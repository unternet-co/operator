import { workspaces, type Workspace } from '@unternet/kernel';
import db from '../lib/db';
import { liveQuery } from 'dexie';

export type Tab = WorkspaceTab;
export type TabType = 'workspace';

export interface BaseTab {
  id?: number;
  title: string;
  type: TabType;
}

export interface WorkspaceTab extends BaseTab {
  type: 'workspace';
  workspaceId: Workspace['id'];
}

async function create(type?: TabType) {
  const workspaceId = await workspaces.create();

  db.tabs.add({
    type: 'workspace',
    title: 'New workspace',
    workspaceId,
  });
}

function setTitle(id: Tab['id'], title: string) {
  return db.tabs.update(id, { title });
}

async function close(id: Tab['id']) {
  const { workspaceId } = await db.tabs.get(id);
  await db.tabs.delete(id);
  // TODO: Remove this when history done
  await workspaces.delete(workspaceId);
}

function subscribe(
  query: () => Promise<Tab[]>,
  callback: (tabs: Tab[]) => void
) {
  return liveQuery(query).subscribe(callback);
}

export const tabs = {
  create,
  close,
  setTitle,
  subscribe,
  all: db.tabs.toArray.bind(db.tabs),
};
