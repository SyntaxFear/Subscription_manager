import { BlurView } from 'expo-blur';
import { Link, Tabs, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { View, StyleSheet, Platform, Pressable } from 'react-native';

import { TabBarIcon } from '../../components/TabBarIcon';

// Helper function for tab press with haptic feedback
const handleTabPress = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF8000',
        tabBarInactiveTintColor: '#888',
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(255, 255, 255, 0.8)',
          borderTopColor: 'transparent',
          elevation: 0,
          height: 80,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView
              tint="light"
              intensity={30}
              style={[StyleSheet.absoluteFill, styles.blurView]}
            />
          ) : null,
        // Add haptic feedback on tab press
        tabBarButton: (props) => (
          <Pressable
            {...props}
            onPress={(e) => {
              handleTabPress();
              props.onPress?.(e);
            }}
          />
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          headerTitle: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="Home" color={focused ? color : '#888'} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          headerTitle: 'Analytics',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="BarChart3" color={focused ? color : '#888'} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          headerShown: false,
          tabBarItemStyle: {
            height: 0,
          },
          tabBarIcon: () => null,
          tabBarButton: () => (
            <Link href="/modal" asChild>
              <Pressable
                style={styles.addButtonWrapper}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }}>
                <View style={styles.addButtonContainer}>
                  <View style={styles.plusIconContainer}>
                    <TabBarIcon name="Plus" color="white" size={24} />
                  </View>
                </View>
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          headerTitle: 'Calendar',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="CalendarRange" color={focused ? color : '#888'} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerTitle: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="Settings" color={focused ? color : '#888'} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  blurView: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  addButtonWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: -25,
    height: 70,
    width: 70,
    left: '50%',
    marginLeft: -35,
    zIndex: 10,
  },
  addButtonContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  plusIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF8000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  plusIconSelected: {
    backgroundColor: '#FF8000',
  },
  addButtonSelected: {
    backgroundColor: 'transparent',
  },
});
