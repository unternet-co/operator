import db from '../lib/db';
import { applets } from '@web-applets/sdk';

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

async function createAppletProcess(url: string, action?: ActionDeclaration) {
  const id = await db.processes.add({ type: 'applet', url });
  if (action) {
    console.log('Dispatching create action', id);
    dispatchAction(id, action.id, action.params);
  }
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

async function dispatchAction(pid: number, actionId: string, params: any) {
  const instance = await processes.get(pid);
  if (!instance) {
    throw new Error(`Process with ID ${pid} doesn't exist!`);
  }

  console.log('[Operator] Loading applet.');
  const applet = await applets.load(instance.url);
  console.log('[Operator] Applet loaded.');
  applet.data = instance.data;

  applet.ondata = (data) => {
    console.log('[Operator] Updating data', data);
    processes.setAppletData(pid, data);
  };

  console.log('[Operator] Dispatching action:', actionId, params);
  await applet.dispatchAction(actionId, params);
  applet.ondata = () => {};

  return applet.data;
}

async function setAppletData(instanceId: number, data: any) {
  db.processes.update(instanceId, { data });
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
};
