import { Store } from 'store-thing';
import { AppletRegister } from '../core/appletRegister';

export interface StoreData {
  appletRegister: AppletRegister;
}

let initData: StoreData = {
  appletRegister: {},
};

export const store = new Store('store', initData, { storage: 'local' });
