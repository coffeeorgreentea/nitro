import { hash } from "ohash";
import type { Nitro } from "../../types";
import { virtual } from "./virtual";

export function zitroQueues(nitro: Nitro) {
  const getZitroQueues = () => {
    return nitro.zitro.scannedQueues;
  };

  return virtual(
    {
      "#internal/nitro/virtual/zitro-queues": () => {
        const zitroQueues = getZitroQueues();

        const imports = unique(zitroQueues.map((q) => q.handler));

        const code = /* js */ `
${imports
  .map((handler) => `import ${getImportId(handler)} from '${handler}';`)
  .join("\n")}

export const zitroQueues = [
${zitroQueues
  .map((q) => `  { name: '${q.name}', handler: ${getImportId(q.handler)} }`)
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
