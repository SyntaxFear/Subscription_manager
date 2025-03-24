import { useNavigation } from 'expo-router';
import * as React from 'react';
import { SearchBarProps } from 'react-native-screens';

import { useColorScheme } from './useColorScheme';

import { COLORS } from '~/theme/colors';

// Orange brand color
const ORANGE_COLOR = '#FF8000';

export function useHeaderSearchBar(props: SearchBarProps = {}) {
  const { colorScheme, colors } = useColorScheme();
  const navigation = useNavigation();
  const [search, setSearch] = React.useState('');

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        placeholder: 'Search...sda',
        barTintColor: colorScheme === 'dark' ? COLORS.black : COLORS.white,
        textColor: colors.foreground,
        tintColor: ORANGE_COLOR,
        headerIconColor: ORANGE_COLOR,
        hintTextColor: colors.grey,
        hideWhenScrolling: false,
        onChangeText(ev) {
          setSearch(ev.nativeEvent.text);
        },
        ...props,
      } satisfies SearchBarProps,
    });
  }, [navigation, colorScheme]);

  return search;
}
