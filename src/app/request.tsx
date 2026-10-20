import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CampusHeader } from '@/components/campus-header';
import { useBlood } from '@/context/blood-context';
import { useTheme } from '@/hooks/use-theme';
import { BloodGroup, CaseType, JuRole, UrgencyLevel } from '@/types/blood';

const BLOOD_GROUPS: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

const PRESET_HOSPITALS = [
  { name: 'Jahangirnagar University Medical Centre', area: 'Medical Center Quad' },
  { name: 'Enam Medical College & Hospital', area: 'Savar Bus Stand' },
  { name: 'Savar Upazila Health Complex', area: 'Genda, Savar' },
  { name: 'Dhaka Medical College Hospital', area: 'Dhaka' },
];

export default function RequestScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { createRequest, profile } = useBlood();

  const [patientName, setPatientName] = useState('');
  const [role, setRole] = useState<JuRole>(profile.role);
  const [bloodType, setBloodType] = useState<BloodGroup>('O-');
  const [units, setUnits] = useState<number>(2);
  const [urgency, setUrgency] = useState<UrgencyLevel>('Code Red');
  const [caseType, setCaseType] = useState<CaseType>('Trauma / Accident');
  const [selectedHospital, setSelectedHospital] = useState(PRESET_HOSPITALS[0]);
  const [room, setRoom] = useState('');
  const [deptOrOffice, setDeptOrOffice] = useState(profile.departmentOrOffice);
  const [hallOrOffice, setHallOrOffice] = useState(profile.hallOrResidence);
  const [contactNumber, setContactNumber] = useState(profile.phone);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bottomPadding = 70 + Math.max(insets.bottom, 12);

  const handleSubmit = async () => {
    if (!patientName.trim()) {
      Alert.alert('অসম্পূর্ণ তথ্য', 'অনুগ্রহ করে রোগীর নাম লিখুন।');
      return;
    }
    if (!room.trim()) {
      Alert.alert('অসম্পূর্ণ তথ্য', 'অনুগ্রহ করে ওয়ার্ড বা কেবিন/রুম নম্বর লিখুন।');
      return;
    }
    if (!contactNumber.trim()) {
      Alert.alert('অসম্পূর্ণ তথ্য', 'অনুগ্রহ করে যোগাযোগের ফোন নম্বর লিখুন।');
      return;
    }

    setIsSubmitting(true);

    try {
      await createRequest({
        patientName: patientName.trim(),
        hospital: selectedHospital.name,
        campusArea: selectedHospital.area,
        room: room.trim(),
        distance: selectedHospital.name.includes('University') ? '০.২ কিমি (ক্যাম্পাস)' : '৩.৫ কিমি (সাভার)',
        requiredUnits: units,
        bloodType,
        urgency,
        caseType,
        description: description.trim() || `${bloodType} রক্তের জরুরি প্রয়োজনে ক্যাম্পাসে ডোনার আহ্বান করা হচ্ছে।`,
        contactNumber: contactNumber.trim(),
        requesterRole: role,
        requesterDepartment: deptOrOffice.trim() || 'জাহাঙ্গীরনগর বিশ্ববিদ্যালয়',
        requesterHallOrOffice: hallOrOffice.trim() || 'ক্যাম্পাস',
      });

      Alert.alert(
        'রক্তের অনুরোধ সফল হয়েছে!',
        `আপনার অনুরোধটি সেতু লাইভ ফিডে প্রচার করা হয়েছে এবং জাবি ডোনারদের কাছে পাঠানো হয়েছে।`,
        [
          {
            text: 'ফিডে দেখুন',
            onPress: () => router.push('/'),
          },
        ]
      );
    } catch {
      Alert.alert('ত্রুটি', 'অনুরোধ পোস্ট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <CampusHeader
        title="সেতু • রক্তের অনুরোধ"
        subtitle="জাহাঙ্গীরনগর বিশ্ববিদ্যালয় ডোনার নেটওয়ার্কে পোস্ট করুন"
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
        keyboardShouldPersistTaps="handled">
        {/* Banner */}
        <View
          style={[
            styles.banner,
            { backgroundColor: theme.primaryContainer, borderColor: theme.primaryLight },
          ]}>
          <Ionicons name="megaphone" size={20} color={theme.primary} />
          <View style={styles.bannerTextCol}>
            <Text style={[styles.bannerTitle, { color: theme.primary }]}>
              ক্যাম্পাস ইমার্জেন্সি এসওএস ব্রডকাস্ট
            </Text>
            <Text style={[styles.bannerSub, { color: theme.textSecondary }]}>
              অনুরোধ পোস্ট করার সাথে সাথে জাবি শিক্ষার্থী, শিক্ষক ও কর্মকর্তা রক্তদাতাদের কাছে নোটিফিকেশন পৌঁছে যাবে।
            </Text>
          </View>
        </View>

        {/* Section 1: Patient Name & Role */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>১. রোগী ও অনুরোধকারীর পরিচয়</Text>

          <View style={styles.fieldGroup}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>রোগীর নাম *</Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.cardBorder,
                  color: theme.text,
                },
              ]}
              placeholder="উদা: তাহসিন আহমেদ (সিএসই ৪৯)"
              placeholderTextColor={theme.textSecondary}
              value={patientName}
              onChangeText={setPatientName}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>অনুরোধকারীর পরিচয় (JU Role)</Text>
            <View style={styles.rolePickerRow}>
              {(
                [
                  { id: 'student', label: '🎓 শিক্ষার্থী' },
                  { id: 'teacher', label: '🏛️ শিক্ষক' },
                  { id: 'staff', label: '🏢 কর্মকর্তা/কর্মচারী' },
                ] as const
              ).map(r => {
                const isSelected = role === r.id;
                return (
                  <TouchableOpacity
                    key={r.id}
                    style={[
                      styles.roleChip,
                      {
                        backgroundColor: isSelected ? theme.primaryContainer : theme.backgroundElement,
                        borderColor: isSelected ? theme.primary : theme.cardBorder,
                      },
                    ]}
                    onPress={() => setRole(r.id)}>
                    <Text
                      style={[
                        styles.roleChipText,
                        { color: isSelected ? theme.primary : theme.textSecondary },
                      ]}>
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.twoColRow}>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>বিভাগ / অফিস</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.backgroundElement,
                    borderColor: theme.cardBorder,
                    color: theme.text,
                  },
                ]}
                placeholder="উদা: সিএসই, পরিসংখ্যান"
                placeholderTextColor={theme.textSecondary}
                value={deptOrOffice}
                onChangeText={setDeptOrOffice}
              />
            </View>

            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>হল / কোয়ার্টার</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.backgroundElement,
                    borderColor: theme.cardBorder,
                    color: theme.text,
                  },
                ]}
                placeholder="উদা: আল-বেরুনী হল"
                placeholderTextColor={theme.textSecondary}
                value={hallOrOffice}
                onChangeText={setHallOrOffice}
              />
            </View>
          </View>
        </View>

        {/* Section 2: Blood Group & Units */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>২. রক্তের গ্রুপ ও ব্যাগের পরিমাণ</Text>

          <View style={styles.bloodGrid}>
            {BLOOD_GROUPS.map(bg => {
              const isSelected = bloodType === bg;
              return (
                <TouchableOpacity
                  key={bg}
                  style={[
                    styles.bloodBox,
                    {
                      backgroundColor: isSelected ? theme.primary : theme.backgroundElement,
                      borderColor: isSelected ? theme.primary : theme.cardBorder,
                    },
                  ]}
                  onPress={() => setBloodType(bg)}>
                  <Text
                    style={[
                      styles.bloodBoxText,
                      { color: isSelected ? '#FFFFFF' : theme.text },
                    ]}>
                    {bg}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.unitsRow}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>প্রয়োজনীয় রক্ত (ব্যাগ):</Text>
            <View style={styles.counterRow}>
              <TouchableOpacity
                style={[styles.counterBtn, { borderColor: theme.cardBorder }]}
                onPress={() => setUnits(Math.max(1, units - 1))}>
                <Ionicons name="remove" size={16} color={theme.text} />
              </TouchableOpacity>
              <Text style={[styles.unitsValue, { color: theme.primary }]}>{units} ব্যাগ</Text>
              <TouchableOpacity
                style={[styles.counterBtn, { borderColor: theme.cardBorder }]}
                onPress={() => setUnits(Math.min(8, units + 1))}>
                <Ionicons name="add" size={16} color={theme.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Section 3: Urgency & Case Type */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>৩. জরুরি অবস্থা ও রোগের ধরন</Text>

          <View style={styles.urgencyChoiceRow}>
            {(
              [
                { id: 'Code Red', label: '🚨 কোড রেড (তাৎক্ষণিক)', color: '#DC2626' },
                { id: 'Urgent', label: '⚡ জরুরি (২৪ ঘণ্টা)', color: '#D97706' },
                { id: 'Standard', label: '🗓️ সাধারণ (শিডিউল)', color: '#0284C7' },
              ] as const
            ).map(u => {
              const isSel = urgency === u.id;
              return (
                <TouchableOpacity
                  key={u.id}
                  style={[
                    styles.urgencySelectBtn,
                    {
                      backgroundColor: isSel ? theme.primaryContainer : theme.backgroundElement,
                      borderColor: isSel ? u.color : theme.cardBorder,
                    },
                  ]}
                  onPress={() => setUrgency(u.id)}>
                  <Text style={[styles.urgencySelectText, { color: isSel ? u.color : theme.textSecondary }]}>
                    {u.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.casePickerRow}>
            {(
              [
                'Trauma / Accident',
                'Emergency Surgery',
                'Thalassemia',
                'Dengue Platelets',
                'Maternity',
              ] as CaseType[]
            ).map(ct => {
              const isSel = caseType === ct;
              return (
                <TouchableOpacity
                  key={ct}
                  style={[
                    styles.caseChip,
                    {
                      backgroundColor: isSel ? theme.primary : theme.backgroundElement,
                      borderColor: isSel ? theme.primary : theme.cardBorder,
                    },
                  ]}
                  onPress={() => setCaseType(ct)}>
                  <Text
                    style={[
                      styles.caseChipText,
                      { color: isSel ? '#FFFFFF' : theme.textSecondary },
                    ]}>
                    {ct}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section 4: Hospital & Contact */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>৪. হাসপাতাল ও যোগাযোগের নম্বর</Text>

          <View style={styles.hospitalList}>
            {PRESET_HOSPITALS.map((h, i) => {
              const isSel = selectedHospital.name === h.name;
              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.hospitalChoice,
                    {
                      backgroundColor: isSel ? theme.secondaryLight : theme.backgroundElement,
                      borderColor: isSel ? theme.secondary : theme.cardBorder,
                    },
                  ]}
                  onPress={() => setSelectedHospital(h)}>
                  <Ionicons
                    name={isSel ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={isSel ? theme.secondaryDark : theme.textSecondary}
                  />
                  <View style={styles.hospitalTextCol}>
                    <Text style={[styles.hospitalNameText, { color: theme.text }]}>{h.name}</Text>
                    <Text style={[styles.hospitalAreaText, { color: theme.textSecondary }]}>
                      {h.area}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>ওয়ার্ড / বেড / রুম নম্বর *</Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.cardBorder,
                  color: theme.text,
                },
              ]}
              placeholder="উদা: জরুরি বিভাগ, বেড ৩"
              placeholderTextColor={theme.textSecondary}
              value={room}
              onChangeText={setRoom}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>যোগাযোগের ফোন নম্বর *</Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.cardBorder,
                  color: theme.text,
                },
              ]}
              placeholder="উদা: 01712-345678"
              placeholderTextColor={theme.textSecondary}
              keyboardType="phone-pad"
              value={contactNumber}
              onChangeText={setContactNumber}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>অতিরিক্ত তথ্য / বিবরণ</Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.cardBorder,
                  color: theme.text,
                },
              ]}
              placeholder="উদা: অপারেশনের জন্য তাৎক্ষণিক ৩ ব্যাগ ফ্রেশ রক্তের প্রয়োজন..."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: theme.primary }]}
          activeOpacity={0.88}
          disabled={isSubmitting}
          onPress={handleSubmit}>
          <Ionicons name="paper-plane" size={18} color="#FFFFFF" />
          <Text style={styles.submitBtnText}>
            {isSubmitting ? 'পোস্ট হচ্ছে...' : 'সেতু নেটওয়ার্কে রক্তের অনুরোধ পোস্ট করুন'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  bannerTextCol: {
    flex: 1,
    gap: 2,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  bannerSub: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 16,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  fieldGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  textInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '600',
  },
  textArea: {
    height: 76,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    fontWeight: '500',
    textAlignVertical: 'top',
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 10,
  },
  rolePickerRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  roleChip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  roleChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  bloodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bloodBox: {
    width: '22%',
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bloodBoxText: {
    fontSize: 15,
    fontWeight: '900',
  },
  unitsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  counterBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unitsValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  urgencyChoiceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  urgencySelectBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  urgencySelectText: {
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
  casePickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  caseChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  caseChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  hospitalList: {
    gap: 8,
  },
  hospitalChoice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  hospitalTextCol: {
    flex: 1,
  },
  hospitalNameText: {
    fontSize: 12,
    fontWeight: '700',
  },
  hospitalAreaText: {
    fontSize: 10,
    fontWeight: '500',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
