import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CampusHeader } from '@/components/campus-header';
import { DonorCard } from '@/components/donor-card';
import { useBlood } from '@/context/blood-context';
import { BloodDrive, BloodGroup, JuRole } from '@/types/blood';

const BLOOD_GROUPS: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export default function DirectoryAndDrivesScreen() {
  const insets = useSafeAreaInsets();
  const { donors, drives, toggleBookDrive } = useBlood();

  const [activeTab, setActiveTab] = useState<'donors' | 'drives'>('donors');
  const [selectedRole, setSelectedRole] = useState<'all' | JuRole>('all');
  const [selectedBlood, setSelectedBlood] = useState<'all' | BloodGroup>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const bottomPadding = 56 + Math.max(insets.bottom, 12);

  const isFiltered =
    selectedRole !== 'all' ||
    selectedBlood !== 'all' ||
    searchQuery.trim().length > 0;

  const resetDonorFilters = () => {
    setSelectedRole('all');
    setSelectedBlood('all');
    setSearchQuery('');
  };

  const filteredDonors = donors.filter(d => {
    if (selectedRole !== 'all' && d.role !== selectedRole) return false;
    if (selectedBlood !== 'all' && d.bloodType !== selectedBlood) return false;
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const match =
        d.name.toLowerCase().includes(q) ||
        d.departmentOrOffice.toLowerCase().includes(q) ||
        d.hallOrResidence.toLowerCase().includes(q) ||
        d.bloodType.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleBooking = (drive: BloodDrive) => {
    toggleBookDrive(drive.id);
    if (Platform.OS !== 'web') {
      Alert.alert(
        drive.isBooked ? 'বুকিং বাতিল করা হয়েছে' : '🎉 রক্তদানের স্লট বুকিং নিশ্চিত!',
        drive.isBooked
          ? `${drive.title}-এর বুকিং স্লট বাতিল করা হয়েছে।`
          : `${drive.venue}-এ ${drive.date} (${drive.time})-এর জন্য স্লট সংরক্ষিত হয়েছে।`,
        [{ text: 'ঠিক আছে' }]
      );
    }
  };

  const renderDriveItem = ({ item }: { item: BloodDrive }) => {
    const bookedPercent = Math.round(
      ((item.totalSlots - item.slotsRemaining) / item.totalSlots) * 100
    );

    return (
      <View
        style={[
          styles.driveCard,
          item.isBooked && styles.driveCardBooked,
        ]}>
        <View style={styles.driveHeader}>
          <View style={styles.driveHeaderLeft}>
            <View style={styles.datePill}>
              <Ionicons name="calendar-outline" size={11} color="#DC2626" />
              <Text style={styles.dateText}>{item.date}</Text>
            </View>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>

          {item.isBooked && (
            <View style={styles.bookedBadge}>
              <Ionicons name="checkmark-circle" size={11} color="#16A34A" />
              <Text style={styles.bookedText}>বুকড</Text>
            </View>
          )}
        </View>

        <Text style={styles.driveTitle}>{item.title}</Text>

        <View style={styles.venueBox}>
          <View style={styles.venueRow}>
            <Ionicons name="location-outline" size={12} color="#DC2626" />
            <Text style={styles.venueText}>{item.venue}</Text>
          </View>
          <View style={styles.venueRow}>
            <Ionicons name="people-outline" size={12} color="#64748B" />
            <Text style={styles.coordText}>আয়োজনে: {item.coordinator}</Text>
          </View>
        </View>

        {/* Capacity Bar */}
        <View style={styles.capacitySection}>
          <View style={styles.capacityLabels}>
            <Text style={styles.capacityTitle}>স্লট সক্ষমতা</Text>
            <Text style={styles.capacityValue}>
              {item.slotsRemaining} টি বাকি ({bookedPercent}% বুকড)
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${bookedPercent}%`,
                  backgroundColor: bookedPercent > 80 ? '#DC2626' : '#0284C7',
                },
              ]}
            />
          </View>
        </View>

        {/* Booking Button */}
        <TouchableOpacity
          style={[
            styles.bookBtn,
            item.isBooked ? styles.bookBtnCancel : styles.bookBtnActive,
          ]}
          activeOpacity={0.88}
          onPress={() => handleBooking(item)}>
          <Ionicons
            name={item.isBooked ? 'close-circle-outline' : 'calendar-outline'}
            size={14}
            color={item.isBooked ? '#64748B' : '#FFFFFF'}
          />
          <Text
            style={[
              styles.bookBtnText,
              { color: item.isBooked ? '#64748B' : '#FFFFFF' },
            ]}>
            {item.isBooked ? 'স্লট বাতিল করুন' : 'রক্তদানের স্লট বুক করুন'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <CampusHeader
        title="সেতু • ডোনার ও ক্যাম্প"
        subtitle="জাহাঙ্গীরনগর বিশ্ববিদ্যালয় রক্তদাতা তালিকা ও ইভেন্ট"
      />

      {/* Segment Switcher */}
      <View style={styles.segmentContainer}>
        <View style={styles.segmentTrack}>
          <TouchableOpacity
            style={[
              styles.segmentBtn,
              activeTab === 'donors' && styles.segmentBtnActive,
            ]}
            activeOpacity={0.8}
            onPress={() => setActiveTab('donors')}>
            <Ionicons
              name="people"
              size={13}
              color={activeTab === 'donors' ? '#DC2626' : '#64748B'}
            />
            <Text
              style={[
                styles.segmentText,
                { color: activeTab === 'donors' ? '#DC2626' : '#64748B' },
              ]}>
              রক্তদাতা তালিকা ({donors.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentBtn,
              activeTab === 'drives' && styles.segmentBtnActive,
            ]}
            activeOpacity={0.8}
            onPress={() => setActiveTab('drives')}>
            <Ionicons
              name="calendar"
              size={13}
              color={activeTab === 'drives' ? '#DC2626' : '#64748B'}
            />
            <Text
              style={[
                styles.segmentText,
                { color: activeTab === 'drives' ? '#DC2626' : '#64748B' },
              ]}>
              ক্যাম্পাস ক্যাম্প ({drives.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'donors' ? (
        <View style={styles.donorsSection}>
          {/* Search bar & Filters */}
          <View style={styles.searchFilterBar}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={14} color="#94A3B8" />
              <TextInput
                style={styles.searchInput}
                placeholder="নাম, বিভাগ, হল বা গ্রুপ দিয়ে খুঁজুন..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={15} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>

            {/* Role Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRowScroll}>
              {(
                [
                  { id: 'all', label: 'সকল' },
                  { id: 'student', label: '🎓 শিক্ষার্থী' },
                  { id: 'teacher', label: '🏛️ শিক্ষক' },
                  { id: 'staff', label: '🏢 কর্মকর্তা' },
                ] as const
              ).map(r => {
                const isSel = selectedRole === r.id;
                return (
                  <TouchableOpacity
                    key={r.id}
                    style={[
                      styles.filterChip,
                      isSel && styles.filterChipActive,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => setSelectedRole(r.id)}>
                    <Text
                      style={[
                        styles.filterChipText,
                        isSel && styles.filterChipTextActive,
                      ]}>
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Blood Group Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRowScroll}>
              <TouchableOpacity
                style={[
                  styles.bloodChip,
                  selectedBlood === 'all' && styles.bloodChipActive,
                ]}
                activeOpacity={0.7}
                onPress={() => setSelectedBlood('all')}>
                <Text
                  style={[
                    styles.bloodChipText,
                    selectedBlood === 'all' && styles.bloodChipTextActive,
                  ]}>
                  সকল গ্রুপ
                </Text>
              </TouchableOpacity>

              {BLOOD_GROUPS.map(bg => {
                const isSel = selectedBlood === bg;
                return (
                  <TouchableOpacity
                    key={bg}
                    style={[
                      styles.bloodChip,
                      isSel && styles.bloodChipActive,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => setSelectedBlood(isSel ? 'all' : bg)}>
                    <Text
                      style={[
                        styles.bloodChipText,
                        isSel && styles.bloodChipTextActive,
                      ]}>
                      {bg}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Donors List */}
          <FlatList
            data={filteredDonors}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <DonorCard donor={item} />}
            contentContainerStyle={[styles.listContent, { paddingBottom: bottomPadding }]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <MaterialCommunityIcons
                    name="account-search-outline"
                    size={32}
                    color="#CBD5E1"
                  />
                </View>
                <Text style={styles.emptyTitle}>কোনো রক্তদাতা মেলেনি</Text>
                <Text style={styles.emptySub}>
                  {isFiltered
                    ? 'আপনার বর্তমান অনুসন্ধান বা ফিল্টারে কোনো রক্তদাতা পাওয়া যায়নি।'
                    : 'অন্য কোনো রক্তের গ্রুপ বা বিভাগ দিয়ে সার্চ করে দেখুন।'}
                </Text>
                {isFiltered && (
                  <TouchableOpacity
                    style={styles.emptyResetBtn}
                    onPress={resetDonorFilters}
                    activeOpacity={0.8}>
                    <Ionicons name="refresh" size={13} color="#FFFFFF" />
                    <Text style={styles.emptyResetBtnText}>সকল রক্তদাতা দেখুন</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />
        </View>
      ) : (
        <FlatList
          data={drives}
          keyExtractor={item => item.id}
          renderItem={renderDriveItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: bottomPadding }]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  segmentContainer: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E8F0',
  },
  segmentTrack: {
    flexDirection: 'row',
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    padding: 2,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 6,
    borderRadius: 7,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 11,
    fontWeight: '800',
  },
  donorsSection: {
    flex: 1,
  },
  searchFilterBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E8F0',
    gap: 7,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  searchInput: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: '#0F172A',
  },
  filterRowScroll: {
    gap: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 9,
    height: 25,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 0.8,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  bloodChip: {
    paddingHorizontal: 8,
    height: 24,
    borderRadius: 5,
    backgroundColor: '#F1F5F9',
    borderWidth: 0.8,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bloodChipActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  bloodChipText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  bloodChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 14,
    gap: 10,
  },
  driveCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  driveCardBooked: {
    borderColor: '#86EFAC',
  },
  driveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driveHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  dateText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
  },
  timeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  bookedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  bookedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#16A34A',
  },
  driveTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  venueBox: {
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
    gap: 3,
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  venueText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  coordText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
  },
  capacitySection: {
    gap: 4,
  },
  capacityLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  capacityTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  capacityValue: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
  },
  progressTrack: {
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2.5,
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    height: 32,
    borderRadius: 7,
  },
  bookBtnActive: {
    backgroundColor: '#DC2626',
  },
  bookBtnCancel: {
    backgroundColor: '#F1F5F9',
    borderWidth: 0.8,
    borderColor: '#E2E8F0',
  },
  bookBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
  },
  emptySub: {
    fontSize: 11,
    textAlign: 'center',
    color: '#94A3B8',
    lineHeight: 16,
  },
  emptyIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DC2626',
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 17,
    marginTop: 6,
  },
  emptyResetBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
