export class MailCheckError extends Error {
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
//# sourceMappingURL=error.js.map