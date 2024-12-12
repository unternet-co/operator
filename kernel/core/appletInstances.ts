import db from '../lib/db';
import { applets } from '@web-applets/sdk';

/* Models */

export interface AppletInstance {
  id?: number;
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

export async function createAppletInstance(
  url: string,
  action?: ActionDeclaration
) {
  const id = await db.appletInstances.add({ url });
  if (action) {
    console.log('Dispatching create action', id);
    dispatchAction(id, action.id, action.params);
  }
  return id;
}

export async function getAppletData(actionChoice?: ActionChoice) {
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
  instanceId: number,
  actionId: string,
  params: any
) {
  const instance = await appletInstances.get(instanceId);
  if (!instance) {
    throw new Error(`Applet instance with ID ${instanceId} doesn't exist!`);
  }

  console.log('[Operator] Loading applet.');
  const applet = await applets.load(instance.url);
  console.log('[Operator] Applet loaded.');
  applet.data = instance.data;

  applet.ondata = (data) => {
    console.log('[Operator] Updating data', data);
    appletInstances.setData(instanceId, data);
  };

  console.log('[Operator] Dispatching action:', actionId, params);
  await applet.dispatchAction(actionId, params);
  applet.ondata = () => {};

  return applet.data;
}

async function setData(instanceId: number, data: any) {
  db.appletInstances.update(instanceId, { data });
}

/* Exports */

export const appletInstances = {
  create: createAppletInstance,
  get: db.appletInstances.get.bind(db.appletInstances),
  getAppletData,
  dispatchAction,
  setData,
  destroy: db.appletInstances.delete.bind(db.appletInstances),
  clear: db.appletInstances.clear.bind(db.appletInstances),
};
