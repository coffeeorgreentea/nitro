import { hash } from "ohash";
import type { Nitro, RPCRouter } from "../../types";
import { virtual } from "./virtual";

export function zitroRPC(nitro: Nitro) {
  const getZitroRPC = (): RPCRouter[] => {
    return nitro.zitro.scannedRPCRouters;
  };

  return virtual(
    {
      "#internal/nitro/virtual/zitro-rpc": () => {
        const zitroRPC = getZitroRPC();

        // Imports take priority
        const imports = unique(zitroRPC.map((r) => r.handler));

        const code = /* js */ `
${imports
  .map((handler) => `import ${getImportId(handler)} from '${handler}';`)
  .join("\n")}

export const zitroRPC = [
${zitroRPC
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
