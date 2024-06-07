import { hash } from "ohash";
import type { Nitro, ZitroConfigFileName } from "../../types";
import { virtual } from "./virtual";

export function zitroConfig(nitro: Nitro) {
  const getZitroConfig = (): {
    name: ZitroConfigFileName;
    handler: string;
  }[] => {
    return nitro.zitro.scannedConfig;
  };

  return virtual(
    {
      "#internal/nitro/virtual/zitro-config": () => {
        const zitroConfig = getZitroConfig();

        // Imports take priority
        const imports = unique(zitroConfig.map((r) => r.handler));

        const code = /* js */ `
${imports
  .map((handler) => `import ${getImportId(handler)} from '${handler}';`)
  .join("\n")}

export const zitroConfig = [
${zitroConfig
  .map(
    (r) =>
      `  { name: '${r.name}', handler: ${getImportId(
        r.handler
      )}, options: ${JSON.stringify({})} }`
  )
  .join(",\n")}
];
  `.trim();
        return code;
      },
    },
    nitro.vfs
  );
}

function unique(arr: any[]) {
  return [...new Set(arr)];
}

function getImportId(p: string, lazy?: boolean) {
  return (lazy ? "_lazy_" : "_") + hash(p).slice(0, 6);
}
