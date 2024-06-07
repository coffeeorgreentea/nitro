import {
  callProcedure,
  getTRPCErrorFromUnknown,
  TRPCError,
} from "@trpc/server";
import { getErrorShape, transformTRPCResponse } from "@trpc/server/shared";
import { resolveHTTPResponse } from "@trpc/server/http";
import { isObservable } from "@trpc/server/observable";
import { parseTRPCMessage } from "@trpc/server/rpc";
import { Peer } from "crossws";
import {
  defineEventHandler,
  createApp,
  H3Event,
  EventHandlerObject,
  getRequestURL,
  createError,
  isMethod,
  readBody,
  handleCors,
  H3CorsOptions,
} from "h3";

import type {
  AnyRouter,
  inferRouterContext,
  inferRouterError,
  ProcedureType,
} from "@trpc/server";
import type { ResponseMeta } from "@trpc/server/http";
import type { Unsubscribable } from "@trpc/server/observable";
import type {
  JSONRPC2,
  TRPCClientOutgoingMessage,
  TRPCResponse,
  TRPCResponseMessage,
} from "@trpc/server/rpc";

type MaybePromise<T> = T | Promise<T>;

export type CreateContextFn<TRouter extends AnyRouter> = (
  event: H3Event
) => MaybePromise<inferRouterContext<TRouter>>;

export interface ResponseMetaFnPayload<TRouter extends AnyRouter> {
  data: TRPCResponse<unknown, inferRouterError<TRouter>>[];
  ctx?: inferRouterContext<TRouter>;
  paths?: string[];
  type: ProcedureType | "unknown";
  errors: TRPCError[];
}

export type ResponseMetaFn<TRouter extends AnyRouter> = (
  opts: ResponseMetaFnPayload<TRouter>
) => ResponseMeta;

export interface OnErrorPayload<TRouter extends AnyRouter> {
  error: TRPCError;
  type: ProcedureType | "unknown";
  path: string | undefined;
  req: H3Event["node"]["req"];
  input: unknown;
  ctx: undefined | inferRouterContext<TRouter>;
}

export type OnErrorFn<TRouter extends AnyRouter> = (
  opts: OnErrorPayload<TRouter>
) => void;

export declare type WithTrpcPeer = Peer & {
  clientSubscriptions: Map<number | string, Unsubscribable>;
  trpcCtx: inferRouterContext<AnyRouter>;
};

export interface ResolveHTTPRequestOptions<TRouter extends AnyRouter> {
  router: TRouter;
  createContext?: CreateContextFn<TRouter>;
  responseMeta?: ResponseMetaFn<TRouter>;
  onError?: OnErrorFn<TRouter>;
  enableWebsockets?: boolean;
}

function getPath(event: H3Event): string | null {
  const { params } = event.context;

  if (typeof params?.trpc === "string") {
    return params.trpc;
  }

  if (params?.trpc && Array.isArray(params.trpc)) {
    return (params.trpc as string[]).join("/");
  }

  return null;
}

