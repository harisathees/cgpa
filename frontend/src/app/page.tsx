"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import {
  api,
  ApiError,
  type CollegeEntry,
  type CollegesByDistrict,
  type CourseEntry,
  type DegreeEntry,
} from "@/lib/api";

const GRADES = ["O", "A+", "A", "B+", "B", "C", "RA", "AA"] as const;
type Grade = (typeof GRADES)[number] | "";
const GRADE_POINTS: Record<string, number> = {
  O: 10,
  "A+": 9,
  A: 8,
  "B+": 7,
  B: 6,
  C: 5,
  RA: 0,
  AA: 0,
};

interface PortalRow {
  id: string;
  code: string;
  title: string;
  sem: string;
  part: string;
  credit: number;
  grade: Grade;
}

function mapCatalogCourse(c: CourseEntry, idx: number): PortalRow {
  return {
    id: `cat-${idx}-${c.course_name.slice(0, 8)}-${Math.random().toString(36).slice(2, 6)}`,
    code: c.code ?? "—",
    title: c.course_name,
    sem: String(c.sem ?? Math.ceil((idx + 1) / 6)),
    part: String(c.part ?? "III"),
    credit: Number(c.credits) || 0,
    grade: "",
  };
}

export default function Home() {
  const [colleges, setColleges] = useState<CollegesByDistrict>({});
  const [degrees, setDegrees] = useState<DegreeEntry[]>([]);
  const [selectedDegree, setSelectedDegree] = useState<string>("");
  const [rows, setRows] = useState<PortalRow[]>([]);
  const [loadingDegrees, setLoadingDegrees] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  // Student form
  const [regNo, setRegNo] = useState("");
  const [studentName, setStudentName] = useState("");
  const [collegeChoice, setCollegeChoice] = useState("");
  const [injectCode, setInjectCode] = useState("");

  // Initial catalog load
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [c, d] = await Promise.all([api.listColleges(), api.listDegrees()]);
        if (cancelled) return;
        setColleges(c);
        setDegrees(d);
        if (d.length && !selectedDegree) setSelectedDegree(d[0].degree);
      } catch (err) {
        if (cancelled) return;
        setCatalogError(
          err instanceof ApiError
            ? err.message
            : "Could not reach the catalog API",
        );
      } finally {
        if (!cancelled) setLoadingDegrees(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load courses whenever the degree changes
  useEffect(() => {
    if (!selectedDegree) return;
    let cancelled = false;
    (async () => {
      setLoadingCourses(true);
      try {
        const courses = await api.listCoursesForDegree(selectedDegree);
        if (cancelled) return;
        setRows(courses.map((c, i) => mapCatalogCourse(c, i)));
      } catch (err: unknown) {
        if (cancelled) return;
        setCatalogError(
          err instanceof ApiError ? err.message : "Could not load courses",
        );
        setRows([]);
      } finally {
        if (!cancelled) setLoadingCourses(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedDegree]);

  const totals = useMemo(() => {
    let credits = 0,
      points = 0,
      p3Credits = 0,
      p3Points = 0;
    for (const r of rows) {
      if (!r.grade) continue;
      const gp = GRADE_POINTS[r.grade];
      credits += r.credit;
      points += gp * r.credit;
      if (r.part.toUpperCase() === "III") {
        p3Credits += r.credit;
        p3Points += gp * r.credit;
      }
    }
    return {
      cgpa: credits > 0 ? (points / credits).toFixed(2) : "0.00",
      part3: p3Credits > 0 ? ((p3Points / p3Credits) * 10).toFixed(1) : "0.0",
      credits,
    };
  }, [rows]);

  const onGradeChange = (id: string, grade: Grade) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, grade } : r)));

  const onRemoveRow = (id: string) =>
    setRows((prev) => prev.filter((r) => r.id !== id));

  const onInject = () => {
    const code = injectCode.trim().toUpperCase();
    if (!code) return;
    setRows((prev) => [
      ...prev,
      {
        id: `inj-${Date.now()}`,
        code,
        title: `Injected Course (${code})`,
        sem: "6",
        part: "III",
        credit: 4,
        grade: "",
      },
    ]);
    setInjectCode("");
  };

  const onClearForm = () => {
    setRegNo("");
    setStudentName("");
    setCollegeChoice("");
    setRows((prev) => prev.map((r) => ({ ...r, grade: "" })));
  };

  const collegeDistricts = Object.keys(colleges).sort();

  return (
    <div className="portal-body min-h-screen py-3 md:py-6 px-2 sm:px-4">
      {/* Top control bar */}
      <div className="max-w-5xl md:max-w-[210mm] mx-auto mb-3 sm:mb-4 bg-slate-900 text-white p-3 sm:p-4 rounded-xl flex flex-col sm:flex-row gap-2 sm:gap-3 items-center justify-between shadow-md no-print">
        <div className="text-center sm:text-left">
          <h2 className="font-bold text-xs sm:text-sm text-blue-400">
            MSU Multi-College CGPA Engine
          </h2>
          <p className="text-[10px] sm:text-xs text-slate-400">
            Pick a degree, choose your grades, and watch the CGPA update live.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-center">
          <button
            onClick={onClearForm}
            className="w-full sm:w-auto bg-slate-700 hover:bg-slate-600 text-[11px] font-bold px-4 py-2 rounded transition-all min-h-[40px]"
          >
            Clear Form
          </button>
          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-[11px] font-bold px-4 py-2 rounded transition-all min-h-[40px]"
          >
            Print
          </button>
        </div>
      </div>

      {/* Ad slot */}
      <div className="ad-slot max-w-5xl md:max-w-[210mm] mx-auto mb-3 bg-slate-200/80 border border-slate-300 rounded p-2 flex items-center justify-center min-h-[50px] sm:min-h-[90px] text-center">
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
          [ Place Top Advertisement Code Here ]
        </span>
      </div>

      {/* Sticky mobile totals */}
      <div className="sm:hidden sticky top-0 z-20 -mx-2 px-2 py-2 bg-white border-b border-slate-300 shadow-sm no-print">
        <div className="grid grid-cols-3 gap-1.5 text-center">
          <StatCard label="CGPA" value={totals.cgpa} tone="blue" />
          <StatCard label="Part III" value={`${totals.part3}%`} tone="green" />
          <StatCard label="Credits" value={`${totals.credits}/144`} tone="slate" />
        </div>
      </div>

      <div className="print-container max-w-5xl md:max-w-[210mm] mx-auto p-3 sm:p-6 rounded-sm w-full box-border">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start border-b border-slate-300 pb-3 gap-3 text-center sm:text-left relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 border border-slate-300 rounded flex items-center justify-center text-[9px] font-bold text-slate-400 p-1 order-2 sm:order-1">
            MSU CREST
          </div>
          <div className="text-center flex-1 px-1 order-1 sm:order-2">
            <h1
              className="text-[#008000] text-base sm:text-xl font-bold tracking-wide"
              style={{ fontFamily: "'Arial Unicode MS', sans-serif" }}
            >
              மனோன்மணியம் சுந்தரனார் பல்கலைக்கழகம்
            </h1>
            <h2 className="text-[#000080] text-base sm:text-xl font-bold uppercase tracking-tight mt-0.5">
              Manonmaniam Sundaranar University
            </h2>
            <p className="text-slate-600 text-[10px] sm:text-[11px] font-medium mt-1">
              Reaccredited with &lsquo;A&rsquo; Grade (CGPA 3.13 Out of 4.0) by NAAC
              (3rd Cycle)
            </p>
            <p className="text-slate-500 text-[10px] sm:text-[11px]">
              Tirunelveli - 627012, Tamil Nadu, India
            </p>
          </div>
          <div className="w-14 h-14 sm:w-[72px] sm:h-[72px] rounded-full border border-slate-400 overflow-hidden bg-slate-50 flex items-center justify-center order-3 text-[9px] text-slate-400 font-bold">
            MSU
          </div>
        </div>

        {/* Student details */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-[11px] sm:text-xs border border-slate-300 p-3 bg-slate-50/50 rounded">
          <Field label="Registration No">
            <input
              type="text"
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
              placeholder="Enter Registration Number"
              className="bg-transparent border-b border-slate-300 focus:border-blue-500 focus:outline-none font-mono font-bold text-slate-800 w-full py-1"
            />
          </Field>
          <Field label="Course Code & Name">
            {loadingDegrees ? (
              <span className="text-slate-400 italic py-1">Loading degrees…</span>
            ) : (
              <select
                value={selectedDegree}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setSelectedDegree(e.target.value)
                }
                className="bg-transparent border-b border-slate-300 focus:outline-none font-bold text-slate-800 w-full cursor-pointer py-1"
              >
                {degrees.map((d) => (
                  <option key={`${d.category}-${d.degree}`} value={d.degree}>
                    {d.degree}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label="Student Name">
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value.toUpperCase())}
              placeholder="ENTER NAME"
              className="bg-transparent border-b border-slate-300 focus:border-blue-500 focus:outline-none font-bold text-slate-800 uppercase w-full py-1"
            />
          </Field>
          <Field label="Batch / Regulation">
            <span className="font-bold text-slate-800 text-[10px] sm:text-xs py-1">
              2023-2024 (Affiliated Colleges)
            </span>
          </Field>
          <div className="md:col-span-2">
            <Field label="College">
              <select
                value={collegeChoice}
                onChange={(e) => setCollegeChoice(e.target.value)}
                className="bg-transparent border-b border-slate-300 focus:outline-none font-bold text-slate-800 w-full cursor-pointer py-1"
              >
                <option value="">— Select college —</option>
                {collegeDistricts.map((district) => (
                  <optgroup key={district} label={district}>
                    {colleges[district].map((c: CollegeEntry) => (
                      <option
                        key={`${district}-${c.college_name}`}
                        value={c.college_name}
                      >
                        {c.college_name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </Field>
          </div>
        </div>

        {/* Inject course code */}
        <div className="mt-3 bg-slate-50 p-2 border border-dashed border-slate-400 flex flex-col sm:flex-row gap-2 items-center rounded no-print">
          <span className="text-[11px] sm:text-xs font-bold text-slate-600 whitespace-nowrap">
            🔍 Inject Course Code:
          </span>
          <div className="flex gap-2 w-full">
            <input
              type="text"
              value={injectCode}
              onChange={(e) => setInjectCode(e.target.value)}
              placeholder="e.g. CC14, E5EA61, EMCS51…"
              className="w-full px-2 py-2 text-[11px] sm:text-xs border border-slate-300 rounded font-mono uppercase focus:outline-none focus:border-blue-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") onInject();
              }}
            />
            <button
              onClick={onInject}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2 rounded transition-all whitespace-nowrap min-h-[40px]"
            >
              Add
            </button>
          </div>
        </div>

        {/* Desktop totals row */}
        <div className="hidden sm:grid mt-3 grid-cols-3 gap-1.5 text-center">
          <StatCard label="Cumulative CGPA" value={totals.cgpa} tone="blue" />
          <StatCard label="Part III Pct" value={`${totals.part3}%`} tone="green" />
          <StatCard
            label="Credits"
            value={`${totals.credits}/144`}
            tone="slate"
          />
        </div>

        {catalogError && (
          <p className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {catalogError}
          </p>
        )}

        {/* Ledger — table on md+, cards on mobile */}
        <div className="mt-4">
          {loadingCourses ? (
            <p className="text-center text-slate-500 text-xs py-6">
              Loading courses for {selectedDegree}…
            </p>
          ) : rows.length === 0 ? (
            <p className="text-center text-slate-500 text-xs py-6">
              No courses yet — pick a degree above or inject codes below.
            </p>
          ) : (
            <>
              {/* Table view (sm and up) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="portal-table w-full text-left text-[10px] sm:text-xs font-semibold border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 uppercase text-[9px] sm:text-[11px] font-bold">
                      <th className="p-2 text-center w-[6%]">S.No</th>
                      <th className="p-2 w-[14%]">Code</th>
                      <th className="p-2 w-[36%]">Subject Title</th>
                      <th className="p-2 w-[7%] text-center">Sem</th>
                      <th className="p-2 w-[9%] text-center">Part</th>
                      <th className="p-2 w-[7%] text-center">Crd</th>
                      <th className="p-2 w-[12%] text-center">Grade</th>
                      <th className="p-2 w-[9%] text-center">Res</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-700 divide-y divide-slate-300">
                    {rows.map((r, i) => (
                      <tr
                        key={r.id}
                        className="hover:bg-slate-50 transition-all font-medium text-slate-800"
                      >
                        <td className="p-2 text-center text-slate-500 font-normal">
                          {i + 1}
                        </td>
                        <td className="p-2 font-mono uppercase tracking-tight text-slate-600 text-[10px] sm:text-xs">
                          {r.code}
                        </td>
                        <td className="p-2 text-[10px] sm:text-xs text-slate-700 font-bold">
                          {r.title}
                        </td>
                        <td className="p-2 text-center text-slate-500">
                          {r.sem}
                        </td>
                        <td className="p-2 text-center">
                          <span className="bg-slate-100 text-slate-600 font-bold text-[9px] px-1 py-0.5 rounded">
                            P-{r.part}
                          </span>
                        </td>
                        <td className="p-2 text-center font-bold text-slate-600">
                          {r.credit}
                        </td>
                        <td className="p-2 text-center">
                          <GradeSelect
                            value={r.grade}
                            onChange={(g) => onGradeChange(r.id, g)}
                          />
                        </td>
                        <td className="p-2 text-center font-black text-[10px] sm:text-xs">
                          <ResultBadge grade={r.grade} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Card view (mobile only) */}
              <ul className="sm:hidden space-y-2">
                {rows.map((r, i) => (
                  <li
                    key={r.id}
                    className="border border-slate-300 rounded bg-white p-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] uppercase font-mono text-slate-500">
                          #{i + 1} · {r.code}
                        </p>
                        <p className="text-sm font-bold text-slate-800 leading-tight">
                          {r.title}
                        </p>
                      </div>
                      <button
                        onClick={() => onRemoveRow(r.id)}
                        className="text-[10px] font-bold text-red-500 hover:text-red-700 no-print px-2 py-1"
                        aria-label="Remove row"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="mt-2 grid grid-cols-4 gap-2 text-[10px] text-slate-500">
                      <Meta label="Sem" value={r.sem} />
                      <Meta label="Part" value={`P-${r.part}`} />
                      <Meta label="Credits" value={String(r.credit)} />
                      <div>
                        <p className="font-semibold text-slate-500 uppercase tracking-wider">
                          Res
                        </p>
                        <p className="mt-1 font-black">
                          <ResultBadge grade={r.grade} />
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Grade
                      </p>
                      <GradeSelect
                        value={r.grade}
                        onChange={(g) => onGradeChange(r.id, g)}
                        fullWidth
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="mt-4 text-center text-[10px] sm:text-[11px] font-bold text-slate-500 tracking-widest uppercase">
          -- End of the Statement --
        </div>

        {/* Grade legend + notes */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
          <div className="lg:col-span-8 overflow-x-auto">
            <table className="portal-table w-full text-[10px] text-center border-collapse font-bold table-fixed">
              <thead>
                <tr className="bg-slate-50 text-[9px] text-slate-600">
                  <th className="p-1 w-[8%]">S.No</th>
                  <th className="p-1 w-[28%]">Percentage</th>
                  <th className="p-1 w-[14%]">Grade</th>
                  <th className="p-1 w-[14%]">Point</th>
                  <th className="p-1 w-[36%]">Performance</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {[
                  ["1", "90 - 100", "O", "10", "Outstanding"],
                  ["2", "80 - 89", "A+", "9", "Excellent"],
                  ["3", "70 - 79", "A", "8", "Very Good"],
                  ["4", "60 - 69", "B+", "7", "Good"],
                  ["5", "50 - 59", "B", "6", "Above Avg"],
                  ["6", "40 - 49", "C", "5", "Pass"],
                  ["7", "0 - 39", "RA", "-", "ReAppear"],
                  ["8", "Absent", "AA", "-", "Absent"],
                ].map((r) => (
                  <tr key={r[0]}>
                    <td className="p-1">{r[0]}</td>
                    <td className="p-1">{r[1]}</td>
                    <td className="p-1 font-bold">{r[2]}</td>
                    <td className="p-1">{r[3]}</td>
                    <td className="p-1 font-normal">{r[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lg:col-span-4 text-[9px] text-slate-500 leading-tight border border-slate-300 p-2 bg-slate-50 rounded">
            <p className="font-bold uppercase text-slate-600 mb-0.5">
              Note Notification:
            </p>
            <p className="mb-1">
              The results published here are for immediate information to the
              examinees. This cannot be treated as original mark sheets.
            </p>
            <p className="font-bold">
              (hints P-Pass, WW-With Held, MM-Malpractice, RA-Re Appear,
              AA-Absent)
            </p>
          </div>
        </div>

        <div className="ad-slot mt-6 bg-slate-100 border border-slate-200 rounded p-1.5 flex items-center justify-center min-h-[50px] text-center">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
            [ Place Bottom Advertisement Code Here ]
          </span>
        </div>

        <div className="mt-6 flex justify-center gap-4 no-print">
          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto bg-[#2463eb] hover:bg-[#1d4ed8] text-white font-bold text-xs px-6 py-3 rounded shadow transition-all uppercase tracking-wider min-h-[44px]"
          >
            Print Statement
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
      <span className="sm:w-36 font-bold text-slate-700 uppercase tracking-wide text-[10px] sm:text-xs">
        {label}
      </span>
      <span className="hidden sm:inline mr-1.5">:</span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-semibold text-slate-500 uppercase tracking-wider">
        {label}
      </p>
      <p className="mt-1 font-bold text-slate-700">{value}</p>
    </div>
  );
}

function GradeSelect({
  value,
  onChange,
  fullWidth,
}: {
  value: Grade;
  onChange: (g: Grade) => void;
  fullWidth?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Grade)}
      className={`bg-white border border-slate-300 rounded font-bold text-[11px] sm:text-xs p-1.5 focus:outline-none focus:border-blue-500 ${
        fullWidth ? "w-full" : "w-full max-w-[80px]"
      }`}
    >
      <option value="">—</option>
      {GRADES.map((g) => (
        <option key={g} value={g}>
          {g}
        </option>
      ))}
    </select>
  );
}

function ResultBadge({ grade }: { grade: Grade }) {
  if (!grade) return <span className="text-slate-400">-</span>;
  if (grade === "RA" || grade === "AA")
    return <span className="text-red-600">{grade}</span>;
  return <span className="text-green-600">P</span>;
}

type Tone = "blue" | "green" | "slate";
function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: Tone;
}) {
  const palette: Record<Tone, string> = {
    blue: "bg-blue-50 border-blue-200 text-blue-900",
    green: "bg-emerald-50 border-emerald-200 text-emerald-900",
    slate: "bg-slate-50 border-slate-200 text-slate-800",
  };
  const labelTone: Record<Tone, string> = {
    blue: "text-blue-800",
    green: "text-emerald-800",
    slate: "text-slate-600",
  };
  return (
    <div className={`${palette[tone]} border p-1.5 rounded`}>
      <span
        className={`block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${labelTone[tone]}`}
      >
        {label}
      </span>
      <span className="text-base sm:text-xl font-black">{value}</span>
    </div>
  );
}
