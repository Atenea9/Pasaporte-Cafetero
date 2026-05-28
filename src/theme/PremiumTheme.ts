export const PremiumTheme = {
  colors: {
    // Bone white / cream backgrounds
    bgLight:       '#FAF7F0',
    bgCard:        '#FFFFFF',
    bgCardAlt:     '#F5F0E6',
    bgSection:     '#EDE8DC',

    // Dark text on light bg
    textDark:      '#2C1810',
    textBody:      '#4A3728',
    textMuted:     '#8A7060',
    textLight:     '#FFFFFF',

    // Coffee gold
    goldPrimary:   '#B8860B',
    goldDark:      '#8B6308',
    goldLight:     '#D4A520',
    goldPale:      '#F5E6B0',

    // Coffee green
    greenPrimary:  '#2D5A1E',
    greenLight:    '#4A8030',
    greenPale:     '#E8F2E4',

    // Borders & dividers
    borderLight:   '#E8D5B0',
    borderMed:     '#D4B896',
    borderDark:    '#B89870',

    // Status
    danger:        '#C0392B',
    success:       '#2D5A1E',
    info:          '#1565C0',
    warning:       '#E67E22',

    // Legacy aliases (for compat)
    bgDark:        '#2C1810',
    bgMedium:      '#4A3728',
    glassBg:       'rgba(255,255,255,0.8)',
    glassBorder:   'rgba(184,134,11,0.3)',
  },
  shadows: {
    glow: {
      shadowColor: '#B8860B',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4
    },
    card: {
      shadowColor: '#2C1810',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
      elevation: 5
    },
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2
    }
  }
};
