import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn('[jwt] JWT_SECRET is not set — auth will fail at runtime.');
}

export const AUTH_COOKIE = 'cue_session';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export interface JwtPayload {
  userId: string;
  username: string;
}

/** Sign a JWT with userId + username. Returns the token string. */
export function signToken(payload: JwtPayload): string {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not configured.');
  return jwt.sign(payload, JWT_SECRET, { expiresIn: MAX_AGE_SECONDS });
}

/** Verify and decode a JWT. Returns null if invalid/expired. */
export function verifyToken(token: string): JwtPayload | null {
  if (!JWT_SECRET) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & JwtPayload;
    if (!decoded.userId || !decoded.username) return null;
    return { userId: decoded.userId, username: decoded.username };
  } catch {
    return null;
  }
}

/** Cookie options for setting the JWT cookie. */
export const cookieOptions = (secure: boolean) =>
  ({
    httpOnly: true,
    sameSite: 'lax' as const,
    secure,
    maxAge: MAX_AGE_SECONDS,
    path: '/',
  });
