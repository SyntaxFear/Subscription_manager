import { Theme, DefaultTheme, DarkTheme } from '@react-navigation/native';

import { COLORS } from './colors';

// Orange brand color
const ORANGE_COLOR = '#FF8000';

const NAV_THEME: { light: Theme; dark: Theme } = {
  light: {
    dark: false,
    colors: {
      background: COLORS.light.background,
      border: COLORS.light.grey5,
      card: COLORS.light.card,
      notification: COLORS.light.destructive,
      primary: ORANGE_COLOR,
      text: COLORS.black,
    },
    fonts: DefaultTheme.fonts,
  },
  dark: {
    dark: true,
    colors: {
      background: COLORS.dark.background,
      border: COLORS.dark.grey5,
      card: COLORS.dark.grey6,
      notification: COLORS.dark.destructive,
      primary: ORANGE_COLOR,
      text: COLORS.white,
    },
    fonts: DarkTheme.fonts,
  },
};

export { NAV_THEME };
