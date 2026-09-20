import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../types.js';

const SALT_ROUNDS = 10;

/**
 * JWT signing secret. In production, the server will refuse to start without
 * the JWT_SECRET environment variable set — this prevents token forgery via
 * a committed default string. In development, a local-only fallback is used
 * so that `npm run dev` works without .env setup.
 */
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
if (IS_PRODUCTION && !process.env.JWT_SECRET) {
  console.error('[FATAL] JWT_SECRET environment variable is not set. Refusing to start in production without it.');
  process.exit(1);
}
export const JWT_SECRET: string = process.env.JWT_SECRET || (() => {
  console.warn('[Security Warning] JWT_SECRET not set — using development-only fallback. Do NOT deploy to production without setting JWT_SECRET.');
  return 'iskilllink-dev-only-secret-DO-NOT-USE-IN-PRODUCTION';
})();

export const JWT_EXPIRY = '7d';

export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  is_primary_admin?: boolean;
}

/**
 * Asynchronously hashes a plaintext password using bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Synchronously hashes a plaintext password using bcrypt.
 * Useful for synchronous DB initialization and migration.
 */
export function hashPasswordSync(password: string): string {
  return bcrypt.hashSync(password, SALT_ROUNDS);
}

/**
 * Compares a candidate password against a stored bcrypt hash.
 * All passwords should be bcrypt-hashed; legacy plaintext passwords are
 * automatically migrated by Database.ensurePasswordsHashed() at startup.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false;
  if (!hash.startsWith('$2')) {
    // If somehow a non-bcrypt hash is encountered, reject the comparison.
    // This is a safety net — ensurePasswordsHashed() should have migrated all
    // legacy passwords on startup. Logging helps detect edge cases.
    console.warn('[Security] comparePassword encountered a non-bcrypt hash. Rejecting comparison for safety.');
    return false;
  }
  return await bcrypt.compare(password, hash);
}

/**
 * Generates a cryptographically signed JSON Web Token (JWT) with user claims.
 */
export function generateToken(user: { id: string; email: string; role: UserRole; name: string; is_primary_admin?: boolean }): string {
  const isPrimary = user.is_primary_admin === true ||
    (user.role === 'admin' && user.email.toLowerCase() === 'ashabahebwahassan665@gmail.com');
  const payload: TokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    is_primary_admin: isPrimary
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Strips password_hash and internal credentials from a user object before returning to client.
 */
export function sanitizeUser<T extends Partial<User> | null | undefined>(user: T): Omit<T, 'password_hash'> | null {
  if (!user) return null as any;
  const clone = { ...user } as any;
  delete clone.password_hash;
  return clone;
}
