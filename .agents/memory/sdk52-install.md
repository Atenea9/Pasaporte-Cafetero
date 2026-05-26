---
name: SDK52 install flags
description: How to install packages without breaking the Expo SDK 52 project.
---

## Rule
Always use `npm install --legacy-peer-deps` for this project. React Native peer dependency conflicts make a standard install fail.

**Why:** The project uses Expo SDK 52 (downgraded from 56). Many packages have peer dep declarations that conflict with RN 0.76.9.

**How to apply:** Every `npm install <pkg>` command must append `--legacy-peer-deps`. The package versions for expo-* must match the SDK 52 expected ranges (expo-file-system ~17.0.1, expo-image-picker ~15.0.7, expo-localization ~15.0.3).
