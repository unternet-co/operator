import Dexie, { Table } from 'dexie';
import { Tab } from '../features/tabs';
import { Config } from '../features/config';

export class Database extends Dexie {
  config!: Table<{ key: keyof Config; value: string }, string>;
  tabs!: Table<Tab, number>;

  constructor() {
    super('unternet/client');

    this.version(1).stores({
      tabs: '++id',
      config: 'key',
    });
  }
}

export default new Database();
