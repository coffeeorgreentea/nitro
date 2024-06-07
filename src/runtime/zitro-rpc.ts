import { zitroRPC } from "#internal/nitro/virtual/zitro-rpc";
import {
  FetchCreateContextFn,
  fetchRequestHandler,
} from "@trpc/server/adapters/fetch";
import {
  type H3CorsOptions,
  handleCors,
  toWebRequest,
  H3Event,
  eventHandler,
  getRequestURL,
  createError,
  readBody,
  isMethod,
} from "h3";
import { AnyRouter, TRPCError } from "@trpc/server";
import consola from "consola";
import { getZitroConfig } from "./zitro-config";
import { NitroApp } from "./app";
// import { buildWebsocketHooks, getPath } from "./zitro-rpc-core";
import { resolveHTTPResponse } from "@trpc/server/http";
import { getErrorShape } from "@trpc/server/shared";
import { createContext } from "unctx/index";
import { createNitroApiHandler } from "./zitro-rpc-core";

export function defineRPCRouter(def: AnyRouter) {
  return def;
}

const cors: H3CorsOptions = {
  origin: (origin) => origin === "http://localhost:5173",
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true,
};

const endpoint = "/rpc";

export function initRPC(app: NitroApp) {
  const config = getZitroConfig();
  const router = Object.values(zitroRPC)[0].handler;
  // consola.info(`Zitro Config: `, config);
  const createContextFn = config.find((item) => item.name === "context")
    ?.handler as (req: H3Event) => ReturnType<FetchCreateContextFn<AnyRouter>>;

  // RPC OVER HTTP
  // app.router.use(
  //   `${endpoint}/**`,
  //   eventHandler(async (event) => {
  //     console.log("rpc received");
  // handleCors(event, cors || {});

  // if (event.method === "OPTIONS") {
  //   return new Response(null, { status: 204 });
  // }

  //     if (event.method === "GET" || event.method === "POST") {
  //       return fetchRequestHandler({
  //         router,
  //         endpoint,
  //         createContext: () => createContextFn(event),
  //         req: toWebRequest(event),
  //         onError: true
  //           ? ({ path, error }) => {
  //               consola.error(
  //                 `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
  //               );
  //             }
  //           : undefined,
  //       });
  //     } else {
  //       return new Response(null, { status: 405 });
  //     }
  //   })
  // );

  app.router.use(
    "/rpc/**",
    createNitroApiHandler({
      router,
      createContext: createContextFn,
      enableWebsockets: true,
      cors,
    })
  );
}
