"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeToken = encodeToken;
exports.decodeToken = decodeToken;
exports.getBearerToken = getBearerToken;
function base64UrlEncode(input) {
    return Buffer.from(input, "utf8").toString("base64url");
}
function base64UrlDecode(input) {
    return Buffer.from(input, "base64url").toString("utf8");
}
function sign(payloadB64, secret) {
    const crypto = require("crypto");
    return crypto.createHmac("sha256", secret).update(payloadB64).digest("base64url");
}
function encodeToken(payload, secret) {
    const payloadB64 = base64UrlEncode(JSON.stringify(payload));
    const signature = sign(payloadB64, secret);
    return `${payloadB64}.${signature}`;
}
function decodeToken(token, secret) {
    if (!token) {
        return null;
    }
    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature) {
        return null;
    }
    if (sign(payloadB64, secret) !== signature) {
        return null;
    }
    try {
        const payload = JSON.parse(base64UrlDecode(payloadB64));
        if (!payload?.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
            return null;
        }
        return payload;
    }
    catch {
        return null;
    }
}
function getBearerToken(authorization) {
    if (!authorization) {
        return null;
    }
    const [scheme, token] = authorization.split(" ");
    if (scheme?.toLowerCase() !== "bearer" || !token) {
        return null;
    }
    return token;
}
//# sourceMappingURL=token.util.js.map