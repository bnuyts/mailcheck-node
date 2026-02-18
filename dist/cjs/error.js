"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailCheckError = void 0;
class MailCheckError extends Error {
    status;
    code;
    constructor(status, code, message) {
        super(message);
        this.name = 'MailCheckError';
        this.status = status;
        this.code = code;
        Object.setPrototypeOf(this, MailCheckError.prototype);
    }
}
exports.MailCheckError = MailCheckError;
//# sourceMappingURL=error.js.map