import { MailCheck, MailCheckError } from '../dist/esm/index.js';
import assert from 'node:assert';

// Smoke tests (no network calls)

// 1. Constructor requires API key
try {
  new MailCheck('');
  assert.fail('Should throw on empty key');
} catch (e) {
  assert.ok(e.message.includes('API key'));
}

// 2. Constructor sets defaults
const mc = new MailCheck('sk_test_123');
assert.ok(mc);
assert.ok(mc.bulk);

// 3. Custom options
const mc2 = new MailCheck('sk_test_456', {
  baseUrl: 'https://custom.api.dev/',
  timeout: 5000,
});
assert.ok(mc2);

// 4. MailCheckError
const err = new MailCheckError(422, 'invalid_email', 'Bad email');
assert.strictEqual(err.status, 422);
assert.strictEqual(err.code, 'invalid_email');
assert.strictEqual(err.message, 'Bad email');
assert.ok(err instanceof Error);
assert.ok(err instanceof MailCheckError);
assert.strictEqual(err.name, 'MailCheckError');

console.log('✅ All tests passed');
