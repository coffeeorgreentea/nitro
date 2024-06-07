import { scanFiles } from "./scan";
import { type Nitro, ZitroConfigFileName } from "./types";

export async function scanZitroPaths(nitro: Nitro) {
  const rpcFiles = await scanFiles(nitro, "rpc");
  const configFiles = await scanFiles(nitro, "config");
  const subscriptionFiles = await scanFiles(nitro, "subscriptions");
  const queueFiles = await scanFiles(nitro, "queues");

  nitro.zitro.scannedRPCRouters = rpcFiles.map((file) => {
    const name = file.path.replace(/.*\/rpc\/(.*)\.(js|ts)/, "$1");
    return { name, handler: file.fullPath, options: {} };
  });

  const context = configFiles.find((file) => file.path.includes("context"));
  const middleware = configFiles.find((file) =>
    file.path.includes("middleware")
  );
  const options = configFiles.find((file) => file.path.includes("options"));
  const shield = configFiles.find((file) => file.path.includes("shield"));

  const config: { name: ZitroConfigFileName; handler: string }[] = [];
  if (context) {
    config.push({
      name: ZitroConfigFileName.context,
      handler: context.fullPath,
    });
  }

  if (middleware) {
    config.push({
      name: ZitroConfigFileName.middleware,
      handler: middleware.fullPath,
    });
  }

  if (options) {
    config.push({
      name: ZitroConfigFileName.options,
      handler: options.fullPath,
    });
  }

  if (shield) {
    config.push({
      name: ZitroConfigFileName.shield,
      handler: shield.fullPath,
    });
  }

  nitro.zitro.scannedConfig = config;

  nitro.zitro.scannedSubscriptions = subscriptionFiles.map((file) => {
    const name = file.path.replace(/.*\/subscriptions\/(.*)\.(js|ts)/, "$1");
    return { name, handler: file.fullPath, topic: name };
  });

  nitro.zitro.scannedQueues = queueFiles.map((file) => {
    const name = file.path.replace(/.*\/queues\/(.*)\.(js|ts)/, "$1");
    return { name, handler: file.fullPath };
  });
}
