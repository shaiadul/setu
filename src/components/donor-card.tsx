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
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      {/* Top Details */}
      <View style={styles.cardHeader}>
        <BloodGroupBadge bloodType={donor.bloodType} size="sm" highlightUniversal />

        <View style={styles.metaCol}>
          <View style={styles.nameRow}>
            <Text style={[styles.donorName, { color: theme.text }]} numberOfLines={1}>
              {donor.name}
            </Text>
            {donor.verifiedJu && (
              <Ionicons name="checkmark-circle" size={15} color={theme.secondary} />
            )}
          </View>

          <View style={styles.badgeRow}>
            <JuBadge role={donor.role} size="sm" />
            <View
              style={[
                styles.availPill,
                {
                  backgroundColor: donor.isAvailable ? theme.successLight : theme.backgroundElement,
                  borderColor: donor.isAvailable ? theme.success : theme.cardBorder,
                },
              ]}>
              <View
                style={[
                  styles.availDot,
                  { backgroundColor: donor.isAvailable ? theme.success : theme.textSecondary },
                ]}
              />
              <Text
                style={[
                  styles.availText,
                  { color: donor.isAvailable ? theme.success : theme.textSecondary },
                ]}>
                {donor.isAvailable ? 'প্রস্তুত' : 'বিশ্রাম কাল'}
              </Text>
            </View>
          </View>
        </View>

        {/* Contact Actions */}
        <View style={styles.actionCol}>
          <TouchableOpacity
            style={[styles.callBtn, { backgroundColor: theme.primary }]}
            activeOpacity={0.8}
            onPress={handleCall}>
            <Ionicons name="call" size={14} color="#FFFFFF" />
            <Text style={styles.callBtnText}>কল</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.smsBtn, { backgroundColor: theme.secondaryLight, borderColor: theme.secondary }]}
            activeOpacity={0.8}
            onPress={handleSms}>
            <Ionicons name="chatbubble-outline" size={14} color={theme.secondaryDark} />
          </TouchableOpacity>
        </View>
      </View>

      {/* JU Details */}
      <View style={[styles.infoRow, { backgroundColor: theme.backgroundElement }]}>
        <View style={styles.infoItem}>
          <Ionicons name="business-outline" size={12} color={theme.textSecondary} />
          <Text style={[styles.infoItemText, { color: theme.textSecondary }]} numberOfLines={1}>
            {donor.departmentOrOffice}
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="location-outline" size={12} color={theme.textSecondary} />
          <Text style={[styles.infoItemText, { color: theme.textSecondary }]} numberOfLines={1}>
            {donor.hallOrResidence}
          </Text>
        </View>
      </View>

      {/* Footer Stats */}
      <View style={styles.footerRow}>
        <Text style={[styles.footerStat, { color: theme.textSecondary }]}>
          মোট রক্তদান: <Text style={{ color: theme.primary, fontWeight: '800' }}>{donor.totalDonations} বার</Text>
        </Text>
        <Text style={[styles.footerStat, { color: theme.textSecondary }]}>
          সর্বশেষ: {donor.lastDonationDate}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
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
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  donorName: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  availPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  availDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  availText: {
    fontSize: 10,
    fontWeight: '700',
  },
  actionCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  callBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  smsBtn: {
    padding: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  infoRow: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoItemText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  footerStat: {
    fontSize: 11,
    fontWeight: '500',
  },
});
