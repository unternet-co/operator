import { liveQuery } from 'dexie';
import db from '../lib/db';

export interface Workspace {
  id?: number;
  interactionIds: number[];
  resourceUrls: string[];
}

function create() {
  return db.workspaces.add({
    interactionIds: [],
    resourceUrls: [],
  });
}

function subscribe(
  query: () => Promise<Workspace[]>,
  callback: (workspaces: Workspace[]) => void
) {
  return liveQuery(query).subscribe(callback);
}

export const workspaces = {
  create,
  close,
  all: db.workspaces.toArray.bind(db.workspaces),
  get: db.workspaces.get.bind(db.workspaces),
  delete: db.workspaces.delete.bind(db.workspaces),
  subscribe,
};
