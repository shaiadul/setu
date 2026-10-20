import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Linking,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CampusHeader } from '@/components/campus-header';
import { BloodGroupBadge } from '@/components/blood-group-badge';
import { JuBadge } from '@/components/ju-badge';
import { useBlood } from '@/context/blood-context';
import { useTheme } from '@/hooks/use-theme';
import { BloodRequest, JuRole, ResponderStatus } from '@/types/blood';

export default function FeedScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { requests, updateResponseStatus, setSelectedTrackingRequest, refreshAll } = useBlood();

  const [activeRoleFilter, setActiveRoleFilter] = useState<'all' | JuRole>('all');
  const [activeUrgencyFilter, setActiveUrgencyFilter] = useState<'all' | 'Code Red' | 'Urgent'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  const filteredRequests = requests.filter(req => {
    if (activeRoleFilter !== 'all' && req.requesterRole !== activeRoleFilter) {
      return false;
    }
    if (activeUrgencyFilter !== 'all' && req.urgency !== activeUrgencyFilter) {
      return false;
    }
    return true;
  });

  const handleQuickRespond = (req: BloodRequest) => {
    if (req.userStatus === 'en_route') {
      updateResponseStatus(req.id, 'none');
      return;
    }
    updateResponseStatus(req.id, 'en_route');
    if (Platform.OS !== 'web') {
      Alert.alert(
        '🚑 রেসপন্স কনফার্ম!',
        `হাসপাতাল ও রোগীর স্বজনকে জানানো হয়েছে যে আপনি ${req.hospital}-এর উদ্দেশ্যে রওনা হয়েছেন।`,
        [{ text: 'ঠিক আছে' }]
      );
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('কল ব্যর্থ', `ফোন নম্বর: ${phone}`);
    });
  };

  const bottomPadding = 64 + Math.max(insets.bottom, 12);

  const renderItem = ({ item }: { item: BloodRequest }) => {
    const isCodeRed = item.urgency === 'Code Red';
    const isEnRoute = item.userStatus === 'en_route';

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.card,
            borderColor: isCodeRed ? theme.primaryLight : theme.cardBorder,
          },
          isCodeRed && styles.codeRedBorder,
        ]}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <BloodGroupBadge bloodType={item.bloodType} size="md" highlightUniversal />

          <View style={styles.headerInfo}>
            <View style={styles.urgencyRow}>
              <View
                style={[
                  styles.urgencyPill,
                  {
                    backgroundColor: isCodeRed ? theme.primaryContainer : theme.backgroundElement,
                  },
                ]}>
                <View
                  style={[
                    styles.urgencyDot,
                    { backgroundColor: isCodeRed ? theme.primary : theme.secondary },
                  ]}
                />
                <Text
                  style={[
                    styles.urgencyText,
                    { color: isCodeRed ? theme.primary : theme.textSecondary },
                  ]}>
                  {item.urgency === 'Code Red' ? 'জরুরি কোড রেড' : item.urgency}
                </Text>
              </View>

              <Text style={[styles.timeAgo, { color: theme.textSecondary }]}>
                {item.timeAgo}
              </Text>
            </View>

            <Text style={[styles.patientName, { color: theme.text }]} numberOfLines={1}>
              {item.patientName}
            </Text>

            <View style={styles.roleDeptRow}>
              <JuBadge role={item.requesterRole} size="sm" />
              <Text style={[styles.deptText, { color: theme.textSecondary }]} numberOfLines={1}>
                {item.requesterDepartment}
              </Text>
            </View>
          </View>
        </View>

        {/* Location & Case info */}
        <View style={[styles.locationBox, { backgroundColor: theme.backgroundElement }]}>
          <View style={styles.locItem}>
            <Ionicons name="location" size={14} color={theme.primary} />
            <Text style={[styles.locHospital, { color: theme.text }]} numberOfLines={1}>
              {item.hospital}
            </Text>
          </View>

          <View style={styles.locDetailRow}>
            <Text style={[styles.locRoom, { color: theme.textSecondary }]}>
              {item.room}
            </Text>
            <Text style={[styles.unitsNeeded, { color: theme.primary }]}>
              {item.requiredUnits} ব্যাগ রক্ত প্রয়োজন
            </Text>
          </View>
        </View>

        {/* Description note */}
        <Text style={[styles.descText, { color: theme.textSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Responders Count & Live Tracking Pill */}
        <View style={styles.respondersRow}>
          <View style={styles.respondersLeft}>
            <View style={[styles.pingCircle, { backgroundColor: theme.primary }]} />
            <Text style={[styles.respondersText, { color: theme.text }]}>
              {item.respondersCount > 0
                ? `${item.respondersCount} জন ডোনার এগিয়ে এসেছেন`
                : 'এখনও ডোনার পাওয়া যায়নি'}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.trackBtn, { backgroundColor: theme.secondaryLight }]}
            activeOpacity={0.8}
            onPress={() => setSelectedTrackingRequest(item)}>
            <Ionicons name="navigate-outline" size={13} color={theme.secondaryDark} />
            <Text style={[styles.trackBtnText, { color: theme.secondaryDark }]}>
              লাইভ ট্র্যাক
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[
              styles.respondBtn,
              {
                backgroundColor: isEnRoute ? theme.success : theme.primary,
              },
            ]}
            activeOpacity={0.88}
            onPress={() => handleQuickRespond(item)}>
            <Ionicons
              name={isEnRoute ? 'checkmark-circle' : 'flash'}
              size={15}
              color="#FFFFFF"
            />
            <Text style={styles.respondBtnText}>
              {isEnRoute ? 'আমি রওনা হয়েছি' : 'রক্ত দিতে এগিয়ে আসুন'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.callBtn, { borderColor: theme.cardBorder }]}
            activeOpacity={0.8}
            onPress={() => handleCall(item.contactNumber)}>
            <Ionicons name="call-outline" size={16} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const codeRedTotal = requests.filter(r => r.urgency === 'Code Red').length;

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <CampusHeader
        title="সেতু • রক্তের ফিড"
        subtitle="জাহাঙ্গীরনগর বিশ্ববিদ্যালয় ক্যাম্পাস ও সাভার ইমার্জেন্সি ফিড"
      />

      {/* Role Filter Tabs */}
      <View style={[styles.filterBar, { backgroundColor: theme.card, borderBottomColor: theme.cardBorder }]}>
        <View style={styles.filterChipScroll}>
          {(
            [
              { id: 'all', label: 'সকল রক্তদাতা' },
              { id: 'student', label: '🎓 শিক্ষার্থী' },
              { id: 'teacher', label: '🏛️ শিক্ষক' },
              { id: 'staff', label: '🏢 কর্মকর্তা/কর্মচারী' },
            ] as const
          ).map(chip => {
            const isSelected = activeRoleFilter === chip.id;
            return (
              <TouchableOpacity
                key={chip.id}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.backgroundElement,
                    borderColor: isSelected ? theme.primary : theme.cardBorder,
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => setActiveRoleFilter(chip.id)}>
                <Text
                  style={[
                    styles.filterChipText,
                    { color: isSelected ? '#FFFFFF' : theme.textSecondary },
                  ]}>
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Urgency toggle */}
        <View style={styles.urgencyToggleRow}>
          {(
            [
              { id: 'all', label: 'সব অনুরোধ' },
              { id: 'Code Red', label: `🚨 কোড রেড (${codeRedTotal})` },
            ] as const
          ).map(u => {
            const isSel = activeUrgencyFilter === u.id;
            return (
              <TouchableOpacity
                key={u.id}
                style={[
                  styles.urgencySubPill,
                  {
                    backgroundColor: isSel ? theme.primaryContainer : 'transparent',
                    borderColor: isSel ? theme.primary : theme.cardBorder,
                  },
                ]}
                onPress={() => setActiveUrgencyFilter(u.id)}>
                <Text
                  style={[
                    styles.urgencySubText,
                    { color: isSel ? theme.primary : theme.textSecondary },
                  ]}>
                  {u.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Request List */}
      <FlatList
        data={filteredRequests}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.listContainer, { paddingBottom: bottomPadding }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="heart-pulse" size={54} color={theme.cardBorder} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>কোনো রক্তের অনুরোধ নেই</Text>
            <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
              জাহাঙ্গীরনগর বিশ্ববিদ্যালয়ে বর্তমানে এই ফিল্টারে কোনো রক্তের অনুরোধ নেই।
            </Text>
          </View>
        }
      />

      {/* Floating Action Button to post new request */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary, bottom: bottomPadding + 14 }]}
        activeOpacity={0.9}
        onPress={() => router.push('/request')}>
        <Ionicons name="add" size={24} color="#FFFFFF" />
        <Text style={styles.fabText}>রক্তের অনুরোধ করুন</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  filterBar: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    gap: 8,
  },
  filterChipScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  urgencyToggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  urgencySubPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  urgencySubText: {
    fontSize: 11,
    fontWeight: '700',
  },
  listContainer: {
    padding: 16,
    gap: 14,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  codeRedBorder: {
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerInfo: {
    flex: 1,
    gap: 3,
  },
  urgencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  urgencyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  urgencyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: '800',
  },
  timeAgo: {
    fontSize: 11,
    fontWeight: '500',
  },
  patientName: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  roleDeptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deptText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  locationBox: {
    padding: 10,
    borderRadius: 10,
    gap: 4,
  },
  locItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locHospital: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  locDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 20,
  },
  locRoom: {
    fontSize: 11,
    fontWeight: '500',
  },
  unitsNeeded: {
    fontSize: 11,
    fontWeight: '800',
  },
  descText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  respondersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  respondersLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pingCircle: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  respondersText: {
    fontSize: 11,
    fontWeight: '700',
  },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  trackBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
  },
  respondBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  respondBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  callBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  fab: {
    position: 'absolute',
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 24,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
