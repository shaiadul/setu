import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BloodGroup } from '@/types/blood';
import { useTheme } from '@/hooks/use-theme';

interface BloodGroupBadgeProps {
  bloodType: BloodGroup | string;
  size?: 'sm' | 'md' | 'lg';
  highlightUniversal?: boolean;
}

export function BloodGroupBadge({
  bloodType,
  size = 'md',
  highlightUniversal = false,
}: BloodGroupBadgeProps) {
  const theme = useTheme();
  const isUniversal = bloodType === 'O-';

  const sizeStyles = {
    sm: { box: { width: 38, height: 38, borderRadius: 10 }, text: { fontSize: 13 }, drop: 12 },
    md: { box: { width: 50, height: 50, borderRadius: 14 }, text: { fontSize: 17 }, drop: 14 },
    lg: { box: { width: 68, height: 68, borderRadius: 18 }, text: { fontSize: 22 }, drop: 18 },
  }[size];

  return (
    <View
      style={[
        styles.container,
        sizeStyles.box,
        {
          backgroundColor: theme.primaryContainer,
          borderColor: theme.primaryLight,
        },
      ]}>
      <Text style={[styles.text, sizeStyles.text, { color: theme.primary }]}>
        {bloodType}
      </Text>
      {highlightUniversal && isUniversal && (
        <View style={[styles.universalIndicator, { backgroundColor: theme.primary }]}>
          <Text style={styles.universalText}>UNIVERSAL</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    position: 'relative',
  },
  text: {
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  universalIndicator: {
    position: 'absolute',
    bottom: -6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  universalText: {
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
});
