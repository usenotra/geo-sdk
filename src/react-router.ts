import { VERCEL_REQUEST_CONTEXT } from "./constants";
import { Tracker } from "./tracker";
import type {
  GeoReactRouterOptions,
  ReactRouterMiddlewareArgs,
  WaitUntil,
} from "./types";

function vercelWaitUntil(): WaitUntil | undefined {
  const context = Reflect.get(globalThis, VERCEL_REQUEST_CONTEXT)?.get?.();
  if (typeof context?.waitUntil !== "function") {
    return;
  }
  return (promise) => context.waitUntil(promise);
}

export function createGeoMiddleware(options: GeoReactRouterOptions) {
  const tracker = new Tracker(options);

  return async <T>(
    { request }: ReactRouterMiddlewareArgs,
    next: () => Promise<T>
  ): Promise<T> => {
    try {
      return await next();
    } finally {
      const pending = tracker.track(request).catch(() => undefined);
      (options.waitUntil ?? vercelWaitUntil())?.(pending);
    }
  };
}
