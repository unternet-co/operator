import { getMetadata, normalizeUrl } from '../lib/utils.js';
import db from '../lib/db.js';
import { liveQuery } from 'dexie';
import { ManifestIcon } from '../types.js';
import { AppletActionDescriptor } from '@web-applets/sdk';
import { Resource } from '../index.js';

export type ResourceType = 'web';

export interface Resource {
  type: ResourceType;
  url: string;
  name?: string;
  short_name?: string;
  icons?: ManifestIcon[];
  description?: string;
  actions?: AppletActionDescriptor[];
}

class ResourceService {
  async register(url: string) {
    if (url.includes('localhost')) {
      url = normalizeUrl(url, 'http');
    } else {
      url = normalizeUrl(url);
    }

    const metadata = await getMetadata(url);
    const resource: Resource = {
      type: 'web',
      url,
      ...metadata,
    };

    db.resources.put(resource);
  }

  all() {
    return db.resources.toArray();
  }

  get = db.resources.get.bind(db.resources);
  delete = db.resources.delete.bind(db.resources);

  subscribe(
    query: () => Promise<Resource[]>,
    callback: (resources: Resource[]) => void
  ) {
    return liveQuery(query).subscribe(callback);
  }
}

export const resources = new ResourceService();
