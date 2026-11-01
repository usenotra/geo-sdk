import { sendRequestLog } from "../send";
import { MCP_BATCH_MAX_EVENTS, MCP_FLUSH_INTERVAL_MS } from "./constants";
import type { McpAnalyticsOptions, McpEvent } from "./types";

const batchers = new Set<McpBatcher>();

export class McpBatcher {
  readonly #options: McpAnalyticsOptions;
  #queue: McpEvent[] = [];
  #timer: ReturnType<typeof setTimeout> | undefined;
  #scheduled: Promise<void> | undefined;

  constructor(options: McpAnalyticsOptions) {
    this.#options = options;
    batchers.add(this);
  }

  push(event: McpEvent): void {
    this.#queue.push(event);
    if (this.#queue.length >= MCP_BATCH_MAX_EVENTS) {
      void this.flush();
      return;
    }
    if (this.#scheduled) {
      return;
    }
    this.#scheduled = new Promise((resolve) => {
      this.#timer = setTimeout(() => {
        void this.flush().then(resolve);
      }, this.#options.flushIntervalMs ?? MCP_FLUSH_INTERVAL_MS);
      const handle: unknown = this.#timer;
      if (
        typeof handle === "object" &&
        handle !== null &&
        "unref" in handle &&
        typeof handle.unref === "function"
      ) {
        handle.unref();
      }
    });
    try {
      this.#options.waitUntil?.(this.#scheduled);
    } catch (error) {
      this.#options.onError?.(error);
    }
  }

  async flush(): Promise<void> {
    clearTimeout(this.#timer);
    this.#timer = undefined;
    this.#scheduled = undefined;
    const sends: Promise<void>[] = [];
    while (this.#queue.length > 0) {
      const events = this.#queue.splice(0, MCP_BATCH_MAX_EVENTS);
      sends.push(sendRequestLog({ type: "mcp", events }, this.#options));
    }
    await Promise.all(sends);
  }
}

/** Sends every queued MCP event now; await it before a serverless function returns. */
export async function flushMcpEvents(): Promise<void> {
  await Promise.all([...batchers].map((batcher) => batcher.flush()));
}
