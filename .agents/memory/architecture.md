---
name: Architecture overview
description: Multi-role navigator structure for PasaporteCafetero.
---

## Rule
App.tsx wraps everything in: I18nextProvider → AppProvider → NavigationContainer → RootNavigator.

RootNavigator reads `state.usuario.rol` and renders the matching navigator:
- No user → RegistroScreen (rendered directly, outside any Stack)
- visitante → VisitanteNavigator (Stack: Inicio, Pasaporte, Ranking, Vendedor)
- expositor → ExpositorNavigator (Stack: ExpositorHome, Scanner)
- comprador → CompradorNavigator (Stack: CompradorHome, Catalog, Auctions, MyOrders)
- admin → AdminNavigator (Stack: AdminDashboard, UsersManagement, StandsManagement, HappyHourControl, SendNotification)
- ceo → CeoNavigator (Stack: CeoDashboard, Reports, Analytics)

**Why:** Role-based routing at the root level means each role gets a completely isolated navigation tree with no shared state or accidental cross-role navigation.

**How to apply:** To add a new screen for a role, add it to the relevant navigator's param list in src/navigation/types.ts and register it in the matching navigator file.
