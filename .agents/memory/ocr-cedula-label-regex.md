---
name: OCR cédula label regex pitfalls
description: Regex patterns for Colombian cédula field labels — known OCR variants and false-name pitfalls
---

## Apellidos label regex
Use `/Apell?i+dos?/i` (NOT `/Apeli+dos?/i`).

"Apellidos" has double-l (`ll`) — the single-l pattern `/Apeli+dos?/i` matches "Apeliidos" (double-i OCR typo) but FAILS on the standard "Apellidos" spelling, leaving `apellidosLabelIdx = -1` and triggering the garbage fallback.

**Why:** Regex `Apeli+dos?` reads as `Apel` + `i+` + `dos?`. "Apellidos" = A-p-e-l-**l**-i-d-o-s, so after "Apel" the next char is the second `l`, not `i`, causing a mismatch.

**How to apply:** Every time the Apellidos label is searched in OCR text, use `/Apell?i+dos?/i` to cover all variants:
- "Apellidos" (standard, double-l)
- "Apeliidos" (Tesseract double-i typo)
- "Apelidos" (single-l + single-i OCR drop)

## FALSE_NAME word blocklist
Keep these word categories in the FALSE_NAME constant to prevent the all-caps fallback from picking them up:
- Document header words: CÉDULA, CEDULA, CIUDADANA, CIUDADANO
- Function words: DE, LA, EL, LOS, LAS (too short or too common to be a surname alone)
- Month abbreviations: ENE, FEB, MAR, ABR, MAY, JUN, JUL, AGO, SEP, OCT, NOV, DIC (appear in dates and were misidentified as nombres)

## Fallback strategy order
1. Find label line with fuzzy regex → scan next 1-3 lines for clean all-caps name
2. If label not found → first all-caps multi-word line (2+ words) not in FALSE_NAME
3. The fallback is a last resort — ensure FALSE_NAME is comprehensive
