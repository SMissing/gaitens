/** HttpOnly session cookie; shared by middleware (edge) and server auth. */
export const SESSION_COOKIE_NAME = 'session_user_id'

/**
 * HttpOnly cookie mirroring the current user's role, set/cleared alongside
 * the session cookie. UX convenience only for middleware route-gating
 * (e.g. bouncing maintenance accounts back to /dashboard) — never an
 * authorization boundary. Sensitive pages still re-check the live role via
 * requireManager()/requireAdmin() against the database.
 */
export const ROLE_COOKIE_NAME = 'session_user_role'
