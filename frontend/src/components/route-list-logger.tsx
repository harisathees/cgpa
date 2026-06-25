"use client";

import { useEffect } from "react";
import { apiRoutes, frontendRoutes } from "@/lib/routes";

/**
 * Logs the full frontend + backend route list to the browser console once on
 * startup — the client-side analog of the backend printing its routes on boot.
 * Renders nothing.
 */
export function RouteListLogger() {
  useEffect(() => {
    console.groupCollapsed("%cFrontend routes", "font-weight:bold");
    console.table(frontendRoutes);
    console.groupEnd();

    console.groupCollapsed("%cAPI routes", "font-weight:bold");
    console.table(apiRoutes);
    console.groupEnd();
  }, []);

  return null;
}
