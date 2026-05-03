import { colors } from './colors';
import { useColorScheme } from 'react-native';

// ─────────────────────────────────────────────────────────────────────────────
// useTheme hook – returns colors + typography helpers
// Usage: const { colors, fonts } = useTheme();
// ─────────────────────────────────────────────────────────────────────────────
export const useTheme = () => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const activeColors = isDark ? colors.dark : colors.light;

  return {
    colors: activeColors,
    isDark,
    fonts: {
      regular:    { fontWeight: '400' },
      medium:     { fontWeight: '500' },
      semiBold:   { fontWeight: '600' },
      bold:       { fontWeight: '700' },
      extraBold:  { fontWeight: '800' },
      black:      { fontWeight: '900' },
    },
    spacing: {
      xs:  4,
      sm:  8,
      md:  16,
      lg:  24,
      xl:  32,
      xxl: 48,
    },
    radius: {
      sm:   8,
      md:  12,
      lg:  20,
      xl:  28,
      full: 999,
    },
  };
};

export const useColors = () => {
  const scheme = useColorScheme();
  return scheme === 'dark' ? colors.dark : colors.light;
};
