import { AppletManifest, loadManifest } from '@web-applets/sdk';
import { normalizeUrl } from '../lib/utils';
import db from '../lib/db';
import { liveQuery } from 'dexie';

/* APPLET REGISTER */

export interface AppletRecord {
  url: string;
  manifest: AppletManifest;
}

async function register(url: string) {
  if (url.includes('localhost')) {
    url = normalizeUrl(url, 'http');
  } else {
    url = normalizeUrl(url);
  }

  // TODO: Make applets.getManifest(url);
  const manifest = await loadManifest(url);
  if (manifest && manifest.actions) {
    db.appletRecords.put({ url, manifest });
  }
}

function all() {
  return db.appletRecords.toArray();
}

function subscribe(
  query: () => Promise<AppletRecord[]>,
  callback: (processes: AppletRecord[]) => void
) {
  return liveQuery(query).subscribe(callback);
}

export const appletRecords = {
  register,
  all,
  get: db.appletRecords.get.bind(db.appletRecords),
  delete: db.appletRecords.delete.bind(db.appletRecords),
  subscribe,
};
