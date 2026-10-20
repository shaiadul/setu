import React, { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CampusHeader } from '@/components/campus-header';
import { useBlood } from '@/context/blood-context';
import { SetuNotification } from '@/types/blood';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandGradient } from '@/constants/theme';

const INITIAL_NOTIFICATIONS: SetuNotification[] = [
  {
    id: 'notif-1',
    title: '🚨 জরুরি কোড রেড: O- রক্ত প্রয়োজন',
    message: 'এনাম মেডিকেল কলেজ (আইসিইউ-৩)। রোগী: রোকেয়া বেগম (৫৫)। জরুরি সার্জারির জন্য ২ ব্যাগ রক্ত প্রয়োজন।',
    type: 'code_red',
    timeAgo: '৩ মিনিট আগে',
    isRead: false,
    requestId: 'req-ju-2',
  },
  {
    id: 'notif-2',
    title: '🩸 ডোনার রওনা হয়েছেন',
    message: 'ডা. রফিকুল ইসলাম (ফার্মেসি বিভাগ) আপনার রক্তের অনুরোধে সাড়া দিয়ে জাবি মেডিকেল সেন্টারের উদ্দেশ্যে রওনা হয়েছেন (ETA: ৭ মিনিট)।',
    type: 'donor_response',
    timeAgo: '১২ মিনিট আগে',
    isRead: false,
    requestId: 'req-ju-1',
  },
  {
    id: 'notif-3',
    title: '🎉 রক্তদানের যোগ্যতা ফিরে পেয়েছেন',
    message: 'অভিনন্দন! আপনার ৯০ দিনের বাধ্যতামূলক বিশ্রাম পর্ব সফলভাবে সমাপ্ত হয়েছে। আপনি এখন যেকোনো জরুরি প্রয়োজনে রক্তদানে সম্পূর্ণ প্রস্তুত।',
    type: 'milestone',
    timeAgo: '২ ঘণ্টা আগে',
    isRead: true,
  },
  {
    id: 'notif-4',
    title: '📢 জাবি ভলান্টারি ব্লাড ড্রাইভ ২০২৬',
    message: 'আগামী শুক্রবার সকাল ৯টায় জাবি মেডিকেল সেন্টার প্রাঙ্গণে কেন্দ্রীয় রক্তদান ক্যাম্প অনুষ্ঠিত হবে। বিনামূল্যে স্বাস্থ্য পরীক্ষা অন্তর্ভুক্ত।',
    type: 'drive',
    timeAgo: '১ দিন আগে',
    isRead: true,
  },
  {
    id: 'notif-5',
    title: '🛡️ ক্যাম্পাস ডোনার ভেরিফিকেশন আপডেট',
    message: 'আপনার শিক্ষার্থী আইডি (JU-2019-CSE-042) এবং প্ল্যাটিনাম ডোনার ব্যাজ জাবি অথরিটি দ্বারা ভেরিফাইড হয়েছে।',
    type: 'system',
    timeAgo: '৩ দিন আগে',
    isRead: true,
  },
];

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { requests, setSelectedTrackingRequest } = useBlood();

  const [notifications, setNotifications] = useState<SetuNotification[]>(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState<'all' | 'code_red' | 'donor_response' | 'milestone'>('all');

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleClearAll = () => {
    Alert.alert(
      'সব নোটিফিকেশন মুছবেন?',
      'আপনি কি সকল নোটিফিকেশন তালিকা থেকে মুছে ফেলতে চান?',
      [
        { text: 'বাতিল', style: 'cancel' },
        {
          text: 'মুছে ফেলুন',
          style: 'destructive',
          onPress: () => setNotifications([]),
        },
      ]
    );
  };

  const handleItemPress = (item: SetuNotification) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
    );

    // If associated with request, open tracking modal or feed
    if (item.requestId) {
      const match = requests.find((r) => r.id === item.requestId);
      if (match) {
        setSelectedTrackingRequest(match);
        return;
      }
      router.push('/');
    } else if (item.type === 'milestone') {
      router.push('/profile');
    }
  };

  const handleDeleteItem = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.type === activeFilter;
  });

  const getIconConfig = (type: SetuNotification['type']) => {
    switch (type) {
      case 'code_red':
        return {
          icon: 'flash' as const,
          color: '#BE123C',
          bg: '#FFF1F2',
          badgeText: 'জরুরি এলার্ট',
        };
      case 'donor_response':
        return {
          icon: 'heart' as const,
          color: '#16A34A',
          bg: '#F0FDF4',
          badgeText: 'ডোনার আপডেট',
        };
      case 'milestone':
        return {
          icon: 'trophy' as const,
          color: '#D97706',
          bg: '#FFFBEB',
          badgeText: 'মাইলফলক',
        };
      case 'drive':
        return {
          icon: 'calendar' as const,
          color: '#0284C7',
          bg: '#F0F9FF',
          badgeText: 'ক্যাম্পাস ড্রাইভ',
        };
      default:
        return {
          icon: 'notifications' as const,
          color: '#64748B',
          bg: '#F1F5F9',
          badgeText: 'সিস্টেম',
        };
    }
  };

  return (
    <View style={styles.screen}>
      <CampusHeader
        title="নোটিফিকেশন ও জরুরি বার্তা"
        subtitle="রক্তের ডাক ও ডোনার আপডেট"
        showBack={true}
        onBack={() => router.back()}
      />

      {/* Top Meta Bar */}
      <View style={styles.metaActionBar}>
        <View style={styles.unreadStatusCluster}>
          <Text style={styles.unreadStatusTitle}>ইনবক্স বার্তা</Text>
          {unreadCount > 0 ? (
            <View style={styles.unreadBadgePill}>
              <Text style={styles.unreadBadgeText}>{unreadCount}টি নতুন</Text>
            </View>
          ) : (
            <Text style={styles.allReadText}>সব পঠিত</Text>
          )}
        </View>

        <View style={styles.actionBtnsCluster}>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.actionTextBtn}
              activeOpacity={0.7}
              onPress={handleMarkAllAsRead}
            >
              <Ionicons name="checkmark-done" size={13} color="#BE123C" />
              <Text style={styles.actionBtnLabel}>সব পঠিত</Text>
            </TouchableOpacity>
          )}

          {notifications.length > 0 && (
            <TouchableOpacity
              style={styles.actionTextBtn}
              activeOpacity={0.7}
              onPress={handleClearAll}
            >
              <Ionicons name="trash-outline" size={13} color="#64748B" />
              <Text style={[styles.actionBtnLabel, { color: '#64748B' }]}>পরিষ্কার</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Modern Filter Track */}
      <View style={styles.filterTrackContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTrack}
        >
          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'all' && styles.filterChipActive]}
            activeOpacity={0.8}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[styles.filterChipText, activeFilter === 'all' && styles.filterChipTextActive]}>
              সব ({notifications.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'code_red' && styles.filterChipActive]}
            activeOpacity={0.8}
            onPress={() => setActiveFilter('code_red')}
          >
            <Ionicons
              name="flash"
              size={11}
              color={activeFilter === 'code_red' ? '#BE123C' : '#EA580C'}
            />
            <Text style={[styles.filterChipText, activeFilter === 'code_red' && styles.filterChipTextActive]}>
              কোড রেড
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'donor_response' && styles.filterChipActive]}
            activeOpacity={0.8}
            onPress={() => setActiveFilter('donor_response')}
          >
            <Ionicons
              name="heart"
              size={11}
              color={activeFilter === 'donor_response' ? '#BE123C' : '#16A34A'}
            />
            <Text style={[styles.filterChipText, activeFilter === 'donor_response' && styles.filterChipTextActive]}>
              ডোনার সাড়া
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'milestone' && styles.filterChipActive]}
            activeOpacity={0.8}
            onPress={() => setActiveFilter('milestone')}
          >
            <Ionicons
              name="trophy"
              size={11}
              color={activeFilter === 'milestone' ? '#BE123C' : '#D97706'}
            />
            <Text style={[styles.filterChipText, activeFilter === 'milestone' && styles.filterChipTextActive]}>
              সম্মাননা
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Notifications List */}
      <ScrollView
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 30 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="notifications-off-outline" size={36} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>কোনো নোটিফিকেশন নেই</Text>
            <Text style={styles.emptySubtitle}>
              জরুরি রক্তের ডাক বা ক্যাম্পাসের ডোনার আপডেট এলে এখানে সাথে সাথে দেখতে পাবেন।
            </Text>
            <TouchableOpacity
              style={styles.emptyResetBtnTouch}
              activeOpacity={0.85}
              onPress={() => setNotifications(INITIAL_NOTIFICATIONS)}
            >
              <LinearGradient
                colors={BrandGradient.colors}
                start={BrandGradient.start}
                end={BrandGradient.end}
                style={styles.emptyResetBtnGradient}
              >
                <Ionicons name="refresh" size={13} color="#FFFFFF" />
                <Text style={styles.emptyResetBtnText}>নোটিফিকেশন রিলোড করুন</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          filteredNotifications.map((item) => {
            const config = getIconConfig(item.type);
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.notifCard, !item.isRead && styles.notifCardUnread]}
                activeOpacity={0.85}
                onPress={() => handleItemPress(item)}
              >
                {/* Left Type Icon Squircle */}
                <View style={[styles.typeIconSquircle, { backgroundColor: config.bg }]}>
                  <Ionicons name={config.icon} size={16} color={config.color} />
                </View>

                {/* Content Center */}
                <View style={styles.notifContentCol}>
                  <View style={styles.notifTopMetaRow}>
                    <View style={styles.typeBadgePill}>
                      <Text style={[styles.typeBadgeText, { color: config.color }]}>
                        {config.badgeText}
                      </Text>
                    </View>
                    <Text style={styles.timeAgoText}>{item.timeAgo}</Text>
                    {!item.isRead && <View style={styles.unreadDot} />}
                  </View>

                  <Text style={[styles.notifTitle, !item.isRead && styles.notifTitleBold]}>
                    {item.title}
                  </Text>
                  <Text style={styles.notifMessage} numberOfLines={3}>
                    {item.message}
                  </Text>

                  {/* Context Action Button if available */}
                  {item.requestId && (
                    <View style={styles.cardActionRow}>
                      <View style={styles.respondActionPill}>
                        <Ionicons name="eye-outline" size={11} color="#BE123C" />
                        <Text style={styles.respondActionText}>অনুরোধের বিবরণ দেখুন</Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Dismiss Icon */}
                <TouchableOpacity
                  style={styles.deleteIconBtn}
                  activeOpacity={0.7}
                  onPress={() => handleDeleteItem(item.id)}
                >
                  <Ionicons name="close" size={14} color="#94A3B8" />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  metaActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  unreadStatusCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  unreadStatusTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  unreadBadgePill: {
    backgroundColor: '#FFF1F2',
    borderWidth: 0.8,
    borderColor: '#FECDD3',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  unreadBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#BE123C',
  },
  allReadText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#16A34A',
  },
  actionBtnsCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionTextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  actionBtnLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#BE123C',
  },

  /* Filter Track */
  filterTrackContainer: {
    paddingVertical: 6,
  },
  filterTrack: {
    paddingHorizontal: 16,
    gap: 6,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#FFF1F2',
    borderColor: '#BE123C',
  },
  filterChipText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#BE123C',
    fontWeight: '800',
  },

  /* List */
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
    gap: 10,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  notifCardUnread: {
    borderColor: '#FECDD3',
    backgroundColor: '#FFFAFA',
    borderLeftWidth: 3.5,
    borderLeftColor: '#BE123C',
  },
  typeIconSquircle: {
    width: 34,
    height: 34,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifContentCol: {
    flex: 1,
    gap: 3,
  },
  notifTopMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeBadgePill: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    backgroundColor: '#F8FAFC',
  },
  typeBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
  },
  timeAgoText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#94A3B8',
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#BE123C',
    marginLeft: 'auto',
  },
  notifTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
    lineHeight: 16,
  },
  notifTitleBold: {
    fontWeight: '900',
    color: '#0F172A',
  },
  notifMessage: {
    fontSize: 10.5,
    fontWeight: '500',
    color: '#64748B',
    lineHeight: 15,
  },
  cardActionRow: {
    marginTop: 4,
  },
  respondActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: '#FFF1F2',
    borderWidth: 0.8,
    borderColor: '#FECDD3',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  respondActionText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#BE123C',
  },
  deleteIconBtn: {
    padding: 3,
    alignSelf: 'flex-start',
  },

  /* Empty State */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 10,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 17,
  },
  emptyResetBtnTouch: {
    borderRadius: 17,
    overflow: 'hidden',
    shadowColor: '#881337',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 3,
    marginTop: 6,
  },
  emptyResetBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 17,
  },
  emptyResetBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
