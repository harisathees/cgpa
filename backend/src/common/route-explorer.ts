import { INestApplication, Logger, RequestMethod } from '@nestjs/common';
import { PATH_METADATA, METHOD_METADATA } from '@nestjs/common/constants';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';

export interface RouteInfo {
  method: string;
  path: string;
  controller: string;
}

/**
 * Walks every registered controller and returns the full list of HTTP routes
 * (method + path), prefixed with the app's global prefix.
 */
export function listRoutes(
  app: INestApplication,
  globalPrefix = '',
): RouteInfo[] {
  const discovery = app.get(DiscoveryService);
  const scanner = new MetadataScanner();
  const routes: RouteInfo[] = [];

  for (const wrapper of discovery.getControllers()) {
    const { instance, metatype, name } = wrapper;
    if (!instance || !metatype) continue;

    const controllerPath =
      (Reflect.getMetadata(PATH_METADATA, metatype) as string) ?? '';
    const prototype = Object.getPrototypeOf(instance) as object;

    for (const methodName of scanner.getAllMethodNames(prototype)) {
      const handler = (prototype as Record<string, object>)[methodName];
      const routePath = Reflect.getMetadata(PATH_METADATA, handler) as
        | string
        | undefined;
      const method = Reflect.getMetadata(METHOD_METADATA, handler) as
        | number
        | undefined;
      if (routePath === undefined || method === undefined) continue;

      routes.push({
        method: RequestMethod[method] ?? String(method),
        path: join(globalPrefix, controllerPath, routePath),
        controller: name,
      });
    }
  }

  return routes.sort((a, b) => a.path.localeCompare(b.path));
}

/** Logs the route list as a tidy, aligned table. */
export function printRoutes(routes: RouteInfo[]): void {
  const logger = new Logger('Routes');
  const width = Math.max(...routes.map((r) => r.method.length), 6);
  logger.log(`Mapped ${routes.length} route(s):`);
  for (const r of routes) {
    logger.log(`  ${r.method.padEnd(width)}  ${r.path}`);
  }
}

function join(...parts: string[]): string {
  const segments = parts
    .map((p) => p.replace(/^\/+|\/+$/g, ''))
    .filter(Boolean);
  return '/' + segments.join('/');
}
