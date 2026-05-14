import fs from "fs";
import path from "path";
import { LocalStorageState } from "../types/agent.types";

const initialState: LocalStorageState = {
  session: {
    accessToken: null,
    agentId: null,
    unitId: null,
    authenticatedAt: null
  },
  queue: [],
  devices: []
};

export class FileStorage {
  constructor(private readonly filename: string) {}

  read(): LocalStorageState {
    if (!fs.existsSync(this.filename)) {
      this.write(initialState);
      return initialState;
    }

    const raw = fs.readFileSync(this.filename, "utf8");
    return JSON.parse(raw) as LocalStorageState;
  }

  write(state: LocalStorageState) {
    const dir = path.dirname(this.filename);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(this.filename, JSON.stringify(state, null, 2), "utf8");
  }

  update(mutator: (state: LocalStorageState) => LocalStorageState) {
    const current = this.read();
    const next = mutator(current);
    this.write(next);
    return next;
  }
}

