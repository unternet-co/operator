import { ManifestIcon } from '@web-applets/sdk';
import { getMetadata, normalizeUrl } from '../lib/utils';
import db from '../lib/db';
import { liveQuery } from 'dexie';
import { JSONSchema } from '../lib/types';

export type ResourceType = 'web';

export interface Resource {
  type: ResourceType;
  url: string;
  name?: string;
  short_name?: string;
  icons?: ManifestIcon[];
  description?: string;
  actions?: ResourceAction[];
}

export interface ResourceAction {
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
  const resource: Resource = {
    type: 'web',
    url,
    name: metadata.name,
    short_name: metadata.short_name,
    icons: metadata.icons,
    description: metadata.description,
    actions: metadata.actions,
  };

  db.resources.put(resource);
}

async function allActions() {
  const allResources = await resources.all();

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

  for (const resource of allResources) {
    // if (resource.search)
    for (const action of resource.actions) {
      actions.push({
        id: `${resource.url}#${action.id}`,
        description: `${resource.description}\n\n${action.description}`,
        parameters: action.parameters,
      });
    }
  }

  return actions;
}

function all() {
  return db.resources.toArray();
}

function subscribe(
  query: () => Promise<Resource[]>,
  callback: (resources: Resource[]) => void
) {
  return liveQuery(query).subscribe(callback);
}

const actions = {
  all: allActions,
};

export const resources = {
  register,
  all,
  get: db.resources.get.bind(db.resources),
  delete: db.resources.delete.bind(db.resources),
  subscribe,
  actions,
};
