import { reportGeoError } from "../send";
import { McpBatcher } from "./batcher";
import { MCP_SESSION_ID_HEADER, MCP_SSE_DATA_PREFIX } from "./constants";
import { observeMcpTransport } from "./transport";
import type {
  McpHttpAnalyticsOptions,
  McpHttpMiddleware,
  McpPeerInfo,
  McpTransportLike,
} from "./types";

async function readRequestMessage(request: Request): Promise<unknown> {
  if (
    request.method !== "POST" ||
    !request.headers.get("content-type")?.includes("application/json")
  ) {
    return undefined;
  }
  try {
    return await request.clone().json();
  } catch {
    return undefined;
  }
}

function isJsonRpc(message: unknown): boolean {
  const first = Array.isArray(message) ? message[0] : message;
  return (
    typeof first === "object" &&
    first !== null &&
    "jsonrpc" in first &&
    first.jsonrpc === "2.0"
  );
}

async function readResponseMessages(response: Response): Promise<unknown[]> {
  const type = response.headers.get("content-type") ?? "";
  if (type.includes("application/json")) {
    return [await response.json()];
  }
  if (!type.includes("text/event-stream")) {
    return [];
  }
  const text = await response.text();
  return text
    .split("\n")
    .filter((line) => line.startsWith(MCP_SSE_DATA_PREFIX))
    .flatMap((line) => {
      try {
        return [JSON.parse(line.slice(MCP_SSE_DATA_PREFIX.length))];
      } catch {
        return [];
      }
    });
}

export function trackMcpHttp(
  options: McpHttpAnalyticsOptions
): McpHttpMiddleware {
  const batcher = options.token ? new McpBatcher(options) : undefined;
  let server: McpPeerInfo | undefined;
  const observed: McpHttpAnalyticsOptions = {
    ...options,
    beforeSend: (event) => {
      server = event.server ?? server;
      const final = { ...event, server };
      return options.beforeSend ? options.beforeSend(final) : final;
    },
  };
  return async (context, next) => {
    const request = context.req.raw;
    const message = batcher ? await readRequestMessage(request) : undefined;
    if (!(batcher && isJsonRpc(message))) {
      await next();
      return;
    }
    const target: McpTransportLike = {
      sessionId: request.headers.get(MCP_SESSION_ID_HEADER) ?? undefined,
      onmessage: () => undefined,
      send: async () => undefined,
    };
    const transport = observeMcpTransport(target, observed, batcher);
    transport.onmessage?.(message);
    await next();
    transport.sessionId ??=
      context.res.headers.get(MCP_SESSION_ID_HEADER) ?? undefined;
    const settled = readResponseMessages(context.res.clone())
      .then(async (messages) => {
        for (const item of messages) {
          await transport.send(item);
        }
      })
      .catch((error: unknown) => reportGeoError(options.onError, error));
    batcher.observe(settled);
    try {
      options.waitUntil?.(settled);
    } catch (error) {
      reportGeoError(options.onError, error);
    }
  };
}
