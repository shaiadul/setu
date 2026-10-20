import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSliderProps {
  visible: boolean;
  onFinish: () => void;
}

interface SlideItem {
  id: string;
  badge: string;
  titleBn: string;
  titleEn: string;
  descBn: string;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  highlights: Array<{ icon: keyof typeof Ionicons.glyphMap; text: string }>;
}

const SLIDES: SlideItem[] = [
  {
    id: 'slide-1',
    badge: 'জাবি রক্তদান সেতু',
    titleBn: 'সেতু — রক্তের বন্ধনে জাহাঙ্গীরনগর',
    titleEn: 'JU Student, Teacher & Staff Blood Network',
    descBn: 'জাহাঙ্গীরনগর বিশ্ববিদ্যালয়ের শিক্ষার্থী, শিক্ষক ও কর্মকর্তা-কর্মচারীদের রক্তের প্রয়োজনে এক মানবিক ও বিশ্বস্ত ডিজিটাল প্ল্যাটফর্ম।',
    iconName: 'hand-heart',
    highlights: [
      { icon: 'school-outline', text: 'শিক্ষার্থী, শিক্ষক ও কর্মচারীদের ভেরিফাইড প্রোফাইল' },
      { icon: 'medkit-outline', text: 'জাবি মেডিকেল সেন্টার ও এনাম মেডিকেলে দ্রুত সংযোগ' },
      { icon: 'shield-checkmark-outline', text: 'নিরাপদ ও নির্ভরযোগ্য রক্তদাতা নেটওয়ার্ক' },
    ],
  },
  {
    id: 'slide-2',
    badge: 'জরুরি ইমার্জেন্সি এসওএস',
    titleBn: 'তাৎক্ষণিক রক্তের অনুরোধ ও লাইভ ট্র্যাকিং',
    titleEn: 'Instant SOS Request & Live Responder Tracking',
    descBn: 'জরুরি প্রয়োজনে এক ক্লিকে রক্তের অনুরোধ পাঠান। ডোনার কখন রওনা হয়েছে বা পৌঁছেছে তা সরাসরি ট্র্যাক করুন।',
    iconName: 'map-marker-distance',
    highlights: [
      { icon: 'flash-outline', text: 'কোড রেড তাৎক্ষণিক ক্যাম্পাস এলার্ট' },
      { icon: 'navigate-outline', text: 'ডোনার স্ট্যাটাস ট্র্যাকিং (রওনা / পৌঁছেছি)' },
      { icon: 'call-outline', text: 'ওয়ান-ট্যাপে সরাসরি ফোন ও যোগাযোগ' },
    ],
  },
  {
    id: 'slide-3',
    badge: 'ডিজিটাল ডোনার পাসপোর্ট',
    titleBn: 'স্মার্ট ডোনার প্রোফাইল ও ডিরেক্টরি',
    titleEn: 'Digital Donor Passport & Verified Directory',
    descBn: 'আপনার রক্তের গ্রুপ, পূর্ববর্তী রক্তদানের রেকর্ড এবং পরবর্তী রক্তদানের যোগ্যতার হিসাব এক নজরে রাখুন।',
    iconName: 'card-account-details-outline',
    highlights: [
      { icon: 'id-card-outline', text: 'বিশ্ববিদ্যালয় ভেরিফাইড ডিজিটাল ডোনার কার্ড' },
      { icon: 'time-outline', text: '৯০ দিনের বিরতি ও স্বাস্থ্য সচেতনতা ট্র্যাকার' },
      { icon: 'search-outline', text: 'ব্লাড গ্রুপ ও বিভাগ অনুযায়ী ডোনার সার্চ' },
    ],
  },
];

