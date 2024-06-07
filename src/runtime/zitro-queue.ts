import {
  zitroQueues,
  QueueDefinition,
} from "#internal/nitro/virtual/zitro-queues";
import Redis from "ioredis";
import { TaskPayload, TaskContext } from "./task";
import { Queue, Worker } from "bullmq";

export function defineQueue(def: QueueDefinition): QueueDefinition {
  if (typeof def.handle !== "function") {
    throw new TypeError("Queue must implement a `handle` method!");
  }
  return def;
}

const redis = new Redis({
  maxRetriesPerRequest: null,
});

export const queues: { [name: string]: Queue } = {};

export function initializeQueues(queueDefinitions: QueueDefinition[]) {
  for (const def of queueDefinitions) {
    const queue = new Queue(def.meta.name, { connection: redis });
    const worker = new Worker(
      def.meta.name,
      async (job) => {
        return new Promise((resolve, reject) => {
          def.handle(job, (err, result) => {
            if (err) return reject(err);
            resolve(result);
          });
        });
      },
      { connection: redis }
    );
    queues[def.meta.name] = queue;
  }
}

export async function addJobToQueue(
  queueName: string,
  payload: TaskPayload,
  context: TaskContext = {}
) {
  if (!(queueName in queues)) {
    throw new Error(`Queue \`${queueName}\` is not available!`);
  }
  await queues[queueName].add("job", payload, {
    removeOnComplete: true,
    removeOnFail: true,
  });
}

export function initQueues() {
  const queueDefinitions = Object.values(zitroQueues).map((q) => q.handler);
  initializeQueues(queueDefinitions);
}
