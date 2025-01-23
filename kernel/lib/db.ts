import Dexie, { Table } from 'dexie';
import { Interaction } from '../modules/interactions';
import { Process } from '../modules/processes';
import { ToolDefinition } from '../modules/tools';

export class Database extends Dexie {
  interactions!: Table<Interaction, number>;
  processes!: Table<Process, number>;
  tools!: Table<ToolDefinition, string>;

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
