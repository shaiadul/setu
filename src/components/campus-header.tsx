import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBlood } from '@/context/blood-context';
import { useTheme } from '@/hooks/use-theme';

interface CampusHeaderProps {
  title?: string;
  subtitle?: string;
}

export function CampusHeader({ title, subtitle }: CampusHeaderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { requests, setShowSplash } = useBlood();

  const codeRedCount = requests.filter(r => r.urgency === 'Code Red').length;

  return (
    <View
      style={[
        styles.headerContainer,
        {
          paddingTop: Math.max(insets.top, 12),
          backgroundColor: theme.card,
          borderBottomColor: theme.cardBorder,
        },
      ]}>
      <View style={styles.contentRow}>
        {/* Brand & Ticker */}
        <View style={styles.brandColumn}>
          <View style={styles.logoRow}>
            <View style={[styles.logoIcon, { backgroundColor: theme.primary }]}>
              <MaterialCommunityIcons name="water" size={17} color="#FFFFFF" />
            </View>
            <Text style={[styles.appName, { color: theme.text }]}>সেতু</Text>
            <View style={[styles.statusDot, { backgroundColor: theme.primary }]} />
            <Text style={[styles.brandSub, { color: theme.primary }]}>SETU • JU</Text>
          </View>
          <Text style={[styles.campusStatus, { color: theme.textSecondary }]}>
            {subtitle ?? `জাহাঙ্গীরনগর বিশ্ববিদ্যালয় • ${codeRedCount} টি জরুরি কোড রেড`}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          {/* 3-Slider Onboarding Re-trigger */}
          <TouchableOpacity
            style={[
              styles.infoBtn,
              { backgroundColor: theme.primaryContainer, borderColor: theme.primaryLight },
            ]}
            activeOpacity={0.8}
            onPress={() => setShowSplash(true)}>
            <Ionicons name="sparkles" size={14} color={theme.primary} />
            <Text style={[styles.infoBtnText, { color: theme.primary }]}>পরিচিতি</Text>
          </TouchableOpacity>

          {/* Alert pill */}
          <View style={[styles.alertBadge, { backgroundColor: theme.backgroundElement }]}>
            <Ionicons name="notifications-outline" size={18} color={theme.text} />
            {codeRedCount > 0 && (
              <View style={[styles.badgeNumber, { backgroundColor: theme.primary }]}>
                <Text style={styles.badgeText}>{codeRedCount}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandColumn: {
    gap: 2,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  brandSub: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  campusStatus: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  infoBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  alertBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badgeNumber: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});
