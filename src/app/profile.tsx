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
import { useBlood } from '@/context/blood-context';
import { JuRole } from '@/types/blood';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { profile, updateProfile, setShowSplash } = useBlood();

  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [sosAlertsEnabled, setSosAlertsEnabled] = useState(true);
  const [readyToDonate, setReadyToDonate] = useState(true);

  const bottomPadding = 56 + Math.max(insets.bottom, 12);

  const handleRoleChange = (newRole: JuRole) => {
    updateProfile({ role: newRole });
    Alert.alert('পরিচয় আপডেট', `আপনার প্রোফাইল রোল পরিবর্তিত হয়েছে।`);
  };

  return (
    <View style={styles.screen}>
      <CampusHeader
        title="ডোনার পাসপোর্ট"
        subtitle="জাহাঙ্গীরনগর বিশ্ববিদ্যালয় ডিজিটাল ডোনার রেকর্ড"
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}>
        {/* Digital Donor Passport Card */}
        <View style={styles.passportCard}>
          {/* Card Top */}
          <View style={styles.cardHeader}>
            <View style={styles.donorInfoCol}>
              <View style={styles.nameRow}>
                <Text style={styles.donorName}>{profile.name}</Text>
                <Ionicons name="checkmark-circle" size={16} color="#0284C7" />
              </View>
              <Text style={styles.studentId}>
                আইডি: {profile.studentId} • জাবি ভেরিফাইড
              </Text>
            </View>

            {/* QR Pass Trigger Button */}
            <TouchableOpacity
              style={styles.qrTriggerBtn}
              activeOpacity={0.8}
              onPress={() => setQrModalVisible(true)}>
              <Ionicons name="qr-code-outline" size={15} color="#DC2626" />
              <Text style={styles.qrTriggerText}>কিউআর পাস</Text>
            </TouchableOpacity>
          </View>

          {/* JU Role Switcher */}
          <View style={styles.roleSwitcherRow}>
            <Text style={styles.roleLabel}>ক্যাম্পাস পরিচয়:</Text>
            <View style={styles.roleChipsRow}>
              {(['student', 'teacher', 'staff'] as JuRole[]).map(r => {
                const isSelected = profile.role === r;
                return (
                  <TouchableOpacity
                    key={r}
                    style={[styles.roleSelectChip, isSelected && styles.roleSelectChipActive]}
                    activeOpacity={0.7}
                    onPress={() => handleRoleChange(r)}>
                    <Text
                      style={[
                        styles.roleSelectText,
                        isSelected && styles.roleSelectTextActive,
                      ]}>
                      {r === 'student' ? '🎓 শিক্ষার্থী' : r === 'teacher' ? '🏛️ শিক্ষক' : '🏢 কর্মকর্তা'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Department & Hall Info Strip */}
          <View style={styles.detailsBox}>
            <View style={styles.detailItem}>
              <Ionicons name="school-outline" size={12} color="#0284C7" />
              <Text style={styles.detailText} numberOfLines={1}>
                {profile.departmentOrOffice}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={12} color="#64748B" />
              <Text style={styles.detailText} numberOfLines={1}>
                {profile.hallOrResidence}
              </Text>
            </View>
          </View>

          {/* Blood Type & Donor ID Bar */}
          <View style={styles.bloodDetailRow}>
            <View style={styles.bloodBox}>
              <Text style={styles.bloodBoxLabel}>রক্তের গ্রুপ</Text>
              <View style={styles.bloodValueRow}>
                <Text style={styles.bloodValue}>
                  {profile.bloodType} {profile.rhFactor}
                </Text>
                <MaterialCommunityIcons name="water" size={16} color="#DC2626" />
              </View>
              <Text style={styles.bloodSub}>সার্বজনীন রক্তদাতা</Text>
            </View>

            <View style={styles.donorIdBox}>
              <Text style={styles.bloodBoxLabel}>ডোনার সিরিয়াল</Text>
              <Text style={styles.donorIdText}>{profile.donorId}</Text>
              <Text style={styles.bloodSub}>মেডিকেল সেন্টার রেকর্ড</Text>
            </View>
          </View>

          {/* Eligibility Banner */}
          <View
            style={[
              styles.eligibilityBanner,
              profile.status === 'Eligible' ? styles.eligibilityActive : styles.eligibilityResting,
            ]}>
            <Ionicons
              name={profile.status === 'Eligible' ? 'shield-checkmark' : 'time-outline'}
              size={15}
              color={profile.status === 'Eligible' ? '#16A34A' : '#D97706'}
            />
            <View style={styles.eligibilityCol}>
              <Text
                style={[
                  styles.eligibilityTitle,
                  { color: profile.status === 'Eligible' ? '#15803D' : '#B45309' },
                ]}>
                {profile.status === 'Eligible' ? 'বর্তমানে রক্তদানে প্রস্তুত' : 'বিশ্রাম কাল চলমান'}
              </Text>
              <Text style={styles.eligibilitySub}>{profile.statusDetails}</Text>
            </View>
          </View>
        </View>

        {/* Lifetime Campus Impact */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>ক্যাম্পাস অবদান ও পরিসংখ্যান</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: '#DC2626' }]}>
                {profile.totalDonations}
              </Text>
              <Text style={styles.metricLabel}>মোট রক্তদান</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: '#0284C7' }]}>
                {profile.livesSaved}
              </Text>
              <Text style={styles.metricLabel}>জীবন রক্ষা</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: '#16A34A' }]}>
                #{profile.campusRank}
              </Text>
              <Text style={styles.metricLabel}>জাবি র‍্যাংক</Text>
            </View>
          </View>
        </View>

        {/* Donation History Records */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>পূর্ববর্তী রক্তদানের ইতিহাস</Text>
          <View style={styles.historyList}>
            {profile.records.map(rec => (
              <View key={rec.id} style={styles.recordCard}>
                <View style={styles.recordIconBox}>
                  <MaterialCommunityIcons name="water-check" size={17} color="#DC2626" />
                </View>
                <View style={styles.recordInfo}>
                  <Text style={styles.recordHospital}>{rec.hospital}</Text>
                  <Text style={styles.recordDetail}>
                    {rec.date} • {rec.component} ({rec.units} ব্যাগ)
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Preferences & Settings */}
        <View style={styles.settingsCard}>
          <Text style={styles.sectionHeading}>নোটিফিকেশন ও প্রেফারেন্স</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>কোড রেড জরুরি এলার্ট</Text>
              <Text style={styles.settingSub}>
                জাবি মেডিকেল সেন্টার ও সাভারের রক্তের জরুরি নোটিফিকেশন পান
              </Text>
            </View>
            <Switch
              value={sosAlertsEnabled}
              onValueChange={setSosAlertsEnabled}
              trackColor={{ false: '#E2E8F0', true: '#DC2626' }}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>রক্তদানে প্রস্তুত স্ট্যাটাস</Text>
              <Text style={styles.settingSub}>
                ক্যাম্পাস ডিরেক্টরিতে আপনাকে রক্তদানে আগ্রহী হিসেবে দেখাবে
              </Text>
            </View>
            <Switch
              value={readyToDonate}
              onValueChange={setReadyToDonate}
              trackColor={{ false: '#E2E8F0', true: '#16A34A' }}
            />
          </View>

          <View style={styles.divider} />

          {/* Re-open Onboarding 3-Slider */}
          <TouchableOpacity
            style={styles.onboardingLinkRow}
            activeOpacity={0.7}
            onPress={() => setShowSplash(true)}>
            <View style={styles.onboardingLinkLeft}>
              <Ionicons name="sparkles-outline" size={16} color="#DC2626" />
              <Text style={styles.onboardingLinkText}>
                অ্যাপ পরিচিতি স্লাইডার দেখুন (সেতু গাইড)
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* QR Pass Modal */}
      <Modal
        visible={qrModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setQrModalVisible(false)}>
        <View style={styles.qrModalBackdrop}>
          <View style={styles.qrModalCard}>
            <View style={styles.qrModalHeader}>
              <Text style={styles.qrModalTitle}>ডিজিটাল ডোনার পাস</Text>
              <TouchableOpacity onPress={() => setQrModalVisible(false)}>
                <Ionicons name="close-circle" size={22} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <View style={styles.qrCodeContainer}>
              <Ionicons name="qr-code" size={140} color="#0F172A" />
              <Text style={styles.qrIdText}>{profile.donorId}</Text>
              <Text style={styles.qrDonorName}>{profile.name}</Text>
              <Text style={styles.qrSub}>
                রক্তের গ্রুপ: {profile.bloodType} {profile.rhFactor} • {profile.departmentOrOffice}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.qrCloseBtn}
              activeOpacity={0.88}
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
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 14,
    gap: 12,
  },
  passportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  donorInfoCol: {
    gap: 2,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  donorName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  studentId: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  qrTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#FEF2F2',
    borderWidth: 0.8,
    borderColor: '#FECACA',
  },
  qrTriggerText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
  },
  roleSwitcherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  roleLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  roleChipsRow: {
    flexDirection: 'row',
    gap: 5,
    flexWrap: 'wrap',
  },
  roleSelectChip: {
    paddingHorizontal: 7,
    height: 24,
    borderRadius: 5,
    backgroundColor: '#F1F5F9',
    borderWidth: 0.8,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleSelectChipActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#DC2626',
  },
  roleSelectText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
  },
  roleSelectTextActive: {
    color: '#DC2626',
  },
  detailsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  detailText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  bloodDetailRow: {
    flexDirection: 'row',
    gap: 8,
  },
  bloodBox: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 0.8,
    borderColor: '#FECACA',
    gap: 1,
  },
  donorIdBox: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 0.8,
    borderColor: '#E2E8F0',
    gap: 1,
  },
  bloodBoxLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
  },
  bloodValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bloodValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#DC2626',
  },
  donorIdText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0284C7',
  },
  bloodSub: {
    fontSize: 9,
    fontWeight: '500',
    color: '#94A3B8',
  },
  eligibilityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 9,
    borderRadius: 8,
    borderWidth: 0.8,
  },
  eligibilityActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  eligibilityResting: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  eligibilityCol: {
    flex: 1,
    gap: 1,
  },
  eligibilityTitle: {
    fontSize: 11,
    fontWeight: '800',
  },
  eligibilitySub: {
    fontSize: 9,
    fontWeight: '500',
    color: '#64748B',
  },
  section: {
    gap: 8,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  historyList: {
    gap: 6,
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  recordIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordInfo: {
    flex: 1,
    gap: 1,
  },
  recordHospital: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  recordDetail: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    paddingRight: 10,
    gap: 1,
  },
  settingTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  settingSub: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
    lineHeight: 14,
  },
  divider: {
    height: 0.5,
    backgroundColor: '#E2E8F0',
  },
  onboardingLinkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  onboardingLinkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  onboardingLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
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
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    padding: 18,
    alignItems: 'center',
    gap: 14,
  },
  qrModalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qrModalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  qrCodeContainer: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  qrIdText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#DC2626',
    letterSpacing: 1,
    marginTop: 4,
  },
  qrDonorName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  qrSub: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
  },
  qrCloseBtn: {
    width: '100%',
    height: 38,
    borderRadius: 9,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrCloseBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
