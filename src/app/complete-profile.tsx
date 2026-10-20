import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CampusHeader } from '@/components/campus-header';
import { PrimaryButton } from '@/components/primary-button';
import { useBlood } from '@/context/blood-context';
import { BloodGroup, JuRole } from '@/types/blood';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const JU_DEPARTMENTS = [
  'Computer Science & Engineering',
  'Pharmacy',
  'Physics',
  'Chemistry',
  'Mathematics',
  'Biochemistry & Molecular Biology',
  'Economics',
  'English',
  'Business Administration (IBA-JU)',
  'Bangla',
  'International Relations',
  'Medical Centre JU',
];

const JU_HALLS = [
  'Al-Beruni Hall',
  'Mir Mosharraf Hossain Hall',
  'Shaheed Salam-Barkat Hall',
  'AF Rahman Hall',
  'Bangabandhu Sheikh Mujibur Rahman Hall',
  'Jahanara Imam Hall',
  'Nawab Faizunnesa Hall',
  'Pritilata Hall',
  'Fazilatunnesa Hall',
  'Begum Khaleda Zia Hall',
  'Sheikh Hasina Hall',
  'Bangamata Sheikh Fazilatunnesa Mujib Hall',
  'Teacher / Staff Quarters',
];

export default function CompleteProfileScreen() {
  const insets = useSafeAreaInsets();
  const { profile, updateProfile, isLoggedIn } = useBlood();

  // Form State
  const [name, setName] = useState(profile.name || 'Md. Saidul Bashar');
  const [phone, setPhone] = useState(profile.phone || '01700-112233');
  const [emergencyPhone, setEmergencyPhone] = useState('01812-998877');
  const [bloodType, setBloodType] = useState<BloodGroup>(profile.bloodType || 'O-');
  const [role, setRole] = useState<JuRole>(profile.role || 'student');
  const [department, setDepartment] = useState(profile.departmentOrOffice || 'Computer Science & Engineering');
  const [hall, setHall] = useState(profile.hallOrResidence || 'Al-Beruni Hall');
  const [studentId, setStudentId] = useState(profile.studentId || 'JU-2019-CSE-042');
  const [neverDonated, setNeverDonated] = useState(false);
  const [lastDonationDate, setLastDonationDate] = useState(profile.lastDonationDate || '12 Aug 2026');
  const [weightEligible, setWeightEligible] = useState(true);

  // Settings Toggles (Unified toggle design)
  const [readyToDonate, setReadyToDonate] = useState(true);
  const [sosAlerts, setSosAlerts] = useState(true);
  const [showPhonePublic, setShowPhonePublic] = useState(true);

  // Success Modal
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Dropdown helper modals
  const [deptPickerVisible, setDeptPickerVisible] = useState(false);
  const [hallPickerVisible, setHallPickerVisible] = useState(false);

  // Reusable Unified Toggle Row (Same design across the whole application)
  const renderToggleRow = (
    icon: keyof typeof Ionicons.glyphMap,
    iconColor: string,
    iconBg: string,
    title: string,
    subtitle: string,
    value: boolean,
    onValueChange: (val: boolean) => void
  ) => (
    <View style={styles.toggleRow}>
      <View style={[styles.toggleIconBox, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={15} color={iconColor} />
      </View>
      <View style={styles.toggleTextCol}>
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleSub}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E2E8F0', true: '#DC2626' }}
        thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
      />
    </View>
  );

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('অসম্পূর্ণ নাম', 'অনুগ্রহ করে আপনার পুরো নাম প্রদান করুন।');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('অসম্পূর্ণ মোবাইল নম্বর', 'জরুরি যোগাযোগের জন্য মোবাইল নম্বর প্রয়োজন।');
      return;
    }

    setIsSaving(true);

    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        bloodType,
        rhFactor: bloodType.includes('-') ? 'Rh-' : 'Rh+',
        role,
        departmentOrOffice: department,
        hallOrResidence: hall,
        studentId: studentId.trim(),
        lastDonationDate: neverDonated ? 'কখনো দেননি' : lastDonationDate,
        status: readyToDonate ? 'Eligible' : 'Rest Period',
        statusDetails: 'জাহাঙ্গীরনগর বিশ্ববিদ্যালয় ভেরিফাইড ডিজিটাল ডোনার',
      });

      setIsSaving(false);
      setIsSuccessModalVisible(true);
    } catch {
      setIsSaving(false);
      Alert.alert('ত্রুটি', 'প্রোফাইল আপডেট সংরক্ষণ করা সম্ভব হয়নি। আবার চেষ্টা করুন।');
    }
  };

  // Guard: User must be logged in before completing profile
  if (!isLoggedIn) {
    return (
      <View style={styles.keyboardContainer}>
        <CampusHeader
          title="প্রোফাইল নিবন্ধন"
          subtitle="লগইন আবশ্যক"
          showBack={true}
          onBack={() => router.back()}
        />

        <View style={styles.authRequiredContainer}>
          <View style={styles.authRequiredIconBox}>
            <Ionicons name="lock-closed" size={38} color="#DC2626" />
          </View>
          <Text style={styles.authRequiredTitle}>লগইন করা আবশ্যক</Text>
          <Text style={styles.authRequiredSubtitle}>
            সেতু রক্তদান নেটওয়ার্কে নতুন ডোনার প্রোফাইল যুক্ত বা আপডেট করার পূর্বে আপনার অ্যাকাউন্টে সাইন ইন থাকা প্রয়োজন।
          </Text>

          <View style={styles.authActionBlock}>
            <PrimaryButton
              title="Google দিয়ে এক ক্লিকে সাইন ইন"
              icon="logo-google"
              onPress={() => router.push('/login?redirectTo=complete-profile')}
            />

            <PrimaryButton
              title="জাবি আইডি বা মোবাইল দিয়ে প্রবেশ"
              icon="school-outline"
              variant="secondary"
              onPress={() => router.push('/login?redirectTo=complete-profile')}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <CampusHeader
        title="প্রোফাইল সম্পূর্ণ করুন"
        subtitle="জাবি ভেরিফাইড ডিজিটাল ডোনার আইডি"
        showBack={true}
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Tracker Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeaderRow}>
            <View style={styles.progressTitleCluster}>
              <View style={styles.progressDialMini}>
                <Ionicons name="shield-checkmark" size={14} color="#16A34A" />
              </View>
              <Text style={styles.progressCardTitle}>ডোনার প্রোফাইল সম্পূর্ণতা</Text>
            </View>
            <Text style={styles.progressPercentText}>১০০% রেডি</Text>
          </View>

          <View style={styles.progressBarTrack}>
            <View style={styles.progressBarFill} />
          </View>

          <Text style={styles.progressNote}>
            সম্পূর্ণ তথ্য জাবি মেডিকেল সেন্টার ও রক্তগ্রহীতার কাছে তাৎক্ষণিক বিশ্বাসযোগ্যতা নিশ্চিত করে।
          </Text>
        </View>

        {/* SECTION 1: PERSONAL INFORMATION */}
        <View style={styles.sectionSurface}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="person-circle" size={16} color="#DC2626" />
            <Text style={styles.sectionTitle}>১. ব্যক্তিগত ও যোগাযোগের তথ্য</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>পূর্ণ নাম (ইংরেজি অথবা বাংলা)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={16} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="যেমন: Md. Saidul Bashar"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabelRow}>
              <Text style={styles.inputLabel}>প্রাথমিক মোবাইল নম্বর</Text>
              <View style={styles.verifiedTag}>
                <Ionicons name="checkmark-circle" size={11} color="#16A34A" />
                <Text style={styles.verifiedTagText}>ভেরিফাইড</Text>
              </View>
            </View>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={16} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="01700112233"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>বিকল্প জরুরি যোগাযোগ (অভিভাবক / রুমমেট)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="people-outline" size={16} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="01812998877"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={emergencyPhone}
                onChangeText={setEmergencyPhone}
              />
            </View>
          </View>
        </View>

        {/* SECTION 2: BLOOD GROUP & MEDICAL READINESS */}
        <View style={styles.sectionSurface}>
          <View style={styles.sectionHeaderRow}>
            <MaterialCommunityIcons name="water" size={17} color="#DC2626" />
            <Text style={styles.sectionTitle}>২. রক্তের গ্রুপ ও স্বাস্থ্য স্থিতি</Text>
          </View>

          <Text style={styles.fieldSubGuide}>আপনার সঠিক রক্তের গ্রুপ নির্বাচন করুন:</Text>

          {/* Blood Group Grid */}
          <View style={styles.bloodGrid}>
            {BLOOD_GROUPS.map((bg) => {
              const isSelected = bloodType === bg;
              return (
                <TouchableOpacity
                  key={bg}
                  style={[styles.bloodChip, isSelected && styles.bloodChipActive]}
                  activeOpacity={0.75}
                  onPress={() => setBloodType(bg)}
                >
                  <Text style={[styles.bloodChipText, isSelected && styles.bloodChipTextActive]}>
                    {bg}
                  </Text>
                  {bg === 'O-' && <Text style={styles.universalSubPill}>ইউনিভার্সাল</Text>}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Last Donation Date Selector */}
          <View style={styles.inputGroup}>
            <View style={styles.inputLabelRow}>
              <Text style={styles.inputLabel}>সর্বশেষ রক্তদানের সময়</Text>
              <TouchableOpacity
                onPress={() => setNeverDonated(!neverDonated)}
                style={styles.neverDonatedRow}
              >
                <Ionicons
                  name={neverDonated ? 'checkbox' : 'square-outline'}
                  size={15}
                  color={neverDonated ? '#DC2626' : '#64748B'}
                />
                <Text style={styles.neverDonatedText}>কখনো রক্তদান করিনি</Text>
              </TouchableOpacity>
            </View>

            {!neverDonated && (
              <View style={styles.inputContainer}>
                <Ionicons name="calendar-outline" size={16} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="যেমন: 12 Aug 2026"
                  placeholderTextColor="#94A3B8"
                  value={lastDonationDate}
                  onChangeText={setLastDonationDate}
                />
              </View>
            )}
          </View>

          {/* Weight & Fitness Confirmation */}
          <TouchableOpacity
            style={styles.fitnessCheckRow}
            activeOpacity={0.8}
            onPress={() => setWeightEligible(!weightEligible)}
          >
            <Ionicons
              name={weightEligible ? 'checkmark-circle' : 'ellipse-outline'}
              size={20}
              color={weightEligible ? '#16A34A' : '#94A3B8'}
            />
            <View style={styles.fitnessTextCol}>
              <Text style={styles.fitnessTitle}>শারীরিক সুস্থতা ও ওজন ৫০+ কেজি</Text>
              <Text style={styles.fitnessSub}>
                হিমোগ্লোবিন লেভেল স্বাভাবিক ও কোনো রক্তবাহিত ব্যাধি নেই
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* SECTION 3: JU CAMPUS IDENTITY */}
        <View style={styles.sectionSurface}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="school" size={16} color="#0284C7" />
            <Text style={styles.sectionTitle}>৩. জাহাঙ্গীরনগর বিশ্ববিদ্যালয় পরিচয়</Text>
          </View>

          {/* Role Picker Buttons */}
          <View style={styles.rolePickerRow}>
            {(['student', 'teacher', 'staff'] as JuRole[]).map((r) => {
              const isSelected = role === r;
              return (
                <TouchableOpacity
                  key={r}
                  style={[styles.rolePickerBtn, isSelected && styles.rolePickerBtnActive]}
                  activeOpacity={0.75}
                  onPress={() => setRole(r)}
                >
                  <Text
                    style={[
                      styles.rolePickerBtnText,
                      isSelected && styles.rolePickerBtnTextActive,
                    ]}
                  >
                    {r === 'student' ? '🎓 শিক্ষার্থী' : r === 'teacher' ? '🏛️ শিক্ষক' : '🏢 কর্মকর্তা'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Department Picker Trigger */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>বিভাগ / ইনস্টিটিউট / অফিস</Text>
            <TouchableOpacity
              style={styles.inputContainer}
              activeOpacity={0.8}
              onPress={() => setDeptPickerVisible(true)}
            >
              <Ionicons name="business-outline" size={16} color="#64748B" style={styles.inputIcon} />
              <Text style={styles.selectorValueText} numberOfLines={1}>
                {department}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Hall / Residence Picker Trigger */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>আবাসিক হল / বাসভবন</Text>
            <TouchableOpacity
              style={styles.inputContainer}
              activeOpacity={0.8}
              onPress={() => setHallPickerVisible(true)}
            >
              <Ionicons name="home-outline" size={16} color="#64748B" style={styles.inputIcon} />
              <Text style={styles.selectorValueText} numberOfLines={1}>
                {hall}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Student ID / Employee ID */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>শিক্ষার্থী আইডি / ব্যাচ / রেজিস্ট্রেশন নম্বর</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="card-outline" size={16} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="যেমন: JU-2019-CSE-042"
                placeholderTextColor="#94A3B8"
                value={studentId}
                onChangeText={setStudentId}
              />
            </View>
          </View>
        </View>

        {/* SECTION 4: PRIVACY & AVAILABILITY SETTINGS (UNIFIED TOGGLES) */}
        <View style={styles.sectionSurface}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="shield-checkmark" size={16} color="#16A34A" />
            <Text style={styles.sectionTitle}>৪. এভেইল্যাবিলিটি ও প্রাইভেসি সেটিংস</Text>
          </View>

          {renderToggleRow(
            'water',
            '#DC2626',
            '#FEF2F2',
            'রক্তদানে সর্বদা প্রস্তুত (Active Donor)',
            'ক্যাম্পাসের জরুরি ডিরেক্টরিতে আপনাকে আগ্রহী হিসেবে দেখাবে',
            readyToDonate,
            setReadyToDonate
          )}

          <View style={styles.hairlineDivider} />

          {renderToggleRow(
            'flash',
            '#DC2626',
            '#FEF2F2',
            'কোড রেড পুশ এলার্ট',
            'জাবি মেডিকেল সেন্টার ও সাভারের ক্রিটিক্যাল রোগীর জন্য সরাসরি এলার্ট',
            sosAlerts,
            setSosAlerts
          )}

          <View style={styles.hairlineDivider} />

          {renderToggleRow(
            'call',
            '#DC2626',
            '#FEF2F2',
            'ফোন নম্বর উন্মুক্ত রাখুন',
            'জরুরি প্রয়োজনে রোগী বা রোগীর স্বজন আপনাকে সরাসরি কল করতে পারবে',
            showPhonePublic,
            setShowPhonePublic
          )}
        </View>

        {/* Reusable Primary Action Button */}
        <PrimaryButton
          title={isSaving ? 'সংরক্ষণ করা হচ্ছে...' : 'প্রোফাইল সংরক্ষণ ও সক্রিয় করুন'}
          icon="checkmark-circle"
          loading={isSaving}
          onPress={handleSaveProfile}
          style={{ marginTop: 4 }}
        />
      </ScrollView>

      {/* DEPARTMENT PICKER MODAL */}
      <Modal visible={deptPickerVisible} transparent animationType="fade">
        <View style={styles.pickerModalBackdrop}>
          <View style={styles.pickerModalBox}>
            <View style={styles.pickerModalHeader}>
              <Text style={styles.pickerModalTitle}>বিভাগ / ইনস্টিটিউট নির্বাচন করুন</Text>
              <TouchableOpacity onPress={() => setDeptPickerVisible(false)}>
                <Ionicons name="close-circle" size={22} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerListScroll} showsVerticalScrollIndicator={false}>
              {JU_DEPARTMENTS.map((dept, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.pickerItemRow, department === dept && styles.pickerItemRowActive]}
                  onPress={() => {
                    setDepartment(dept);
                    setDeptPickerVisible(false);
                  }}
                >
                  <Text style={[styles.pickerItemText, department === dept && styles.pickerItemTextActive]}>
                    {dept}
                  </Text>
                  {department === dept && <Ionicons name="checkmark" size={16} color="#DC2626" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* HALL PICKER MODAL */}
      <Modal visible={hallPickerVisible} transparent animationType="fade">
        <View style={styles.pickerModalBackdrop}>
          <View style={styles.pickerModalBox}>
            <View style={styles.pickerModalHeader}>
              <Text style={styles.pickerModalTitle}>আবাসিক হল / বাসভবন নির্বাচন করুন</Text>
              <TouchableOpacity onPress={() => setHallPickerVisible(false)}>
                <Ionicons name="close-circle" size={22} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerListScroll} showsVerticalScrollIndicator={false}>
              {JU_HALLS.map((h, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.pickerItemRow, hall === h && styles.pickerItemRowActive]}
                  onPress={() => {
                    setHall(h);
                    setHallPickerVisible(false);
                  }}
                >
                  <Text style={[styles.pickerItemText, hall === h && styles.pickerItemTextActive]}>
                    {h}
                  </Text>
                  {hall === h && <Ionicons name="checkmark" size={16} color="#DC2626" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* SUCCESS CONFIRMATION CELEBRATION MODAL */}
      <Modal visible={isSuccessModalVisible} transparent animationType="slide">
        <View style={styles.celebrationBackdrop}>
          <View style={styles.celebrationCard}>
            <View style={styles.celebrationIconBadge}>
              <MaterialCommunityIcons name="shield-check" size={44} color="#16A34A" />
            </View>

            <Text style={styles.celebrationTitle}>প্রোফাইল সফলভাবে সম্পূর্ণ!</Text>
            <Text style={styles.celebrationDesc}>
              আপনার জাহাঙ্গীরনগর বিশ্ববিদ্যালয় ভেরিফাইড ডিজিটাল ডোনার আইডি সক্রিয় করা হয়েছে। রক্তদানে এগিয়ে আসার জন্য ধন্যবাদ!
            </Text>

            {/* Generated ID preview summary */}
            <View style={styles.idCardMini}>
              <View style={styles.idCardTop}>
                <Text style={styles.idCardJuTitle}>JAHANGIRNAGAR UNIVERSITY BLOOD NETWORK</Text>
                <View style={styles.idBloodPill}>
                  <Text style={styles.idBloodPillText}>{bloodType}</Text>
                </View>
              </View>
              <Text style={styles.idCardName}>{name}</Text>
              <Text style={styles.idCardDetail}>{department}</Text>
              <Text style={styles.idCardDetail}>{hall} • আইডি: {studentId}</Text>
            </View>

            <PrimaryButton
              title="প্রোফাইল ড্যাশবোর্ডে যান"
              icon="arrow-forward"
              onPress={() => {
                setIsSuccessModalVisible(false);
                router.replace('/profile');
              }}
              style={{ width: '100%', marginTop: 4 }}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  authRequiredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  authRequiredIconBox: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FEF2F2',
    borderWidth: 2,
    borderColor: '#FECACA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  authRequiredTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  authRequiredSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 8,
  },
  authActionBlock: {
    width: '100%',
    gap: 10,
    maxWidth: 340,
  },
  scrollContent: {
    padding: 14,
    gap: 12,
  },

  /* Progress Card */
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTitleCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressDialMini: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCardTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  progressPercentText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#16A34A',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '100%',
    height: '100%',
    backgroundColor: '#16A34A',
    borderRadius: 3,
  },
  progressNote: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
    lineHeight: 14,
  },

  /* Surfaces */
  sectionSurface: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 2,
    borderBottomWidth: 0.8,
    borderBottomColor: '#F1F5F9',
  },
  sectionTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  fieldSubGuide: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#475569',
  },

  /* Inputs */
  inputGroup: {
    gap: 5,
  },
  inputLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#16A34A',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 9,
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
    height: '100%',
  },
  selectorValueText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },

  /* Blood Grid */
  bloodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bloodChip: {
    width: '23%',
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bloodChipActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  bloodChipText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
  },
  bloodChipTextActive: {
    color: '#FFFFFF',
  },
  universalSubPill: {
    fontSize: 7.5,
    fontWeight: '800',
    color: '#D97706',
    marginTop: -1,
  },

  /* Never Donated */
  neverDonatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  neverDonatedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },

  /* Fitness */
  fitnessCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    padding: 10,
    borderRadius: 10,
  },
  fitnessTextCol: {
    flex: 1,
  },
  fitnessTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  fitnessSub: {
    fontSize: 9.5,
    fontWeight: '500',
    color: '#475569',
  },

  /* Role Picker */
  rolePickerRow: {
    flexDirection: 'row',
    gap: 6,
  },
  rolePickerBtn: {
    flex: 1,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rolePickerBtnActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  rolePickerBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },
  rolePickerBtnTextActive: {
    color: '#FFFFFF',
  },

  /* Unified Toggle */
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toggleIconBox: {
    width: 28,
    height: 28,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleTextCol: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  toggleSub: {
    fontSize: 9.5,
    fontWeight: '500',
    color: '#64748B',
    lineHeight: 14,
  },
  hairlineDivider: {
    height: 0.8,
    backgroundColor: '#F1F5F9',
  },

  /* Save Button */
  saveBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
    marginTop: 4,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  /* Pickers */
  pickerModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerModalBox: {
    width: '100%',
    maxHeight: '75%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    gap: 10,
  },
  pickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0.8,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 10,
  },
  pickerModalTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  pickerListScroll: {
    maxHeight: 320,
  },
  pickerItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 8,
    borderBottomWidth: 0.6,
    borderBottomColor: '#F1F5F9',
  },
  pickerItemRowActive: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  pickerItemText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  pickerItemTextActive: {
    color: '#DC2626',
    fontWeight: '800',
  },

  /* Celebration Modal */
  celebrationBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  celebrationCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  celebrationIconBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  celebrationDesc: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },
  idCardMini: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  idCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  idCardJuTitle: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  idBloodPill: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  idBloodPillText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  idCardName: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  idCardDetail: {
    fontSize: 9.5,
    fontWeight: '500',
    color: '#CBD5E1',
  },
  doneBtn: {
    width: '100%',
    height: 44,
    borderRadius: 11,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  doneBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
