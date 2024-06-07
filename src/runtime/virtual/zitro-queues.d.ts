import type { Job } from "bullmq";

export interface QueueMeta {
  name: string;
  description?: string;
}

export interface QueueDefinition {
  meta: QueueMeta;
  handle: (job: Job, done: (err: Error | null, result?: any) => void) => void;
}

export declare const zitroQueues: {
  [name: string]: {
    handler: QueueDefinition;
  };
};
