import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { JuRole } from '@/types/blood';
import { useTheme } from '@/hooks/use-theme';

interface JuBadgeProps {
  role: JuRole;
  size?: 'sm' | 'md';
}

const ROLE_META: Record<JuRole, { labelBn: string; labelEn: string; icon: keyof typeof Ionicons.glyphMap; bg: string; text: string; border: string }> = {
  student: {
    labelBn: 'শিক্ষার্থী',
    labelEn: 'Student',
    icon: 'school-outline',
    bg: '#EFF6FF',
    text: '#1D4ED8',
    border: '#BFDBFE',
  },
  teacher: {
    labelBn: 'শিক্ষক',
    labelEn: 'Faculty',
    icon: 'book-outline',
    bg: '#FDF4FF',
    text: '#86198F',
    border: '#F5D0FE',
  },
  staff: {
    labelBn: 'কর্মকর্তা/কর্মচারী',
    labelEn: 'Staff',
    icon: 'briefcase-outline',
    bg: '#F0FDF4',
    text: '#15803D',
    border: '#BBF7D0',
  },
};

export function JuBadge({ role, size = 'sm' }: JuBadgeProps) {
  const meta = ROLE_META[role] || ROLE_META.student;
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: meta.bg,
          borderColor: meta.border,
          paddingVertical: isSm ? 2 : 4,
          paddingHorizontal: isSm ? 6 : 9,
        },
      ]}>
      <Ionicons name={meta.icon} size={isSm ? 11 : 13} color={meta.text} />
      <Text style={[styles.text, { color: meta.text, fontSize: isSm ? 10 : 12 }]}>
        {meta.labelBn}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  text: {
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
