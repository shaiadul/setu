import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandGradient } from '@/constants/theme';

export interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  icon?: string;
  iconFamily?: 'ionicons' | 'material';
  iconSize?: number;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function PrimaryButton({
  title,
  onPress,
  icon,
  iconFamily = 'ionicons',
  iconSize = 16,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  style,
  textStyle,
}: PrimaryButtonProps) {
  const isOutline = variant === 'outline';
  const isSecondary = variant === 'secondary';
  const isGradient = variant === 'primary' || variant === 'danger';

  const iconColor = isOutline ? '#BE123C' : isSecondary ? '#475569' : '#FFFFFF';

  if (isGradient) {
    return (
      <TouchableOpacity
        style={[
          styles.gradientTouchBase,
          styles[`shadow_${variant}`],
          (disabled || loading) && styles.disabled,
          style,
        ]}
        activeOpacity={0.85}
        disabled={disabled || loading}
        onPress={onPress}
      >
        <LinearGradient
          colors={BrandGradient.colors}
          start={BrandGradient.start}
          end={BrandGradient.end}
          style={[styles.buttonBase, styles[`size_${size}`], styles.gradientButtonFill]}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <View style={styles.contentRow}>
              {icon && (
                iconFamily === 'material' ? (
                  <MaterialCommunityIcons
                    name={icon as any}
                    size={iconSize}
                    color="#FFFFFF"
                  />
                ) : (
                  <Ionicons
                    name={icon as any}
                    size={iconSize}
                    color="#FFFFFF"
                  />
                )
              )}
              <Text
                style={[
                  styles.textBase,
                  styles.text_primary,
                  styles[`textSize_${size}`],
                  textStyle,
                ]}
              >
                {title}
              </Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.buttonBase,
        styles[variant],
        styles[`size_${size}`],
        (disabled || loading) && styles.disabled,
        style,
      ]}
      activeOpacity={0.85}
      disabled={disabled || loading}
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : (
        <View style={styles.contentRow}>
          {icon && (
            iconFamily === 'material' ? (
              <MaterialCommunityIcons
                name={icon as any}
                size={iconSize}
                color={iconColor}
              />
            ) : (
              <Ionicons
                name={icon as any}
                size={iconSize}
                color={iconColor}
              />
            )
          )}
          <Text
            style={[
              styles.textBase,
              styles[`text_${variant}`],
              styles[`textSize_${size}`],
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradientTouchBase: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButtonFill: {
    width: '100%',
  },
  shadow_primary: {
    shadowColor: '#881337',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  shadow_danger: {
    shadowColor: '#881337',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  textBase: {
    fontWeight: '800',
    letterSpacing: 0.1,
  },

  /* Non-gradient Variants */
  secondary: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  outline: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#BE123C',
    shadowColor: '#BE123C',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },

  /* Text Variants */
  text_primary: {
    color: '#FFFFFF',
  },
  text_danger: {
    color: '#FFFFFF',
  },
  text_secondary: {
    color: '#334155',
  },
  text_outline: {
    color: '#BE123C',
  },

  /* Sizes */
  size_sm: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 9,
  },
  size_md: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  size_lg: {
    height: 48,
    paddingHorizontal: 18,
    borderRadius: 14,
  },

  /* Text Sizes */
  textSize_sm: {
    fontSize: 11.5,
  },
  textSize_md: {
    fontSize: 13.5,
  },
  textSize_lg: {
    fontSize: 14.5,
  },

  disabled: {
    opacity: 0.65,
  },
});
