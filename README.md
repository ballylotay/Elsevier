# Elsevier CampusHub: Auth0 + LTI 1.3 Demo

Next.js (App Router) demo: academic content portal plus an Identity & Token Inspector (`/inspector`).

## Run
```bash
cp .env.local.example .env.local   # fill in real values
npm install && npm run dev         # http://localhost:3000
```
Without real credentials the app runs in **demo mode** (banner, sample profile, no tokens) instead of crashing.

> **SDK v4 note:** `@auth0/nextjs-auth0` v4 mounts routes at `/auth/login`, `/auth/logout`, `/auth/callback`
> (not `/api/auth/*`), and uses `APP_BASE_URL` + `AUTH0_DOMAIN` instead of `AUTH0_BASE_URL` + `AUTH0_ISSUER_BASE_URL`.

## Auth0 Dashboard setup
1. Create a **Regular Web Application**.
2. **Allowed Callback URLs:** `http://localhost:3000/auth/callback`
3. **Allowed Logout URLs:** `http://localhost:3000`
4. (Optional, for a JWT access token) create an **API** with identifier `https://api.elsevier-demo.com` and set `AUTH0_AUDIENCE`.

### Getting a Refresh Token
- The app requests `offline_access` by default (`AUTH0_SCOPE`).
- With an API audience: Dashboard → Applications → APIs → your API → Settings → enable **Allow Offline Access**.
- Application → Settings → Refresh Token Rotation: enable **Rotation** (recommended). Make sure *Refresh Token* is in the app's allowed Grant Types.

### LTI claims
Add a Post-Login Action that sets `https://elsevier.com/lms_platform`, `institution_id`, `lti_roles`, `course_context`
on the ID/access token. The header's "Simulate LMS Launch" passes `?lms_platform=...` to the login route; the inspector's
**Simulate LTI Custom Claims Overlay** toggle shows sample claims live if the Action isn't set up.

## Security
The inspector displays raw tokens by design; use only for demos, never in production.