export function OnboardingSlider({ visible, onFinish }: OnboardingSliderProps) {
  const theme = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  if (!visible) return null;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== currentIndex && index >= 0 && index < SLIDES.length) {
      setCurrentIndex(index);
    }
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      onFinish();
    }
  };

  const renderSlide = ({ item }: { item: SlideItem }) => (
    <View style={[styles.slideContainer, { width: SCREEN_WIDTH }]}>
      {/* Visual Feature Card */}
      <View style={[styles.illustrationCard, { backgroundColor: theme.primaryContainer, borderColor: theme.primaryLight }]}>
        <View style={[styles.iconHalo, { backgroundColor: '#FFFFFF' }]}>
          <MaterialCommunityIcons name={item.iconName} size={54} color={theme.primary} />
        </View>

        <View style={[styles.categoryPill, { backgroundColor: theme.primary }]}>
          <Text style={styles.categoryPillText}>{item.badge}</Text>
        </View>
      </View>

      {/* Typography Content */}
      <View style={styles.textContainer}>
        <Text style={[styles.slideTitleBn, { color: theme.text }]}>
          {item.titleBn}
        </Text>
        <Text style={[styles.slideTitleEn, { color: theme.primary }]}>
          {item.titleEn}
        </Text>
        <Text style={[styles.slideDesc, { color: theme.textSecondary }]}>
          {item.descBn}
        </Text>
      </View>

      {/* Highlights List */}
      <View style={styles.highlightsContainer}>
        {item.highlights.map((h, i) => (
          <View
            key={i}
            style={[styles.highlightRow, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={[styles.highlightIconBox, { backgroundColor: theme.backgroundElement }]}>
              <Ionicons name={h.icon} size={15} color={theme.primary} />
            </View>
            <Text style={[styles.highlightText, { color: theme.text }]}>{h.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="fade" transparent={false} onRequestClose={onFinish}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Top Header Bar */}
        <View style={styles.topHeader}>
          {/* Brand Logo & Name */}
          <View style={styles.logoRow}>
            <View style={[styles.logoBadge, { backgroundColor: theme.primary }]}>
              <MaterialCommunityIcons name="water" size={18} color="#FFFFFF" />
            </View>
            <View>
              <Text style={[styles.brandBn, { color: theme.primary }]}>সেতু</Text>
              <Text style={[styles.brandSub, { color: theme.textSecondary }]}>JU Blood Bridge</Text>
            </View>
          </View>

          {/* Skip Button */}
          <TouchableOpacity style={styles.skipButton} activeOpacity={0.7} onPress={onFinish}>
            <Text style={[styles.skipText, { color: theme.textSecondary }]}>বাদ দিন (Skip)</Text>
          </TouchableOpacity>
        </View>

        {/* 3 Slider Content */}
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          keyExtractor={item => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          renderItem={renderSlide}
          style={styles.sliderList}
        />

        {/* Bottom Pagination & Action Buttons */}
        <View style={styles.bottomBar}>
          {/* Pagination Dots */}
          <View style={styles.dotsContainer}>
            {SLIDES.map((_, index) => {
              const isActive = index === currentIndex;
              return (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: isActive ? theme.primary : theme.cardBorder,
                      width: isActive ? 24 : 8,
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Action Row */}
          <View style={styles.actionRow}>
            {currentIndex > 0 ? (
              <TouchableOpacity
                style={[styles.backBtn, { borderColor: theme.cardBorder }]}
                activeOpacity={0.7}
                onPress={() => {
                  const prev = currentIndex - 1;
                  flatListRef.current?.scrollToIndex({ index: prev, animated: true });
                  setCurrentIndex(prev);
                }}>
                <Ionicons name="arrow-back" size={18} color={theme.text} />
                <Text style={[styles.backBtnText, { color: theme.text }]}>পূর্ববর্তী</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ width: 80 }} />
            )}

            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: theme.primary }]}
              activeOpacity={0.88}
              onPress={handleNext}>
              <Text style={styles.nextBtnText}>
                {currentIndex === SLIDES.length - 1 ? 'সেতুতে প্রবেশ করুন' : 'পরবর্তী ধাপ'}
              </Text>
              <Ionicons
                name={currentIndex === SLIDES.length - 1 ? 'checkmark-circle' : 'arrow-forward'}
                size={18}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandBn: {
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 28,
    letterSpacing: 0.5,
  },
  brandSub: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  skipButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sliderList: {
    flex: 1,
  },
  slideContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  illustrationCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    borderRadius: 24,
    borderWidth: 1.5,
    marginBottom: 24,
    position: 'relative',
  },
  iconHalo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  categoryPill: {
    position: 'absolute',
    bottom: -12,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  textContainer: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  slideTitleBn: {
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 30,
    marginBottom: 4,
  },
  slideTitleEn: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  slideDesc: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
  },
  highlightsContainer: {
    gap: 8,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  highlightIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  nextBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
