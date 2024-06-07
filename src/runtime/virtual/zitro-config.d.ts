import type { AnyRouter } from "@trpc/server";
import { H3Event } from "h3";

type Base = Pick<
  Parameters<typeof fetchRequestHandler>[0],
  "endpoint" | "router"
>;

enum ZitroConfigFileName {
  context = "context",
  middleware = "middleware",
  options = "options",
  shield = "shield",
}

export declare const zitroConfig: {
  name: ZitroConfigFileName;
  handler: any;
}[];
