import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBlood } from '@/context/blood-context';

interface CampusHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  hideIcons?: boolean;
  rightElement?: React.ReactNode;
}

export function CampusHeader({
  title = 'সেতু • রক্তের ফিড',
  subtitle = 'জাহাঙ্গীরনগর বিশ্ববিদ্যালয় ডোনার নেটওয়ার্ক',
  showBack,
  onBack,
  hideIcons,
  rightElement,
}: CampusHeaderProps) {
  const insets = useSafeAreaInsets();
  const { requests, setShowSplash } = useBlood();

  const codeRedCount = requests.filter(r => r.urgency === 'Code Red').length;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View
      style={[
        styles.headerContainer,
        { paddingTop: Math.max(insets.top, 10) + 4 },
      ]}>
      <View style={styles.contentRow}>
        {showBack ? (
          <View style={styles.backTitleRow}>
            <TouchableOpacity
              style={styles.iconCircleBtn}
              activeOpacity={0.7}
              onPress={handleBack}>
              <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.titleCol}>
              <Text style={styles.screenTitle} numberOfLines={1}>
                {title}
              </Text>
              {subtitle && (
                <Text style={styles.screenSubtitle} numberOfLines={1}>
                  {subtitle}
                </Text>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.titleCol}>
            <View style={styles.titleBadgeRow}>
              <Text style={styles.screenTitle} numberOfLines={1}>
                {title}
              </Text>
              <View style={styles.livePill}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>লাইভ</Text>
              </View>
            </View>
            {subtitle && (
              <Text style={styles.screenSubtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
        )}

        {/* Right Actions */}
        {!hideIcons && (
          <View style={styles.actionsRow}>
            {rightElement ? (
              rightElement
            ) : (
              <>
                <TouchableOpacity
                  style={styles.iconCircleBtn}
                  activeOpacity={0.7}
                  onPress={() => setShowSplash(true)}>
                  <Ionicons name="help-buoy-outline" size={16} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconCircleBtn}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (codeRedCount > 0) {
                      router.push('/');
                    }
                  }}>
                  <Ionicons name="notifications-outline" size={16} color="#FFFFFF" />
                  {codeRedCount > 0 && (
                    <View style={styles.badgePill}>
                      <Text style={styles.badgeText}>{codeRedCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    shadowColor: '#7F1D1D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    zIndex: 10,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  titleCol: {
    flex: 1,
    gap: 2,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  screenSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.82)',
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
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
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badgePill: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#DC2626',
  },
});
