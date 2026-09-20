import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, TokenPayload, isTokenRevoked } from '../utils/security.js';
import { UserRole } from '../types.js';

// Extend Express Request to include authenticated user payload
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Middleware that strictly verifies a Bearer JWT in the Authorization header.
 * Rejects unauthenticated requests with HTTP 401.
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Missing Bearer token.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    if (!decoded.jti || isTokenRevoked(decoded.jti)) {
      return res.status(401).json({ error: 'This session has been revoked. Please sign in again.' });
    }
    req.user = decoded;
    next();
  } catch (err: any) {
    return res.status(401).json({ error: 'Invalid or expired session token. Please sign in again.' });
  }
}

/**
 * Middleware that parses Bearer JWT if present, but does not block if missing.
 */
export function optionalToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch {
      // Ignored for optional identification
    }
  }
  next();
}

/**
 * Role-Based Access Control (RBAC) middleware factory.
 * Verifies that the authenticated user possesses one of the allowed roles.
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    // Secondary admins inherit general admin privileges unless specific restriction applies
    const hasRole = allowedRoles.includes(req.user.role) ||
      (allowedRoles.includes('admin') && req.user.role === 'secondary_admin');

    if (!hasRole) {
      return res.status(403).json({
        error: `Access denied. This action requires one of the following roles: [${allowedRoles.join(', ')}]. Your current role is '${req.user.role}'.`
      });
    }

    next();
  };
}

/**
 * Restricts access solely to the Primary Platform Administrator (Ashabahebwa Hassan).
 * Used for critical governance actions like delegating or revoking secondary admin rights.
 */
export function requirePrimaryAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const isPrimary = req.user.role === 'admin' && (
    req.user.is_primary_admin === true ||
    req.user.email.toLowerCase() === 'ashabahebwahassan665@gmail.com'
  );

  if (!isPrimary) {
    return res.status(403).json({
      error: 'Access restricted: Only the primary platform administrator (Ashabahebwa Hassan) has authority to perform this operation.'
    });
  }

  next();
}

/**
 * Middleware ensuring a user can only read or mutate their own resource, unless they hold administrative privileges.
 */
export function requireSelfOrAdmin(getOwnerId: (req: Request) => string | string[] | undefined) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const rawOwnerId = getOwnerId(req);
    const ownerId = Array.isArray(rawOwnerId) ? rawOwnerId[0] : rawOwnerId;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'secondary_admin';
    const isSelf = ownerId && req.user.id === ownerId;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({
        error: 'Access denied. You do not have permission to modify or access this user account or resource.'
      });
    }

    next();
  };
}
