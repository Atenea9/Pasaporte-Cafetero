// ─── PASAPORTE CAFETERO — Design System ───────────────────────────
// Palette: amber honey + espresso browns + warm parchment
// Primary accent = amber/miel (#C8960C)  Secondary = dark coffee (#5C3520)

export const PremiumTheme = {
  colors: {
    // Backgrounds — warm parchment
    bgLight:       '#FBF7ED',
    bgCard:        '#FFFDF8',
    bgCardAlt:     '#F6F0E2',
    bgSection:     '#EEE8D8',

    // Text on light background
    textDark:      '#2C1A0E',   // espresso
    textBody:      '#5C3520',   // roast brown
    textMuted:     '#9B7B5A',   // latte
    textLight:     '#FFFFFF',

    // Amber / Honey Gold — PRIMARY accent
    goldPrimary:   '#C8960C',   // honey amber (from "EDICIÓN 2026" badge)
    goldDark:      '#8B6308',   // dark amber
    goldLight:     '#E8B820',   // bright gold
    goldPale:      '#FBF0C8',   // pale amber/parchment

    // Coffee / Caramel — SECONDARY
    coffeeDark:    '#5C3520',   // dark roast
    coffeeMed:     '#7B4A2A',   // medium roast
    coffeeLight:   '#A0663C',   // cinnamon
    coffeePale:    '#F0E0CC',   // latte foam

    // Borders & dividers — warm parchment
    borderLight:   '#EDD9A8',
    borderMed:     '#D4B886',
    borderDark:    '#B89060',

    // Status
    danger:        '#C0392B',
    success:       '#2D6A1E',
    info:          '#1565C0',
    warning:       '#E67E22',

    // Legacy aliases (backward compat)
    bgDark:        '#2C1A0E',
    bgMedium:      '#5C3520',
    glassBg:       'rgba(255,253,248,0.92)',
    glassBorder:   'rgba(200,150,12,0.35)',

    // Aliases used throughout screens
    bg:            '#FBF7ED',
    card:          '#FFFDF8',
    dark:          '#2C1A0E',
    body:          '#5C3520',
    muted:         '#9B7B5A',
    gold:          '#C8960C',
    amber:         '#C8960C',
    amberLight:    '#E8B820',
    amberPale:     '#FBF0C8',
    coffee:        '#7B4A2A',
    border:        '#EDD9A8',
  },
  shadows: {
    glow: {
      shadowColor: '#C8960C',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.28,
      shadowRadius: 8,
      elevation: 4,
    },
    card: {
      shadowColor: '#2C1A0E',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
      elevation: 5,
    },
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.07,
      shadowRadius: 4,
      elevation: 2,
    },
  },
};
