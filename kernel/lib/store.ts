import { Store } from 'store-thing';
import { AppletsRegister } from '../core/applets';

export interface StoreData {
  appletsRegister: AppletsRegister;
}

let initData: StoreData = {
  appletsRegister: {},
};

export const store = new Store('store', initData, { storage: 'local' });
