import { useNitroApp } from "./app";

export function triggerAgentMessage(message: any) {
  const nitroApp = useNitroApp();
  nitroApp.hooks.callHook("agent:message", message);
}

export function triggerAgentError(error: any) {
  const nitroApp = useNitroApp();
  nitroApp.hooks.callHook("agent:error", error);
}

export function triggerAgentWarn(warning: any) {
  const nitroApp = useNitroApp();
  nitroApp.hooks.callHook("agent:warn", warning);
}

export function triggerAgentLog(log: any) {
  const nitroApp = useNitroApp();
  nitroApp.hooks.callHook("agent:log", log);
}

export function triggerAgentCommand(command: any) {
  const nitroApp = useNitroApp();
  nitroApp.hooks.callHook("agent:command", command);
}
