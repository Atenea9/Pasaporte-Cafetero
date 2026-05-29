# Pasaporte Cafetero

A mobile-first web app (Expo/React Native Web) that serves as a digital passport for the *Feria Internacional del Café Chaparral 2026* in Tolima, Colombia. Visitors collect stamps from coffee stands, earn points, and participate in live auctions.

## Tech Stack
- **Framework:** Expo SDK 52 (React Native Web)
- **Language:** TypeScript
- **Navigation:** React Navigation (Native Stack + Bottom Tabs)
- **Auth:** Custom mock auth service (demo accounts, role-based)
- **Database:** Mock service layer (demo data; Firebase ready but not connected)
- **i18n:** i18next supporting 7 languages (ES, EN, FR, DE, ZH, PT, IT)

## User Roles
- **Visitante** — collects stamps via QR, earns points, levels up
- **Expositor** — manages stand, scans visitors, manages catalog
- **Comprador** — participates in live coffee auctions
- **Admin** — KPIs, happy hour toggle, notifications
- **CEO** — full analytics, database export

## Demo Accounts (for login)
| Email | Role |
|---|---|
| visitor@demo.com | Visitante |
| expositor@demo.com | Expositor |
| buyer@demo.com | Comprador |
| admin@demo.com | Admin |
| ceo@demo.com | CEO |

## How to Run
The app starts automatically via the "Start application" workflow.
- Dev server: `npm install && BROWSER=none npx expo start --web --port 5000`
- Build for static deploy: `npx expo export --platform web`

## Project Structure
```
assets/           Static images, icons, splash
src/
  components/     Reusable UI (QRScanner, Charts, etc.)
  context/        App-wide state (points, transactions)
  contexts/       Auth state (AuthContext)
  data/           Mock/seed data
  hooks/          Custom hooks (realtime auction, etc.)
  i18n/           Translation files (locales/*.json)
  navigation/     Role-based navigators
  screens/        Screens grouped by role
  services/       Service layer (mockAuth, mockDb, firebase stubs)
  theme/          Styling constants
```

## User Preferences
- Keep the mock auth system in place (role-based demo accounts)
- Firebase is stubbed out with placeholder values — do not activate without user supplying real credentials
