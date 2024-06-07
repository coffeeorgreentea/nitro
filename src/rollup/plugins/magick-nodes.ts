import { hash } from "ohash";
import type { Nitro } from "../../types/nitro";
import { virtual } from "./virtual";

export function magickNodes(nitro: Nitro) {
  const getmagickNodes = () => {
    return nitro.magick.scannedNodes;
  };

  return virtual(
    {
      "#internal/nitro/virtual/magick-nodes": () => {
        const magickNodes = getmagickNodes();

        const imports = unique(magickNodes.map((n) => n.handler));

        const code = /* js */ `
${imports.map((handler) => `import ${getImportId(handler)} from '${handler}';`).join("\n")}

export const magickNodes = [
${magickNodes.map((n) => `  { name: '${n.name}', handler: ${getImportId(n.handler)} }`).join(",\n")}
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
