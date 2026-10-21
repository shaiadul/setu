import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, ImageSource } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  LayoutChangeEvent,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export interface GallerySlide {
  id: string;
  image: ImageSource;
  badge: string;
  badgeIcon: keyof typeof MaterialCommunityIcons.glyphMap;
  badgeColor: string;
  title: string;
  subtitle: string;
  location: string;
  ctaText: string;
  ctaIcon: keyof typeof Ionicons.glyphMap;
  action: () => void;
}

const GALLERY_SLIDES: GallerySlide[] = [
  {
    id: "camp",
    image: require("../../assets/images/gallery/camp.jpg"),
    badge: "বার্ষিক রক্তদান ক্যাম্প ২০২৬",
    badgeIcon: "calendar-heart",
    badgeColor: "#E11D48",
    title: "জাহাঙ্গীরনগর বিশ্ববিদ্যালয় রক্তদান উৎসব",
    subtitle:
      "বাঁধন ও রেড ক্রিসেন্টের যৌথ ক্যাম্পেইনে অংশ নিয়ে মুমূর্ষু রোগীর পাশে দাঁড়ান।",
    location: "টিএসসি ক্যাফেটেরিয়া • সকাল ৯টা - বিকাল ৫টা",
    ctaText: "ক্যাম্পেইন দেখুন",
    ctaIcon: "arrow-forward",
    action: () => router.push("/drives"),
  },
  {
    id: "emergency",
    image: require("../../assets/images/gallery/emergency.jpg"),
    badge: "জরুরি কোড রেড রেসপন্স",
    badgeIcon: "ambulance",
    badgeColor: "#DC2626",
    title: "তাৎক্ষণিক রক্তের অনুরোধ ও ডেলিভারি",
    subtitle:
      "এনাম মেডিকেল ও সাভারের ক্লিনিকে জরুরি রক্তের প্রয়োজনে তাৎক্ষণিক নোটিফিকেশন।",
    location: "এনাম মেডিকেল ও ক্যাম্পাস এলাকা • ২৪/৭ সাপোর্ট",
    ctaText: "অনুরোধ করুন",
    ctaIcon: "flash",
    action: () => router.push("/request"),
  },
  {
    id: "volunteers",
    image: require("../../assets/images/gallery/volunteers.jpg"),
    badge: "জাবি স্বেচ্ছাসেবী নেটওয়ার্ক",
    badgeIcon: "account-group",
    badgeColor: "#0284C7",
    title: "৫০০+ নিবন্ধিত রক্তদাতা শিক্ষার্থী ও শিক্ষক",
    subtitle:
      "সকল ১৬টি হল ও অনুষদের প্রস্তুত রক্তদাতাদের ডিরেক্টরি থেকে সরাসরি যোগাযোগ।",
    location: "সকল হল ও বিভাগ • সেতু নেটওয়ার্ক",
    ctaText: "ডোনার খুঁজুন",
    ctaIcon: "search",
    action: () => router.push("/drives"),
  },
  {
    id: "donor",
    image: require("../../assets/images/gallery/donor.jpg"),
    badge: "ডোনার অনুপ্রেরণা",
    badgeIcon: "heart-pulse",
    badgeColor: "#16A34A",
    title: "“আপনার এক ব্যাগ রক্ত, একটি পরিবারের নতুন হাসি”",
    subtitle:
      "নিয়মিত রক্তদানে সুস্থ থাকুন এবং অর্জন করুন ডিজিটাল রক্তদাতা পাসপোর্ট।",
    location: "জাবি মেডিকেল সেন্টার • ৯০০+ সফল রক্তদান",
    ctaText: "ডোনার প্রোফাইল",
    ctaIcon: "card-outline",
    action: () => router.push("/profile"),
  },
];

