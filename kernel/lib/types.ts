import { AppletAction } from '@web-applets/sdk';

export interface IndexedAction {
  key: string;
  appletUrl: string;
  action: AppletAction;
}
