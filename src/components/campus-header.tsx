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
        { paddingTop: Math.max(insets.top, 12) + 2 },
      ]}>
      {/* Gradient-like layered background */}
      <View style={styles.bgLayer} />

      <View style={styles.contentRow}>
        {/* Brand */}
        <View style={styles.brandColumn}>
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <MaterialCommunityIcons name="water" size={14} color="#FFFFFF" />
            </View>
            <Text style={styles.appName}>সেতু</Text>
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
          <Text style={styles.campusStatus} numberOfLines={1}>
            {subtitle ?? `জাহাঙ্গীরনগর বিশ্ববিদ্যালয় • ${codeRedCount} কোড রেড`}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            activeOpacity={0.7}
            onPress={() => setShowSplash(true)}>
            <Ionicons name="information-circle-outline" size={20} color="rgba(255,255,255,0.85)" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={19} color="rgba(255,255,255,0.85)" />
            {codeRedCount > 0 && (
              <View style={styles.badgeDot}>
                <Text style={styles.badgeText}>{codeRedCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 18,
    paddingBottom: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  bgLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#DC2626',
    opacity: 1,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandColumn: {
    gap: 3,
    flex: 1,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#4ADE80',
  },
  liveText: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.8,
  },
  campusStatus: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: -0.1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FDE047',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: '#92400E',
    fontSize: 8,
    fontWeight: '900',
  },
});
