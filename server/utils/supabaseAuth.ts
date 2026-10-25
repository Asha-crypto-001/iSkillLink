import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { db } from '../db.js';
import { createRoleProfile, unusablePasswordHash } from '../accounts.js';
import { TokenPayload } from './security.js';
import { User } from '../types.js';

/**
 * Bridges Supabase Auth sessions onto local API accounts.
 *
 * When the frontend signs in through Supabase it sends Supabase access tokens to this API.
 * Those tokens are verified with Supabase itself (works for both legacy HS256 and asymmetric
 * signing keys) and mapped onto a local user record, which remains the source of truth for
 * roles: user_metadata is editable by the user, so it is never trusted for privileges.
 */
const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '');
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const SUPABASE_ISSUER = `${SUPABASE_URL}/auth/v1`;

const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    })
  : null;

// Verified tokens are cached briefly to avoid a round trip to Supabase on every request.
const CACHE_TTL_MS = 60 * 1000;
const verifiedTokens = new Map<string, { userId: string; jti: string; expiresAt: number }>();

export function isSupabaseAuthEnabled(): boolean {
  return supabase !== null;
}

/** True when the token was issued by the configured Supabase project (signature not yet checked). */
export function isSupabaseToken(token: string): boolean {
  if (!supabase) return false;
  const claims = jwt.decode(token) as { iss?: string } | null;
  return claims?.iss === SUPABASE_ISSUER;
}

function pruneExpired(now: number) {
  if (verifiedTokens.size < 1000) return;
  for (const [token, entry] of verifiedTokens) {
    if (entry.expiresAt <= now) verifiedTokens.delete(token);
  }
}

function toTokenPayload(user: User, jti: string): TokenPayload {
  const isPrimary = user.is_primary_admin === true ||
    (user.role === 'admin' && user.email.toLowerCase() === 'ashabahebwahassan665@gmail.com');
  return { jti, id: user.id, email: user.email, role: user.role, name: user.name, is_primary_admin: isPrimary };
}

/**
 * Finds the local account for a verified Supabase user, linking an existing account by
 * confirmed email or provisioning a new learner/educator account on first sign-in.
 * Runs synchronously, so concurrent first requests cannot create duplicate accounts.
 */
function resolveLocalUser(supabaseUser: {
  id: string;
  email?: string;
  email_confirmed_at?: string;
  user_metadata?: Record<string, any>;
}): User | null {
  const linked = db.findUserBySupabaseId(supabaseUser.id);
  if (linked) return linked;

  const email = supabaseUser.email?.trim().toLowerCase();
  if (!email) return null;

  const existing = db.findUserByEmail(email);
  if (existing) {
    // Only a confirmed email proves ownership of an existing local account.
    if (!supabaseUser.email_confirmed_at) {
      console.warn(`[Auth] Refusing to link unconfirmed Supabase email to existing account ${existing.id}.`);
      return null;
    }
    if (existing.supabase_id && existing.supabase_id !== supabaseUser.id) {
      console.warn(`[Auth] Account ${existing.id} is already linked to a different Supabase user.`);
      return null;
    }
    return db.updateUser(existing.id, { supabase_id: supabaseUser.id });
  }

  const metadata = supabaseUser.user_metadata || {};
  const now = new Date().toISOString();
  const user: User = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    email,
    supabase_id: supabaseUser.id,
    password_hash: unusablePasswordHash(),
    // Public sign-up is limited to learner or educator accounts.
    role: metadata.role === 'educator' ? 'educator' : 'learner',
    name: String(metadata.name || metadata.full_name || email.split('@')[0]).trim(),
    phone: String(metadata.phone || ''),
    avatar_url: String(metadata.avatar_url || metadata.picture || ''),
    location: String(metadata.location || 'Mbarara City, Uganda'),
    created_at: now,
    updated_at: now
  };
  db.createUser(user);
  createRoleProfile(user, { location: user.location });
  return user;
}

/**
 * Verifies a Supabase access token and returns the claims of the matching local user,
 * or null when the token is invalid, expired, revoked by Supabase, or cannot be mapped.
 */
export async function verifySupabaseToken(token: string): Promise<TokenPayload | null> {
  if (!supabase) return null;

  const now = Date.now();
  const cached = verifiedTokens.get(token);
  if (cached && cached.expiresAt > now) {
    const user = db.findUserById(cached.userId);
    return user ? toTokenPayload(user, cached.jti) : null;
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;

  const user = resolveLocalUser(data.user);
  if (!user) return null;

  const claims = jwt.decode(token) as { exp?: number; session_id?: string } | null;
  // Scope revocation (POST /api/auth/logout) to this Supabase session, not the whole account.
  const jti = `supabase:${claims?.session_id || data.user.id}`;
  const tokenExpiry = claims?.exp ? claims.exp * 1000 : now + CACHE_TTL_MS;

  pruneExpired(now);
  verifiedTokens.set(token, { userId: user.id, jti, expiresAt: Math.min(now + CACHE_TTL_MS, tokenExpiry) });

  return toTokenPayload(user, jti);
}
