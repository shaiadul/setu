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
import { BloodGroup, CaseType, JuRole, UrgencyLevel } from '@/types/blood';

const BLOOD_GROUPS: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

const PRESET_HOSPITALS = [
  { name: 'Jahangirnagar University Medical Centre', area: 'মেডিকেল সেন্টার (ক্যাম্পাস)' },
  { name: 'Enam Medical College & Hospital', area: 'সাভার বাস স্ট্যান্ড' },
  { name: 'Savar Upazila Health Complex', area: 'গেন্ডা, সাভার' },
  { name: 'Dhaka Medical College Hospital', area: 'ঢাকা' },
];

export default function RequestScreen() {
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

  const bottomPadding = 56 + Math.max(insets.bottom, 12);

  const handleSubmit = async () => {
    if (!patientName.trim()) {
      Alert.alert('অসম্পূর্ণ তথ্য', 'অনুগ্রহ করে রোগীর নাম লিখুন।');
      return;
    }
    if (!room.trim()) {
      Alert.alert('অসম্পূর্ণ তথ্য', 'অনুগ্রহ করে ওয়ার্ড বা কেবিন নম্বর লিখুন।');
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
        description: description.trim() || `${bloodType} রক্তের জরুরি প্রয়োজনে ক্যাম্পাসে রক্তদাতা আহ্বান করা হচ্ছে।`,
        contactNumber: contactNumber.trim(),
        requesterRole: role,
        requesterDepartment: deptOrOffice.trim() || 'জাহাঙ্গীরনগর বিশ্ববিদ্যালয়',
        requesterHallOrOffice: hallOrOffice.trim() || 'ক্যাম্পাস',
      });

      Alert.alert(
        'রক্তের অনুরোধ সফল হয়েছে!',
        `আপনার অনুরোধটি সেতু লাইভ ফিডে সম্প্রচার করা হয়েছে এবং জাবি রক্তদাতাদের কাছে পাঠানো হয়েছে।`,
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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <CampusHeader
        title="রক্তের অনুরোধ"
        subtitle="জাহাঙ্গীরনগর বিশ্ববিদ্যালয় রক্তদাতা নেটওয়ার্কে পোস্ট করুন"
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Urgent Announcement Alert Strip */}
        <View style={styles.alertBanner}>
          <Ionicons name="megaphone" size={16} color="#DC2626" />
          <View style={styles.alertTextWrap}>
            <Text style={styles.alertTitle}>ক্যাম্পাস ইমার্জেন্সি এসওএস ব্রডকাস্ট</Text>
            <Text style={styles.alertDesc}>
              অনুরোধ পোস্ট করার সাথে সাথে জাবি শিক্ষার্থী, শিক্ষক ও কর্মকর্তা রক্তদাতাদের কাছে পুশ এলার্ট পৌঁছে যাবে।
            </Text>
          </View>
        </View>

        {/* Step 1: Patient Details & Identity */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <View style={styles.stepNumPill}>
              <Text style={styles.stepNumText}>১</Text>
            </View>
            <Text style={styles.cardHeading}>রোগী ও অনুরোধকারীর পরিচয়</Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>রোগীর নাম *</Text>
            <TextInput
              style={styles.input}
              placeholder="উদা: তাহসিন আহমেদ (সিএসই ৪৯)"
              placeholderTextColor="#94A3B8"
              value={patientName}
              onChangeText={setPatientName}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>অনুরোধকারীর পরিচয় (JU Role)</Text>
            <View style={styles.pillRow}>
              {(
                [
                  { id: 'student', label: '🎓 শিক্ষার্থী' },
                  { id: 'teacher', label: '🏛️ শিক্ষক' },
                  { id: 'staff', label: '🏢 কর্মকর্তা' },
                ] as const
              ).map(r => {
                const isSelected = role === r.id;
                return (
                  <TouchableOpacity
                    key={r.id}
                    style={[styles.roleChip, isSelected && styles.roleChipActive]}
                    activeOpacity={0.7}
                    onPress={() => setRole(r.id)}>
                    <Text style={[styles.roleChipText, isSelected && styles.roleChipTextActive]}>
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.twoColRow}>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>বিভাগ / অফিস</Text>
              <TextInput
                style={styles.input}
                placeholder="উদা: সিএসই, পরিসংখ্যান"
                placeholderTextColor="#94A3B8"
                value={deptOrOffice}
                onChangeText={setDeptOrOffice}
              />
            </View>

            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>হল / কোয়ার্টার</Text>
              <TextInput
                style={styles.input}
                placeholder="উদা: আল-বেরুনী হল"
                placeholderTextColor="#94A3B8"
                value={hallOrOffice}
                onChangeText={setHallOrOffice}
              />
            </View>
          </View>
        </View>

        {/* Step 2: Blood Group & Units */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <View style={styles.stepNumPill}>
              <Text style={styles.stepNumText}>২</Text>
            </View>
            <Text style={styles.cardHeading}>রক্তের গ্রুপ ও ব্যাগের সংখ্যা</Text>
          </View>

          <View style={styles.bloodGrid}>
            {BLOOD_GROUPS.map(bg => {
              const isSelected = bloodType === bg;
              return (
                <TouchableOpacity
                  key={bg}
                  style={[styles.bloodBox, isSelected && styles.bloodBoxActive]}
                  activeOpacity={0.75}
                  onPress={() => setBloodType(bg)}>
                  <Text style={[styles.bloodBoxText, isSelected && styles.bloodBoxTextActive]}>
                    {bg}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.counterRow}>
            <Text style={styles.counterLabel}>প্রয়োজনীয় রক্ত (ব্যাগ):</Text>
            <View style={styles.counterControl}>
              <TouchableOpacity
                style={styles.counterBtn}
                activeOpacity={0.7}
                onPress={() => setUnits(Math.max(1, units - 1))}>
                <Ionicons name="remove" size={14} color="#0F172A" />
              </TouchableOpacity>
              <Text style={styles.counterValue}>{units} ব্যাগ</Text>
              <TouchableOpacity
                style={styles.counterBtn}
                activeOpacity={0.7}
                onPress={() => setUnits(Math.min(8, units + 1))}>
                <Ionicons name="add" size={14} color="#0F172A" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Step 3: Urgency & Case Type */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <View style={styles.stepNumPill}>
              <Text style={styles.stepNumText}>৩</Text>
            </View>
            <Text style={styles.cardHeading}>জরুরি অবস্থা ও রোগের ধরন</Text>
          </View>

          <View style={styles.urgencyChoiceRow}>
            {(
              [
                { id: 'Code Red', label: '🚨 কোড রেড', sub: 'তাৎক্ষণিক', color: '#DC2626' },
                { id: 'Urgent', label: '⚡ জরুরি', sub: '২৪ ঘণ্টা', color: '#D97706' },
                { id: 'Standard', label: '🗓️ সাধারণ', sub: 'শিডিউল', color: '#0284C7' },
              ] as const
            ).map(u => {
              const isSel = urgency === u.id;
              return (
                <TouchableOpacity
                  key={u.id}
                  style={[
                    styles.urgencyBtn,
                    isSel && { borderColor: u.color, backgroundColor: `${u.color}10` },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setUrgency(u.id)}>
                  <Text style={[styles.urgencyBtnLabel, isSel && { color: u.color }]}>
                    {u.label}
                  </Text>
                  <Text style={styles.urgencyBtnSub}>{u.sub}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.caseChipsRow}>
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
                  style={[styles.caseChip, isSel && styles.caseChipActive]}
                  activeOpacity={0.7}
                  onPress={() => setCaseType(ct)}>
                  <Text style={[styles.caseChipText, isSel && styles.caseChipTextActive]}>
                    {ct}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Step 4: Hospital & Contact */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <View style={styles.stepNumPill}>
              <Text style={styles.stepNumText}>৪</Text>
            </View>
            <Text style={styles.cardHeading}>হাসপাতাল ও যোগাযোগের নম্বর</Text>
          </View>

          <View style={styles.hospitalList}>
            {PRESET_HOSPITALS.map((h, i) => {
              const isSel = selectedHospital.name === h.name;
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.hospitalChoice, isSel && styles.hospitalChoiceActive]}
                  activeOpacity={0.7}
                  onPress={() => setSelectedHospital(h)}>
                  <Ionicons
                    name={isSel ? 'radio-button-on' : 'radio-button-off'}
                    size={15}
                    color={isSel ? '#DC2626' : '#94A3B8'}
                  />
                  <View style={styles.hospitalTextWrap}>
                    <Text style={styles.hospitalNameText}>{h.name}</Text>
                    <Text style={styles.hospitalAreaText}>{h.area}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>ওয়ার্ড / কেবিন / রুম নম্বর *</Text>
            <TextInput
              style={styles.input}
              placeholder="উদা: জরুরি বিভাগ, বেড ৩"
              placeholderTextColor="#94A3B8"
              value={room}
              onChangeText={setRoom}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>যোগাযোগের ফোন নম্বর *</Text>
            <TextInput
              style={styles.input}
              placeholder="উদা: 01712-345678"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              value={contactNumber}
              onChangeText={setContactNumber}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>অতিরিক্ত তথ্য / বিবরণ</Text>
            <TextInput
              style={styles.textArea}
              placeholder="উদা: রোগীর রক্তের জন্য জরুরি সাহায্য প্রয়োজন..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={2}
              value={description}
              onChangeText={setDescription}
            />
          </View>
        </View>

        {/* Refined Submit Action */}
        <TouchableOpacity
          style={styles.submitBtn}
          activeOpacity={0.88}
          disabled={isSubmitting}
          onPress={handleSubmit}>
          <Ionicons name="paper-plane" size={16} color="#FFFFFF" />
          <Text style={styles.submitBtnText}>
            {isSubmitting ? 'পোস্ট হচ্ছে...' : 'সেতু নেটওয়ার্কে রক্তের অনুরোধ পোস্ট করুন'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 14,
    gap: 12,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 0.8,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 10,
  },
  alertTextWrap: {
    flex: 1,
    gap: 2,
  },
  alertTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
  },
  alertDesc: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
    lineHeight: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 13,
    gap: 11,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  stepNumPill: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cardHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  fieldGroup: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  input: {
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  textArea: {
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: '500',
    color: '#0F172A',
    textAlignVertical: 'top',
  },
  pillRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  roleChip: {
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 0.8,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleChipActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#DC2626',
  },
  roleChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  roleChipTextActive: {
    color: '#DC2626',
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 8,
  },
  bloodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  bloodBox: {
    width: '23%',
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bloodBoxActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  bloodBoxText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
  },
  bloodBoxTextActive: {
    color: '#FFFFFF',
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  counterLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  counterControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  counterBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 0.8,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
    minWidth: 44,
    textAlign: 'center',
  },
  urgencyChoiceRow: {
    flexDirection: 'row',
    gap: 6,
  },
  urgencyBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 7,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  urgencyBtnLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },
  urgencyBtnSub: {
    fontSize: 9,
    fontWeight: '500',
    color: '#94A3B8',
  },
  caseChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  caseChip: {
    paddingHorizontal: 8,
    height: 25,
    borderRadius: 5,
    backgroundColor: '#F1F5F9',
    borderWidth: 0.8,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  caseChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  caseChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  caseChipTextActive: {
    color: '#FFFFFF',
  },
  hospitalList: {
    gap: 6,
  },
  hospitalChoice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  hospitalChoiceActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  hospitalTextWrap: {
    flex: 1,
  },
  hospitalNameText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  hospitalAreaText: {
    fontSize: 9,
    fontWeight: '500',
    color: '#64748B',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#DC2626',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
