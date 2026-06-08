---
name: LoginScreen art style
description: Colour palette, shadow helpers, and design tokens established for the Pasaporte Cafetero app — all new screens must follow this system.
---

## Colour tokens (src/screens/auth/LoginScreen.tsx — C object)
- Background gradient: `#F7EECE → #EDD89E → #D4BA6E` (parchment, locations 0/0.55/1)
- Dark text: `#3A1C08`; body: `#5C3010`; muted: `#8B6438`
- Amber title (TOLIMA CORAZÓN): `#C47408`; lighter amber: `#E89010`
- Badge bg gradient: `#4A2010 → #6A3818 → #4A2010`; badge border: `#A07030`; badge text: `#F5E5C0`
- Wooden buttons: dark `#3E1A08`, mid `#7A4A20`, light `#A06838`; text `#F5E8C0`; border `#281008`
- Medallion ring: `#7A5028`; medallion bg: `#F0DFB0`

## Platform shadow/textShadow helpers
Use these helpers to avoid deprecation warnings on web (RN 0.76+):
```typescript
const sh = (h, r, op, el) => Platform.select({
  web:     { boxShadow: `0px ${h}px ${r}px rgba(0,0,0,${op})` },
  default: { shadowColor: '#000', shadowOffset: { width: 0, height: h }, shadowOpacity: op, shadowRadius: r, elevation: el },
}) ?? {};

const tsh = (color, h = 1, r = 4) => Platform.select({
  web:     { textShadow: `0px ${h}px ${r}px ${color}` },
  default: { textShadowColor: color, textShadowOffset: { width: 0, height: h }, textShadowRadius: r },
}) ?? {};
```
Spread these inside `StyleSheet.create` entries: `...sh(6, 10, 0.45, 10)`.

## pointerEvents
In RN 0.76+ the `pointerEvents` prop on View is deprecated — put it in `style` instead:
`style={{ pointerEvents: 'none' }}` / `style={{ pointerEvents: 'box-none' }}`.

## Design anatomy (reference: Gemini mockup image)
- Logo: small drop-icon only (assets/logo-feria.png), ~54×58
- Botanical deco: 🌿 emoji at ~130px, absolutely positioned at four corners, opacity 0.13–0.16, rotated
- Title hierarchy: tiny label (11px tracking) → large amber bold (38px) → medium amber bold (26px) → small subtitle
- Badge: dark brown rounded rect, two-line text "PASAPORTE / CAFETERO", wide letter-spacing (9)
- Medallion: circle clip using `borderRadius = size/2` + `overflow:hidden`; brown ring outer frame; `presentacion-feria.webp` fills it
- Buttons: LinearGradient wooden-plank style with animal photo on left + right-edge fade + bold cream label
- Admin access: hidden behind pill button; long-press on small dot (top-left) also reveals it

**Why:** This screen sets the visual language for the entire app. New screens should copy C palette, `sh`/`tsh` helpers, and the parchment background.
