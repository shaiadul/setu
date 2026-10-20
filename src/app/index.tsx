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
import { JuBadge } from '@/components/ju-badge';
import { useBlood } from '@/context/blood-context';
import { useTheme } from '@/hooks/use-theme';
import { BloodRequest, JuRole } from '@/types/blood';

export default function FeedScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { requests, updateResponseStatus, setSelectedTrackingRequest, refreshAll } = useBlood();

  const [activeFilter, setActiveFilter] = useState<'all' | 'Code Red' | JuRole>('all');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  const filteredRequests = requests.filter(req => {
    if (activeFilter === 'Code Red') return req.urgency === 'Code Red';
    if (activeFilter === 'student' || activeFilter === 'teacher' || activeFilter === 'staff') {
      return req.requesterRole === activeFilter;
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
        `আপনি ${req.hospital}-এর উদ্দেশ্যে রওনা হয়েছেন জানানো হয়েছে।`,
        [{ text: 'ঠিক আছে' }]
      );
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('কল ব্যর্থ', `ফোন নম্বর: ${phone}`);
    });
  };

  const bottomPadding = 56 + Math.max(insets.bottom, 12);
  const codeRedTotal = requests.filter(r => r.urgency === 'Code Red').length;

  const urgencyColor = (u: string) => {
    if (u === 'Code Red') return { bg: '#FEF2F2', text: '#DC2626', dot: '#DC2626' };
    if (u === 'Urgent') return { bg: '#FFFBEB', text: '#D97706', dot: '#F59E0B' };
    return { bg: '#F0F9FF', text: '#0284C7', dot: '#0EA5E9' };
  };

  const renderItem = ({ item }: { item: BloodRequest }) => {
    const isCodeRed = item.urgency === 'Code Red';
    const isEnRoute = item.userStatus === 'en_route';
    const uc = urgencyColor(item.urgency);

    return (
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => setSelectedTrackingRequest(item)}
        style={[
          styles.card,
          { backgroundColor: '#FFFFFF' },
          isCodeRed && styles.codeRedCard,
        ]}>
        {/* Urgency Accent Strip */}
        <View style={[styles.accentStrip, { backgroundColor: uc.dot }]} />

        {/* Card Content */}
        <View style={styles.cardInner}>
          {/* Top Row: Blood type + Meta */}
          <View style={styles.topRow}>
            <View style={[styles.bloodBadge, { backgroundColor: uc.bg }]}>
              <Text style={[styles.bloodBadgeText, { color: uc.text }]}>
                {item.bloodType}
              </Text>
            </View>

            <View style={styles.topMeta}>
              <View style={styles.topMetaLeft}>
                <View style={[styles.urgencyChip, { backgroundColor: uc.bg }]}>
                  <View style={[styles.urgencyDot, { backgroundColor: uc.dot }]} />
                  <Text style={[styles.urgencyLabel, { color: uc.text }]}>
                    {item.urgency === 'Code Red' ? 'কোড রেড' : item.urgency}
                  </Text>
                </View>
                <Text style={styles.units}>
                  {item.requiredUnits} ব্যাগ
                </Text>
              </View>
              <Text style={styles.timeAgo}>{item.timeAgo}</Text>
            </View>
          </View>

          {/* Patient & Requester */}
          <View style={styles.patientSection}>
            <Text style={styles.patientName} numberOfLines={1}>
              {item.patientName}
            </Text>
            <View style={styles.requesterRow}>
              <JuBadge role={item.requesterRole} size="sm" />
              <Text style={styles.deptText} numberOfLines={1}>
                {item.requesterDepartment}
              </Text>
            </View>
          </View>

          {/* Hospital Location — compact */}
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={13} color="#DC2626" />
            <Text style={styles.hospitalName} numberOfLines={1}>
              {item.hospital}
            </Text>
            <Text style={styles.distanceText}>{item.distance}</Text>
          </View>

          {/* Bottom Actions — compact inline */}
          <View style={styles.bottomRow}>
            <View style={styles.respondersInfo}>
              {item.respondersCount > 0 ? (
                <>
                  <View style={styles.avatarStack}>
                    {[0, 1, 2].slice(0, Math.min(item.respondersCount, 3)).map(i => (
                      <View
                        key={i}
                        style={[
                          styles.miniAvatar,
                          { marginLeft: i > 0 ? -6 : 0, backgroundColor: i === 0 ? '#DC2626' : i === 1 ? '#0284C7' : '#16A34A' },
                        ]}>
                        <Ionicons name="person" size={8} color="#FFFFFF" />
                      </View>
                    ))}
                  </View>
                  <Text style={styles.respondersText}>
                    {item.respondersCount} জন সাড়া দিয়েছেন
                  </Text>
                </>
              ) : (
                <Text style={styles.noRespondersText}>ডোনার প্রয়োজন</Text>
              )}
            </View>

            <View style={styles.actionBtns}>
              <TouchableOpacity
                style={[
                  styles.respondBtn,
                  isEnRoute && styles.respondBtnActive,
                ]}
                activeOpacity={0.85}
                onPress={() => handleQuickRespond(item)}>
                <Ionicons
                  name={isEnRoute ? 'checkmark' : 'flash'}
                  size={13}
                  color={isEnRoute ? '#16A34A' : '#FFFFFF'}
                />
                <Text style={[styles.respondBtnText, isEnRoute && styles.respondBtnTextActive]}>
                  {isEnRoute ? 'রওনা' : 'এগিয়ে আসুন'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.callBtn}
                activeOpacity={0.8}
                onPress={() => handleCall(item.contactNumber)}>
                <Ionicons name="call" size={14} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: '#F1F5F9' }]}>
      <CampusHeader subtitle="ক্যাম্পাস ও সাভার ইমার্জেন্সি রক্তের ফিড" />

      {/* Inline filter pills */}
      <View style={styles.filterBar}>
        {([
          { id: 'all', label: 'সকল', icon: 'grid-outline' as const },
          { id: 'Code Red', label: `🔴 জরুরি (${codeRedTotal})`, icon: undefined },
          { id: 'student', label: 'শিক্ষার্থী', icon: 'school-outline' as const },
          { id: 'teacher', label: 'শিক্ষক', icon: 'book-outline' as const },
          { id: 'staff', label: 'কর্মকর্তা', icon: 'briefcase-outline' as const },
        ] as const).map(f => {
          const isActive = activeFilter === f.id;
          return (
            <TouchableOpacity
              key={f.id}
              style={[styles.filterPill, isActive && styles.filterPillActive]}
              activeOpacity={0.7}
              onPress={() => setActiveFilter(f.id as typeof activeFilter)}>
              {f.icon && (
                <Ionicons
                  name={f.icon}
                  size={13}
                  color={isActive ? '#FFFFFF' : '#64748B'}
                />
              )}
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Feed */}
      <FlatList
        data={filteredRequests}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.listContent, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#DC2626" />
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyCircle}>
              <MaterialCommunityIcons name="heart-pulse" size={36} color="#CBD5E1" />
            </View>
            <Text style={styles.emptyTitle}>কোনো অনুরোধ নেই</Text>
            <Text style={styles.emptySub}>এই ফিল্টারে বর্তমানে কোনো রক্তের অনুরোধ নেই।</Text>
          </View>
        }
      />

      {/* Compact FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: bottomPadding + 8 }]}
        activeOpacity={0.9}
        onPress={() => router.push('/request')}>
        <Ionicons name="add" size={22} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(226,232,240,0.6)',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterPillActive: {
    backgroundColor: '#0F172A',
  },
  filterText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 14,
    gap: 10,
  },
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  codeRedCard: {
    shadowColor: '#DC2626',
    shadowOpacity: 0.1,
  },
  accentStrip: {
    height: 3,
    width: '100%',
  },
  cardInner: {
    padding: 14,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bloodBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bloodBadgeText: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  topMeta: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topMetaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  urgencyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  urgencyDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  urgencyLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  units: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
  },
  timeAgo: {
    fontSize: 10,
    fontWeight: '500',
    color: '#94A3B8',
  },
  patientSection: {
    gap: 3,
  },
  patientName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  requesterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deptText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  hospitalName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
  },
  distanceText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  respondersInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  respondersText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  noRespondersText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#DC2626',
  },
  actionBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  respondBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  respondBtnActive: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  respondBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  respondBtnTextActive: {
    color: '#16A34A',
  },
  callBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptySub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: 240,
  },
  fab: {
    position: 'absolute',
    right: 18,
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
});
