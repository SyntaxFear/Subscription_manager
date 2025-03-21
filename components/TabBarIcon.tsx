import { StyleSheet } from 'react-native';
import * as LucideIcons from 'lucide-react-native';

export const TabBarIcon = (props: {
  name: keyof typeof LucideIcons;
  color: string;
  size?: number;
}) => {
  const Icon = LucideIcons[props.name];
  return <Icon size={props.size || 28} style={styles.tabBarIcon} color={props.color} />;
};

export const styles = StyleSheet.create({
  tabBarIcon: {
    marginBottom: -3,
  },
});
