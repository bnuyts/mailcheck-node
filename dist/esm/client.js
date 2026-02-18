import { MailCheckError } from './error.js';
const DEFAULT_BASE_URL = 'https://api.mailcheck.dev';
const DEFAULT_TIMEOUT = 30_000;
export class MailCheck {
    apiKey;
    baseUrl;
    timeout;
    bulk;
    constructor(apiKey, options = {}) {
        if (!apiKey)
            throw new Error('API key is required');
        this.apiKey = apiKey;
        this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
        this.timeout = options.timeout ?? DEFAULT_TIMEOUT;
        this.bulk = new BulkClient(this);
    }
    /** Verify a single email address. */
    async verify(email) {
        return this.request('/v1/verify', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    }
    /** Check email authentication (SPF/DKIM/DMARC) from raw email headers. */
    async verifyAuth(options) {
        const body = {};
        if (options.headers)
            body.headers = options.headers;
        if (options.rawEmail)
            body.raw_email = options.rawEmail;
        if (options.trustedDomains)
            body.trusted_domains = options.trustedDomains;
        return this.request('/v1/verify/auth', {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }
    /** @internal */
    async request(path, init) {
        const url = `${this.baseUrl}${path}`;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeout);
        try {
            const res = await fetch(url, {
                ...init,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    ...init.headers,
                },
            });
            if (!res.ok) {
                let body;
                try {
                    body = (await res.json());
                }
                catch {
                    body = { message: res.statusText };
                }
                throw new MailCheckError(res.status, body.code ?? body.error ?? 'unknown_error', body.message);
            }
            return (await res.json());
        }
        catch (err) {
            if (err instanceof MailCheckError)
                throw err;
            if (err.name === 'AbortError') {
                throw new MailCheckError(0, 'timeout', `Request to ${path} timed out after ${this.timeout}ms`);
            }
            throw err;
        }
        finally {
            clearTimeout(timer);
        }
    }
}
class BulkClient {
    mc;
    constructor(mc) {
        this.mc = mc;
    }
    /** Submit a bulk email verification job. */
    async verify(emails, options = {}) {
        return this.mc.request('/v1/verify/bulk', {
            method: 'POST',
            body: JSON.stringify({
                emails,
                ...(options.webhookUrl ? { webhook_url: options.webhookUrl } : {}),
            }),
        });
    }
}
//# sourceMappingURL=client.js.map