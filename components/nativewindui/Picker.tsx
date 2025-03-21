import { Picker as RNPicker } from '@react-native-picker/picker';
import { Platform, View, StyleSheet } from 'react-native';

import { cn } from '~/lib/cn';
import { useColorScheme } from '~/lib/useColorScheme';

export function Picker<T>({
  mode = Platform.OS === 'ios' ? 'dialog' : 'dropdown',
  style,
  dropdownIconColor,
  dropdownIconRippleColor,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RNPicker<T>>) {
  const { colors, colorScheme } = useColorScheme();

  const styles = StyleSheet.create({
    pickerStyle: {
      backgroundColor: 'transparent',
      color: Platform.OS === 'ios' ? colors.primary : colors.foreground,
      height: Platform.OS === 'ios' ? 32 : 42,
      ...(Platform.OS === 'android' ? { width: '100%' } : {}),
      ...(Platform.OS === 'ios' ? { marginRight: -8 } : {}),
    },
  });

  return (
    <View className={cn('rounded-md', className)}>
      <RNPicker
        mode={mode}
        style={style ?? styles.pickerStyle}
        dropdownIconColor={dropdownIconColor ?? colors.foreground}
        dropdownIconRippleColor={dropdownIconRippleColor ?? colors.foreground}
        itemStyle={{
          fontSize: 17,
          height: 32,
          color: colors.foreground,
        }}
        {...props}
      />
    </View>
  );
}

export const PickerItem = RNPicker.Item;
