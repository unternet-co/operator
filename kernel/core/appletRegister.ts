import { store } from '../lib/store';
import { AppletManifest, loadManifest } from '@web-applets/sdk';

export interface AppletRegister {
  [key: string]: AppletManifest;
}

async function add(url: string) {
  // TODO: Make applets.getManifest(url);
  const manifest = await loadManifest(url);

  store.update((state) => {
    state.appletRegister[url] = manifest;
  });
}

function get() {
  return store.get().appletRegister;
}

type SubscribeCallback = (register: AppletRegister) => void;
function subscribe(callback: SubscribeCallback) {
  store.subscribe((state) => callback(state.appletRegister));
}

export const appletRegister = {
  add,
  get,
  subscribe,
};
