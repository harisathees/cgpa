/**
 * Tiny typed fetch wrapper for talking to the NestJS backend.
 *
 * Auth model: the backend issues a JWT from /auth/login and /auth/register.
 * Store it (see lib/auth.tsx) and pass it here as `token`; it is sent as a
 * Bearer header for protected endpoints.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export type Role = "ADMIN" | "USER";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string | null;
  role: Role;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  grade: string | null;
  gradePoint: number | null;
}

export interface Semester {
  id: string;
  name: string;
  number: number;
  gpa: number | null;
  courses: Course[];
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string | null;
  role: Role;
  createdAt: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers, ...rest } = options;
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as
      | { message?: string | string[] }
      | null;
    const message = Array.isArray(body?.message)
      ? body.message.join(", ")
      : (body?.message ?? res.statusText);
    throw new ApiError(message, res.status);
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

export const api = {
  register: (data: { email: string; password: string; fullName?: string }) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: (token: string) => request<AuthUser>("/auth/me", { token }),

  // USER endpoints
  listSemesters: (token: string) =>
    request<Semester[]>("/semesters", { token }),

  createSemester: (token: string, data: { name: string; number: number }) =>
    request<Semester>("/semesters", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    }),

  // ADMIN endpoints
  listUsers: (token: string) => request<AdminUser[]>("/admin/users", { token }),
};
