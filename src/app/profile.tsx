import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CampusHeader } from '@/components/campus-header';
import { BloodGroupBadge } from '@/components/blood-group-badge';
import { JuBadge } from '@/components/ju-badge';
import { useBlood } from '@/context/blood-context';
import { useTheme } from '@/hooks/use-theme';
import { JuRole } from '@/types/blood';

export default function ProfileScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { profile, updateProfile, setShowSplash } = useBlood();

  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [sosAlertsEnabled, setSosAlertsEnabled] = useState(true);
  const [readyToDonate, setReadyToDonate] = useState(true);

  const bottomPadding = 64 + Math.max(insets.bottom, 12);

  const handleRoleChange = (newRole: JuRole) => {
    updateProfile({ role: newRole });
    Alert.alert('পরিচয় আপডেট', `আপনার প্রোফাইল রোল পরিবর্তিত হয়েছে।`);
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <CampusHeader
        title="সেতু • ডোনার পাসপোর্ট"
        subtitle="জাহাঙ্গীরনগর বিশ্ববিদ্যালয় ডিজিটাল ডোনার পরিচয় ও রেকর্ড"
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}>
        {/* Digital Donor Passport Card */}
        <View style={[styles.passportCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          {/* Card Top */}
          <View style={styles.cardHeader}>
            <View style={styles.donorInfoCol}>
              <View style={styles.nameRow}>
                <Text style={[styles.donorName, { color: theme.text }]}>{profile.name}</Text>
                <Ionicons name="checkmark-circle" size={18} color={theme.secondary} />
              </View>
              <Text style={[styles.studentId, { color: theme.textSecondary }]}>
                আইডি: {profile.studentId} • জাবি ভেরিফাইড
              </Text>
            </View>

            {/* QR Pass Trigger */}
            <TouchableOpacity
              style={[styles.qrTriggerBtn, { backgroundColor: theme.primaryContainer, borderColor: theme.primaryLight }]}
              activeOpacity={0.8}
              onPress={() => setQrModalVisible(true)}>
              <Ionicons name="qr-code-outline" size={20} color={theme.primary} />
              <Text style={[styles.qrTriggerText, { color: theme.primary }]}>পাস</Text>
            </TouchableOpacity>
          </View>

          {/* JU Role Switcher */}
          <View style={styles.roleSwitcherRow}>
            <Text style={[styles.roleLabel, { color: theme.textSecondary }]}>ক্যাম্পাস পরিচয়:</Text>
            <View style={styles.roleChipsRow}>
              {(['student', 'teacher', 'staff'] as JuRole[]).map(r => {
                const isSelected = profile.role === r;
                return (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.roleSelectChip,
                      {
                        backgroundColor: isSelected ? theme.primaryContainer : theme.backgroundElement,
                        borderColor: isSelected ? theme.primary : theme.cardBorder,
                      },
                    ]}
                    onPress={() => handleRoleChange(r)}>
                    <Text
                      style={[
                        styles.roleSelectText,
                        { color: isSelected ? theme.primary : theme.textSecondary },
                      ]}>
                      {r === 'student' ? '🎓 শিক্ষার্থী' : r === 'teacher' ? '🏛️ শিক্ষক' : '🏢 কর্মকর্তা'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Details Row: Dept & Hall */}
          <View style={[styles.detailsBox, { backgroundColor: theme.backgroundElement }]}>
            <View style={styles.detailItem}>
              <Ionicons name="school-outline" size={13} color={theme.secondary} />
              <Text style={[styles.detailText, { color: theme.text }]} numberOfLines={1}>
                {profile.departmentOrOffice}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="home-outline" size={13} color={theme.textSecondary} />
              <Text style={[styles.detailText, { color: theme.textSecondary }]} numberOfLines={1}>
                {profile.hallOrResidence}
              </Text>
            </View>
          </View>

          {/* Blood Type & Donor ID Bar */}
          <View style={styles.bloodDetailRow}>
            <View style={[styles.bloodBox, { backgroundColor: theme.primaryContainer, borderColor: theme.primaryLight }]}>
              <Text style={[styles.bloodBoxLabel, { color: theme.primary }]}>সার্বজনীন রক্তদাতা</Text>
              <View style={styles.bloodValueRow}>
                <Text style={[styles.bloodValue, { color: theme.primary }]}>
                  {profile.bloodType} {profile.rhFactor}
                </Text>
                <MaterialCommunityIcons name="water" size={20} color={theme.primary} />
              </View>
              <Text style={[styles.bloodSub, { color: theme.textSecondary }]}>
                সকল গ্রুপ রোগীর জন্য উপযুক্ত
              </Text>
            </View>

            <View style={[styles.bloodBox, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}>
              <Text style={[styles.bloodBoxLabel, { color: theme.textSecondary }]}>ডিজিটাল ডোনার আইডি</Text>
              <Text style={[styles.donorIdText, { color: theme.secondaryDark }]}>
                {profile.donorId}
              </Text>
              <Text style={[styles.bloodSub, { color: theme.textSecondary }]}>
                মেডিকেল সেন্টারে কিয়স্ক সমর্থিত
              </Text>
            </View>
          </View>

          {/* Eligibility Banner */}
          <View
            style={[
              styles.eligibilityBanner,
              {
                backgroundColor: profile.status === 'Eligible' ? theme.successLight : theme.warningLight,
                borderColor: profile.status === 'Eligible' ? theme.success : theme.warning,
              },
            ]}>
            <Ionicons
              name="shield-checkmark"
              size={18}
              color={profile.status === 'Eligible' ? theme.success : theme.warning}
            />
            <View style={styles.eligibilityCol}>
              <Text
                style={[
                  styles.eligibilityTitle,
                  { color: profile.status === 'Eligible' ? theme.success : theme.warning },
                ]}>
                {profile.status === 'Eligible' ? 'বর্তমানে রক্তদানে প্রস্তুত' : 'বিশ্রাম কাল চলমান'}
              </Text>
              <Text style={[styles.eligibilitySub, { color: theme.textSecondary }]}>
                {profile.statusDetails}
              </Text>
            </View>
          </View>
        </View>

        {/* Lifetime Campus Impact */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: theme.text }]}>ক্যাম্পাস অবদান ও পরিসংখ্যান</Text>
          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Text style={[styles.metricValue, { color: theme.primary }]}>{profile.totalDonations}</Text>
              <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>মোট রক্তদান</Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Text style={[styles.metricValue, { color: theme.secondaryDark }]}>{profile.livesSaved}</Text>
              <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>জীবন বাঁচিয়েছেন</Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Text style={[styles.metricValue, { color: theme.success }]}>#{profile.campusRank}</Text>
              <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>জাবি র্যাংক</Text>
            </View>
          </View>
        </View>

        {/* Donation History Records */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: theme.text }]}>পূর্ববর্তী রক্তদানের ইতিহাস</Text>
          <View style={styles.historyList}>
            {profile.records.map(rec => (
              <View
                key={rec.id}
                style={[styles.recordCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <View style={[styles.recordIconBox, { backgroundColor: theme.primaryContainer }]}>
                  <MaterialCommunityIcons name="water-check" size={20} color={theme.primary} />
                </View>
                <View style={styles.recordInfo}>
                  <Text style={[styles.recordHospital, { color: theme.text }]}>{rec.hospital}</Text>
                  <Text style={[styles.recordDetail, { color: theme.textSecondary }]}>
                    {rec.date} • {rec.component} ({rec.units} ব্যাগ)
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Preferences & Settings */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.sectionHeading, { color: theme.text }]}>নোটিফিকেশন ও প্রেফারেন্স</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: theme.text }]}>কোড রেড জরুরি এলার্ট</Text>
              <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                জাবি মেডিকেল সেন্টার ও সাভারের রক্তের জরুরি নোটিফিকেশন পান
              </Text>
            </View>
            <Switch
              value={sosAlertsEnabled}
              onValueChange={setSosAlertsEnabled}
              trackColor={{ false: theme.cardBorder, true: theme.primary }}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: theme.text }]}>রক্তদানে প্রস্তুত স্ট্যাটাস</Text>
              <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                ক্যাম্পাস ডিরেক্টরিতে আপনাকে রক্তদানে আগ্রহী হিসেবে দেখাবে
              </Text>
            </View>
            <Switch
              value={readyToDonate}
              onValueChange={setReadyToDonate}
              trackColor={{ false: theme.cardBorder, true: theme.success }}
            />
          </View>

          <View style={styles.divider} />

          {/* Re-open Onboarding 3-Slider */}
          <TouchableOpacity
            style={styles.onboardingLinkRow}
            activeOpacity={0.7}
            onPress={() => setShowSplash(true)}>
            <View style={styles.onboardingLinkLeft}>
              <Ionicons name="sparkles-outline" size={18} color={theme.primary} />
              <Text style={[styles.onboardingLinkText, { color: theme.primary }]}>
                অ্যাপ পরিচিতি স্লাইডার দেখুন (সেতু গাইড)
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* QR Pass Modal */}
      <Modal visible={qrModalVisible} transparent animationType="fade" onRequestClose={() => setQrModalVisible(false)}>
        <View style={styles.qrModalBackdrop}>
          <View style={[styles.qrModalCard, { backgroundColor: theme.card }]}>
            <View style={styles.qrModalHeader}>
              <Text style={[styles.qrModalTitle, { color: theme.text }]}>ডিজিটাল ডোনার পাস</Text>
              <TouchableOpacity onPress={() => setQrModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.qrCodeContainer}>
              <Ionicons name="qr-code" size={160} color={theme.text} />
              <Text style={[styles.qrIdText, { color: theme.primary }]}>{profile.donorId}</Text>
              <Text style={[styles.qrDonorName, { color: theme.text }]}>{profile.name}</Text>
              <Text style={[styles.qrSub, { color: theme.textSecondary }]}>
                রক্তের গ্রুপ: {profile.bloodType} {profile.rhFactor} • {profile.departmentOrOffice}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.qrCloseBtn, { backgroundColor: theme.primary }]}
              onPress={() => setQrModalVisible(false)}>
              <Text style={styles.qrCloseBtnText}>বন্ধ করুন</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  passportCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  donorInfoCol: {
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  donorName: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  studentId: {
    fontSize: 11,
    fontWeight: '600',
  },
  qrTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  qrTriggerText: {
    fontSize: 11,
    fontWeight: '800',
  },
  roleSwitcherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  roleLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  roleChipsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  roleSelectChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  roleSelectText: {
    fontSize: 10,
    fontWeight: '800',
  },
  detailsBox: {
    padding: 10,
    borderRadius: 10,
    gap: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bloodDetailRow: {
    flexDirection: 'row',
    gap: 10,
  },
  bloodBox: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 2,
  },
  bloodBoxLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  bloodValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bloodValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  donorIdText: {
    fontSize: 13,
    fontWeight: '900',
  },
  bloodSub: {
    fontSize: 9,
    fontWeight: '500',
  },
  eligibilityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  eligibilityCol: {
    flex: 1,
  },
  eligibilityTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  eligibilitySub: {
    fontSize: 10,
    fontWeight: '600',
  },
  section: {
    gap: 10,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  historyList: {
    gap: 8,
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  recordIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordInfo: {
    flex: 1,
    gap: 2,
  },
  recordHospital: {
    fontSize: 13,
    fontWeight: '800',
  },
  recordDetail: {
    fontSize: 11,
    fontWeight: '500',
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    paddingRight: 10,
    gap: 2,
  },
  settingTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  settingSub: {
    fontSize: 11,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  onboardingLinkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  onboardingLinkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  onboardingLinkText: {
    fontSize: 13,
    fontWeight: '700',
  },
  qrModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  qrModalCard: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    gap: 16,
  },
  qrModalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qrModalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  qrCodeContainer: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  qrIdText: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 6,
  },
  qrDonorName: {
    fontSize: 15,
    fontWeight: '800',
  },
  qrSub: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  qrCloseBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  qrCloseBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
