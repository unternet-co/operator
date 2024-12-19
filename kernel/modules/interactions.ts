import { liveQuery } from 'dexie';
import db from '../lib/db';

/* Model */

export type InteractionInput = CommandInput;

interface CommandInput {
  type: 'command';
  text: string;
}

export type InteractionOutput = TextOutput | DataOutput | AppletOutput;

export interface DataOutput {
  type: 'data';
  appletUrl: string;
  content: object;
}

export interface TextOutput {
  type: 'text';
  content: string;
}

export interface AppletOutput {
  type: 'applet';
  processId: number;
}

export interface Interaction {
  id?: number;
  input: InteractionInput;
  outputs: InteractionOutput[];
}

/* Actions */

async function fromInput(input: InteractionInput) {
  return await db.interactions.add({
    input,
    outputs: [],
  });
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

async function createAppletOutput(
  interactionId: number,
  processId: number
): Promise<number> {
  const { outputs } = await interactions.get(interactionId);
  outputs.push({ type: 'applet', processId });
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

function subscribe(callback: (interactions: Interaction[]) => void) {
  return liveQuery(() => db.interactions.toArray()).subscribe(callback);
}

/* Exports */

export const interactions = {
  fromInput,
  createDataOutput,
  createTextOutput,
  updateTextOutput,
  createAppletOutput,
  subscribe,
  get: db.interactions.get.bind(db.interactions),
  destroy: db.interactions.delete.bind(db.interactions),
  clear: db.interactions.clear.bind(db.interactions),
  all: db.interactions.toArray.bind(db.interactions),
};
