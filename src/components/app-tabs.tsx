import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBlood } from '@/context/blood-context';

interface TabIconProps {
  focused: boolean;
  color: any;
  iconType: 'ionicons' | 'material';
  activeName: string;
  inactiveName: string;
  size?: number;
}

function TabIcon({
  focused,
  color,
  iconType,
  activeName,
  inactiveName,
  size = 20,
}: TabIconProps) {
  const scaleAnim = useRef(new Animated.Value(focused ? 1.05 : 1.0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1.05 : 1.0,
      friction: 7,
      tension: 160,
      useNativeDriver: true,
    }).start();
  }, [focused, scaleAnim]);

  return (
    <Animated.View style={[styles.iconWrap, { transform: [{ scale: scaleAnim }] }]}>
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
  );
}

function CustomTabBarButton({
  children,
  style,
  onPress,
  onLongPress,
  accessibilityState,
  ...rest
}: any) {
  const [isHovered, setIsHovered] = useState(false);
  const isSelected = accessibilityState?.selected;

  return (
    <Pressable
      {...rest}
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityState={accessibilityState}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={[style, styles.tabBarButton]}>
      <View
        style={[
          styles.tabItemContainer,
          isSelected && styles.tabItemActive,
          isHovered && !isSelected && styles.tabItemHover,
        ]}>
        {/* Subtle active indicator accent at top */}
        {isSelected && <View style={styles.activeTopAccent} />}
        {children}
      </View>
    </Pressable>
  );
}

export default function AppTabs() {
  const insets = useSafeAreaInsets();
  const { requests } = useBlood();

  const codeRedCount = requests.filter(r => r.urgency === 'Code Red').length;

  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 6 : 4);
  const tabHeight = 48 + bottomInset;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#BE123C',
        tabBarInactiveTintColor: '#64748B',
        tabBarButton: props => <CustomTabBarButton {...props} />,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          borderTopWidth: 0.6,
          height: tabHeight,
          paddingBottom: bottomInset,
          paddingTop: 2,
          paddingHorizontal: 8,
          elevation: 8,
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: -0.1,
          marginTop: 1,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'ফিড',
          tabBarBadge: codeRedCount > 0 ? codeRedCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#BE123C',
            color: '#FFFFFF',
            fontSize: 8,
            fontWeight: '900',
            minWidth: 14,
            height: 14,
            borderRadius: 7,
            lineHeight: 13,
            top: 2,
          },
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              color={color}
              iconType="ionicons"
              activeName="pulse"
              inactiveName="pulse-outline"
              size={19}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="request"
        options={{
          title: 'অনুরোধ',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              color={color}
              iconType="material"
              activeName="plus-circle"
              inactiveName="plus-circle-outline"
              size={20}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="drives"
        options={{
          title: 'ডোনার',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              color={color}
              iconType="ionicons"
              activeName="people"
              inactiveName="people-outline"
              size={19}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'প্রোফাইল',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              color={color}
              iconType="ionicons"
              activeName="person-circle"
              inactiveName="person-circle-outline"
              size={20}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="login"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="complete-profile"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarButton: {
    flex: 1,
    paddingVertical: 2,
    paddingHorizontal: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabItemContainer: {
    width: '100%',
    height: 42,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: 'transparent',
    ...Platform.select({
      web: {
        transition: 'background-color 0.15s ease',
        cursor: 'pointer',
      },
    }),
  },
  tabItemActive: {
    backgroundColor: '#FFF1F2',
  },
  tabItemHover: {
    backgroundColor: '#F8FAFC',
  },
  activeTopAccent: {
    position: 'absolute',
    top: 0,
    width: 22,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#BE123C',
  },
  iconWrap: {
    marginBottom: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