function buildWebsocketHooks<TRouter extends AnyRouter>(
  opts: Omit<ResolveHTTPRequestOptions<TRouter>, "enableWebsockets">
): NonNullable<EventHandlerObject["websocket"]> {
  const { createContext, router } = opts;
  const { transformer } = router._def._config;

  console.log("Building websocket hooks");

  function respond(peer: WithTrpcPeer, untransformedJSON: TRPCResponseMessage) {
    peer.send(
      JSON.stringify(
        transformTRPCResponse(router._def._config, untransformedJSON)
      )
    );
  }

  function stopSubscription(
    peer: WithTrpcPeer,
    subscription: Unsubscribable,
    { id, jsonrpc }: JSONRPC2.BaseEnvelope & { id: JSONRPC2.RequestId }
  ) {
    subscription.unsubscribe();

    respond(peer, {
      id,
      jsonrpc,
      result: {
        type: "stopped",
      },
    });
  }

  function close(peer: WithTrpcPeer) {
    const { clientSubscriptions } = peer as WithTrpcPeer;
    for (const sub of clientSubscriptions.values()) {
      sub.unsubscribe();
    }
    clientSubscriptions.clear();
  }

  async function handleRequest(
    peer: WithTrpcPeer,
    msg: TRPCClientOutgoingMessage
  ) {
    const { clientSubscriptions, trpcCtx } = peer;

    const { id, jsonrpc } = msg;
    if (id === null) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "`id` is required",
      });
    }
    if (msg.method === "subscription.stop") {
      const sub = clientSubscriptions.get(id);
      if (sub) {
        stopSubscription(peer, sub, { id, jsonrpc });
      }
      clientSubscriptions.delete(id);
      return;
    }
    const { path, input } = msg.params;
    const type = msg.method;
    try {
      const result = await callProcedure({
        procedures: router._def.procedures,
        path,
        rawInput: async () => input,
        ctx: trpcCtx,
        type,
      });

      if (type === "subscription") {
        if (!isObservable(result)) {
          throw new TRPCError({
            message: `Subscription ${path} did not return an observable`,
            code: "INTERNAL_SERVER_ERROR",
          });
        }
      } else {
        respond(peer, {
          id,
          jsonrpc,
          result: {
            type: "data",
            data: result,
          },
        });
        return;
      }

      const sub = result.subscribe({
        next(data) {
          respond(peer, {
            id,
            jsonrpc,
            result: {
              type: "data",
              data,
            },
          });
        },
        error(err) {
          const error = getTRPCErrorFromUnknown(err);
          opts.onError?.({
            error,
            path,
            type,
            ctx: trpcCtx,
            req: peer as never,
            input,
          });
          respond(peer, {
            id,
            jsonrpc,
            error: getErrorShape({
              config: router._def._config,
              error,
              type,
              path,
              input,
              ctx: trpcCtx,
            }),
          });
        },
        complete() {
          respond(peer, {
            id,
            jsonrpc,
            result: {
              type: "stopped",
            },
          });
        },
      });
      if (peer.readyState !== 1) {
        sub.unsubscribe();
        return;
      }

      if (clientSubscriptions.has(id)) {
        stopSubscription(peer, sub, { id, jsonrpc });
        throw new TRPCError({
          message: `Duplicate id ${id}`,
          code: "BAD_REQUEST",
        });
      }
      clientSubscriptions.set(id, sub);

      respond(peer, {
        id,
        jsonrpc,
        result: {
          type: "started",
        },
      });
    } catch (cause) {
      const error = getTRPCErrorFromUnknown(cause);
      opts.onError?.({
        error,
        path,
        type,
        ctx: trpcCtx,
        req: peer as never,
        input,
      });
      respond(peer, {
        id,
        jsonrpc,
        error: getErrorShape({
          config: router._def._config,
          error,
          type,
          path,
          input,
          ctx: trpcCtx,
        }),
      });
    }
  }

  return {
    async open(connection) {
      const peer = connection as WithTrpcPeer;
      peer.clientSubscriptions = new Map();

      let ctx: inferRouterContext<TRouter> | undefined = undefined;

      try {
        ctx = await createContext?.({ peer } as never);
        peer.trpcCtx = ctx!;
      } catch (cause) {
        const error = getTRPCErrorFromUnknown(cause);
        opts.onError?.({
          error,
          path: undefined,
          type: "unknown",
          ctx,
          req: peer as never,
          input: undefined,
        });
        respond(peer, {
          id: null,
          error: getErrorShape({
            config: router._def._config,
            error,
            type: "unknown",
            path: undefined,
            input: undefined,
            ctx,
          }),
        });

        (global.setImmediate ?? global.setTimeout)(() => {
          close(peer);
        });
      }
    },
    async message(connection, message) {
      const peer = connection as WithTrpcPeer;
      try {
        const raw: unknown = JSON.parse(message.text());
        const messages: unknown[] = Array.isArray(raw) ? raw : [raw];
        const promises = messages
          .map((raw) => parseTRPCMessage(raw, transformer))
          .map((rpcMessage) => handleRequest(peer, rpcMessage));
        await Promise.all(promises);
      } catch (cause) {
        const error = new TRPCError({
          code: "PARSE_ERROR",
          cause,
        });

        respond(peer, {
          id: null,
          error: getErrorShape({
            config: router._def._config,
            error,
            type: "unknown",
            path: undefined,
            input: undefined,
            ctx: undefined,
          }),
        });
      }
    },
    async close(peer, event) {
      close(peer as WithTrpcPeer);
    },
    async error(peer, error) {
      const { clientSubscriptions, trpcCtx } = peer as WithTrpcPeer;
      opts.onError?.({
        ctx: trpcCtx,
        error: getTRPCErrorFromUnknown(error),
        input: undefined,
        path: undefined,
        type: "unknown",
        req: peer as never,
      });
    },
  };
}

export function createNitroApiHandler<TRouter extends AnyRouter>({
  router,
  createContext,
  responseMeta,
  onError,
  enableWebsockets = false,
  cors,
}: ResolveHTTPRequestOptions<TRouter> & {
  cors: H3CorsOptions;
}) {
  return defineEventHandler({
    handler: async (event) => {
      console.log("Handling event");
      const { req, res } = event.node;
      const $url = getRequestURL(event);
      const path = getPath(event);

      handleCors(event, cors || {});

      if (event.method === "OPTIONS") {
        return new Response(null, { status: 204 });
      }

      if (path === null) {
        console.error("Path not found");
        const error = getErrorShape({
          config: router._def._config,
          error: new TRPCError({
            message:
              'Query "trpc" not found - is the file named `[trpc]`.ts or `[...trpc].ts`?',
            code: "INTERNAL_SERVER_ERROR",
          }),
          type: "unknown",
          ctx: undefined,
          path: undefined,
          input: undefined,
        });

        throw createError({
          statusCode: 500,
          statusMessage: JSON.stringify(error),
        });
      }

      const httpResponse = await resolveHTTPResponse({
        // allowBatching: true,
        batching: { enabled: true },
        router,
        req: {
          method: req.method!,
          headers: req.headers,
          body: isMethod(event, "GET") ? null : await readBody(event),
          query: $url.searchParams,
        },
        path,
        createContext: async () => await createContext?.(event),
        responseMeta,
        onError: (o) => {
          onError?.({
            ...o,
            req,
          });
        },
      });

      const { status, headers, body } = httpResponse;

      res.statusCode = status;

      headers &&
        Object.keys(headers).forEach((key) => {
          res.setHeader(key, headers[key]!);
        });

      return body;
    },
    websocket: enableWebsockets
      ? buildWebsocketHooks({
          router,
          createContext,
          responseMeta,
          onError,
        })
      : undefined,
  });
}
