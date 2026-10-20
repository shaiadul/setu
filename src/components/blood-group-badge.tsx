import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BloodGroup } from '@/types/blood';
import { useTheme } from '@/hooks/use-theme';
import { BrandGradient } from '@/constants/theme';

interface BloodGroupBadgeProps {
  bloodType: BloodGroup | string;
  size?: 'sm' | 'md' | 'lg';
  highlightUniversal?: boolean;
  solidGradient?: boolean;
}

export function BloodGroupBadge({
  bloodType,
  size = 'md',
  highlightUniversal = false,
  solidGradient = false,
}: BloodGroupBadgeProps) {
  const theme = useTheme();
  const isUniversal = bloodType === 'O-';

  const sizeStyles = {
    sm: { box: { width: 38, height: 38, borderRadius: 10 }, text: { fontSize: 13 }, drop: 12 },
    md: { box: { width: 50, height: 50, borderRadius: 14 }, text: { fontSize: 17 }, drop: 14 },
    lg: { box: { width: 68, height: 68, borderRadius: 18 }, text: { fontSize: 22 }, drop: 18 },
  }[size];

  if (solidGradient) {
    return (
      <LinearGradient
        colors={BrandGradient.colors}
        start={BrandGradient.start}
        end={BrandGradient.end}
        style={[styles.container, sizeStyles.box, styles.gradientShadow]}>
        <Text style={[styles.text, sizeStyles.text, { color: '#FFFFFF' }]}>
          {bloodType}
        </Text>
        {highlightUniversal && isUniversal && (
          <View style={styles.universalIndicatorSolid}>
            <Text style={styles.universalTextSolid}>UNIVERSAL</Text>
          </View>
        )}
      </LinearGradient>
    );
  }

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
        <LinearGradient
          colors={BrandGradient.colors}
          start={BrandGradient.start}
          end={BrandGradient.end}
          style={styles.universalIndicator}>
          <Text style={styles.universalText}>UNIVERSAL</Text>
        </LinearGradient>
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
  gradientShadow: {
    borderWidth: 0,
    shadowColor: '#881337',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  text: {
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  universalIndicator: {
    position: 'absolute',
    bottom: -6,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 5,
  },
  universalIndicatorSolid: {
    position: 'absolute',
    bottom: -6,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  universalText: {
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  universalTextSolid: {
    color: '#FECDD3',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
});
