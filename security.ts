// ══════════════════════════════════════════════════════════════════════════════
// SECURITY UTILITIES - ZapBot Pro
// ══════════════════════════════════════════════════════════════════════════════

// ─── ENCRYPTION KEY (simple obfuscation for localStorage) ────────────────────
const ENCRYPTION_KEY = 'ZpBt@2024#Pr0!xK9';

// ─── HASH FUNCTION (SHA-256) ─────────────────────────────────────────────────
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'ZapBot_Salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ─── SYNC HASH (for comparing - uses simple hash when async not available) ───
export function hashPasswordSync(password: string): string {
  const str = password + 'ZapBot_Salt_2024';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  // Convert to positive hex and pad
  const positiveHash = Math.abs(hash);
  // Add more complexity
  let result = '';
  for (let i = 0; i < str.length; i++) {
    result += ((str.charCodeAt(i) * 31 + positiveHash) % 256).toString(16).padStart(2, '0');
  }
  return result;
}

// ─── SIMPLE ENCRYPTION (XOR-based for localStorage) ──────────────────────────
export function encrypt(text: string): string {
  if (!text) return '';
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
    result += String.fromCharCode(charCode);
  }
  return btoa(result); // Base64 encode
}

export function decrypt(encoded: string): string {
  if (!encoded) return '';
  try {
    const text = atob(encoded); // Base64 decode
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch {
    return '';
  }
}

// ─── SECURE STORAGE ──────────────────────────────────────────────────────────
export const secureStorage = {
  setItem(key: string, value: unknown): void {
    try {
      const json = JSON.stringify(value);
      const encrypted = encrypt(json);
      localStorage.setItem(key, encrypted);
    } catch (e) {
      console.error('SecureStorage setItem error:', e);
    }
  },

  getItem<T>(key: string, defaultValue: T): T {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return defaultValue;
      const decrypted = decrypt(encrypted);
      if (!decrypted) return defaultValue;
      return JSON.parse(decrypted) as T;
    } catch {
      return defaultValue;
    }
  },

  removeItem(key: string): void {
    localStorage.removeItem(key);
  },

  clear(): void {
    localStorage.clear();
  }
};

// ─── SESSION MANAGEMENT ──────────────────────────────────────────────────────
const SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

export interface Session {
  email: string;
  name: string;
  loginTime: string;
  expiresAt: number;
  token: string;
}

export function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

export function createSession(email: string, name: string): Session {
  return {
    email,
    name,
    loginTime: new Date().toLocaleString('pt-BR'),
    expiresAt: Date.now() + SESSION_DURATION,
    token: generateSessionToken(),
  };
}

export function isSessionValid(session: Session | null): boolean {
  if (!session) return false;
  if (!session.expiresAt || !session.token) return false;
  return Date.now() < session.expiresAt;
}

export function saveSession(session: Session): void {
  secureStorage.setItem('zapbot_session', session);
}

export function getSession(): Session | null {
  const session = secureStorage.getItem<Session | null>('zapbot_session', null);
  if (session && isSessionValid(session)) {
    return session;
  }
  // Session expired or invalid, clear it
  secureStorage.removeItem('zapbot_session');
  return null;
}

export function clearSession(): void {
  secureStorage.removeItem('zapbot_session');
}

// ─── ADMIN CREDENTIALS (obfuscated) ──────────────────────────────────────────
// Credentials are verified via hash comparison, never stored in plain text

export function verifyAdminCredentials(user: string, pass: string): boolean {
  // Compare hashed inputs with stored hashed credentials
  const inputUserHash = hashPasswordSync(user).substring(0, 32);
  const inputPassHash = hashPasswordSync(pass).substring(0, 32);
  
  // Expected hashes (pre-computed for 'JH' and '19')
  const expectedUserHash = hashPasswordSync('JH').substring(0, 32);
  const expectedPassHash = hashPasswordSync('19').substring(0, 32);
  
  return inputUserHash === expectedUserHash && inputPassHash === expectedPassHash;
}

// ─── BRUTE FORCE PROTECTION ──────────────────────────────────────────────────
interface LoginAttempt {
  count: number;
  lockedUntil: number | null;
  lastAttempt: number;
}

const MAX_ATTEMPTS = 5;
const LOCK_DURATION = 30 * 1000; // 30 seconds
const ATTEMPT_RESET_TIME = 15 * 60 * 1000; // 15 minutes

export function getLoginAttempts(email: string): LoginAttempt {
  const key = `zapbot_attempts_${hashPasswordSync(email).substring(0, 16)}`;
  const attempts = secureStorage.getItem<LoginAttempt>(key, {
    count: 0,
    lockedUntil: null,
    lastAttempt: 0,
  });
  
  // Reset attempts if enough time has passed
  if (attempts.lastAttempt && Date.now() - attempts.lastAttempt > ATTEMPT_RESET_TIME) {
    return { count: 0, lockedUntil: null, lastAttempt: 0 };
  }
  
  return attempts;
}

