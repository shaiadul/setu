import React from 'react';
import {
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { JuDonor } from '@/types/blood';
import { useTheme } from '@/hooks/use-theme';
import { JuBadge } from '@/components/ju-badge';
import { BloodGroupBadge } from '@/components/blood-group-badge';

interface DonorCardProps {
  donor: JuDonor;
}

export function DonorCard({ donor }: DonorCardProps) {
  const theme = useTheme();

  const handleCall = () => {
    const url = `tel:${donor.phone}`;
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('কল ব্যর্থ', `ডোনার ফোন নম্বর: ${donor.phone}`);
        }
      })
      .catch(() => Alert.alert('কল ব্যর্থ', `ডোনার ফোন নম্বর: ${donor.phone}`));
  };

  const handleSms = () => {
    const message = `আসসালামু আলাইকুম, জাহাঙ্গীরনগর বিশ্ববিদ্যালয় 'সেতু' রক্তদান অ্যাপ থেকে আপনার সাথে জরুরি রক্তের প্রয়োজনে যোগাযোগ করছি।`;
    const url = `sms:${donor.phone}?body=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => Alert.alert('মেসেজ ব্যর্থ', `ফোন নম্বর: ${donor.phone}`));
  };

  return (
    <View style={[styles.card, { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }]}>
      {/* Header Info */}
      <View style={styles.cardHeader}>
        <BloodGroupBadge bloodType={donor.bloodType} size="sm" highlightUniversal />

        <View style={styles.metaCol}>
          <View style={styles.nameRow}>
            <Text style={styles.donorName} numberOfLines={1}>
              {donor.name}
            </Text>
            {donor.verifiedJu && (
              <Ionicons name="checkmark-circle" size={14} color="#0284C7" />
            )}
          </View>

          <View style={styles.badgeRow}>
            <JuBadge role={donor.role} size="sm" />
            <View
              style={[
                styles.availPill,
                {
                  backgroundColor: donor.isAvailable ? '#DCFCE7' : '#F1F5F9',
                  borderColor: donor.isAvailable ? '#86EFAC' : '#E2E8F0',
                },
              ]}>
              <View
                style={[
                  styles.availDot,
                  { backgroundColor: donor.isAvailable ? '#16A34A' : '#94A3B8' },
                ]}
              />
              <Text
                style={[
                  styles.availText,
                  { color: donor.isAvailable ? '#15803D' : '#64748B' },
                ]}>
                {donor.isAvailable ? 'রক্তদানে প্রস্তুত' : 'বিশ্রাম কাল'}
              </Text>
            </View>
          </View>
        </View>

        {/* Compact Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.callBtn}
            activeOpacity={0.8}
            onPress={handleCall}>
            <Ionicons name="call" size={12} color="#FFFFFF" />
            <Text style={styles.callBtnText}>কল</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.smsBtn}
            activeOpacity={0.8}
            onPress={handleSms}>
            <Ionicons name="chatbubble-ellipses-outline" size={13} color="#0284C7" />
          </TouchableOpacity>
        </View>
      </View>

      {/* JU Dept & Hall Details */}
      <View style={styles.infoStrip}>
        <View style={styles.infoCol}>
          <Ionicons name="school-outline" size={12} color="#64748B" />
          <Text style={styles.infoText} numberOfLines={1}>
            {donor.departmentOrOffice}
          </Text>
        </View>

        <View style={styles.infoCol}>
          <Ionicons name="location-outline" size={12} color="#64748B" />
          <Text style={styles.infoText} numberOfLines={1}>
            {donor.hallOrResidence}
          </Text>
        </View>
      </View>

      {/* Footer Stats */}
      <View style={styles.footerRow}>
        <Text style={styles.footerStat}>
          মোট রক্তদান: <Text style={styles.statBold}>{donor.totalDonations} বার</Text>
        </Text>
        <Text style={styles.footerStat}>
          সর্বশেষ: {donor.lastDonationDate}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaCol: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  donorName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  availPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
  },
  availDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  availText: {
    fontSize: 9,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DC2626',
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 7,
    justifyContent: 'center',
  },
  callBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  smsBtn: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#F0F9FF',
    borderWidth: 0.8,
    borderColor: '#BAE6FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  infoCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  infoText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#475569',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  footerStat: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
  },
  statBold: {
    color: '#DC2626',
    fontWeight: '800',
  },
});
