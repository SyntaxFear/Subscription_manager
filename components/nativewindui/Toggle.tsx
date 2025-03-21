import { Switch } from 'react-native';

import { useColorScheme } from '~/lib/useColorScheme';
import { COLORS } from '~/theme/colors';

interface ToggleProps extends React.ComponentPropsWithoutRef<typeof Switch> {
  customTrackColor?: string;
}

function Toggle({ customTrackColor, ...props }: ToggleProps) {
  const { colors } = useColorScheme();
  return (
    <Switch
      trackColor={{
        true: customTrackColor || colors.primary,
        false: colors.grey,
      }}
      thumbColor={COLORS.white}
      {...props}
    />
  );
}

export { Toggle };
