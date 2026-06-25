/**
 * Central route list for the app.
 *
 * `frontendRoutes` are the Next.js pages under src/app; `apiRoutes` mirror the
 * NestJS backend endpoints (kept in sync with the server's own route list).
 */

export interface FrontendRoute {
  path: string;
  description: string;
  auth: "public" | "user" | "admin";
}

export const frontendRoutes: FrontendRoute[] = [
  { path: "/", description: "Redirects to /dashboard or /login", auth: "public" },
  { path: "/login", description: "Sign in", auth: "public" },
  {
    path: "/register",
    description: "Sign up (creates a normal USER)",
    auth: "public",
  },
  {
    path: "/dashboard",
    description: "Role-aware dashboard (users → semesters, admin → users)",
    auth: "user",
  },
];

export interface ApiRoute {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  description: string;
  auth: "public" | "user" | "admin";
}

export const apiRoutes: ApiRoute[] = [
  { method: "GET", path: "/api/health", description: "Health check", auth: "public" },
  {
    method: "POST",
    path: "/api/auth/register",
    description: "Register a new USER",
    auth: "public",
  },
  { method: "POST", path: "/api/auth/login", description: "Log in", auth: "public" },
  { method: "GET", path: "/api/auth/me", description: "Current user", auth: "user" },
  {
    method: "GET",
    path: "/api/semesters",
    description: "List the caller's semesters",
    auth: "user",
  },
  {
    method: "POST",
    path: "/api/semesters",
    description: "Create a semester",
    auth: "user",
  },
  {
    method: "GET",
    path: "/api/admin/users",
    description: "List all users",
    auth: "admin",
  },
];
