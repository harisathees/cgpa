"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  api,
  ApiError,
  type AdminUser,
  type Semester,
} from "@/lib/api";

export default function DashboardPage() {
  const { user, token, loading, logout } = useAuth();
  const router = useRouter();

  // Redirect unauthenticated visitors to the login page.
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user || !token) {
    return (
      <div className="flex flex-1 items-center justify-center text-zinc-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div>
          <h1 className="text-lg font-semibold">CGPA Dashboard</h1>
          <p className="text-sm text-zinc-500">
            {user.fullName ?? user.email}
            <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {user.role}
            </span>
          </p>
        </div>
        <button
          onClick={logout}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Log out
        </button>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 p-6">
        {user.role === "ADMIN" ? (
          <AdminView token={token} />
        ) : (
          <UserView token={token} />
        )}
      </main>
    </div>
  );
}

/** Admin sees every registered account. */
function AdminView({ token }: { token: string }) {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setUsers(await api.listUsers(token));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load users");
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) return <ErrorBox message={error} />;
  if (!users) return <Muted>Loading users…</Muted>;

  return (
    <section>
      <h2 className="mb-4 text-base font-semibold">Users ({users.length})</h2>
      {users.length === 0 ? (
        <Muted>No users yet.</Muted>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
                >
                  <td className="px-4 py-3">{u.fullName ?? "—"}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/** Normal users see their own semesters. */
function UserView({ token }: { token: string }) {
  const [semesters, setSemesters] = useState<Semester[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setSemesters(await api.listSemesters(token));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load semesters",
      );
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) return <ErrorBox message={error} />;
  if (!semesters) return <Muted>Loading semesters…</Muted>;

  return (
    <section>
      <h2 className="mb-4 text-base font-semibold">
        Your semesters ({semesters.length})
      </h2>
      {semesters.length === 0 ? (
        <Muted>No semesters yet.</Muted>
      ) : (
        <ul className="space-y-3">
          {semesters.map((s) => (
            <li
              key={s.id}
              className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {s.number}. {s.name}
                </span>
                <span className="text-sm text-zinc-500">
                  GPA: {s.gpa ?? "—"}
                </span>
              </div>
              <p className="mt-1 text-sm text-zinc-500">
                {s.courses.length} course{s.courses.length === 1 ? "" : "s"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Muted({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-zinc-500">{children}</p>;
}

function ErrorBox({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
      {message}
    </p>
  );
}
