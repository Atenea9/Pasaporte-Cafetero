---
name: Web preview setTimeout freeze
description: setTimeout-based delays freeze in Expo web preview iframes, blocking app initialization.
---

## Rule
Never use `setTimeout`-based delays in async init paths (session checks, context loaders). Remove `await delay(ms)` from any function called during app startup.

**Why:** The Replit web preview renders the app inside an iframe. When the iframe is not in focus (e.g. during screenshot or when the user is interacting with the agent), browsers apply background timer throttling — setTimeout callbacks are delayed or never fire, causing loading spinners to hang indefinitely.

**How to apply:** In mockAuth.service.ts, `checkSession()` and `logout()` have no delay — only `login()` keeps a simulated delay (800ms) since it's user-triggered and the user actively waits. Any context's `useEffect` init that calls async storage reads must NOT include synthetic delays.
