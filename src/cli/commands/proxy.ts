import { defineCommand } from "citty";
// import { loadConfig } from "../utils/load-config";
import consola from "consola";
// import { zitroPresetProxyConfigSchema } from "_zitro/preset";
import { generateZodClientFromOpenAPI } from "openapi-zod-client";
import fs from "node:fs";

const proxies = [
  { name: "deno", specPath: "https://api.deno.com/v1/openapi.json" },
];

const zitroPresetProxyConfigSchema = {
  parse: (config: any) => config,
};

export default defineCommand({
  meta: {
    name: "proxy",
    description: "Generate a proxy",
  },
  args: {
    name: { type: "string", description: "name of the proxy", required: true },
  },
  async run({ args }) {
    const proxy = proxies.find((p) => p.name === args.name);

    if (!proxy) {
      consola.error(`Proxy ${args.name} not found`);
      return;
    }

    consola.info(`Generating proxy ${args.name}...`);

    const spec = await fetch(proxy.specPath).then((res) => res.json());

    // if the file doesn't exist, create it
    const path = `./playground/generated/clients/proxy/${args.name}/schema.ts`;

    if (!fs.existsSync(path)) {
      fs.mkdirSync(`./playground/generated/clients/proxy/${args.name}`, {
        recursive: true,
      });
      fs.writeFileSync;
    }

    const schemas = await generateZodClientFromOpenAPI({
      openApiDoc: spec,
      distPath: `./playground/generated/clients/proxy/${args.name}/schema.ts`,
      templatePath: "./src/cli/templates/proxy.hbs",
      options: {
        withAlias: true,
      },
    });

    consola.info(schemas);

    consola.success(`Proxy ${args.name} generated`);
  },
});

// bunx openapi-zod-client `https://api.deno.com/v1/openapi.json` -o `./server/zitro/generated/proxy/deno/schema.ts
