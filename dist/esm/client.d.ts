import type { MailCheckOptions, VerifyResult, BulkVerifyOptions, BulkVerifyResult, VerifyAuthOptions, VerifyAuthResult } from './types.js';
export declare class MailCheck {
    private readonly apiKey;
    private readonly baseUrl;
    private readonly timeout;
    readonly bulk: BulkClient;
    constructor(apiKey: string, options?: MailCheckOptions);
    /** Verify a single email address. */
    verify(email: string): Promise<VerifyResult>;
    /** Check email authentication (SPF/DKIM/DMARC) from raw email headers. */
    verifyAuth(options: VerifyAuthOptions): Promise<VerifyAuthResult>;
    /** @internal */
    request<T>(path: string, init: RequestInit): Promise<T>;
}
declare class BulkClient {
    private readonly mc;
    constructor(mc: MailCheck);
    /** Submit a bulk email verification job. */
    verify(emails: string[], options?: BulkVerifyOptions): Promise<BulkVerifyResult>;
}
export {};
//# sourceMappingURL=client.d.ts.map