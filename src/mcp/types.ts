import type { WaitUntil } from "../types";

export type McpEventStatus = "ok" | "tool_error" | "rpc_error";

export interface McpPeerInfo {
  name?: string;
  version?: string;
}

export interface McpToolListing {
  name: string;
  description?: string;
  /** The `ui://` resource an MCP Apps host renders for this tool. */
  uiResource?: string;
}

export interface McpEvent {
  timestamp: string;
  sessionId: string;
  protocolVersion?: string;
  server?: McpPeerInfo;
  client?: McpPeerInfo;
  /** Order of the request within its connection, for events that share a millisecond. */
  sequence?: number;
  method: string;
  target?: string;
  status: McpEventStatus;
  errorCode?: number;
  errorMessage?: string;
  durationMs: number;
  responseBytes?: number;
  userId?: string;
  intent?: string;
  model?: string;
  arguments?: string;
  response?: string;
  /** The user's answer to an elicitation: `accept`, `decline` or `cancel`. */
  outcome?: string;
  tools?: McpToolListing[];
}

export interface McpEventBatch {
  type: "mcp";
  events: McpEvent[];
}

export interface McpTransportLike {
  sessionId?: string;
  onmessage?(message: unknown, extra?: unknown): void;
  send(message: unknown, options?: unknown): Promise<void>;
  close?(): Promise<void>;
}

export interface McpRequestContext {
  authInfo?: {
    clientId?: string;
    scopes?: string[];
    extra?: Record<string, unknown>;
  };
  sessionId?: string;
}

export interface McpAnalyticsOptions {
  token: string;
  endpoint?: string;
  excludeMethods?: string[];
  /** Adds optional `_intent` and `_model` parameters to every tool so agents can say why they call it. */
  contextParameters?: boolean;
  /** Records tool arguments with sensitive keys redacted and long strings clipped. */
  captureArguments?: boolean;
  /** Records tool results, redacted and clipped like arguments. */
  captureResponses?: boolean;
  /** Returns the user behind a request, for example from `extra.authInfo`. */
  identify?: (context: McpRequestContext) => string | undefined;
  /** Edits or drops an event before it is sent. */
  beforeSend?: (event: McpEvent) => McpEvent | null;
  waitUntil?: WaitUntil;
  flushIntervalMs?: number;
  onError?: (error: unknown) => void;
  fetch?: typeof fetch;
}

export interface McpPendingRequest {
  sequence: number;
  method: string;
  target?: string;
  startedAt: number;
  timestamp: string;
  userId?: string;
  intent?: string;
  model?: string;
  arguments?: string;
}

export type McpHttpAnalyticsOptions = Omit<
  McpAnalyticsOptions,
  "contextParameters" | "identify"
>;

export interface McpHttpContext {
  req: { raw: Request };
  res: Response;
}

export type McpHttpMiddleware = (
  context: McpHttpContext,
  next: () => Promise<void>
) => Promise<void>;
