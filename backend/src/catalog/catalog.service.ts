import { Injectable, NotFoundException } from '@nestjs/common';
import { promises as fs, existsSync } from 'node:fs';
import * as path from 'node:path';

export interface CollegeEntry {
  college_name: string;
  website: string;
}

export type CollegesByDistrict = Record<string, CollegeEntry[]>;

export interface DegreeEntry {
  category: string;
  degree: string;
}

export interface CourseEntry {
  degree: string;
  course_name: string;
  credits: number;
  code?: string;
  sem?: number | string;
  part?: string;
}

/**
 * Reads the static reference catalog under `backend/data/`. Results are cached
 * after the first read since the JSON tree is shipped with the repo and only
 * changes when an admin edits files.
 */
@Injectable()
export class CatalogService {
  private readonly dataDir: string;
  private collegesCache: CollegesByDistrict | null = null;
  private degreesCache: DegreeEntry[] | null = null;
  private readonly coursesCache = new Map<string, CourseEntry[]>();

  constructor() {
    // Resolve `data/` relative to project root regardless of cwd (dev vs dist).
    const here = path.resolve(process.cwd());
    const candidates = [path.join(here, 'data'), path.join(here, '..', 'data')];
    this.dataDir = candidates.find((p) => existsSync(p)) ?? candidates[0];
  }

  async getColleges(): Promise<CollegesByDistrict> {
    if (this.collegesCache) return this.collegesCache;
    const root = path.join(this.dataDir, 'colleges');
    const districts = await this.listDirs(root);
    const merged: CollegesByDistrict = {};
    for (const district of districts) {
      const file = path.join(root, district, 'data.json');
      const raw = await this.readJson<Record<string, CollegeEntry[]>>(file);
      // Each file is shaped { "<District>": [...] } — flatten that one key.
      const [list] = Object.values(raw);
      merged[district] = list ?? [];
    }
    this.collegesCache = merged;
    return merged;
  }

  async getDegrees(): Promise<DegreeEntry[]> {
    if (this.degreesCache) return this.degreesCache;
    const root = path.join(this.dataDir, 'UG Part III - Major');
    const categories = await this.listDirs(root);
    const out: DegreeEntry[] = [];
    for (const category of categories) {
      const degrees = await this.listDirs(path.join(root, category));
      for (const degree of degrees) out.push({ category, degree });
    }
    out.sort((a, b) => a.degree.localeCompare(b.degree));
    this.degreesCache = out;
    return out;
  }

  async getCoursesForDegree(degree: string): Promise<CourseEntry[]> {
    const key = degree.trim();
    if (!key) throw new NotFoundException('degree query is required');
    const cached = this.coursesCache.get(key);
    if (cached) return cached;

    const all = await this.getDegrees();
    const match = all.find((d) => d.degree === key);
    if (!match) throw new NotFoundException(`Unknown degree: ${key}`);
    const file = path.join(
      this.dataDir,
      'UG Part III - Major',
      match.category,
      match.degree,
      'data.json',
    );
    const data = await this.readJson<CourseEntry[]>(file);
    this.coursesCache.set(key, data);
    return data;
  }

  private async listDirs(root: string): Promise<string[]> {
    try {
      const entries = await fs.readdir(root, { withFileTypes: true });
      return entries.filter((e) => e.isDirectory()).map((e) => e.name);
    } catch {
      return [];
    }
  }

  private async readJson<T>(file: string): Promise<T> {
    const raw = await fs.readFile(file, 'utf8');
    return JSON.parse(raw) as T;
  }
}
