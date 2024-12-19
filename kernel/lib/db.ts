import Dexie, { Table } from 'dexie';
import { Interaction } from '../modules/interactions';
import { Process } from '../modules/processes';
import { AppletRecord } from '../modules/applet-records';

export class Database extends Dexie {
  interactions!: Table<Interaction, number>;
  processes!: Table<Process, number>;
  appletRecords!: Table<AppletRecord, string>;

  constructor() {
    super('@unternet/kernel:db');

    this.version(1).stores({
      interactions: '++id',
      processes: '++id',
      appletRecords: 'url',
    });
  }
}

export default new Database();
