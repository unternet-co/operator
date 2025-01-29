import { ManifestIcon } from '@web-applets/sdk';
import { getMetadata, normalizeUrl } from '../lib/utils';
import db from '../lib/db';
import { liveQuery } from 'dexie';
import { JSONSchema } from '../lib/types';

export type ToolType = 'web-applet' | 'web-resource';

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

async function register(url: string) {
  if (url.includes('localhost')) {
    url = normalizeUrl(url, 'http');
  } else {
    url = normalizeUrl(url);
  }

  const metadata = await getMetadata(url);

  // TODO: Later, might want to have indexing work for web applets too!
  // Maybe just one "web" process, which optionally has actions?
  // Maybe put the protocol on the actions themselves, like "system" or "search" or "web-applets"
  const tool: ToolDefinition = {
    type: 'web-resource',
    url,
    name: metadata.name,
    short_name: metadata.short_name,
    icons: metadata.icons,
    description: metadata.description,
  };

  if (metadata.actions) {
    tool.type = 'web-applet';
    tool.actions = metadata.actions;
  }

  db.tools.put(tool);
}

async function getActions() {
  const allTools = await tools.all();

  let actions = [];
  // const searchAction = {
  //   id: 'search',
  //   description: 'Search the web & specific domains.',
  //   parameters: {
  //     id: `search`,
  //     description: `Conduct a web search on this website's pages.\nWebsite description: ${metadata.description}.`,
  //     parameters: {
  //       type: 'object',
  //       properties: {
  //         query: {
  //           type: 'string',
  //           description: 'The search query.',
  //         },
  //       },
  //       required: ['query'],
  //     },
  //   },
  // };

  for (const tool of allTools) {
    if (tool.type === 'web-resource') {
      continue;
    }

    for (const action of tool.actions) {
      actions.push({
        id: `${tool.url}#${action.id}`,
        description: `${tool.description}\n\n${action.description}`,
        parameters: action.parameters,
      });
    }
  }

  return actions;
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
  getActions,
  get: db.tools.get.bind(db.tools),
  delete: db.tools.delete.bind(db.tools),
  subscribe,
};
