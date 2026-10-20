import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Linking,
  Platform,
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
import { JuBadge } from "@/components/ju-badge";
import { RequestTrackingModal } from "@/components/request-tracking-modal";
import { useBlood } from "@/context/blood-context";
import { BloodGroup, BloodRequest, JuRole } from "@/types/blood";

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

  const [activeFilter, setActiveFilter] = useState<"all" | "Code Red" | JuRole>(
    "all",
  );
  const [selectedBlood, setSelectedBlood] = useState<"all" | BloodGroup>("all");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  const filteredRequests = requests.filter((req) => {
    if (activeFilter === "Code Red" && req.urgency !== "Code Red") return false;
    if (
      (activeFilter === "student" ||
        activeFilter === "teacher" ||
        activeFilter === "staff") &&
      req.requesterRole !== activeFilter
    ) {
      return false;
    }
    if (selectedBlood !== "all" && req.bloodType !== selectedBlood)
      return false;
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
  const codeRedTotal = requests.filter((r) => r.urgency === "Code Red").length;

  const urgencyColor = (u: string) => {
    if (u === "Code Red") {
      return {
        bg: "#FEF2F2",
        text: "#DC2626",
        dot: "#DC2626",
        border: "#FECACA",
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
            <Ionicons name="calendar-outline" size={13} color="#DC2626" />
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
              color="#DC2626"
            />
            <Text style={styles.stockNoticeText}>
              জরুরি রক্তের প্রয়োজন:{" "}
              <Text style={styles.stockHighlight}>O- এবং B-</Text>
            </Text>
          </View>
          <Text style={styles.stockSpeedText}>⚡ গড় সাড়া ৮ মি.</Text>
        </View>
      </View>

      {/* Primary Role/Urgency Filter Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScrollTrack}
      >
        {(
          [
            { id: "all", label: "সব অনুরোধ", count: requests.length },
            { id: "Code Red", label: "🔴 কোড রেড", count: codeRedTotal },
            { id: "student", label: "🎓 শিক্ষার্থী", count: undefined },
            { id: "teacher", label: "🏛️ শিক্ষক", count: undefined },
            { id: "staff", label: "🏢 কর্মকর্তা", count: undefined },
          ] as const
        ).map((f) => {
          const isActive = activeFilter === f.id;
          const isRed = f.id === "Code Red";
          return (
            <TouchableOpacity
              key={f.id}
              style={[
                styles.filterPill,
                isActive &&
                  (isRed
                    ? styles.filterPillRedActive
                    : styles.filterPillActive),
              ]}
              activeOpacity={0.7}
              onPress={() => setActiveFilter(f.id as typeof activeFilter)}
            >
              <Text
                style={[styles.filterText, isActive && styles.filterTextActive]}
              >
                {f.label}
              </Text>
              {f.count !== undefined && f.count > 0 && (
                <View
                  style={[
                    styles.countBadge,
                    isActive &&
                      (isRed
                        ? styles.countBadgeRedActive
                        : styles.countBadgeActive),
                  ]}
                >
                  <Text
                    style={[
                      styles.countText,
                      isActive &&
                        (isRed
                          ? styles.countTextRedActive
                          : styles.countTextActive),
                    ]}
                  >
                    {f.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Secondary Blood Group Filter Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.bloodFilterScrollTrack}
      >
        <TouchableOpacity
          style={[
            styles.bloodFilterChip,
            selectedBlood === "all" && styles.bloodFilterChipActive,
          ]}
          activeOpacity={0.7}
          onPress={() => setSelectedBlood("all")}
        >
          <Text
            style={[
              styles.bloodFilterText,
              selectedBlood === "all" && styles.bloodFilterTextActive,
            ]}
          >
            সকল গ্রুপ
          </Text>
        </TouchableOpacity>

        {BLOOD_GROUPS.map((bg) => {
          const isSel = selectedBlood === bg;
          return (
            <TouchableOpacity
              key={bg}
              style={[
                styles.bloodFilterChip,
                isSel && styles.bloodFilterChipActive,
              ]}
              activeOpacity={0.7}
              onPress={() => setSelectedBlood(isSel ? "all" : bg)}
            >
              <Text
                style={[
                  styles.bloodFilterText,
                  isSel && styles.bloodFilterTextActive,
                ]}
              >
                {bg}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderItem = ({ item }: { item: BloodRequest }) => {
    const isCodeRed = item.urgency === "Code Red";
    const isEnRoute = item.userStatus === "en_route";
    const uc = urgencyColor(item.urgency);

    return (
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => setSelectedTrackingRequest(item)}
        style={[styles.feedCard, isCodeRed && styles.feedCardCodeRed]}
      >
        {/* Urgency Highlight Left Border */}
        <View style={[styles.cardUrgencyStrip, { backgroundColor: uc.dot }]} />

        <View style={styles.cardContent}>
          {/* Card Top: Blood group badge + Urgency pill + Units */}
          <View style={styles.cardTopRow}>
            <View style={styles.bloodGroupCluster}>
              <View
                style={[
                  styles.bloodBadgeBox,
                  { backgroundColor: uc.bg, borderColor: uc.border },
                ]}
              >
                <Text style={[styles.bloodBadgeType, { color: uc.text }]}>
                  {item.bloodType}
                </Text>
              </View>

              <View style={[styles.urgencyBadge, { backgroundColor: uc.bg }]}>
                <View
                  style={[styles.urgencyDot, { backgroundColor: uc.dot }]}
                />
                <Text style={[styles.urgencyLabel, { color: uc.text }]}>
                  {item.urgency === "Code Red" ? "কোড রেড" : item.urgency}
                </Text>
              </View>
            </View>

            <View style={styles.metaTopRight}>
              <Text style={styles.unitsHighlight}>
                {item.requiredUnits} ব্যাগ প্রয়োজন
              </Text>
              <Text style={styles.timeAgoLabel}>{item.timeAgo}</Text>
            </View>
          </View>

          {/* Patient Details & JU Identity */}
          <View style={styles.patientRow}>
            <Text style={styles.patientName} numberOfLines={1}>
              {item.patientName}
            </Text>
            <View style={styles.roleDeptRow}>
              <JuBadge role={item.requesterRole} size="sm" />
              <Text style={styles.deptLabel} numberOfLines={1}>
                {item.requesterDepartment}
              </Text>
            </View>
          </View>

          {/* Hospital & Campus Landmark Pill */}
          <View style={styles.locationStrip}>
            <Ionicons name="location-sharp" size={13} color="#DC2626" />
            <Text style={styles.hospitalTitle} numberOfLines={1}>
              {item.hospital}
            </Text>
            <View style={styles.distanceBadge}>
              <Text style={styles.distanceText}>{item.distance}</Text>
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
                                  ? "#DC2626"
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
                <Ionicons
                  name={isEnRoute ? "checkmark-circle" : "flash"}
                  size={12}
                  color={isEnRoute ? "#16A34A" : "#FFFFFF"}
                />
                <Text
                  style={[
                    styles.respondPillText,
                    isEnRoute && styles.respondPillTextActive,
                  ]}
                >
                  {isEnRoute ? "রওনা হয়েছি" : "এগিয়ে আসুন"}
                </Text>
              </TouchableOpacity>

              {/* Call Button */}
              <TouchableOpacity
                style={styles.iconCircleAction}
                activeOpacity={0.8}
                onPress={() => handleCall(item.contactNumber)}
              >
                <Ionicons name="call" size={13} color="#475569" />
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
        title="সেতু • রক্তের ফিড"
        subtitle="জাহাঙ্গীরনগর বিশ্ববিদ্যালয় ডোনার নেটওয়ার্ক"
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
            tintColor="#DC2626"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <MaterialCommunityIcons
                name="heart-pulse"
                size={32}
                color="#CBD5E1"
              />
            </View>
            <Text style={styles.emptyTitle}>কোনো রক্তের অনুরোধ নেই</Text>
            <Text style={styles.emptySub}>
              এই ফিল্টারে বর্তমানে কোনো সক্রিয় রক্তের অনুরোধ নেই।
            </Text>
          </View>
        }
      />

      {/* Floating Request Button */}
      <TouchableOpacity
        style={[styles.fab, { bottom: bottomPadding + 10 }]}
        activeOpacity={0.9}
        onPress={() => router.push("/request")}
      >
        <Ionicons name="add" size={19} color="#FFFFFF" />
        <Text style={styles.fabText}>অনুরোধ</Text>
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
    backgroundColor: "#FEF2F2",
    borderWidth: 0.8,
    borderColor: "#FECACA",
  },
  heroActionText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#DC2626",
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
    color: "#DC2626",
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
    color: "#DC2626",
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
    backgroundColor: "#DC2626",
  },
  barDayText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#64748B",
  },
  barDayTextActive: {
    color: "#DC2626",
    fontWeight: "800",
  },
  stockNoticeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
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
    color: "#DC2626",
    fontWeight: "800",
  },
  stockSpeedText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#DC2626",
  },
  filterScrollTrack: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 2,
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterPillActive: {
    backgroundColor: "#0F172A",
    borderColor: "#0F172A",
  },
  filterPillRedActive: {
    backgroundColor: "#DC2626",
    borderColor: "#DC2626",
  },
  filterText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  countBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 5,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  countBadgeActive: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  countBadgeRedActive: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  countText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#475569",
  },
  countTextActive: {
    color: "#FFFFFF",
  },
  countTextRedActive: {
    color: "#FFFFFF",
  },
  bloodFilterScrollTrack: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 2,
  },
  bloodFilterChip: {
    paddingHorizontal: 9,
    height: 25,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 0.8,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  bloodFilterChipActive: {
    backgroundColor: "#DC2626",
    borderColor: "#DC2626",
  },
  bloodFilterText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748B",
  },
  bloodFilterTextActive: {
    color: "#FFFFFF",
  },
  feedCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  feedCardCodeRed: {
    borderColor: "#FECACA",
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
    justifyContent: "space-between",
    alignItems: "center",
  },
  bloodGroupCluster: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  bloodBadgeBox: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.8,
  },
  bloodBadgeType: {
    fontSize: 13,
    fontWeight: "900",
  },
  urgencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  urgencyDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  urgencyLabel: {
    fontSize: 9,
    fontWeight: "800",
  },
  metaTopRight: {
    alignItems: "flex-end",
    gap: 1,
  },
  unitsHighlight: {
    fontSize: 11,
    fontWeight: "800",
    color: "#DC2626",
  },
  timeAgoLabel: {
    fontSize: 9,
    fontWeight: "500",
    color: "#94A3B8",
  },
  patientRow: {
    gap: 2,
  },
  patientName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.2,
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
  locationStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
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
    paddingVertical: 1,
    borderRadius: 4,
  },
  distanceText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#475569",
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
    backgroundColor: "#DC2626",
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
  fab: {
    position: "absolute",
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DC2626",
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 19,
    shadowColor: "#DC2626",
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
  },
  emptySub: {
    fontSize: 11,
    fontWeight: "500",
    color: "#94A3B8",
  },
});
