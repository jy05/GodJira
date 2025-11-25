export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
export const API_URL = `${API_BASE_URL}/api/v1`;
export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';

// Token expiry times
export const ACCESS_TOKEN_EXPIRY = 30 * 60 * 1000; // 30 minutes
export const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

// File upload limits
export const MAX_AVATAR_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_ATTACHMENT_SIZE = 25 * 1024 * 1024; // 25MB

// Pagination
export const DEFAULT_PAGE_SIZE = 20;

// Rate limiting
export const RATE_LIMIT_PER_MINUTE = 100;

// NIST Password Rules
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

export const PASSWORD_RULES = {
  regex: PASSWORD_REGEX,
  message: 'Password must contain uppercase, lowercase, digit, and special character (@$!%*?&)',
  hint: 'At least 8 characters with uppercase, lowercase, digit, and special character',
};

// Account lockout
export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MINUTES = 15;
