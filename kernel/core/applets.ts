import { store } from '../lib/store';
import { AppletManifest, loadManifest } from '@web-applets/sdk';

export interface AppletsRegister {
  [key: string]: AppletManifest;
}

async function add(url: string) {
  // TODO: Make applets.getManifest(url);
  const manifest = await loadManifest(url);

  console.log(manifest);
  store.update((state) => {
    state.appletsRegister[url] = manifest;
  });
}

type SubscribeCallback = (register: AppletsRegister) => void;
function subscribe(callback: SubscribeCallback) {
  store.subscribe((state) => callback(state.appletsRegister));
}

export const appletsRegister = {
  add,
  subscribe,
};
