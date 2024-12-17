import Dexie, { Table } from 'dexie';
import { Interaction } from '../core/interactions';
import { Process } from '../core/processes';

export class Database extends Dexie {
  interactions!: Table<Interaction, number>;
  processes!: Table<Process, number>;

  constructor() {
    super('operator-db');

    this.version(1).stores({
      interactions: '++id',
      appletInstances: '++id',
    });
  }
}

export default new Database();
