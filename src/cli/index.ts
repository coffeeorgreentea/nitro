#!/usr/bin/env node
import { defineCommand, runMain } from "citty";
import nitroPkg from "../../package.json";

const main = defineCommand({
  meta: {
    name: nitroPkg.name,
    description: "Nitro CLI",
    version: nitroPkg.version,
  },
  subCommands: {
    dev: () => import("./commands/dev").then((r) => r.default),
    build: () => import("./commands/build").then((r) => r.default),
    prepare: () => import("./commands/prepare").then((r) => r.default),
    task: () => import("./commands/task").then((r) => r.default),
    generate: () => import("./commands/generate").then((r) => r.default),
    proxy: () => import("./commands/proxy").then((r) => r.default),
  },
});

runMain(main);
