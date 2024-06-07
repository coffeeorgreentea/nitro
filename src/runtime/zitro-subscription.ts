import { zitroSubscriptions } from "#internal/nitro/virtual/zitro-subscriptions";

export function initSubscriptions() {
  const subscriptionDefinitions = Object.values(zitroSubscriptions).map(
    (s) => s.handler
  );
  initializeSubscriptions(subscriptionDefinitions);
}

export interface SubscriptionMeta {
  name: string;
  description?: string;
}

export interface SubscriptionDefinition {
  meta: SubscriptionMeta;
  handle: (params: { event: any; context: any }) => Promise<any>;
}

export function defineSubscription(
  def: SubscriptionDefinition
): SubscriptionDefinition {
  if (typeof def.handle !== "function") {
    throw new TypeError("Subscription must implement a `handle` method!");
  }
  return def;
}

const subscriptions: { [name: string]: SubscriptionDefinition } = {};

export function initializeSubscriptions(
  subscriptionDefinitions: SubscriptionDefinition[]
) {
  for (const def of subscriptionDefinitions) {
    subscriptions[def.meta.name] = def;
  }
}

export async function handleSubscriptionEvent(
  name: string,
  event: any,
  context: any = {}
) {
  if (!(name in subscriptions)) {
    throw new Error(`Subscription \`${name}\` is not available!`);
  }

  const handler = subscriptions[name].handle;
  return handler({ event, context });
}

// Hooks
