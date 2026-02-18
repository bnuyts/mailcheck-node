# mailcheck-dev

Official Node.js/TypeScript SDK for the [MailCheck.dev](https://mailcheck.dev) email verification API.

- ✅ Zero dependencies — uses native `fetch`
- ✅ Full TypeScript types
- ✅ ESM + CommonJS dual build
- ✅ Node 18+ and modern browsers

## Installation

```bash
npm install mailcheck-dev
```

## Quick Start

```typescript
import { MailCheck } from 'mailcheck-dev';

const mc = new MailCheck('sk_live_...');

// Verify a single email
const result = await mc.verify('user@example.com');
console.log(result.valid);       // true
console.log(result.score);       // 85
console.log(result.checks);     // { syntax: 'pass', disposable: 'pass', mx: 'pass', ... }
console.log(result.details);    // { risk_level: 'low', is_free_provider: true, ... }
```

## API Reference

### `new MailCheck(apiKey, options?)`

| Option    | Type     | Default                       |
| --------- | -------- | ----------------------------- |
| `baseUrl` | `string` | `https://api.mailcheck.dev`   |
| `timeout` | `number` | `30000` (ms)                  |

### `mc.verify(email): Promise<VerifyResult>`

Verify a single email address. Returns validation status, quality score, and detailed checks.

```typescript
const result = await mc.verify('test@example.com');
// {
//   email: "test@example.com",
//   valid: true,
//   score: 85,
//   reason: "Valid email",
//   checks: { syntax: "pass", disposable: "pass", mx: "pass", smtp: "pass", role: "pass", free_provider: false },
//   details: { risk_level: "low", is_disposable: false, is_role: false, ... },
//   cached: false,
//   credits_remaining: 99
// }
```

### `mc.bulk.verify(emails, options?): Promise<BulkVerifyResult>`

Submit a list of emails for bulk verification. Results delivered via webhook.

```typescript
const job = await mc.bulk.verify(
  ['a@example.com', 'b@example.com'],
  { webhookUrl: 'https://yoursite.com/webhook' }
);
console.log(job.job_id);       // "job_abc123"
console.log(job.total_emails); // 2
```

### `mc.verifyAuth(options): Promise<VerifyAuthResult>`

Analyze email headers for authentication and spoofing signals. Pass raw headers or a full raw email.

```typescript
const auth = await mc.verifyAuth({
  headers: 'From: user@example.com\nReceived: from mail.example.com ...',
});
console.log(auth.trust_score);    // 92
console.log(auth.verdict);       // "trusted"
console.log(auth.authentication); // { spf: {...}, dkim: {...}, dmarc: {...} }
console.log(auth.anomalies);     // []
```

## Error Handling

```typescript
import { MailCheck, MailCheckError } from 'mailcheck-dev';

try {
  await mc.verify('bad');
} catch (err) {
  if (err instanceof MailCheckError) {
    console.error(err.status);  // 422
    console.error(err.code);    // "invalid_email"
    console.error(err.message); // "The email address is invalid"
  }
}
```

## License

MIT — see [LICENSE](./LICENSE).
