import type { NextRequest } from 'next/server';

export const CUE_SESSION_COOKIE = 'cue_session_uid';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseSessionUserId(value: string | undefined): string | null {
  if (!value || !UUID_RE.test(value)) return null;
  return value;
}

export function readSessionUserId(request: NextRequest): string | null {
  return parseSessionUserId(request.cookies.get(CUE_SESSION_COOKIE)?.value);
}
