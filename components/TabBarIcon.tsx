import * as LucideIcons from 'lucide-react-native';
import { StyleSheet } from 'react-native';
import { ComponentType } from 'react';

export const TabBarIcon = (props: {
  name: keyof typeof LucideIcons;
  color: string;
  size?: number;
}) => {
  const Icon = LucideIcons[props.name] as ComponentType<{
    size?: number;
    color?: string;
    style?: any;
  }>;
  return <Icon size={props.size || 28} style={styles.tabBarIcon} color={props.color} />;
};

export const styles = StyleSheet.create({
  tabBarIcon: {
    marginBottom: -3,
  },
});
