import Dexie, { Table } from 'dexie';
import { Interaction } from '../modules/interactions';
import { Process } from '../modules/processes';
import { Resource } from '../modules/resources';
import { Workspace } from '../modules/workspaces';

export class Database extends Dexie {
  interactions!: Table<Interaction, number>;
  processes!: Table<Process, number>;
  resources!: Table<Resource, string>;
  workspaces!: Table<Workspace, number>;

  constructor() {
    super('unternet/kernel');

    this.version(1).stores({
      workspaces: '++id',
      interactions: '++id',
      processes: '++id',
      resources: 'url',
    });
  }
}

export default new Database();
