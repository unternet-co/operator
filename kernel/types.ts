import { AppletActionDescriptor } from '@web-applets/sdk';
import { Workspace } from './services/workspaces.js';

export interface IndexedAction {
  key: string;
  appletUrl: string;
  action: AppletActionDescriptor;
}

type ActionProtocol = 'web' | 'search';

export interface ActionDirective {
  protocol: ActionProtocol;
  uri: string;
  actionId: string;
  arguments?: { [key: string]: any };
}

export interface ActionQueueItem {
  processId: string;
  args: { [key: string]: any }[];
}

export type ProcessType = 'web' | 'search';

export interface Process {
  id?: string;
  type: 'web' | 'search';
  running: boolean;
  url: string;
  data?: Record<string, unknown>;
}

export type ManifestIcon = {
  src: string;
  sizes?: string;
  type?: string;
  purpose?: string;
};

export interface JSONSchema {
  type:
    | 'object'
    | 'string'
    | 'number'
    | 'integer'
    | 'array'
    | 'boolean'
    | 'null';
  description?: string;
  properties?: {
    [key: string]: JSONSchema;
  };
  required?: string[];
  additionalProperties?: boolean;
}

export interface InputOptions {
  workspaceId: Workspace['id'];
}
