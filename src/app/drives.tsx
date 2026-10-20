import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
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
import { useTheme } from '@/hooks/use-theme';
import { BloodDrive, BloodGroup, JuRole } from '@/types/blood';

const BLOOD_GROUPS: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export default function DirectoryAndDrivesScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { donors, drives, toggleBookDrive } = useBlood();

  const [activeTab, setActiveTab] = useState<'donors' | 'drives'>('donors');
  const [selectedRole, setSelectedRole] = useState<'all' | JuRole>('all');
  const [selectedBlood, setSelectedBlood] = useState<'all' | BloodGroup>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const bottomPadding = 64 + Math.max(insets.bottom, 12);

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
          {
            backgroundColor: theme.card,
            borderColor: item.isBooked ? theme.success : theme.cardBorder,
          },
        ]}>
        <View style={styles.driveHeader}>
          <View style={styles.driveHeaderLeft}>
            <View style={[styles.datePill, { backgroundColor: theme.primaryContainer }]}>
              <Ionicons name="calendar" size={12} color={theme.primary} />
              <Text style={[styles.dateText, { color: theme.primary }]}>{item.date}</Text>
            </View>
            <Text style={[styles.timeText, { color: theme.textSecondary }]}>{item.time}</Text>
          </View>

          {item.isBooked && (
            <View style={[styles.bookedBadge, { backgroundColor: theme.successLight }]}>
              <Ionicons name="checkmark-done" size={12} color={theme.success} />
              <Text style={[styles.bookedText, { color: theme.success }]}>বুকড</Text>
            </View>
          )}
        </View>

        <Text style={[styles.driveTitle, { color: theme.text }]}>{item.title}</Text>

        <View style={[styles.venueBox, { backgroundColor: theme.backgroundElement }]}>
          <View style={styles.venueRow}>
            <Ionicons name="location" size={14} color={theme.secondary} />
            <Text style={[styles.venueText, { color: theme.text }]}>{item.venue}</Text>
          </View>
          <View style={styles.venueRow}>
            <Ionicons name="people-outline" size={14} color={theme.textSecondary} />
            <Text style={[styles.coordText, { color: theme.textSecondary }]}>
              আয়োজনে: {item.coordinator}
            </Text>
          </View>
        </View>

        {/* Capacity Bar */}
        <View style={styles.capacitySection}>
          <View style={styles.capacityLabels}>
            <Text style={[styles.capacityTitle, { color: theme.textSecondary }]}>
              স্লট ধারণক্ষমতা
            </Text>
            <Text style={[styles.capacityValue, { color: theme.primary }]}>
              {item.slotsRemaining} টি বাকি ({bookedPercent}% বুকড)
            </Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: theme.backgroundElement }]}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${bookedPercent}%`,
                  backgroundColor: bookedPercent > 80 ? theme.primary : theme.secondary,
                },
              ]}
            />
          </View>
        </View>

        {/* Booking Button */}
        <TouchableOpacity
          style={[
            styles.bookBtn,
            {
              backgroundColor: item.isBooked ? theme.backgroundElement : theme.primary,
              borderColor: item.isBooked ? theme.cardBorder : theme.primary,
            },
          ]}
          activeOpacity={0.88}
          onPress={() => handleBooking(item)}>
          <Ionicons
            name={item.isBooked ? 'close-circle-outline' : 'calendar-outline'}
            size={16}
            color={item.isBooked ? theme.textSecondary : '#FFFFFF'}
          />
          <Text
            style={[
              styles.bookBtnText,
              { color: item.isBooked ? theme.textSecondary : '#FFFFFF' },
            ]}>
            {item.isBooked ? 'স্লট বাতিল করুন' : 'রক্তদানের স্লট বুক করুন'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <CampusHeader
        title="সেতু • ডোনার ও ক্যাম্প"
        subtitle="জাহাঙ্গীরনগর বিশ্ববিদ্যালয় রক্তদাতা ডিরেক্টরি ও ইভেন্ট"
      />

      {/* Segment Switcher */}
      <View style={[styles.segmentContainer, { backgroundColor: theme.card, borderBottomColor: theme.cardBorder }]}>
        <View style={[styles.segmentTrack, { backgroundColor: theme.backgroundElement }]}>
          <TouchableOpacity
            style={[
              styles.segmentBtn,
              activeTab === 'donors' && {
                backgroundColor: theme.card,
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              },
            ]}
            onPress={() => setActiveTab('donors')}>
            <Ionicons
              name="people"
              size={15}
              color={activeTab === 'donors' ? theme.primary : theme.textSecondary}
            />
            <Text
              style={[
                styles.segmentText,
                { color: activeTab === 'donors' ? theme.primary : theme.textSecondary },
              ]}>
              রক্তদাতা তালিকা ({donors.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentBtn,
              activeTab === 'drives' && {
                backgroundColor: theme.card,
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              },
            ]}
            onPress={() => setActiveTab('drives')}>
            <Ionicons
              name="calendar"
              size={15}
              color={activeTab === 'drives' ? theme.primary : theme.textSecondary}
            />
            <Text
              style={[
                styles.segmentText,
                { color: activeTab === 'drives' ? theme.primary : theme.textSecondary },
              ]}>
              ক্যাম্পাস ক্যাম্প ({drives.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'donors' ? (
        <View style={styles.donorsSection}>
          {/* Search bar & Filters */}
          <View style={[styles.searchFilterBar, { backgroundColor: theme.card, borderBottomColor: theme.cardBorder }]}>
            <View style={[styles.searchBox, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}>
              <Ionicons name="search" size={16} color={theme.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="নাম, বিভাগ, হল বা ব্লাড গ্রুপ দিয়ে খুঁজুন..."
                placeholderTextColor={theme.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={16} color={theme.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Role Filter Chips */}
            <View style={styles.roleChipsScroll}>
              {(
                [
                  { id: 'all', label: 'সকল' },
                  { id: 'student', label: '🎓 শিক্ষার্থী' },
                  { id: 'teacher', label: '🏛️ শিক্ষক' },
                  { id: 'staff', label: '🏢 কর্মকর্তা/কর্মচারী' },
                ] as const
              ).map(r => {
                const isSel = selectedRole === r.id;
                return (
                  <TouchableOpacity
                    key={r.id}
                    style={[
                      styles.roleFilterChip,
                      {
                        backgroundColor: isSel ? theme.primary : theme.backgroundElement,
                        borderColor: isSel ? theme.primary : theme.cardBorder,
                      },
                    ]}
                    onPress={() => setSelectedRole(r.id)}>
                    <Text
                      style={[
                        styles.roleFilterText,
                        { color: isSel ? '#FFFFFF' : theme.textSecondary },
                      ]}>
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Blood Group Chips */}
            <View style={styles.bloodChipsRow}>
              <TouchableOpacity
                style={[
                  styles.bloodGroupChip,
                  {
                    backgroundColor: selectedBlood === 'all' ? theme.primaryContainer : theme.backgroundElement,
                    borderColor: selectedBlood === 'all' ? theme.primary : theme.cardBorder,
                  },
                ]}
                onPress={() => setSelectedBlood('all')}>
                <Text
                  style={[
                    styles.bloodChipText,
                    { color: selectedBlood === 'all' ? theme.primary : theme.textSecondary },
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
                      styles.bloodGroupChip,
                      {
                        backgroundColor: isSel ? theme.primary : theme.backgroundElement,
                        borderColor: isSel ? theme.primary : theme.cardBorder,
                      },
                    ]}
                    onPress={() => setSelectedBlood(isSel ? 'all' : bg)}>
                    <Text
                      style={[
                        styles.bloodChipText,
                        { color: isSel ? '#FFFFFF' : theme.textSecondary },
                      ]}>
                      {bg}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Donors List */}
          <FlatList
            data={filteredDonors}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <DonorCard donor={item} />}
            contentContainerStyle={[styles.listContent, { paddingBottom: bottomPadding }]}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="account-search-outline" size={54} color={theme.cardBorder} />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>কোনো রক্তদাতা মেলেনি</Text>
                <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
                  অন্য কোনো রক্তের গ্রুপ বা বিভাগ দিয়ে সার্চ করে দেখুন।
                </Text>
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
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  segmentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  segmentTrack: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '800',
  },
  donorsSection: {
    flex: 1,
  },
  searchFilterBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  roleChipsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  roleFilterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  roleFilterText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bloodChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  bloodGroupChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  bloodChipText: {
    fontSize: 11,
    fontWeight: '800',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  driveCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  driveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driveHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '800',
  },
  timeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  bookedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  bookedText: {
    fontSize: 11,
    fontWeight: '800',
  },
  driveTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  venueBox: {
    padding: 10,
    borderRadius: 10,
    gap: 4,
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  venueText: {
    fontSize: 12,
    fontWeight: '700',
  },
  coordText: {
    fontSize: 11,
    fontWeight: '500',
  },
  capacitySection: {
    gap: 6,
  },
  capacityLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  capacityTitle: {
    fontSize: 11,
    fontWeight: '600',
  },
  capacityValue: {
    fontSize: 11,
    fontWeight: '800',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
  },
  bookBtnText: {
    fontSize: 13,
    fontWeight: '800',
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
});
