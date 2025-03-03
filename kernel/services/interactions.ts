import { liveQuery } from 'dexie';
import db from '../lib/db.js';
import { workspaces } from './workspaces.js';
import { InputOptions } from '../types.js';
import { createId } from '../lib/utils.js';

/* Model */

export type InteractionInput = CommandInput;

interface CommandInput {
  type: 'command';
  text: string;
}

export type InteractionOutput = TextOutput | ProcessOutput;

export interface TextOutput {
  type: 'text';
  content: string;
}

export interface ProcessOutput {
  type: 'process';
  processId: number;
}

export interface Interaction {
  id: string;
  input: InteractionInput;
  outputs: InteractionOutput[];
}

/* Actions */

async function create(input: InteractionInput, options?: InputOptions) {
  const id = await db.interactions.add({
    id: createId(),
    input,
    outputs: [],
  });

  if (options && options.workspaceId) {
    await workspaces.addInteraction(options.workspaceId, id);
  }

  return id;
}

async function createDataOutput(
  interactionId: number,
  partialDataOutput: Omit<DataOutput, 'type'>
) {
  const { outputs } = await interactions.get(interactionId);
  outputs.push({ type: 'data', ...partialDataOutput });
  db.interactions.update(interactionId, { outputs });
  return outputs.length - 1;
}

async function createTextOutput(
  interactionId: number,
  text?: string
): Promise<number> {
  const { outputs } = await interactions.get(interactionId);
  outputs.push({ type: 'text', content: text || '' });
  db.interactions.update(interactionId, { outputs });
  return outputs.length - 1;
}

async function createWebOutput(
  interactionId: number,
  processId: number
): Promise<number> {
  const { outputs } = await interactions.get(interactionId);
  outputs.push({ type: 'web', processId });
  db.interactions.update(interactionId, { outputs });
  return outputs.length - 1;
}

async function updateTextOutput(
  interactionId: number,
  outputIndex: number,
  text: string
) {
  const { outputs } = await interactions.get(interactionId);
  outputs[outputIndex].content = text;
  db.interactions.update(interactionId, { outputs });
}

/* Subscriptions */

function subscribe(
  query: () => Interaction[],
  callback: (interaction: Interaction[]) => void
) {
  return liveQuery(query).subscribe(callback);
}

/* Exports */

export const interactions = {
  create: create,
  createDataOutput,
  createTextOutput,
  updateTextOutput,
  createWebOutput,
  subscribe,
  get: db.interactions.get.bind(db.interactions),
  bulkGet: (interactionIds: Interaction['id'][]) =>
    db.interactions.bulkGet(interactionIds),
  destroy: db.interactions.delete.bind(db.interactions),
  clear: db.interactions.clear.bind(db.interactions),
  all: db.interactions.toArray.bind(db.interactions),
};
