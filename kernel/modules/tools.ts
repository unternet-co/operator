import { loadManifest, ManifestIcon } from '@web-applets/sdk';
import { normalizeUrl } from '../lib/utils';
import db from '../lib/db';
import { liveQuery } from 'dexie';
import { JSONSchema } from '../lib/types';

export type ToolType = 'applet' | 'web_resource';

export interface ToolDefinition {
  type: ToolType;
  url: string;
  name?: string;
  short_name?: string;
  icons?: ManifestIcon[];
  description?: string;
  actions?: ActionDefinition[];
}

export interface ActionDefinition {
  id: string;
  description?: string;
  parameters?: JSONSchema;
}

const webResourceActions: ActionDefinition[] = [
  {
    id: 'query',
    description: 'Search the contents of this domain.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query.',
        },
      },
      required: ['query'],
    },
  },
];

async function register(type: ToolType, url: string) {
  if (url.includes('localhost')) {
    url = normalizeUrl(url, 'http');
  } else {
    url = normalizeUrl(url);
  }

  if (type === 'applet') {
    const manifest = await loadManifest(url);
    if (manifest && manifest.actions) {
      db.tools.put({
        type: 'applet',
        url,
        name: manifest.name,
        short_name: manifest.short_name,
        icons: manifest.icons,
        description: manifest.description,
        actions: manifest.actions,
      });
    }
  } else if (type === 'web_resource') {
    db.tools.put({
      type: 'web_resource',
      url,
      actions: webResourceActions,
    });
  } else {
    throw new TypeError('Tool type value is invalid.');
  }
}

function all() {
  return db.tools.toArray();
}

function subscribe(
  query: () => Promise<ToolDefinition[]>,
  callback: (processes: ToolDefinition[]) => void
) {
  return liveQuery(query).subscribe(callback);
}

export const tools = {
  register,
  all,
  get: db.tools.get.bind(db.tools),
  delete: db.tools.delete.bind(db.tools),
  subscribe,
};
