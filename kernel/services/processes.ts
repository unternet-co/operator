import { liveQuery } from 'dexie';
import db from '../lib/db.js';
import { createId } from '../lib/utils.js';
import { Process, ProcessType } from '../types.js';

/* Models */

class ProcessService {
  async create(type: ProcessType, url: string) {
    const id = createId();
    await db.processes.add({ id, type, url });
    return id;
  }

  subscribe(
    query: () => Process[] | Process,
    callback: (processes: Process[] | Process) => void
  ) {
    return liveQuery(query).subscribe(callback);
  }

  get = db.processes.get.bind(db.processes);
  delete = db.processes.delete.bind(db.processes);
  clear = db.processes.clear.bind(db.processes);
}

export const processes = new ProcessService();
