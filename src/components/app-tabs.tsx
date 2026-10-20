import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';
import { useBlood } from '@/context/blood-context';

interface TabIconProps {
  focused: boolean;
  color: any;
  iconType: 'ionicons' | 'material';
  activeName: string;
  inactiveName: string;
  size?: number;
}

function AnimatedTabIcon({
  focused,
  color,
  iconType,
  activeName,
  inactiveName,
  size = 21,
}: TabIconProps) {
  const scaleAnim = useRef(new Animated.Value(focused ? 1 : 0.8)).current;
  const opacityAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const iconScaleAnim = useRef(new Animated.Value(focused ? 1.08 : 1.0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focused ? 1 : 0.8,
        friction: 6,
        tension: 140,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: focused ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(iconScaleAnim, {
        toValue: focused ? 1.08 : 1.0,
        friction: 6,
        tension: 140,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused, scaleAnim, opacityAnim, iconScaleAnim]);

  return (
    <View style={styles.iconContainer}>
      {/* Smooth animated active pill background */}
      <Animated.View
        style={[
          styles.activePill,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      />

      {/* Animated icon */}
      <Animated.View style={{ transform: [{ scale: iconScaleAnim }] }}>
        {iconType === 'ionicons' ? (
          <Ionicons
            name={(focused ? activeName : inactiveName) as any}
            size={size}
            color={color}
          />
        ) : (
          <MaterialCommunityIcons
            name={(focused ? activeName : inactiveName) as any}
            size={size}
            color={color}
          />
        )}
      </Animated.View>
    </View>
  );
}

export default function AppTabs() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { requests } = useBlood();

  const codeRedCount = requests.filter(r => r.urgency === 'Code Red').length;

  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 6 : 4);
  const tabHeight = 54 + bottomInset;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#DC2626',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          borderTopWidth: 0.8,
          height: tabHeight,
          paddingBottom: bottomInset,
          paddingTop: 5,
          elevation: 16,
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: -0.1,
          marginTop: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'ফিড',
          tabBarBadge: codeRedCount > 0 ? codeRedCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#DC2626',
            color: '#FFFFFF',
            fontSize: 9,
            fontWeight: '900',
            minWidth: 16,
            height: 16,
            borderRadius: 8,
            lineHeight: 15,
          },
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon
              focused={focused}
              color={color}
              iconType="ionicons"
              activeName="pulse"
              inactiveName="pulse-outline"
              size={21}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="request"
        options={{
          title: 'অনুরোধ',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon
              focused={focused}
              color={color}
              iconType="material"
              activeName="plus-circle"
              inactiveName="plus-circle-outline"
              size={22}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="drives"
        options={{
          title: 'ডোনার',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon
              focused={focused}
              color={color}
              iconType="ionicons"
              activeName="people"
              inactiveName="people-outline"
              size={21}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'প্রোফাইল',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon
              focused={focused}
              color={color}
              iconType="ionicons"
              activeName="person-circle"
              inactiveName="person-circle-outline"
              size={22}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 48,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  activePill: {
    position: 'absolute',
    width: 46,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
  },
});
