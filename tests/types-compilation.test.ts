import { describe, it, expect } from 'vitest';
import type { 
  MailCheckOptions, 
  VerifyResult, 
  BulkVerifyResult, 
  VerifyAuthResult,
  BulkVerifyOptions,
  VerifyAuthOptions,
  MailCheckErrorBody
} from '../src/types';

describe('SDK Type Compilation', () => {
  it('should compile MailCheckOptions correctly', () => {
    const options: MailCheckOptions = {
      baseUrl: 'https://api.mailcheck.dev',
      timeout: 30000
    };
    
    expect(options.baseUrl).toBe('https://api.mailcheck.dev');
    expect(options.timeout).toBe(30000);
  });

  it('should compile VerifyResult correctly', () => {
    const result: VerifyResult = {
      email: 'test@example.com',
      valid: true,
      score: 100,
      reason: 'deliverable',
      checks: {
        syntax: 'pass',
        disposable: 'pass', 
        mx: 'pass',
        smtp: 'pass',
        role: 'pass',
        free_provider: false
      },
      details: {
        mxHost: 'mx.example.com',
        risk_level: 'low',
        catch_all: false,
        is_role: false,
        is_free_provider: false,
        is_disposable: false,
        has_typo_suggestion: false
      },
      cached: false,
      credits_remaining: 99
    };

    expect(result.email).toBe('test@example.com');
    expect(result.valid).toBe(true);
  });

  it('should compile BulkVerifyResult correctly with new structure', () => {
    const mockVerifyResult: VerifyResult = {
      email: 'test@example.com',
      valid: true,
      score: 100,
      reason: 'deliverable',
      checks: {
        syntax: 'pass',
        disposable: 'pass',
        mx: 'pass', 
        smtp: 'pass',
        role: 'pass',
        free_provider: false
      },
      details: {
        risk_level: 'low',
        catch_all: false,
        is_role: false,
        is_free_provider: false,
        is_disposable: false,
        has_typo_suggestion: false
      },
      cached: false,
      credits_remaining: 99
    };

    const result: BulkVerifyResult = {
      job_id: 'job-12345',
      results: [mockVerifyResult],
      total: 1,
      unique_verified: 1,
      credits_remaining: 99
    };

    expect(result.job_id).toBe('job-12345');
    expect(result.results).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.unique_verified).toBe(1);
    expect(result.credits_remaining).toBe(99);
  });

  it('should compile VerifyAuthResult correctly with new structure', () => {
    const result: VerifyAuthResult = {
      trust_score: 85,
      verdict: 'trusted',
      from: {
        address: 'sender@example.com',
        display_name: 'Sender Name',
        domain: 'example.com'
      },
      authentication: {
        spf: {
          result: 'pass',
          domain: 'example.com',
          ip: '1.2.3.4'
        },
        dkim: {
          result: 'present',
          domain: 'example.com',
          selector: 's1',
          has_public_key: true
        },
        dmarc: {
          has_policy: true,
          policy: 'reject',
          record: 'v=DMARC1; p=reject;'
        }
      },
      anomalies: [],
      lookalike: {
        is_lookalike: false
      },
      privacy: {
        body_processed: false,
        headers_only: true
      },
      credits_remaining: 99
    };

    expect(result.trust_score).toBe(85);
    expect(result.verdict).toBe('trusted');
    expect(result.from?.address).toBe('sender@example.com');
    expect(result.authentication.spf.result).toBe('pass');
    expect(result.authentication.dkim.has_public_key).toBe(true);
    expect(result.authentication.dmarc.has_policy).toBe(true);
    expect(result.lookalike.is_lookalike).toBe(false);
    expect(result.privacy.body_processed).toBe(false);
    expect(result.privacy.headers_only).toBe(true);
    expect(result.credits_remaining).toBe(99);
  });

  it('should compile BulkVerifyOptions correctly', () => {
    const options: BulkVerifyOptions = {
      webhookUrl: 'https://example.com/webhook'
    };

    expect(options.webhookUrl).toBe('https://example.com/webhook');
  });

  it('should compile VerifyAuthOptions correctly', () => {
    const options: VerifyAuthOptions = {
      headers: 'From: sender@example.com\nReceived: from mail.example.com',
      trustedDomains: ['mycompany.com']
    };

    expect(options.headers).toContain('From: sender@example.com');
    expect(options.trustedDomains).toEqual(['mycompany.com']);
  });

  it('should compile MailCheckErrorBody correctly', () => {
    const error: MailCheckErrorBody = {
      code: 'validation_error',
      error: 'invalid_input',
      message: 'The provided email is invalid'
    };

    expect(error.message).toBe('The provided email is invalid');
  });
});