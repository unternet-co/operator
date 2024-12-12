import Dexie, { Table } from 'dexie';
import { Interaction } from '../core/interactions';
import { AppletInstance } from '../core/appletInstances';

export class Database extends Dexie {
  interactions!: Table<Interaction, number>;
  appletInstances!: Table<AppletInstance, number>;

  constructor() {
    super('operator-db');

    this.version(1).stores({
      interactions: '++id',
      appletInstances: '++id',
    });
  }
}

export default new Database();
