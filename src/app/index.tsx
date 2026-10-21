import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CampusHeader } from "@/components/campus-header";
import { FeedBannerSlider } from "@/components/feed-banner-slider";
import { JuBadge } from "@/components/ju-badge";
import { RequestTrackingModal } from "@/components/request-tracking-modal";
import { useBlood } from "@/context/blood-context";
import { BloodGroup, BloodRequest, JuRole } from "@/types/blood";
import { LinearGradient } from "expo-linear-gradient";
import { BrandGradient } from "@/constants/theme";

const BLOOD_GROUPS: BloodGroup[] = [
  "O-",
  "O+",
  "A-",
  "A+",
  "B-",
  "B+",
  "AB-",
  "AB+",
];

const CASE_TYPE_LABELS: Record<string, string> = {
  "Trauma / Accident": "দুর্ঘটনা / ট্রমা",
  "Emergency Surgery": "জরুরি সার্জারি",
  "Thalassemia": "থ্যালাসেমিয়া",
  "Dengue Platelets": "ডেঙ্গু প্লাটিলেট",
  "Maternity": "প্রসূতি / সিজার",
  "ICU Critical": "আইসিইউ ক্রিটিক্যাল",
};

const WEEKLY_IMPACT_DATA = [
  { day: "শনি", bags: 3, heightPercent: 45, isPeak: false },
  { day: "রবি", bags: 6, heightPercent: 75, isPeak: false },
  { day: "সোম", bags: 4, heightPercent: 55, isPeak: false },
  { day: "মঙ্গল", bags: 8, heightPercent: 100, isPeak: true },
  { day: "বুধ", bags: 5, heightPercent: 65, isPeak: false },
  { day: "বৃহঃ", bags: 7, heightPercent: 88, isPeak: false },
  { day: "আজ", bags: 4, heightPercent: 60, isToday: true },
];

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const {
    requests,
    updateResponseStatus,
    selectedTrackingRequest,
    setSelectedTrackingRequest,
    refreshAll,
  } = useBlood();

  const [selectedBlood, setSelectedBlood] = useState<"all" | BloodGroup>("all");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  const getBloodGroupCount = (bg: BloodGroup) => {
    return requests.filter((r) => r.bloodType === bg).length;
  };

  const filteredRequests = requests.filter((req) => {
    if (selectedBlood !== "all" && req.bloodType !== selectedBlood) {
      return false;
    }
    return true;
  });

  const handleQuickRespond = (req: BloodRequest) => {
    if (req.userStatus === "en_route") {
      updateResponseStatus(req.id, "none");
      return;
    }
    updateResponseStatus(req.id, "en_route");
    if (Platform.OS !== "web") {
      Alert.alert(
        "🚑 রেসপন্স নিশ্চিত!",
        `আপনি ${req.hospital}-এর উদ্দেশ্যে রওনা হয়েছেন জানানো হয়েছে।`,
        [{ text: "ঠিক আছে" }],
      );
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert("কল ব্যর্থ", `ফোন নম্বর: ${phone}`);
    });
  };

  const handleShare = async (item: BloodRequest) => {
    const text = `🚨 [সেতু - জাহাঙ্গীরনগর বিশ্ববিদ্যালয় রক্তদান হাব]\nজরুরি রক্তের অনুরোধ!\nগ্রুপ: ${item.bloodType} (${item.requiredUnits} ব্যাগ)\nরোগী: ${item.patientName}\nহাসপাতাল: ${item.hospital} (${item.distance})\nযোগাযোগ: ${item.contactNumber}\nঅনুরোধকারী: ${item.requesterDepartment}\n\nদয়া করে রক্তদানে এগিয়ে আসুন অথবা শেয়ার করুন।`;
    try {
      if (Platform.OS === "web") {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(text);
          Alert.alert("কপি হয়েছে", "রক্তের অনুরোধ ক্লিপবোর্ডে কপি করা হয়েছে।");
        }
      } else {
        await Share.share({ message: text });
      }
    } catch {
      // Ignored
    }
  };

  const bottomPadding = 56 + Math.max(insets.bottom, 12);

  const urgencyColor = (u: string) => {
    if (u === "Code Red") {
      return {
        bg: "#FFF1F2",
        text: "#BE123C",
        dot: "#BE123C",
        border: "#FECDD3",
      };
    }
    if (u === "Urgent") {
      return {
        bg: "#FFFBEB",
        text: "#D97706",
        dot: "#F59E0B",
        border: "#FDE68A",
      };
    }
    return {
      bg: "#F0F9FF",
      text: "#0284C7",
      dot: "#0EA5E9",
      border: "#BAE6FD",
    };
  };

  const renderHeader = () => (
    <View style={styles.headerBlock}>
      {/* Dynamic Featured Campaign & Awareness Banner Slider */}
      <FeedBannerSlider />

      {/* Inspiring Campus Blood Impact & Weekly Graph Hero Card */}
      <View style={styles.impactCard}>
        {/* Header with Quote & Life Count */}
        <View style={styles.impactTopRow}>
          <View style={styles.impactTitleCol}>
            <View style={styles.impactLiveBadge}>
              <View style={styles.impactDot} />
              <Text style={styles.impactLiveText}>
                ক্যাম্পাস রক্তদান প্রভাব
              </Text>
            </View>
            <Text style={styles.impactQuoteText}>
              “আপনার এক ব্যাগ রক্ত, মুমূর্ষু মুখে হাসি”
            </Text>
          </View>

          <TouchableOpacity
            style={styles.heroActionBtn}
            activeOpacity={0.8}
            onPress={() => router.push("/drives")}
          >
            <Ionicons name="calendar-outline" size={13} color="#BE123C" />
          </TouchableOpacity>
        </View>

        {/* Weekly Donation Bar Graph */}
        <View style={styles.graphContainer}>
          <View style={styles.graphHeader}>
            <Text style={styles.graphSubtitle}>
              এই সপ্তাহে <Text style={styles.graphHighlight}>৩৭ ব্যাগ</Text> •
              ৯৮ জন উপকৃত
            </Text>
            <View style={styles.peakIndicator}>
              <Ionicons name="trending-up" size={12} color="#16A34A" />
              <Text style={styles.peakText}>+২৪%</Text>
            </View>
          </View>

          {/* Bars */}
          <View style={styles.barsRow}>
            {WEEKLY_IMPACT_DATA.map((item, index) => {
              const isActiveToday = item.isToday;
              return (
                <View key={index} style={styles.barCol}>
                  <Text
                    style={[
                      styles.barBagsLabel,
                      isActiveToday && styles.barBagsLabelActive,
                    ]}
                  >
                    {item.bags}
                  </Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { height: `${item.heightPercent}%` },
                        isActiveToday
                          ? styles.barFillToday
                          : item.isPeak
                            ? styles.barFillPeak
                            : styles.barFillNormal,
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.barDayText,
                      isActiveToday && styles.barDayTextActive,
                    ]}
                  >
                    {item.day}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Quick Stock Status Strip */}
        <View style={styles.stockNoticeRow}>
          <View style={styles.stockNoticeLeft}>
            <MaterialCommunityIcons
              name="water-alert-outline"
              size={15}
              color="#BE123C"
            />
            <Text style={styles.stockNoticeText}>
              জরুরি রক্তের প্রয়োজন:{" "}
              <Text style={styles.stockHighlight}>O- এবং B-</Text>
            </Text>
          </View>
          <Text style={styles.stockSpeedText}>⚡ গড় সাড়া ৮ মি.</Text>
        </View>
      </View>

      {/* Modern Blood Group Filter Section */}
      <View style={styles.bloodSectionContainer}>
        <View style={styles.bloodSectionHeader}>
          <View style={styles.bloodHeaderTitleRow}>
            <MaterialCommunityIcons name="water" size={15} color="#BE123C" />
            <Text style={styles.bloodSectionTitle}>রক্তের গ্রুপ নির্বাচন</Text>
            {selectedBlood !== "all" && (
              <View style={styles.selectedPillBadge}>
                <Text style={styles.selectedPillText}>{selectedBlood}</Text>
              </View>
            )}
          </View>

          {selectedBlood !== "all" ? (
            <Pressable
              onPress={() => setSelectedBlood("all")}
              style={({ pressed }) => [
                styles.clearFilterBtn,
                pressed && styles.clearFilterBtnPressed,
              ]}
            >
              <Ionicons name="close-circle" size={11} color="#BE123C" />
              <Text style={styles.clearFilterText}>সব দেখুন</Text>
            </Pressable>
          ) : (
            <Text style={styles.allCountText}>মোট {requests.length}টি সক্রিয় অনুরোধ</Text>
          )}
        </View>

        {/* Modern Blood Tokens Horizontal Track */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.bloodCardsScrollTrack}
        >
          {/* "All" Card */}
          <TouchableOpacity
            style={[
              styles.bloodCard,
              selectedBlood === "all" && styles.bloodCardActiveWrapper,
            ]}
            activeOpacity={0.8}
            onPress={() => setSelectedBlood("all")}
          >
            {selectedBlood === "all" ? (
              <LinearGradient
                colors={BrandGradient.colors}
                start={BrandGradient.start}
                end={BrandGradient.end}
                style={styles.bloodCardGradient}
              >
                <View style={styles.bloodCardIconWrap}>
                  <MaterialCommunityIcons
                    name="water-outline"
                    size={13}
                    color="#FFFFFF"
                  />
                </View>
                <Text style={[styles.bloodCardLabel, styles.bloodCardLabelActive]}>
                  সব
                </Text>
                <View style={[styles.cardBadge, styles.cardBadgeActive]}>
                  <Text style={[styles.cardBadgeText, styles.cardBadgeTextActive]}>
                    {requests.length}
                  </Text>
                </View>
              </LinearGradient>
            ) : (
              <>
                <View style={styles.bloodCardIconWrap}>
                  <MaterialCommunityIcons
                    name="water-outline"
                    size={13}
                    color="#64748B"
                  />
                </View>
                <Text style={styles.bloodCardLabel}>সব</Text>
                <View style={[styles.cardBadge, styles.cardBadgeNeutral]}>
                  <Text style={styles.cardBadgeText}>{requests.length}</Text>
                </View>
              </>
            )}
          </TouchableOpacity>

          {/* Individual Blood Group Cards */}
          {BLOOD_GROUPS.map((bg) => {
            const isSel = selectedBlood === bg;
            const count = getBloodGroupCount(bg);
            const hasRequests = count > 0;

            return (
              <TouchableOpacity
                key={bg}
                style={[
                  styles.bloodCard,
                  isSel && styles.bloodCardActiveWrapper,
                  !isSel && hasRequests && styles.bloodCardHasRequests,
                ]}
                activeOpacity={0.8}
                onPress={() => setSelectedBlood(isSel ? "all" : bg)}
              >
                {isSel ? (
                  <LinearGradient
                    colors={BrandGradient.colors}
                    start={BrandGradient.start}
                    end={BrandGradient.end}
                    style={styles.bloodCardGradient}
                  >
                    <View style={styles.bloodCardIconWrap}>
                      <MaterialCommunityIcons
                        name="water"
                        size={12}
                        color="#FFFFFF"
                      />
                    </View>
                    <Text style={[styles.bloodCardLabel, styles.bloodCardLabelActive]}>
                      {bg}
                    </Text>
                    <View style={[styles.cardBadge, styles.cardBadgeActive]}>
                      <Text style={[styles.cardBadgeText, styles.cardBadgeTextActive]}>
                        {count > 0 ? `${count}টি` : "০"}
                      </Text>
                    </View>
                  </LinearGradient>
                ) : (
                  <>
                    <View style={styles.bloodCardIconWrap}>
                      <MaterialCommunityIcons
                        name="water"
                        size={12}
                        color={hasRequests ? "#BE123C" : "#94A3B8"}
                      />
                    </View>
                    <Text style={styles.bloodCardLabel}>{bg}</Text>
                    <View
                      style={[
                        styles.cardBadge,
                        hasRequests ? styles.cardBadgeUrgent : styles.cardBadgeMuted,
                      ]}
                    >
                      <Text
                        style={[
                          styles.cardBadgeText,
                          hasRequests && styles.cardBadgeTextUrgent,
                        ]}
                      >
                        {count > 0 ? `${count}টি` : "০"}
                      </Text>
                    </View>
                  </>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: BloodRequest }) => {
    const isCodeRed = item.urgency === "Code Red";
    const isEnRoute = item.userStatus === "en_route";
    const uc = urgencyColor(item.urgency);
    const caseLabel = item.caseType
      ? CASE_TYPE_LABELS[item.caseType] || item.caseType
      : null;

    return (
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => setSelectedTrackingRequest(item)}
        style={[styles.feedCard, isCodeRed && styles.feedCardCodeRed]}
      >
        {/* Urgency Highlight Left Border */}
        <View style={[styles.cardUrgencyStrip, { backgroundColor: uc.dot }]} />

        <View style={styles.cardContent}>
          {/* Card Top: Blood group hero badge + Identity & Case + Urgency pill */}
          <View style={styles.cardTopRow}>
            {/* Blood Type Hero Pill */}
            <View
              style={[
                styles.bloodBadgeBox,
                { backgroundColor: uc.bg, borderColor: uc.border },
              ]}
            >
              <MaterialCommunityIcons name="water" size={13} color={uc.dot} />
              <Text style={[styles.bloodBadgeType, { color: uc.text }]}>
                {item.bloodType}
              </Text>
            </View>

            {/* Patient & Case Information */}
            <View style={styles.cardIdentityCol}>
              <View style={styles.patientTitleRow}>
                <Text style={styles.patientName} numberOfLines={1}>
                  {item.patientName}
                </Text>
                {caseLabel && (
                  <View style={styles.caseTypeBadge}>
                    <Text style={styles.caseTypeText} numberOfLines={1}>
                      {caseLabel}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.roleDeptRow}>
                <JuBadge role={item.requesterRole} size="sm" />
                <Text style={styles.deptLabel} numberOfLines={1}>
                  {item.requesterDepartment}
                </Text>
              </View>
            </View>

            {/* Urgency Badge & Time */}
            <View style={styles.metaTopRight}>
              <View
                style={[
                  styles.urgencyBadge,
                  { backgroundColor: uc.bg, borderColor: uc.border },
                ]}
              >
                <View
                  style={[styles.urgencyDot, { backgroundColor: uc.dot }]}
                />
                <Text style={[styles.urgencyLabel, { color: uc.text }]}>
                  {item.urgency === "Code Red"
                    ? "কোড রেড"
                    : item.urgency === "Urgent"
                      ? "জরুরি"
                      : "সাধারণ"}
                </Text>
              </View>
              <Text style={styles.timeAgoLabel}>{item.timeAgo}</Text>
            </View>
          </View>

          {/* Hospital, Room & Required Units Strip */}
          <View style={styles.locationStrip}>
            <View style={styles.locationInfoLeft}>
              <Ionicons name="location-sharp" size={13} color="#BE123C" />
              <Text style={styles.hospitalTitle} numberOfLines={1}>
                {item.hospital}
                {item.room ? ` • ${item.room}` : ""}
              </Text>
              <View style={styles.distanceBadge}>
                <Text style={styles.distanceText}>{item.distance}</Text>
              </View>
            </View>

            <View style={styles.unitsPill}>
              <MaterialCommunityIcons
                name="blood-bag"
                size={12}
                color="#BE123C"
              />
              <Text style={styles.unitsHighlight}>
                {item.requiredUnits} ব্যাগ
              </Text>
            </View>
          </View>

          {/* Bottom Row: Responder Avatar Pile & Tactile Action Buttons */}
          <View style={styles.cardActionRow}>
            <View style={styles.responderCol}>
              {item.respondersCount > 0 ? (
                <View style={styles.avatarCluster}>
                  <View style={styles.avatarStack}>
                    {[0, 1, 2]
                      .slice(0, Math.min(item.respondersCount, 3))
                      .map((i) => (
                        <View
                          key={i}
                          style={[
                            styles.miniAvatar,
                            {
                              marginLeft: i > 0 ? -5 : 0,
                              backgroundColor:
                                i === 0
                                  ? "#BE123C"
                                  : i === 1
                                    ? "#0284C7"
                                    : "#16A34A",
                            },
                          ]}
                        >
                          <Ionicons name="person" size={7} color="#FFFFFF" />
                        </View>
                      ))}
                  </View>
                  <Text style={styles.respondersText}>
                    {item.respondersCount} জন সাড়া দিয়েছেন
                  </Text>
                </View>
              ) : (
                <View style={styles.seekingRow}>
                  <View style={styles.seekingDot} />
                  <Text style={styles.seekingText}>ডোনার খোঁজা হচ্ছে...</Text>
                </View>
              )}
            </View>

            <View style={styles.actionButtonGroup}>
              {/* En-Route Action Pill Button */}
              <TouchableOpacity
                style={[
                  styles.respondPillBtn,
                  isEnRoute && styles.respondPillBtnActive,
                ]}
                activeOpacity={0.85}
                onPress={() => handleQuickRespond(item)}
              >
                {isEnRoute ? (
                  <>
                    <Ionicons
                      name="checkmark-circle"
                      size={13}
                      color="#16A34A"
                    />
                    <Text
                      style={[
                        styles.respondPillText,
                        styles.respondPillTextActive,
                      ]}
                    >
                      রওনা হয়েছি
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="flash" size={12} color="#FFFFFF" />
                    <Text style={styles.respondPillText}>এগিয়ে আসুন</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Call Button */}
              <TouchableOpacity
                style={styles.iconCircleAction}
                activeOpacity={0.8}
                onPress={() => handleCall(item.contactNumber)}
              >
                <Ionicons name="call" size={13} color="#15803D" />
              </TouchableOpacity>

              {/* Share Button */}
              <TouchableOpacity
                style={styles.iconCircleAction}
                activeOpacity={0.8}
                onPress={() => handleShare(item)}
              >
                <Ionicons
                  name="share-social-outline"
                  size={13}
                  color="#475569"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      <CampusHeader
        title="সেতু • রক্তের বন্ধন"
        subtitle="জাহাঙ্গীরনগর বিশ্ববিদ্যালয় ডোনার নেটওয়ার্ক"
        showQuickStats
      />

      <FlatList
        data={filteredRequests}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: bottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#BE123C"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <MaterialCommunityIcons
                name="water-off-outline"
                size={32}
                color="#CBD5E1"
              />
            </View>
            <Text style={styles.emptyTitle}>
              {selectedBlood === "all"
                ? "কোনো রক্তের অনুরোধ নেই"
                : `${selectedBlood} গ্রুপের কোনো অনুরোধ নেই`}
            </Text>
            <Text style={styles.emptySub}>
              {selectedBlood === "all"
                ? "বর্তমানে কোনো সক্রিয় রক্তের অনুরোধ নেই।"
                : `এই মুহূর্তে ${selectedBlood} গ্রুপের সক্রিয় কোনো রক্তের অনুরোধ নেই।`}
            </Text>
            {selectedBlood !== "all" && (
              <TouchableOpacity
                style={styles.emptyResetBtnTouch}
                onPress={() => setSelectedBlood("all")}
                activeOpacity={0.88}
              >
                <LinearGradient
                  colors={BrandGradient.colors}
                  start={BrandGradient.start}
                  end={BrandGradient.end}
                  style={styles.emptyResetBtn}
                >
                  <Ionicons name="refresh" size={13} color="#FFFFFF" />
                  <Text style={styles.emptyResetBtnText}>সকল রক্তের অনুরোধ দেখুন</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Floating Request Button with Brand Gradient */}
      <TouchableOpacity
        style={[styles.fabTouch, { bottom: bottomPadding + 10 }]}
        activeOpacity={0.88}
        onPress={() => router.push("/request")}
      >
        <LinearGradient
          colors={BrandGradient.colors}
          start={BrandGradient.start}
          end={BrandGradient.end}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={19} color="#FFFFFF" />
          <Text style={styles.fabText}>অনুরোধ</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Live Request Tracking Modal */}
      <RequestTrackingModal
        visible={!!selectedTrackingRequest}
        request={selectedTrackingRequest}
        onClose={() => setSelectedTrackingRequest(null)}
        onUpdateStatus={updateResponseStatus}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  listContent: {
    paddingHorizontal: 14,
    paddingTop: 10,
    gap: 10,
  },
  headerBlock: {
    gap: 10,
    marginBottom: 4,
  },
  impactCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 10,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  impactTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  impactTitleCol: {
    flex: 1,
    gap: 4,
  },
  impactLiveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  impactDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16A34A",
  },
  impactLiveText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#16A34A",
    letterSpacing: 0.2,
  },
  impactQuoteText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
    lineHeight: 16,
  },
  heroActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    height: 26,
    borderRadius: 6,
    backgroundColor: "#FFF1F2",
    borderWidth: 0.8,
    borderColor: "#FECDD3",
  },
  heroActionText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#BE123C",
  },
  graphContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  graphHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  graphSubtitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
  },
  graphHighlight: {
    color: "#BE123C",
    fontWeight: "800",
  },
  peakIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  peakText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#15803D",
  },
  barsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 68,
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  barCol: {
    alignItems: "center",
    gap: 3,
    flex: 1,
  },
  barBagsLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#94A3B8",
  },
  barBagsLabelActive: {
    color: "#BE123C",
    fontWeight: "900",
  },
  barTrack: {
    width: 14,
    height: 40,
    backgroundColor: "#E2E8F0",
    borderRadius: 7,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    borderRadius: 7,
  },
  barFillNormal: {
    backgroundColor: "#94A3B8",
  },
  barFillPeak: {
    backgroundColor: "#0284C7",
  },
  barFillToday: {
    backgroundColor: "#BE123C",
  },
  barDayText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#64748B",
  },
  barDayTextActive: {
    color: "#BE123C",
    fontWeight: "800",
  },
  stockNoticeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF1F2",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 7,
  },
  stockNoticeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  stockNoticeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#475569",
  },
  stockHighlight: {
    color: "#BE123C",
    fontWeight: "800",
  },
  stockSpeedText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#BE123C",
  },
  bloodSectionContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 10,
    gap: 8,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  bloodSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 24,
    minHeight: 24,
  },
  bloodHeaderTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 24,
  },
  bloodSectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1E293B",
  },
  selectedPillBadge: {
    backgroundColor: "#BE123C",
    paddingHorizontal: 5,
    height: 16,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedPillText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 11,
  },
  clearFilterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#FFF1F2",
    paddingHorizontal: 7,
    height: 20,
    borderRadius: 100,
    borderWidth: 0.8,
    borderColor: "#FECDD3",
    justifyContent: "center",
    ...Platform.select({
      web: {
        cursor: "pointer",
        transition: "all 0.15s ease",
      },
    }),
  },
  clearFilterBtnPressed: {
    transform: [{ scale: 0.92 }],
    opacity: 0.85,
  },
  clearFilterText: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#BE123C",
  },
  allCountText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748B",
    height: 20,
    lineHeight: 20,
  },
  bloodCardsScrollTrack: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  bloodCard: {
    width: 54,
    height: 62,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
    position: "relative",
    ...Platform.select({
      web: {
        cursor: "pointer",
        transition: "all 0.15s ease",
      },
    }),
  },
  bloodCardActiveWrapper: {
    borderWidth: 1,
    borderColor: "transparent",
    backgroundColor: "transparent",
    paddingVertical: 0,
    overflow: "hidden",
    shadowColor: "#881337",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  bloodCardGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  bloodCardActive: {
    backgroundColor: "#BE123C",
    borderColor: "#BE123C",
    shadowColor: "#881337",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  bloodCardHasRequests: {
    borderColor: "#FECDD3",
    backgroundColor: "#FFFFFF",
  },
  bloodCardIconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  bloodCardLabel: {
    fontSize: 13,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  bloodCardLabelActive: {
    color: "#FFFFFF",
  },
  cardBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBadgeNeutral: {
    backgroundColor: "#E2E8F0",
  },
  cardBadgeActive: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  cardBadgeUrgent: {
    backgroundColor: "#FEF2F2",
  },
  cardBadgeMuted: {
    backgroundColor: "#F1F5F9",
  },
  cardBadgeText: {
    fontSize: 9,
    fontWeight: "800",
  },
  cardBadgeTextActive: {
    color: "#FFFFFF",
  },
  cardBadgeTextUrgent: {
    color: "#BE123C",
  },
  cardBadgeTextMuted: {
    color: "#94A3B8",
  },
  feedCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  feedCardCodeRed: {
    borderColor: "#FECDD3",
    backgroundColor: "#FFFDFD",
  },
  cardUrgencyStrip: {
    width: 4,
  },
  cardContent: {
    flex: 1,
    padding: 12,
    gap: 8,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  bloodBadgeBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 1,
  },
  bloodBadgeType: {
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  cardIdentityCol: {
    flex: 1,
    justifyContent: "center",
    gap: 3,
  },
  patientTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  patientName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.2,
    maxWidth: 140,
  },
  caseTypeBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 0.6,
    borderColor: "#E2E8F0",
  },
  caseTypeText: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#475569",
  },
  roleDeptRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  deptLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748B",
    flex: 1,
  },
  metaTopRight: {
    alignItems: "flex-end",
    gap: 3,
  },
  urgencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 5,
    borderWidth: 0.8,
  },
  urgencyDot: {
    width: 4.5,
    height: 4.5,
    borderRadius: 2.5,
  },
  urgencyLabel: {
    fontSize: 9.5,
    fontWeight: "800",
  },
  timeAgoLabel: {
    fontSize: 9,
    fontWeight: "500",
    color: "#94A3B8",
  },
  locationStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
    borderWidth: 0.6,
    borderColor: "#F1F5F9",
  },
  locationInfoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flex: 1,
  },
  hospitalTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#334155",
    flex: 1,
  },
  distanceBadge: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  distanceText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#475569",
  },
  unitsPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#FFF1F2",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 0.6,
    borderColor: "#FECDD3",
  },
  unitsHighlight: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#BE123C",
  },
  cardActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: "#F1F5F9",
  },
  responderCol: {
    flex: 1,
  },
  avatarCluster: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  avatarStack: {
    flexDirection: "row",
    alignItems: "center",
  },
  miniAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  respondersText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#15803D",
  },
  seekingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seekingDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#94A3B8",
  },
  seekingText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#94A3B8",
  },
  actionButtonGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  respondPillBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#BE123C",
    paddingHorizontal: 9,
    height: 28,
    borderRadius: 6,
  },
  respondPillBtnActive: {
    backgroundColor: "#DCFCE7",
    borderWidth: 0.8,
    borderColor: "#86EFAC",
  },
  respondPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  respondPillTextActive: {
    color: "#15803D",
  },
  iconCircleAction: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  fabTouch: {
    position: "absolute",
    right: 16,
    borderRadius: 20,
    shadowColor: "#881337",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    overflow: "hidden",
  },
  fabGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 20,
  },
  fab: {
    position: "absolute",
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#BE123C",
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 19,
    shadowColor: "#881337",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  fabText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
    gap: 8,
  },
  emptyIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#475569",
    textAlign: "center",
  },
  emptySub: {
    fontSize: 11,
    fontWeight: "500",
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 16,
  },
  emptyResetBtnTouch: {
    borderRadius: 17,
    overflow: "hidden",
    marginTop: 6,
    shadowColor: "#881337",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 2,
  },
  emptyResetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 17,
  },
  emptyResetBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
