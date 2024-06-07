import type { H3Event, AppOptions } from "h3";
import type { RenderResponse } from "./renderer";

export type { NitroApp } from "./app";
export type {
  CacheEntry,
  CacheOptions,
  ResponseCacheEntry,
  CachedEventHandlerOptions,
} from "./cache";
export type { NitroAppPlugin } from "./plugin";
export type { RenderResponse, RenderHandler } from "./renderer";

export interface CapturedErrorContext {
  event?: H3Event;
  [key: string]: unknown;
}

export type CaptureError = (
  error: Error,
  context: CapturedErrorContext
) => void;

export interface NitroRuntimeHooks {
  close: () => void;
  error: CaptureError;

  request: NonNullable<AppOptions["onRequest"]>;
  beforeResponse: NonNullable<AppOptions["onBeforeResponse"]>;
  afterResponse: NonNullable<AppOptions["onAfterResponse"]>;

  "render:response": (
    response: Partial<RenderResponse>,
    context: { event: H3Event }
  ) => void;

  // Agent events
  "agent:message": (message: any) => void;
  "agent:error": (error: any) => void;
  "agent:warn": (warning: any) => void;
  "agent:log": (log: any) => void;
  "agent:command": (command: any) => void;

  // Subscription events
  "subscription:created": (subscription: any) => void;
  "subscription:updated": (subscription: any) => void;
  "subscription:deleted": (subscription: any) => void;
}
