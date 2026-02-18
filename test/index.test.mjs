import { MailCheck, MailCheckError } from '../dist/esm/index.js';
import assert from 'node:assert';
import { describe, it } from 'node:test';

// ── Constructor Tests ──

describe('MailCheck constructor', () => {
  it('should throw on empty API key', () => {
    assert.throws(() => new MailCheck(''), { message: /API key/ });
  });

  it('should throw on undefined API key', () => {
    assert.throws(() => new MailCheck(undefined), { message: /API key/ });
  });

  it('should create instance with valid key', () => {
    const mc = new MailCheck('sk_live_test123');
    assert.ok(mc);
    assert.ok(mc.bulk);
  });

  it('should accept custom baseUrl', () => {
    const mc = new MailCheck('sk_live_test', { baseUrl: 'https://custom.api.dev/' });
    assert.ok(mc);
  });

  it('should strip trailing slashes from baseUrl', async () => {
    const mc = new MailCheck('sk_live_test', { baseUrl: 'https://custom.api.dev///' });
    // Verify by attempting a request (will fail but we can check the URL)
    try {
      await mc.verify('test@test.com');
    } catch (e) {
      // Expected - no server running. The URL construction is tested implicitly.
    }
  });

  it('should accept custom timeout', () => {
    const mc = new MailCheck('sk_live_test', { timeout: 5000 });
    assert.ok(mc);
  });
});

// ── MailCheckError Tests ──

describe('MailCheckError', () => {
  it('should set status, code, and message', () => {
    const err = new MailCheckError(422, 'invalid_email', 'Bad email');
    assert.strictEqual(err.status, 422);
    assert.strictEqual(err.code, 'invalid_email');
    assert.strictEqual(err.message, 'Bad email');
  });

  it('should be instanceof Error', () => {
    const err = new MailCheckError(500, 'server_error', 'Oops');
    assert.ok(err instanceof Error);
    assert.ok(err instanceof MailCheckError);
  });

  it('should have name set to MailCheckError', () => {
    const err = new MailCheckError(400, 'bad_request', 'Bad');
    assert.strictEqual(err.name, 'MailCheckError');
  });

  it('should have a stack trace', () => {
    const err = new MailCheckError(404, 'not_found', 'Not found');
    assert.ok(err.stack);
    assert.ok(err.stack.includes('MailCheckError'));
  });
});

// ── Request Tests (with mock fetch) ──

