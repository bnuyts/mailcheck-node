export class MailCheckError extends Error {
  public readonly status: number;
  public readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'MailCheckError';
    this.status = status;
    this.code = code;
    Object.setPrototypeOf(this, MailCheckError.prototype);
  }
}
