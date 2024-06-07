import { scanFiles } from "./scan";
import type { Nitro } from "./types";

export async function scanMagickPaths(nitro: Nitro) {
  const nodeFiles = await scanFiles(nitro, "nodes");

  nitro.magick.scannedNodes = nodeFiles.map((file) => {
    const name = file.path.replace(/.*\/nodes\/(.*)\.(js|ts)/, "$1");
    return { name, handler: file.fullPath };
  });
}
