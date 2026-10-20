import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Linking,
  Platform,
  RefreshControl,
  Share,
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
import { RequestTrackingModal } from '@/components/request-tracking-modal';
import { useBlood } from '@/context/blood-context';
import { BloodRequest, JuRole } from '@/types/blood';

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const {
    requests,
    updateResponseStatus,
    selectedTrackingRequest,
    setSelectedTrackingRequest,
    refreshAll,
  } = useBlood();

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
        '🚑 রেসপন্স নিশ্চিত!',
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

  const handleShare = async (item: BloodRequest) => {
    const text = `🚨 [সেতু - জাহাঙ্গীরনগর বিশ্ববিদ্যালয় রক্তদান হাব]\nজরুরি রক্তের অনুরোধ!\nগ্রুপ: ${item.bloodType} (${item.requiredUnits} ব্যাগ)\nরোগী: ${item.patientName}\nহাসপাতাল: ${item.hospital} (${item.distance})\nযোগাযোগ: ${item.contactNumber}\nঅনুরোধকারী: ${item.requesterDepartment}\n\nদয়া করে রক্তদানে এগিয়ে আসুন অথবা শেয়ার করুন।`;
    try {
      if (Platform.OS === 'web') {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(text);
          Alert.alert('কপি হয়েছে', 'রক্তের অনুরোধ ক্লিপবোর্ডে কপি করা হয়েছে।');
        }
      } else {
        await Share.share({ message: text });
      }
    } catch {
      // Ignored
    }
  };

  const bottomPadding = 56 + Math.max(insets.bottom, 12);
  const codeRedTotal = requests.filter(r => r.urgency === 'Code Red').length;

  const urgencyColor = (u: string) => {
    if (u === 'Code Red') return { bg: '#FEF2F2', text: '#DC2626', dot: '#DC2626', border: '#FECACA' };
    if (u === 'Urgent') return { bg: '#FFFBEB', text: '#D97706', dot: '#F59E0B', border: '#FDE68A' };
    return { bg: '#F0F9FF', text: '#0284C7', dot: '#0EA5E9', border: '#BAE6FD' };
  };

  const renderHeader = () => (
    <View style={styles.headerBlock}>
      {/* Live Campus Pulse Hero Card */}
      <View style={styles.pulseCard}>
        <View style={styles.pulseTop}>
          <View style={styles.pulseLeft}>
            <View style={styles.pulseLiveDot} />
            <Text style={styles.pulseHeading}>জাহাঙ্গীরনগর ব্লাড নেটওয়ার্ক</Text>
          </View>
          <View style={styles.pulseEtaBadge}>
            <Ionicons name="flash" size={11} color="#DC2626" />
            <Text style={styles.pulseEtaText}>গড় সাড়া: ৮ মি.</Text>
          </View>
        </View>

        <Text style={styles.pulseSub}>
          ক্যাম্পাস মেডিকেল সেন্টার ও সাভারের হাসপাতালে জরুরি রক্তের প্রয়োজনে জাবি পরিবার প্রস্তুত
        </Text>

        <View style={styles.pulseStatsRow}>
          <View style={styles.pulseStatItem}>
            <Text style={styles.pulseStatNum}>{codeRedTotal}</Text>
            <Text style={styles.pulseStatLabel}>কোড রেড</Text>
          </View>
          <View style={styles.pulseStatDivider} />
          <View style={styles.pulseStatItem}>
            <Text style={styles.pulseStatNum}>{requests.length}</Text>
            <Text style={styles.pulseStatLabel}>লাইভ অনুরোধ</Text>
          </View>
          <View style={styles.pulseStatDivider} />
          <View style={styles.pulseStatItem}>
            <Text style={[styles.pulseStatNum, { color: '#16A34A' }]}>১৫+</Text>
            <Text style={styles.pulseStatLabel}>অন-কল ডোনার</Text>
          </View>
        </View>
      </View>

      {/* Filter Pill Row */}
      <View style={styles.filterBar}>
        {([
          { id: 'all', label: 'সব অনুরোধ', icon: 'grid-outline' as const },
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
                  size={12}
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
    </View>
  );

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
          isCodeRed && styles.codeRedCard,
        ]}>
        {/* Urgency Accent Bar */}
        <View style={[styles.accentStrip, { backgroundColor: uc.dot }]} />

        {/* Card Body */}
        <View style={styles.cardInner}>
          {/* Top Row: Blood Type + Urgency Meta */}
          <View style={styles.topRow}>
            <View style={styles.bloodTypeWrap}>
              <View style={[styles.bloodBadge, { backgroundColor: uc.bg, borderColor: uc.border }]}>
                <MaterialCommunityIcons name="water" size={13} color={uc.text} />
                <Text style={[styles.bloodBadgeText, { color: uc.text }]}>
                  {item.bloodType}
                </Text>
              </View>
              <View style={[styles.urgencyTag, { backgroundColor: uc.bg }]}>
                <View style={[styles.urgencyDot, { backgroundColor: uc.dot }]} />
                <Text style={[styles.urgencyLabel, { color: uc.text }]}>
                  {item.urgency === 'Code Red' ? 'কোড রেড' : item.urgency}
                </Text>
              </View>
            </View>

            <View style={styles.topRightMeta}>
              <Text style={styles.unitsText}>
                {item.requiredUnits} ব্যাগ প্রয়োজন
              </Text>
              <Text style={styles.timeAgoText}>{item.timeAgo}</Text>
            </View>
          </View>

          {/* Patient Info */}
          <View style={styles.patientSection}>
            <Text style={styles.patientName} numberOfLines={1}>
              {item.patientName}
            </Text>
            <View style={styles.requesterMetaRow}>
              <JuBadge role={item.requesterRole} size="sm" />
              <Text style={styles.deptText} numberOfLines={1}>
                {item.requesterDepartment}
              </Text>
            </View>
          </View>

          {/* Hospital & Location */}
          <View style={styles.locationPillRow}>
            <Ionicons name="location-sharp" size={12} color="#DC2626" />
            <Text style={styles.hospitalText} numberOfLines={1}>
              {item.hospital}
            </Text>
            <View style={styles.distBadge}>
              <Text style={styles.distBadgeText}>{item.distance}</Text>
            </View>
          </View>

          {/* Responders & Action Buttons */}
          <View style={styles.cardFooter}>
            <View style={styles.respondersCol}>
              {item.respondersCount > 0 ? (
                <View style={styles.avatarRow}>
                  <View style={styles.avatarStack}>
                    {[0, 1, 2].slice(0, Math.min(item.respondersCount, 3)).map(i => (
                      <View
                        key={i}
                        style={[
                          styles.miniAvatar,
                          {
                            marginLeft: i > 0 ? -6 : 0,
                            backgroundColor: i === 0 ? '#DC2626' : i === 1 ? '#0284C7' : '#16A34A',
                          },
                        ]}>
                        <Ionicons name="person" size={8} color="#FFFFFF" />
                      </View>
                    ))}
                  </View>
                  <Text style={styles.respondersLabel}>
                    {item.respondersCount} জন সাড়া দিয়েছেন
                  </Text>
                </View>
              ) : (
                <View style={styles.waitingRow}>
                  <View style={styles.waitingDot} />
                  <Text style={styles.noRespondersText}>ডোনার খোঁজা হচ্ছে...</Text>
                </View>
              )}
            </View>

            {/* Compact Actions Row */}
            <View style={styles.actionGroup}>
              <TouchableOpacity
                style={[
                  styles.respondBtn,
                  isEnRoute && styles.respondBtnActive,
                ]}
                activeOpacity={0.85}
                onPress={() => handleQuickRespond(item)}>
                <Ionicons
                  name={isEnRoute ? 'checkmark-circle' : 'flash'}
                  size={12}
                  color={isEnRoute ? '#16A34A' : '#FFFFFF'}
                />
                <Text style={[styles.respondBtnText, isEnRoute && styles.respondBtnTextActive]}>
                  {isEnRoute ? 'রওনা হয়েছি' : 'এগিয়ে আসুন'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconActionBtn}
                activeOpacity={0.8}
                onPress={() => handleCall(item.contactNumber)}>
                <Ionicons name="call" size={13} color="#475569" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconActionBtn}
                activeOpacity={0.8}
                onPress={() => handleShare(item)}>
                <Ionicons name="share-social-outline" size={13} color="#475569" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      <CampusHeader />

      <FlatList
        data={filteredRequests}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={[styles.listContent, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#DC2626" />
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyCircle}>
              <MaterialCommunityIcons name="heart-pulse" size={32} color="#CBD5E1" />
            </View>
            <Text style={styles.emptyTitle}>কোনো রক্তের অনুরোধ নেই</Text>
            <Text style={styles.emptySub}>এই ফিল্টারে বর্তমানে কোনো সক্রিয় রক্তের অনুরোধ নেই।</Text>
          </View>
        }
      />

      {/* Floating Request Button */}
      <TouchableOpacity
        style={[styles.fab, { bottom: bottomPadding + 10 }]}
        activeOpacity={0.9}
        onPress={() => router.push('/request')}>
        <Ionicons name="add" size={20} color="#FFFFFF" />
        <Text style={styles.fabText}>অনুরোধ</Text>
      </TouchableOpacity>

      {/* Live Request Tracking Modal */}
      <RequestTrackingModal
        visible={!!selectedTrackingRequest}
        request={selectedTrackingRequest}
        onClose={() => setSelectedTrackingRequest(null)}
        onUpdateStatus={updateResponseStatus}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  listContent: {
    paddingHorizontal: 14,
    paddingTop: 10,
    gap: 10,
  },
  headerBlock: {
    gap: 10,
    marginBottom: 4,
  },
  pulseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  pulseTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pulseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseLiveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#DC2626',
  },
  pulseHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.1,
  },
  pulseEtaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pulseEtaText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
  },
  pulseSub: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    lineHeight: 15,
  },
  pulseStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F8FAFC',
    paddingVertical: 8,
    borderRadius: 8,
  },
  pulseStatItem: {
    alignItems: 'center',
    gap: 1,
  },
  pulseStatNum: {
    fontSize: 14,
    fontWeight: '900',
    color: '#DC2626',
  },
  pulseStatLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  pulseStatDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#E2E8F0',
  },
  filterBar: {
    flexDirection: 'row',
    gap: 6,
    overflow: 'hidden',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  codeRedCard: {
    borderColor: '#FECACA',
    backgroundColor: '#FFFFFF',
  },
  accentStrip: {
    width: 4,
  },
  cardInner: {
    flex: 1,
    padding: 11,
    gap: 7,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bloodTypeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bloodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.8,
  },
  bloodBadgeText: {
    fontSize: 12,
    fontWeight: '900',
  },
  urgencyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  urgencyDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  urgencyLabel: {
    fontSize: 9,
    fontWeight: '800',
  },
  topRightMeta: {
    alignItems: 'flex-end',
    gap: 1,
  },
  unitsText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
  },
  timeAgoText: {
    fontSize: 9,
    fontWeight: '500',
    color: '#94A3B8',
  },
  patientSection: {
    gap: 2,
  },
  patientName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  requesterMetaRow: {
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
  locationPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
  },
  hospitalText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  distBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  distBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 3,
    borderTopWidth: 0.5,
    borderTopColor: '#F1F5F9',
  },
  respondersCol: {
    flex: 1,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  respondersLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#15803D',
  },
  waitingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  waitingDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#94A3B8',
  },
  noRespondersText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#94A3B8',
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  respondBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DC2626',
    paddingHorizontal: 9,
    height: 28,
    borderRadius: 6,
  },
  respondBtnActive: {
    backgroundColor: '#DCFCE7',
    borderWidth: 0.8,
    borderColor: '#86EFAC',
  },
  respondBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  respondBtnTextActive: {
    color: '#15803D',
  },
  iconActionBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DC2626',
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 20,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  fabText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
  },
  emptySub: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
  },
});
