---
name: NavContext shim pattern
description: How the old NavContext was replaced with React Navigation while keeping backward compatibility.
---

## Rule
NavContext.tsx is now a compatibility shim. `NavProvider` is a no-op fragment; `useNav()` wraps `useNavigation()` from @react-navigation/native and maps old screen names ('home', 'pasaporte', 'vendedor', 'ranking') to VisitanteStackParamList route names ('Inicio', 'Pasaporte', 'Vendedor', 'Ranking').

**Why:** The 4 existing screens (HomeScreen, PasaporteScreen, VendedorScreen, RankingScreen) all use `useNav()`. Replacing the internals without touching each screen file avoids risky large-file edits during the architectural reset step.

**How to apply:** New screens in src/screens/visitante/, expositor/, etc. should import `useNavigation` directly from '@react-navigation/native' and use the typed navigator prop from src/navigation/types.ts. Only legacy screens use `useNav()`.
