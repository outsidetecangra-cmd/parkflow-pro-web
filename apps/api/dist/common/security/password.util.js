"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPassword = verifyPassword;
const crypto_1 = require("crypto");
function sha256(value) {
    return (0, crypto_1.createHash)("sha256").update(value).digest("hex");
}
function verifyPassword(value, storedHash) {
    if (!storedHash) {
        return false;
    }
    if (storedHash.startsWith("sha256:")) {
        const current = Buffer.from(sha256(value), "utf8");
        const stored = Buffer.from(storedHash.slice(7), "utf8");
        return current.length === stored.length && (0, crypto_1.timingSafeEqual)(current, stored);
    }
    if (storedHash.startsWith("plain:")) {
        return storedHash.slice(6) === value;
    }
    return false;
}
//# sourceMappingURL=password.util.js.map