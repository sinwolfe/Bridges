/// pb_hooks/rateLimit.js

let requestCounts = {};
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 30;     // limit per IP per window

export default function (router) {
  router.before('*', (c) => {
    const ip = c.req.header('x-forwarded-for') || c.req.remoteAddr;

    const now = Date.now();
    if (!requestCounts[ip]) {
      requestCounts[ip] = [];
    }

    // keep only recent requests
    requestCounts[ip] = requestCounts[ip].filter(ts => now - ts < WINDOW_MS);
    requestCounts[ip].push(now);

    if (requestCounts[ip].length > MAX_REQUESTS) {
      return c.json(429, { error: 'Too many requests. Please slow down.' });
    }

    return c.next();
  });
}