const BN_NUMERALS = ["১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
const toBnNumber = (n: number) => {
  return n
    .toString()
    .split("")
    .map((ch) => {
      const idx = parseInt(ch, 10);
      return !isNaN(idx) && idx > 0
        ? BN_NUMERALS[idx - 1]
        : ch === "0"
          ? "০"
          : ch;
    })
    .join("");
};

interface FeedBannerSliderProps {
  slides?: GallerySlide[];
}

export function FeedBannerSlider({
  slides = GALLERY_SLIDES,
}: FeedBannerSliderProps) {
  const [containerWidth, setContainerWidth] = useState(() => {
    const screenWidth = Dimensions.get("window").width;
    return Math.max(screenWidth - 28, 300);
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const userTouchingRef = useRef(false);

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const width = e.nativeEvent.layout.width;
      if (width > 0 && Math.abs(width - containerWidth) > 2) {
        setContainerWidth(width);
      }
    },
    [containerWidth],
  );

  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      if (userTouchingRef.current || isInteracting || fullscreenVisible) return;

      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % slides.length;
        flatListRef.current?.scrollToOffset({
          offset: nextIndex * containerWidth,
          animated: true,
        });
        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [containerWidth, fullscreenVisible, isInteracting, slides.length]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    if (containerWidth > 0) {
      const index = Math.round(offsetX / containerWidth);
      if (index >= 0 && index < slides.length && index !== activeIndex) {
        setActiveIndex(index);
      }
    }
  };

  const handleScrollBeginDrag = () => {
    userTouchingRef.current = true;
    setIsInteracting(true);
  };

  const handleScrollEndDrag = () => {
    setTimeout(() => {
      userTouchingRef.current = false;
      setIsInteracting(false);
    }, 1500);
  };

  const scrollToIndex = (index: number) => {
    if (index >= 0 && index < slides.length) {
      flatListRef.current?.scrollToOffset({
        offset: index * containerWidth,
        animated: true,
      });
      setActiveIndex(index);
    }
  };

  const goToPrevious = () => {
    const prev = activeIndex === 0 ? slides.length - 1 : activeIndex - 1;
    scrollToIndex(prev);
  };

  const goToNext = () => {
    const next = (activeIndex + 1) % slides.length;
    scrollToIndex(next);
  };

  const currentSlide = slides[activeIndex] || slides[0];

  const renderSlideItem = ({ item }: { item: GallerySlide }) => {
    return (
      <View style={[styles.slideContainer, { width: containerWidth }]}>
        <View style={styles.cardWrapper}>
          {/* Main Photo Banner */}
          <Image
            source={item.image}
            style={styles.slideImage}
            contentFit="cover"
            transition={300}
          />

          <LinearGradient
            colors={["rgba(0,0,0,0.65)", "rgba(0,0,0,0.1)", "transparent"]}
            style={styles.topScrim}
          />

          <LinearGradient
            colors={[
              "transparent",
              "rgba(15, 23, 42, 0.45)",
              "rgba(15, 23, 42, 0.88)",
              "rgba(15, 23, 42, 0.98)",
            ]}
            locations={[0, 0.35, 0.72, 1]}
            style={styles.bottomScrim}
          />

          <View style={styles.topRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setFullscreenVisible(true)}
              style={styles.fullscreenBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="expand" size={15} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Content Body at bottom */}
          <View style={styles.contentBody}>
            <View style={styles.actionRow}>
              {/* Location & Time Pin on bottom-left */}
              <View style={styles.locationRow}>
                <Ionicons name="location-sharp" size={12} color="#F43F5E" />
                <Text style={styles.locationText} numberOfLines={1}>
                  {item.location}
                </Text>
              </View>

              {/* Only Navigation Arrows on bottom-right */}
              <View style={styles.navigationArrows}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={goToPrevious}
                  style={styles.navArrowBtn}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Ionicons name="chevron-back" size={14} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={goToNext}
                  style={styles.navArrowBtn}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.wrapper} onLayout={onLayout}>
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        renderItem={renderSlideItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        decelerationRate="fast"
        snapToInterval={containerWidth}
        snapToAlignment="start"
        bounces={false}
      />

      {/* Pagination Dot Indicator */}
      <View style={styles.paginationTrack}>
        {slides.map((_, idx) => {
          const isActive = idx === activeIndex;
          return (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.8}
              onPress={() => scrollToIndex(idx)}
              style={[
                styles.dot,
                isActive ? styles.dotActive : styles.dotInactive,
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            />
          );
        })}
      </View>

      {/* Lightbox / Fullscreen Image Viewer Modal (Light Theme) */}
      <Modal
        visible={fullscreenVisible}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setFullscreenVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalCounter}>
              <Ionicons name="images-outline" size={13} color="#64748B" />
              <Text style={styles.modalCounterText}>
                {toBnNumber(activeIndex + 1)} / {toBnNumber(slides.length)}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setFullscreenVisible(false)}
              style={styles.modalCloseBtn}
            >
              <Ionicons name="close" size={20} color="#0F172A" />
            </TouchableOpacity>
          </View>

          {/* Fullscreen Photo with Navigation */}
          <View style={styles.modalImageContainer}>
            <Image
              source={currentSlide.image}
              style={styles.modalImage}
              contentFit="contain"
            />
            {/* Modal Floating Prev & Next Arrows */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={goToPrevious}
              style={[styles.modalNavBtn, styles.modalNavBtnLeft]}
            >
              <Ionicons name="chevron-back" size={20} color="#0F172A" />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={goToNext}
              style={[styles.modalNavBtn, styles.modalNavBtnRight]}
            >
              <Ionicons name="chevron-forward" size={20} color="#0F172A" />
            </TouchableOpacity>
          </View>

          {/* Modal Bottom Caption Card */}
          <View style={styles.modalCaptionCard}>
            <View style={styles.modalLocationRow}>
              <Ionicons name="location-sharp" size={14} color="#BE123C" />
              <Text style={styles.modalLocationText}>
                {currentSlide.location}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => {
                setFullscreenVisible(false);
                currentSlide.action();
              }}
              style={styles.modalCtaBtn}
            >
              <Text style={styles.modalCtaText}>{currentSlide.ctaText}</Text>
              <Ionicons name={currentSlide.ctaIcon} size={15} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    marginBottom: 4,
  },
  galleryHeaderBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  galleryTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  galleryLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#BE123C",
  },
  galleryHeading: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  galleryTapHint: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748B",
  },
  slideContainer: {
    paddingHorizontal: 0,
  },
  cardWrapper: {
    height: 220,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#0F172A",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  slideImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
  topScrim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 65,
  },
  bottomScrim: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
  },
  topRow: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    zIndex: 2,
  },
  fullscreenBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    ...Platform.select({
      web: { cursor: "pointer" },
    }),
  },
  contentBody: {
    position: "absolute",
    bottom: 8,
    left: 12,
    right: 12,
    zIndex: 2,
  },
  locationRow: {
    flex: 1,
    marginRight: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FEF08A",
    textShadowColor: "rgba(0, 0, 0, 0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  navigationArrows: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  navArrowBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.8,
    borderColor: "rgba(255, 255, 255, 0.3)",
    ...Platform.select({
      web: { cursor: "pointer" },
    }),
  },
  paginationTrack: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  dot: {
    height: 4,
    borderRadius: 2,
    ...Platform.select({
      web: { cursor: "pointer" },
    }),
  },
  dotActive: {
    width: 20,
    backgroundColor: "#BE123C",
  },
  dotInactive: {
    width: 6,
    backgroundColor: "#CBD5E1",
  },

  /* Lightbox Modal (Light Theme) */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "space-between",
    paddingVertical: 36,
    paddingHorizontal: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? 8 : 0,
  },
  modalCounter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FFFFFF",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  modalCounterText: {
    color: "#0F172A",
    fontWeight: "800",
    fontSize: 12,
  },
  modalCloseBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    ...Platform.select({
      web: { cursor: "pointer" },
    }),
  },
  modalImageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 14,
    position: "relative",
  },
  modalImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  modalNavBtn: {
    position: "absolute",
    top: "50%",
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
    ...Platform.select({
      web: { cursor: "pointer" },
    }),
  },
  modalNavBtnLeft: {
    left: 8,
  },
  modalNavBtnRight: {
    right: 8,
  },
  modalCaptionCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 8,
  },
  modalLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  modalLocationText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
  modalCtaBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#BE123C",
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
    ...Platform.select({
      web: { cursor: "pointer" },
    }),
  },
  modalCtaText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
  },
});
