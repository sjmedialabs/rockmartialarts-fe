# Production deployment

## Backend URL (fix 502 and branches not loading)

The frontend proxies API calls to your backend. In production (e.g. Vercel), the server must be able to reach the backend. If you see **502 Bad Gateway** or **branches not loading**, set these in your hosting environment (e.g. Vercel → Project → Settings → Environment Variables):

- `API_BASE_URL` – backend root URL (e.g. `https://api.rockmartialartsacademy.com` or `http://rockmartialartsacademy.com:8003`)
- `NEXT_PUBLIC_API_BASE_URL` – same value (used in browser when not using proxy)
- `NEXT_PUBLIC_BACKEND_URL` – same value

**Requirements:**

- The URL must be reachable from your hosting provider’s network (e.g. Vercel serverless runs in the cloud and must reach your API over the internet).
- If the API is on the same server as the domain, ensure port 8003 is open and the backend is bound to `0.0.0.0` (not only `localhost`).
- Prefer HTTPS in production (e.g. `https://api.rockmartialartsacademy.com`).

After changing these variables, redeploy the frontend.

## Vercel Web Analytics

To enable Vercel Analytics and remove the `/_vercel/insights/script.js` 404:

1. In Vercel: Project → Settings → Analytics → enable **Web Analytics**.
2. Add env var: `NEXT_PUBLIC_VERCEL_ANALYTICS_ENABLED=true`.
3. Redeploy.

If you leave this unset, the Analytics script is not loaded and the 404 will not appear.
