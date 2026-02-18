// ── Configuration ──

export interface MailCheckOptions {
  /** Base URL for the API. Default: https://api.mailcheck.dev */
  baseUrl?: string;
  /** Request timeout in milliseconds. Default: 30000 */
  timeout?: number;
}

// ── Single Verify ──

export interface VerifyResult {
  email: string;
  valid: boolean;
  score: number;
  reason: string;
  checks: {
    syntax: 'pass' | 'fail' | 'skip';
    disposable: 'pass' | 'fail' | 'skip';
    mx: 'pass' | 'fail' | 'skip';
    smtp: 'pass' | 'fail' | 'skip';
    role: 'pass' | 'warn' | 'skip';
    free_provider: boolean;
  };
  details: {
    mxHost?: string;
    isDisposable?: boolean;
    catchAll?: boolean | null;
    catch_all?: boolean | null;
    smtpError?: string;
    is_role?: boolean;
    role?: string;
    is_free_provider?: boolean;
    free_provider_name?: string;
    is_disposable?: boolean;
    has_typo_suggestion?: boolean;
    typo_suggestion?: string;
    risk_level?: 'low' | 'medium' | 'high';
    is_catch_all?: boolean;
  };
  cached: boolean;
  credits_remaining: number;
}

// ── Bulk Verify ──

export interface BulkVerifyOptions {
  webhookUrl?: string;
}

export interface BulkVerifyResult {
  job_id: string;
  results: VerifyResult[];
  total: number;
  unique_verified: number;
  credits_remaining: number;
}

// ── Auth Verify ──

export interface VerifyAuthOptions {
  /** Raw email headers as a string */
  headers?: string;
  /** Full raw email content */
  rawEmail?: string;
  /** List of domains you trust (won't flag as suspicious) */
  trustedDomains?: string[];
}

export interface VerifyAuthResult {
  trust_score: number;
  verdict: 'trusted' | 'suspicious' | 'dangerous';
  from: {
    address: string;
    display_name: string | null;
    domain: string;
  } | null;
  authentication: {
    spf: {
      result: 'pass' | 'fail' | 'softfail' | 'neutral' | 'none' | 'temperror' | 'permerror';
      domain: string;
      ip?: string;
    };
    dkim: {
      result: 'present' | 'missing' | 'dns_error';
      domain?: string;
      selector?: string;
      has_public_key: boolean;
    };
    dmarc: {
      has_policy: boolean;
      policy: 'none' | 'quarantine' | 'reject' | null;
      record?: string;
    };
  };
  anomalies: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
  }>;
  lookalike: {
    is_lookalike: boolean;
    similar_to?: string;
    technique?: string;
  };
  privacy: {
    body_processed: false;
    headers_only: true;
    body_stripped?: boolean;
  };
  credits_remaining: number;
}

// ── Errors ──

export interface MailCheckErrorBody {
  code?: string;
  error?: string;
  message: string;
}
