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

  const iconColor = isOutline ? '#DC2626' : isSecondary ? '#475569' : '#FFFFFF';

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
  buttonBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    elevation: 3,
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

  /* Variants */
  primary: {
    backgroundColor: '#DC2626',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  danger: {
    backgroundColor: '#DC2626',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  secondary: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  outline: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#DC2626',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
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
    color: '#DC2626',
  },

  /* Sizes */
  size_sm: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  size_md: {
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  size_lg: {
    height: 46,
    paddingHorizontal: 18,
    borderRadius: 12,
  },

  /* Text Sizes */
  textSize_sm: {
    fontSize: 11,
  },
  textSize_md: {
    fontSize: 13,
  },
  textSize_lg: {
    fontSize: 14,
  },

  disabled: {
    opacity: 0.65,
  },
});
