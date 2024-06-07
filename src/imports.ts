import type { Preset } from "unimport";

export const nitroImports: Preset[] = [
  {
    from: "#internal/nitro",
    imports: [
      "defineCachedFunction",
      "defineCachedEventHandler",
      "cachedFunction",
      "cachedEventHandler",
      "useRuntimeConfig",
      "useStorage",
      "useNitroApp",
      "defineNitroPlugin",
      "nitroPlugin",
      "defineRenderHandler",
      "defineRouteMeta",
      "getRouteRules",
      "useAppConfig",
      "useEvent",
      "defineTask",
      "runTask",
      "defineNitroErrorHandler",
    ],
  },
  {
    from: "#internal/nitro/zitro",
    imports: [
      "defineQueue",
      "addJobToQueue",
      "defineSubscription",
      "defineRPCRouter",
    ],
  },
  {
    from: "#internal/nitro/magick",
    imports: [
      "defineNode",
      "defineFlowNode",
      "defineAsyncNode",
      "defineEventNode",
      "defineFunctionNode",
      "initNodes",
      "triggerAgentMessage",
      "triggerAgentError",
      "triggerAgentWarn",
      "triggerAgentLog",
      "triggerAgentCommand",
    ],
  },
];
