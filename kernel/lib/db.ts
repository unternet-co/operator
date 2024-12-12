import Dexie, { Table } from 'dexie';
import { Interaction } from '../core/interactions';

export class Database extends Dexie {
  interactions!: Table<Interaction, number>;

  constructor() {
    super('db');

    this.version(1).stores({
      interactions: '++id',
    });
  }
}

export default new Database();
