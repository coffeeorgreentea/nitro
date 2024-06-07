import { useNitroApp } from "./app";

export interface Procedure {
  name: string;
  args: any[];
}

export function triggerRpc(message: any) {
  const nitroApp = useNitroApp();
  nitroApp.hooks.callHook("agent:message", message);
}
