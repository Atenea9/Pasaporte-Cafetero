---
name: Web preview setTimeout freeze
description: setTimeout-based delays freeze in Expo web preview iframes, blocking app initialization and animations.
---

## Rule
Never use `setTimeout`-based delays in async init paths (session checks, context loaders, SplashScreen). For SplashScreen specifically: skip all animations and call `onFinish()` immediately when `Platform.OS === 'web'`.

**Why:** The Replit web preview renders the app inside an iframe. When the iframe is not in focus (e.g. during screenshot or when the user is interacting with the agent), browsers apply background timer throttling — setTimeout callbacks are delayed or never fire, causing loading spinners or animated splash screens to hang indefinitely. Animated.delay() internally uses setTimeout and is also affected.

**How to apply:**
- `SplashScreen.tsx`: add `if (Platform.OS === 'web') { onFinish(); return; }` at the top of the useEffect, before any animation sequences.
- `mockAuth.service.ts`: `checkSession()` and `logout()` have no delay. Only `login()` keeps a simulated delay (800ms) since it's user-triggered.
- Any context `useEffect` init that calls async storage reads must NOT include synthetic delays.
