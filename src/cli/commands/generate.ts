import { defineCommand } from "citty";
import consola from "consola";
import { execa } from "execa";

const config = {
  // TODO: move to nitro.config.ts
  dbConfig: {
    schemaPath: "./playground/schema.prisma",
  },
};

export default defineCommand({
  meta: {
    name: "generate",
    description:
      "Generates a Prisma Client, Zod schemas, and shielded TRPC router.",
  },

  async run({ args, subCommand }) {
    consola.log("Generating Zitro...");

    try {
      const res = await execa("npx", [
        "prisma",
        "generate",
        "--schema",
        config.dbConfig.schemaPath,
      ]);
      consola.success("Generated Prisma Client: ", res.stdout);
    } catch (error) {
      consola.error("Failed to generate Prisma Client.");
    }
  },
});
