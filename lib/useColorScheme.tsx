import * as NavigationBar from 'expo-navigation-bar';
import { useColorScheme as useNativewindColorScheme } from 'nativewind';
import * as React from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { COLORS } from '~/theme/colors';

const COLOR_SCHEME_STORAGE_KEY = '@Subs:colorScheme';

function useColorScheme() {
  const { colorScheme: nativewindColorScheme, setColorScheme: setNativeWindColorScheme } =
    useNativewindColorScheme();
  const [initialLoadComplete, setInitialLoadComplete] = React.useState(false);

  // Load previously saved color scheme when component mounts
  React.useEffect(() => {
    const loadSavedColorScheme = async () => {
      try {
        const savedColorScheme = await AsyncStorage.getItem(COLOR_SCHEME_STORAGE_KEY);
        if (savedColorScheme === 'dark' || savedColorScheme === 'light') {
          setNativeWindColorScheme(savedColorScheme);
          if (Platform.OS === 'android') {
            await setNavigationBar(savedColorScheme);
          }
        }
      } catch (error) {
        console.error('Failed to load saved color scheme', error);
      } finally {
        setInitialLoadComplete(true);
      }
    };

    loadSavedColorScheme();
  }, []);

  async function setColorScheme(colorScheme: 'light' | 'dark') {
    setNativeWindColorScheme(colorScheme);

    // Save the color scheme to AsyncStorage
    try {
      await AsyncStorage.setItem(COLOR_SCHEME_STORAGE_KEY, colorScheme);
    } catch (error) {
      console.error('Failed to save color scheme', error);
    }

    if (Platform.OS !== 'android') return;
    try {
      await setNavigationBar(colorScheme);
    } catch (error) {
      console.error('useColorScheme.tsx", "setColorScheme', error);
    }
  }

  function toggleColorScheme() {
    return setColorScheme(nativewindColorScheme === 'light' ? 'dark' : 'light');
  }

  return {
    colorScheme: nativewindColorScheme ?? 'light',
    isDarkColorScheme: nativewindColorScheme === 'dark',
    setColorScheme,
    toggleColorScheme,
    colors: COLORS[nativewindColorScheme ?? 'light'],
    initialLoadComplete,
  };
}

/**
 * Set the Android navigation bar color based on the color scheme.
 */
function useInitialAndroidBarSync() {
  const { colorScheme } = useColorScheme();
  React.useEffect(() => {
    if (Platform.OS !== 'android') return;
    setNavigationBar(colorScheme).catch((error) => {
      console.error('useColorScheme.tsx", "useInitialColorScheme', error);
    });
  }, []);
}

export { useColorScheme, useInitialAndroidBarSync };

function setNavigationBar(colorScheme: 'light' | 'dark') {
  return Promise.all([
    NavigationBar.setButtonStyleAsync(colorScheme === 'dark' ? 'light' : 'dark'),
    NavigationBar.setPositionAsync('absolute'),
    NavigationBar.setBackgroundColorAsync(colorScheme === 'dark' ? '#00000030' : '#ffffff80'),
  ]);
}
