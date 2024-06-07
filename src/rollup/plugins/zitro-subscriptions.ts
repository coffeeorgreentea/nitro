import { hash } from "ohash";
import type { Nitro } from "../../types";
import { virtual } from "./virtual";

export function zitroSubscriptions(nitro: Nitro) {
  const getZitroSubscriptions = () => {
    return nitro.zitro.scannedSubscriptions;
  };

  return virtual(
    {
      "#internal/nitro/virtual/zitro-subscriptions": () => {
        const zitroSubscriptions = getZitroSubscriptions();

        const imports = unique(zitroSubscriptions.map((s) => s.handler));

        const code = /* js */ `
${imports
  .map((handler) => `import ${getImportId(handler)} from '${handler}';`)
  .join("\n")}

export const zitroSubscriptions = [
${zitroSubscriptions
  .map((s) => `  { name: '${s.name}', handler: ${getImportId(s.handler)} }`)
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
