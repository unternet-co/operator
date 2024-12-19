import { liveQuery, Table } from 'dexie';
import db from '../lib/db';
import { AppletDataEvent, applets } from '@web-applets/sdk';

/* Models */

export type Process = AppletProcess;
type ProcessType = 'applet';

interface BaseProcess {
  id?: number;
  type: ProcessType;
}

export interface AppletProcess extends BaseProcess {
  id?: number;
  type: 'applet';
  url: string;
  data?: Record<string, unknown>;
}

export interface ActionDeclaration {
  id: string;
  params: any;
}

export interface ActionChoice {
  appletUrl: string;
  actionId: string;
  params: any;
}

/* Actions */

async function createAppletProcess(actionChoice: ActionChoice) {
  const id = await db.processes.add({
    type: 'applet',
    url: actionChoice.appletUrl,
  });
  dispatchAction(id, actionChoice.actionId, actionChoice.params);
  return id;
}

async function runAppletWithAction(actionChoice?: ActionChoice) {
  console.log('[Operator] Loading applet.');
  const applet = await applets.load(actionChoice.appletUrl);
  console.log('[Operator] Applet loaded.');
  console.log(
    '[Operator] Dispatching action:',
    actionChoice.actionId,
    actionChoice.params
  );
  await applet.dispatchAction(actionChoice.actionId, actionChoice.params);
  return applet.data;
}

async function dispatchAction(
  processId: number,
  actionId: string,
  params: any
) {
  const instance = await processes.get(processId);
  if (!instance) {
    throw new Error(`Process with ID ${processId} doesn't exist!`);
  }

  console.log('[Operator] Loading applet.');
  const applet = await applets.load(instance.url);
  console.log('[Operator] Applet loaded.');
  if (instance.data) applet.data = instance.data;

  applet.ondata = (event: AppletDataEvent) => {
    console.log('[Operator] Updating data', event.data);
    processes.setAppletData(processId, event.data);
  };

  console.log('[Operator] Dispatching action:', actionId, params);
  await applet.dispatchAction(actionId, params);
  applet.ondata = () => {};

  return applet.data;
}

async function setAppletData(instanceId: number, data: any) {
  db.processes.update(instanceId, { data });
}

/* Subscriptions */

function subscribe(
  query: () => Process[] | Process,
  callback: (processes: Process[] | Process) => void
) {
  return liveQuery(query).subscribe(callback);
}

/* Exports */

export const processes = {
  get: db.processes.get.bind(db.processes),
  createAppletProcess,
  runAppletWithAction,
  setAppletData,
  dispatchAction,
  destroy: db.processes.delete.bind(db.processes),
  clear: db.processes.clear.bind(db.processes),
  subscribe,
};
