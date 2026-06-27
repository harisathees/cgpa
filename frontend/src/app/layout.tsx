import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// Auth is fully disabled for the public CGPA portal. The legacy /login,
// /register and /dashboard routes are parked at `page.tsx.disabled` and the
// AuthProvider wrapper is no longer mounted. To re-enable, restore those
// filenames and reinstate the import + wrapper below.
// import { AuthProvider } from "@/lib/auth";
import { RouteListLogger } from "@/components/route-list-logger";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CGPA",
  description: "Track semesters, courses, and your CGPA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <RouteListLogger />
        {children}
      </body>
    </html>
  );
}
