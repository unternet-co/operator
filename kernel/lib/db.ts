import Dexie, { Table } from 'dexie';
import { Interaction } from '../modules/interactions';
import { Process } from '../modules/processes';
import { Resource } from '../modules/resources';

export class Database extends Dexie {
  interactions!: Table<Interaction, number>;
  processes!: Table<Process, number>;
  resources!: Table<Resource, string>;

  constructor() {
    super('@unternet/kernel:db');

    this.version(1).stores({
      interactions: '++id',
      processes: '++id',
      resources: 'url',
    });
  }
}

export default new Database();
