import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import * as React from 'react';
import { Platform } from 'react-native';

import { useColorScheme } from '~/lib/useColorScheme';

// Theme colors
const ORANGE_COLOR = '#FF8000';

interface SheetProps extends React.ComponentPropsWithoutRef<typeof BottomSheetModal> {
  customHandleColor?: string;
}

const Sheet = React.forwardRef<BottomSheetModal, SheetProps>(
  (
    {
      index = 0,
      backgroundStyle,
      style,
      handleIndicatorStyle,
      snapPoints = ['50%'],
      customHandleColor,
      ...props
    },
    ref
  ) => {
    const { colors } = useColorScheme();

    // Theme colors override
    const themeColors = React.useMemo(
      () => ({
        ...colors,
        primary: customHandleColor || ORANGE_COLOR,
      }),
      [colors, customHandleColor]
    );

    const renderBackdrop = React.useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior="close"
        />
      ),
      []
    );

    return (
      <BottomSheetModal
        ref={ref}
        index={index}
        snapPoints={snapPoints}
        enablePanDownToClose
        enableDynamicSizing
        backgroundStyle={{
          backgroundColor: colors.card,
          ...backgroundStyle,
        }}
        style={{
          borderWidth: Platform.OS === 'ios' ? 1 : 0,
          borderColor: colors.grey5,
          borderTopStartRadius: 16,
          borderTopEndRadius: 16,
          ...style,
        }}
        handleIndicatorStyle={{
          backgroundColor: themeColors.primary,
          width: 40,
          height: 4,
          ...handleIndicatorStyle,
        }}
        backdropComponent={renderBackdrop}
        {...props}
      />
    );
  }
);

Sheet.displayName = 'Sheet';

function useSheetRef() {
  return React.useRef<BottomSheetModal>(null);
}

export { Sheet, useSheetRef };
