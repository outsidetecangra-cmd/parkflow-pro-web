"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileStorage = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const initialState = {
    session: {
        accessToken: null,
        agentId: null,
        unitId: null,
        authenticatedAt: null
    },
    queue: [],
    devices: []
};
class FileStorage {
    constructor(filename) {
        this.filename = filename;
    }
    read() {
        if (!fs_1.default.existsSync(this.filename)) {
            this.write(initialState);
            return initialState;
        }
        const raw = fs_1.default.readFileSync(this.filename, "utf8");
        return JSON.parse(raw);
    }
    write(state) {
        const dir = path_1.default.dirname(this.filename);
        fs_1.default.mkdirSync(dir, { recursive: true });
        fs_1.default.writeFileSync(this.filename, JSON.stringify(state, null, 2), "utf8");
    }
    update(mutator) {
        const current = this.read();
        const next = mutator(current);
        this.write(next);
        return next;
    }
}
exports.FileStorage = FileStorage;
