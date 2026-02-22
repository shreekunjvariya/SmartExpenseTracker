# Security Review (Current Controls + Recommended Additions)

## Current Security Mechanisms in this Project

### 1) Authentication and session primitives
- Passwords are never stored in plain text; they are hashed with `bcrypt` before persistence.
- Login verifies credentials using `bcrypt.checkpw`.
- JWTs are issued with `iat` and `exp` claims (`JWT_EXPIRATION_DAYS=7`) and signed using `HS256`.
- Auth accepts JWT from either secure cookie (`session_token`) or `Authorization: Bearer` header.

### 2) Cookie and browser-session controls
- Auth cookie is set as `HttpOnly` (mitigates JS token theft from XSS).
- Cookie `Secure` and `SameSite` are configurable via environment (`COOKIE_SECURE`, `COOKIE_SAMESITE`).
- Angular client sends `withCredentials: true` for cookie usage.

### 3) Access control and route protection
- Backend protected endpoints rely on `Depends(get_current_user)` to enforce authentication.
- Data is scoped by `user_id` at query time (categories/expenses/reports use authenticated user context).
- Angular route guard (`authGuard`) blocks protected routes when session validation fails.

### 4) Input and API validation
- Pydantic schemas validate request payload shape/types (e.g., `EmailStr`, enum-like literals for entry types).
- API returns explicit 401/400/404 errors for auth and malformed requests.

### 5) Cross-origin controls
- CORS is enabled with explicit allow-list from `CORS_ORIGINS` env.
- `allow_credentials=True` is used for cookie-based auth only for configured origins.

## Gaps / Risks to Address

1. **Token in localStorage**: Angular stores JWT in localStorage, which is vulnerable to exfiltration if XSS happens.
2. **Long static session TTL**: Session lifetime is fixed at 7 days and not tied to user inactivity.
3. **No CSRF token strategy**: Cookie-auth + `withCredentials` without CSRF token/double-submit defense is a risk if CORS or browser behavior is misconfigured.
4. **No rate limiting / brute-force protections** on login/register endpoints.
5. **No account hardening features** (MFA, lockout policy, suspicious-login telemetry).
6. **No security headers middleware** (CSP, X-Frame-Options, X-Content-Type-Options, HSTS at edge).
7. **No refresh-token rotation/revocation model**; logout deletes cookie but JWTs remain valid until expiry.
8. **Secret fallback default exists** (`expense-tracker-secret-key-2024`) and should be forbidden in production.

## Recommended Additions (Right-Sized for this App)

### Highest priority (implement first)
1. **Idle session timeout + re-authentication** (your idea)
   - Track `last_activity_at` per session.
   - Expire session after inactivity window (e.g., 2 hours) even if JWT absolute expiry is longer.
   - On expiry, return 401 with specific message so UI redirects to login.
2. **Short-lived access token + refresh token rotation**
   - Access token: 10–20 minutes.
   - Refresh token: HttpOnly, Secure cookie, rotated on each refresh, server-side revocation list.
3. **Move away from localStorage token usage**
   - Prefer cookie-only auth path for browser clients.
   - If bearer token retained, keep only in memory and never in persistent storage.
4. **Rate limiting for auth endpoints**
   - Per IP + per email throttling and temporary lockouts.

### Next priority
5. Add CSRF protection for state-changing requests (synchronizer token or double-submit cookie).
6. Enforce production-only secure defaults:
   - Require strong `JWT_SECRET` from env.
   - Force `COOKIE_SECURE=true` and `COOKIE_SAMESITE` policy fit for deployment.
7. Add structured audit logs for login success/failure/logout/password changes.
8. Add security response headers at API gateway/reverse proxy.

## Why refresh token is in days, while access token is minutes/hours

- **Access token (minutes/hours) = blast-radius control**: if stolen, attacker only gets a short window.
- **Refresh token (days) = UX continuity**: user can stay signed in across app restarts without entering password repeatedly.
- **Rotation** means every refresh invalidates the previous refresh token, so replayed/stolen old tokens fail quickly.
- **Server revocation + idle timeout** gives operational control to end sessions early (logout, risk signals, inactivity).

In short: short access tokens reduce risk, longer refresh tokens preserve usability; rotation and revocation are what make the longer refresh window acceptable.

### If you want stricter security for this project

- High-security profile: access token `5-10 min`, refresh token `24h-72h`, idle timeout `30-60 min`.
- Balanced profile (recommended): access token `10-20 min`, refresh token `3-7 days`, idle timeout `2h`.
- Low-friction profile: access token `30-60 min`, refresh token `7-14 days`, idle timeout `4-8h`.

Choose based on threat model, user tolerance for re-login prompts, and whether MFA is enabled.

## Inactivity Re-Login Design (Suggested)

### Option A: Server-authoritative session collection (recommended)
- Store sessions in DB: `session_id`, `user_id`, `created_at`, `last_activity_at`, `expires_at`, `revoked`.
- Include `sid` claim in JWT to map to DB session.
- On every authenticated request:
  1. Resolve session by `sid`.
  2. Reject if revoked or now - `last_activity_at` > idle timeout.
  3. Update `last_activity_at`.
- On logout: mark session revoked.

### Option B: Stateless JWT with short absolute expiry
- Keep JWT expiry short (e.g., 30 min) and force refresh/login when expired.
- Easier to implement but weaker for instant revocation and multi-device control.

### UI behavior recommendation
- Warn user ~2 minutes before idle timeout.
- Provide “Stay signed in” action that pings a lightweight `/auth/ping` endpoint.
- If timeout occurs, clear local state and navigate to `/login` with a reason banner.

## Practical Baseline Configuration
- Idle timeout: 2 hours.
- Absolute session max age: 24 hours (or 7 days for low-risk consumer use).
- Access token: 15 minutes.
- Refresh token: 7 days with rotation.
- Login throttling: 5 failed attempts per 15 minutes per account + per IP.

