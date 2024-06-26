import { defineCommand } from "citty";
import { resolve } from "pathe";
import { createNitro } from "../../nitro";
import { build, prepare, copyPublicAssets } from "../../build";
import { prerender } from "../../prerender";
import { commonArgs } from "../common";

export default defineCommand({
  meta: {
    name: "build",
    description: "Build nitro project for production",
  },
  args: {
    ...commonArgs,
    minify: {
      type: "boolean",
      description:
        "Minify the output (overrides preset defaults you can also use `--no-minify` to disable).",
    },
    preset: {
      type: "string",
      description:
        "The build preset to use (you can also use `NITRO_PRESET` environment variable).",
    },
    compatibilityDate: {
      type: "string",
      description:
        "The date to use for preset compatibility (you can also use `NITRO_COMPATIBILITY_DATE` environment variable).",
    },
  },
  async run({ args }) {
    const rootDir = resolve((args.dir || args._dir || ".") as string);
    const nitro = await createNitro(
      {
        rootDir,
        dev: false,
        minify: args.minify,
        preset: args.preset,
      },
      {
        compatibilityDate: args.compatibilityDate || "2024-05-17",
      }
    );
    await prepare(nitro);
    await copyPublicAssets(nitro);
    await prerender(nitro);
    await build(nitro);
    await nitro.close();
  },
});