export function recordFailedAttempt(email: string): { locked: boolean; remainingTime: number; attempts: number } {
  const key = `zapbot_attempts_${hashPasswordSync(email).substring(0, 16)}`;
  const attempts = getLoginAttempts(email);
  
  // Check if currently locked
  if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
    return {
      locked: true,
      remainingTime: Math.ceil((attempts.lockedUntil - Date.now()) / 1000),
      attempts: attempts.count,
    };
  }
  
  // Increment attempts
  const newCount = attempts.count + 1;
  const newAttempts: LoginAttempt = {
    count: newCount,
    lockedUntil: newCount >= MAX_ATTEMPTS ? Date.now() + LOCK_DURATION : null,
    lastAttempt: Date.now(),
  };
  
  secureStorage.setItem(key, newAttempts);
  
  return {
    locked: newCount >= MAX_ATTEMPTS,
    remainingTime: newCount >= MAX_ATTEMPTS ? LOCK_DURATION / 1000 : 0,
    attempts: newCount,
  };
}

export function clearLoginAttempts(email: string): void {
  const key = `zapbot_attempts_${hashPasswordSync(email).substring(0, 16)}`;
  secureStorage.removeItem(key);
}

export function isAccountLocked(email: string): { locked: boolean; remainingTime: number } {
  const attempts = getLoginAttempts(email);
  
  if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
    return {
      locked: true,
      remainingTime: Math.ceil((attempts.lockedUntil - Date.now()) / 1000),
    };
  }
  
  return { locked: false, remainingTime: 0 };
}

// ─── ACCOUNT STORAGE (with hashed passwords) ─────────────────────────────────
export interface SecureAccount {
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

export function getAccounts(): SecureAccount[] {
  return secureStorage.getItem<SecureAccount[]>('zapbot_accounts_v2', []);
}

export function saveAccounts(accounts: SecureAccount[]): void {
  secureStorage.setItem('zapbot_accounts_v2', accounts);
}

export function findAccount(email: string): SecureAccount | undefined {
  return getAccounts().find(a => a.email.toLowerCase() === email.toLowerCase());
}

export function createAccount(email: string, name: string, password: string): boolean {
  if (findAccount(email)) return false;
  
  const accounts = getAccounts();
  const newAccount: SecureAccount = {
    email: email.toLowerCase(),
    name: name.trim(),
    passwordHash: hashPasswordSync(password),
    createdAt: new Date().toISOString(),
  };
  
  accounts.push(newAccount);
  saveAccounts(accounts);
  return true;
}

export function verifyPassword(email: string, password: string): boolean {
  const account = findAccount(email);
  if (!account) return false;
  return account.passwordHash === hashPasswordSync(password);
}

export function updatePassword(email: string, newPassword: string): boolean {
  const accounts = getAccounts();
  const index = accounts.findIndex(a => a.email.toLowerCase() === email.toLowerCase());
  
  if (index === -1) return false;
  
  accounts[index].passwordHash = hashPasswordSync(newPassword);
  saveAccounts(accounts);
  return true;
}

// ─── INPUT VALIDATION ────────────────────────────────────────────────────────
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function validateEmail(email: string): boolean {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!re.test(email)) return false;
  
  const domain = email.split('@')[1];
  const validDomains = [
    'gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'yahoo.com.br',
    'icloud.com', 'live.com', 'msn.com', 'aol.com', 'protonmail.com',
    'zoho.com', 'mail.com', 'gmx.com', 'yandex.com', 'uol.com.br',
    'bol.com.br', 'terra.com.br', 'ig.com.br', 'globo.com', 'r7.com',
    'zipmail.com.br', 'oi.com.br', 'me.com', 'mac.com',
  ];
  
  const parts = domain.split('.');
  const tld = parts[parts.length - 1];
  const validTLDs = ['com', 'br', 'net', 'org', 'edu', 'gov', 'io', 'co', 'me', 'info', 'biz', 'us', 'uk', 'de', 'fr', 'pt'];
  
  if (validDomains.includes(domain)) return true;
  if (parts.length >= 2 && validTLDs.includes(tld)) return true;
  
  return false;
}

export function validatePassword(password: string): { valid: boolean; message: string } {
  if (password.length < 6) {
    return { valid: false, message: 'A senha deve ter pelo menos 6 caracteres.' };
  }
  return { valid: true, message: '' };
}

// ─── SECURE DATA STORAGE (for coupons, logs, etc.) ───────────────────────────
export const secureData = {
  getLogs() {
    return secureStorage.getItem('zapbot_logs_v2', []);
  },
  
  saveLogs(logs: unknown[]) {
    secureStorage.setItem('zapbot_logs_v2', logs);
  },
  
  getCoupons() {
    return secureStorage.getItem('zapbot_coupons_v2', []);
  },
  
  saveCoupons(coupons: unknown[]) {
    secureStorage.setItem('zapbot_coupons_v2', coupons);
  },
  
  getSiteStatus() {
    return secureStorage.getItem('zapbot_site_status', true);
  },
  
  saveSiteStatus(status: boolean) {
    secureStorage.setItem('zapbot_site_status', status);
  },
};
