const palette = {
  // Classic Vintage Palette
  paper: '#FDFBF7',
  ink: '#1A202C',
  walnut: '#4A3728',
  bronze: '#8E7B56',
  sage: '#718355',
  slate: '#4A5568',
  cream: '#F7F0E5',
  charcoal: '#171923',
  ivory: '#FAF9F6',
  error: '#A52A2A', // Deep Red
  success: '#3D5A44', // Forest Green
  pending: '#B8860B', // Dark Goldenrod
};

export const colors = {
  light: {
    bg: palette.paper,
    surface: palette.ivory,
    card: '#FFFFFF',
    border: '#E2E8F0',
    primary: palette.bronze,
    primaryText: '#FFFFFF',
    primaryGlow: 'rgba(142, 123, 86, 0.1)',
    secondary: palette.slate,
    textPrimary: palette.ink,
    textSecondary: palette.slate,
    textMuted: '#A0AEC0',
    accent: palette.sage,
    star: '#D4AF37',
    error: palette.error,
    errorBg: '#FFF5F5',
    success: palette.success,
    successBg: '#F0FFF4',
    pending: palette.pending,
    pendingBg: '#FFFAF0',
    overlay: 'rgba(0,0,0,0.5)',
  },
  dark: {
    bg: palette.charcoal,
    surface: '#2D3748',
    card: '#242424',
    border: 'rgba(255,255,255,0.08)',
    primary: palette.bronze,
    primaryText: '#FFFFFF',
    primaryGlow: 'rgba(142, 123, 86, 0.15)',
    secondary: palette.slate,
    textPrimary: '#F7FAFC',
    textSecondary: '#E2E8F0',
    textMuted: '#718096',
    accent: palette.sage,
    star: '#D4AF37',
    error: '#FC8181',
    errorBg: 'rgba(252,129,129,0.1)',
    success: '#68D391',
    successBg: 'rgba(104,211,145,0.1)',
    pending: '#F6AD55',
    pendingBg: 'rgba(246,173,85,0.1)',
    overlay: 'rgba(0,0,0,0.7)',
  }
};