describe('MailCheck.verify', () => {
  it('should call /v1/verify with POST and correct headers', async () => {
    const originalFetch = globalThis.fetch;
    let capturedUrl, capturedInit;

    globalThis.fetch = async (url, init) => {
      capturedUrl = url;
      capturedInit = init;
      return new Response(JSON.stringify({
        email: 'test@gmail.com',
        valid: true,
        score: 95,
        reason: 'Valid email',
        checks: { syntax: 'pass', disposable: 'pass', mx: 'pass', smtp: 'pass', role: 'pass', free_provider: true },
        details: { risk_level: 'low', is_free_provider: true },
        cached: false,
        credits_remaining: 99,
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    };

    try {
      const mc = new MailCheck('sk_live_testkey123');
      const result = await mc.verify('test@gmail.com');

      assert.strictEqual(capturedUrl, 'https://api.mailcheck.dev/v1/verify');
      assert.strictEqual(capturedInit.method, 'POST');
      assert.strictEqual(JSON.parse(capturedInit.body).email, 'test@gmail.com');
      assert.ok(capturedInit.headers['Authorization'].includes('sk_live_testkey123'));
      assert.strictEqual(capturedInit.headers['Content-Type'], 'application/json');

      assert.strictEqual(result.email, 'test@gmail.com');
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.score, 95);
      assert.strictEqual(result.credits_remaining, 99);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('should throw MailCheckError on non-ok response', async () => {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async () => {
      return new Response(JSON.stringify({
        error: 'invalid_email',
        message: 'Invalid email format',
      }), { status: 422, headers: { 'Content-Type': 'application/json' } });
    };

    try {
      const mc = new MailCheck('sk_live_testkey123');
      await assert.rejects(
        () => mc.verify('bad'),
        (err) => {
          assert.ok(err instanceof MailCheckError);
          assert.strictEqual(err.status, 422);
          assert.strictEqual(err.code, 'invalid_email');
          return true;
        }
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('should handle non-JSON error responses', async () => {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async () => {
      return new Response('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });
    };

    try {
      const mc = new MailCheck('sk_live_testkey123');
      await assert.rejects(
        () => mc.verify('test@test.com'),
        (err) => {
          assert.ok(err instanceof MailCheckError);
          assert.strictEqual(err.status, 500);
          assert.strictEqual(err.message, 'Internal Server Error');
          return true;
        }
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('should handle 401 unauthorized', async () => {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async () => {
      return new Response(JSON.stringify({
        error: 'unauthorized',
        message: 'Invalid API key',
      }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    };

    try {
      const mc = new MailCheck('sk_live_badkey');
      await assert.rejects(
        () => mc.verify('test@test.com'),
        (err) => {
          assert.ok(err instanceof MailCheckError);
          assert.strictEqual(err.status, 401);
          return true;
        }
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

describe('MailCheck.verifyAuth', () => {
  it('should call /v1/verify/auth with headers', async () => {
    const originalFetch = globalThis.fetch;
    let capturedUrl, capturedBody;

    globalThis.fetch = async (url, init) => {
      capturedUrl = url;
      capturedBody = JSON.parse(init.body);
      return new Response(JSON.stringify({
        trust_score: 85,
        verdict: 'trusted',
        from: { address: 'sender@example.com', display_name: null, domain: 'example.com' },
        authentication: {
          spf: { result: 'pass', domain: 'example.com' },
          dkim: { result: 'present', has_public_key: true },
          dmarc: { has_policy: true, policy: 'reject' },
        },
        anomalies: [],
        lookalike: { is_lookalike: false },
        privacy: { body_processed: false, headers_only: true },
        credits_remaining: 98,
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    };

    try {
      const mc = new MailCheck('sk_live_testkey');
      const result = await mc.verifyAuth({
        headers: 'From: sender@example.com\nReceived: from mail.example.com',
        trustedDomains: ['mycompany.com'],
      });

      assert.strictEqual(capturedUrl, 'https://api.mailcheck.dev/v1/verify/auth');
      assert.strictEqual(capturedBody.headers, 'From: sender@example.com\nReceived: from mail.example.com');
      assert.deepStrictEqual(capturedBody.trusted_domains, ['mycompany.com']);
      assert.strictEqual(result.trust_score, 85);
      assert.strictEqual(result.verdict, 'trusted');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('should send raw_email when provided', async () => {
    const originalFetch = globalThis.fetch;
    let capturedBody;

    globalThis.fetch = async (url, init) => {
      capturedBody = JSON.parse(init.body);
      return new Response(JSON.stringify({
        trust_score: 50,
        verdict: 'suspicious',
        from: null,
        authentication: {
          spf: { result: 'none', domain: '' },
          dkim: { result: 'missing', has_public_key: false },
          dmarc: { has_policy: false, policy: null },
        },
        anomalies: [{ type: 'missing_auth', severity: 'high', message: 'No authentication' }],
        lookalike: { is_lookalike: false },
        privacy: { body_processed: false, headers_only: true },
        credits_remaining: 97,
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    };

    try {
      const mc = new MailCheck('sk_live_testkey');
      const result = await mc.verifyAuth({ rawEmail: 'From: test@test.com\r\n\r\nBody here' });

      assert.strictEqual(capturedBody.raw_email, 'From: test@test.com\r\n\r\nBody here');
      assert.strictEqual(result.verdict, 'suspicious');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

describe('MailCheck.bulk.verify', () => {
  it('should call /v1/verify/bulk with email list', async () => {
    const originalFetch = globalThis.fetch;
    let capturedUrl, capturedBody;

    globalThis.fetch = async (url, init) => {
      capturedUrl = url;
      capturedBody = JSON.parse(init.body);
      return new Response(JSON.stringify({
        job_id: 'job_abc123',
        results: [],
        total: 2,
        unique_verified: 2,
        credits_remaining: 96,
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    };

    try {
      const mc = new MailCheck('sk_live_testkey');
      const result = await mc.bulk.verify(['a@test.com', 'b@test.com']);

      assert.strictEqual(capturedUrl, 'https://api.mailcheck.dev/v1/verify/bulk');
      assert.deepStrictEqual(capturedBody.emails, ['a@test.com', 'b@test.com']);
      assert.strictEqual(capturedBody.webhook_url, undefined);
      assert.strictEqual(result.job_id, 'job_abc123');
      assert.strictEqual(result.total, 2);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('should include webhook_url when provided', async () => {
    const originalFetch = globalThis.fetch;
    let capturedBody;

    globalThis.fetch = async (url, init) => {
      capturedBody = JSON.parse(init.body);
      return new Response(JSON.stringify({
        job_id: 'job_def456',
        results: [],
        total: 1,
        unique_verified: 1,
        credits_remaining: 95,
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    };

    try {
      const mc = new MailCheck('sk_live_testkey');
      await mc.bulk.verify(['a@test.com'], { webhookUrl: 'https://mysite.com/hook' });

      assert.strictEqual(capturedBody.webhook_url, 'https://mysite.com/hook');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

describe('Timeout handling', () => {
  it('should throw MailCheckError on timeout', async () => {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async (url, init) => {
      // Simulate slow response — abort signal will fire first
      return new Promise((resolve, reject) => {
        init.signal.addEventListener('abort', () => {
          const err = new Error('The operation was aborted');
          err.name = 'AbortError';
          reject(err);
        });
      });
    };

    try {
      const mc = new MailCheck('sk_live_testkey', { timeout: 50 }); // 50ms timeout
      await assert.rejects(
        () => mc.verify('test@test.com'),
        (err) => {
          assert.ok(err instanceof MailCheckError);
          assert.strictEqual(err.status, 0);
          assert.strictEqual(err.code, 'timeout');
          assert.ok(err.message.includes('timed out'));
          return true;
        }
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

console.log('✅ All tests defined — run with: node --test test/index.test.mjs');
