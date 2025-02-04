import { AppletAction } from '@web-applets/sdk';

export interface IndexedAction {
  key: string;
  appletUrl: string;
  action: AppletAction;
}

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

export interface ActionChoice {
  url: string;
  actionId: string;
  arguments: unknown;
}
