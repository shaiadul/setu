import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CampusHeader } from "@/components/campus-header";
import { useBlood } from "@/context/blood-context";
import { JuRole } from "@/types/blood";
import { router } from "expo-router";

interface BadgeItem {
  id: string;
  title: string;
  category: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  unlocked: boolean;
  date?: string;
  progress?: string;
}

const PRESTIGE_BADGES: BadgeItem[] = [
  {
    id: "badge-1",
    title: "প্রথম রক্তদান",
    category: "মাইলফলক",
    desc: "জাহাঙ্গীরনগর বিশ্ববিদ্যালয়ে প্রথমবারের মতো জরুরি রক্তদান সম্পন্ন করেছেন।",
    icon: "water",
    color: "#DC2626",
    bg: "#FEF2F2",
    unlocked: true,
    date: "১২ আগস্ট ২০২২",
  },
  {
    id: "badge-2",
    title: "৪x সক্রিয় স্ট্রিক",
    category: "ধারাবাহিকতা",
    desc: "পরপর চারবার নির্ধারিত বিশ্রামের পরপরই নিয়মিত রক্তদান বজায় রেখেছেন।",
    icon: "flame",
    color: "#EA580C",
    bg: "#FFF7ED",
    unlocked: true,
    date: "চলমান সক্রিয় স্ট্রিক",
  },
  {
    id: "badge-3",
    title: "১৮ জীবন রক্ষা",
    category: "ইমপ্যাক্ট",
    desc: "আপনার রক্তে ক্যাম্পাসে ও সাভারে মোট ১৮ জন মুমূর্ষু রোগী সুস্থ হয়ে বাড়ি ফিরেছেন।",
    icon: "heart",
    color: "#E11D48",
    bg: "#FFF1F2",
    unlocked: true,
    date: "জাবি রেকর্ড ভেরিফাইড",
  },
  {
    id: "badge-4",
    title: "কোড রেড রেসপন্ডার",
    category: "জরুরি সেবা",
    desc: "১০ মিনিটের মধ্যে ক্রিটিক্যাল কোড রেড জরুরি অপারেশনে দ্রুত সাড়া দিয়েছেন।",
    icon: "flash",
    color: "#D97706",
    bg: "#FFFBEB",
    unlocked: true,
    date: "এনাম মেডিকেল সেন্টার",
  },
  {
    id: "badge-5",
    title: "টপ ১% ডোনার",
    category: "ক্যাম্পাস র‍্যাংক",
    desc: "ক্যাম্পাসের সকল নিবন্ধিত রক্তদাতার মধ্যে শীর্ষ ৮ নম্বরে অবস্থান করছেন।",
    icon: "trophy",
    color: "#7C3AED",
    bg: "#F5F3FF",
    unlocked: true,
    date: "জাবি লিডারবোর্ড",
  },
  {
    id: "badge-6",
    title: "ক্যাম্পাস লিজেন্ড",
    category: "সর্বোচ্চ সম্মাননা",
    desc: "১০ ব্যাগ রক্তদান সম্পন্ন করার পর এই বিশেষ স্বর্ণপদকটি আনলক হবে।",
    icon: "medal-outline",
    color: "#64748B",
    bg: "#F1F5F9",
    unlocked: false,
    progress: "৬/১০ ব্যাগ সম্পন্ন",
  },
];

const YEARLY_DONATIONS = [
  { year: "'২২", count: 1, percent: 40 },
  { year: "'২৩", count: 1, percent: 40 },
  { year: "'২৪", count: 1, percent: 40 },
  { year: "'২৫", count: 1, percent: 40 },
  { year: "'২৬", count: 2, percent: 85, isCurrent: true },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { profile, updateProfile, setShowSplash, isLoggedIn, logoutUser } = useBlood();

  // Active Segment: 'showcase' or 'settings'
  const [activeTab, setActiveTab] = useState<"showcase" | "settings">(
    "showcase",
  );

  // Modals
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<BadgeItem | null>(null);

  // Settings with unified toggles
  const [sosAlertsEnabled, setSosAlertsEnabled] = useState(true);
  const [highPrioritySound, setHighPrioritySound] = useState(true);
  const [alertRadius, setAlertRadius] = useState<"campus" | "savar" | "dhaka">(
    "savar",
  );
  const [readyToDonate, setReadyToDonate] = useState(true);
  const [showPhonePublic, setShowPhonePublic] = useState(true);
  const [anonymousMode, setAnonymousMode] = useState(false);

  const bottomPadding = 56 + Math.max(insets.bottom, 12);

  const handleEditProfilePress = () => {
    if (!isLoggedIn) {
      Alert.alert(
        'লগইন আবশ্যক',
        'প্রোফাইল তথ্য যোগ বা সম্পাদন করার পূর্বে অনুগ্রহ করে সাইন ইন করুন।',
        [
          { text: 'বাতিল', style: 'cancel' },
          {
            text: 'লগইন করুন',
            onPress: () => router.push('/login?redirectTo=complete-profile'),
          },
        ]
      );
      return;
    }
    router.push('/complete-profile');
  };

  const handleRoleChange = (newRole: JuRole) => {
    updateProfile({ role: newRole });
    Alert.alert(
      "ক্যাম্পাস পরিচয় আপডেট",
      "আপনার পরিচয় সফলভাবে আপডেট করা হয়েছে।",
    );
  };

  const handleShareCard = async () => {
    const text = `🩸 [সেতু • জাবি ডিজিটাল ডোনার পাসপোর্ট]\n\nরক্তদাতা: ${profile.name}\nগ্রুপ: ${profile.bloodType} (${profile.rhFactor})\nক্যাম্পাস: জাহাঙ্গীরনগর বিশ্ববিদ্যালয়\nবিভাগ: ${profile.departmentOrOffice}\nমোট রক্তদান: ${profile.totalDonations} বার • জীবন রক্ষা: ${profile.livesSaved} জন\nর‍্যাংক: #${profile.campusRank} • প্ল্যাটিনাম ডোনার\n\nআপনিও রক্তদানে এগিয়ে আসুন। #সেতু #JU_Blood_Donors`;

    try {
      if (Platform.OS === "web") {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(text);
          Alert.alert(
            "কপি হয়েছে!",
            "আপনার ডিজিটাল ডোনার পাসপোর্টের বিবরণ ক্লিপবোর্ডে কপি করা হয়েছে।",
          );
        }
      } else {
        await Share.share({ message: text });
      }
    } catch {
      // Ignored
    }
  };

  const handleCallHelpline = (phoneNumber: string, label: string) => {
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Alert.alert("কল ব্যর্থ", `${label}: ${phoneNumber}`);
    });
  };

  // Reusable Unified Toggle Component
  const renderToggleRow = (
    icon: keyof typeof Ionicons.glyphMap,
    iconColor: string,
    iconBg: string,
    title: string,
    subtitle: string,
    value: boolean,
    onValueChange: (val: boolean) => void,
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
        trackColor={{ false: "#E2E8F0", true: "#DC2626" }}
        thumbColor={Platform.OS === "android" ? "#FFFFFF" : undefined}
      />
    </View>
  );

  return (
    <View style={styles.screen}>
      <CampusHeader
        title="সেতু • ডোনার প্রোফাইল"
        subtitle="জাহাঙ্গীরনগর বিশ্ববিদ্যালয় ডিজিটাল ডোনার নেটওয়ার্ক"
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ========================================================= */}
        {/* 1. SEAMLESS HERO PROFILE BANNER (NO HEAVY BOX)            */}
        {/* ========================================================= */}
        <View style={styles.heroSection}>
          <View style={styles.heroTopRow}>
            {/* Avatar with Status Aura */}
            <View style={styles.avatarWrap}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {profile.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </Text>
              </View>
              <View style={styles.activePulseRing}>
                <View style={styles.activeDot} />
              </View>
            </View>

            {/* Donor Identity Info */}
            <View style={styles.heroInfoCol}>
              <View style={styles.heroNameLine}>
                <Text style={styles.heroNameText} numberOfLines={1}>
                  {profile.name}
                </Text>
                <Ionicons name="checkmark-circle" size={16} color="#0284C7" />
              </View>
              <Text style={styles.heroDeptLine} numberOfLines={1}>
                {profile.departmentOrOffice}
              </Text>
              <Text style={styles.heroHallLine} numberOfLines={1}>
                🏛️ {profile.hallOrResidence} • আইডি: {profile.studentId}
              </Text>
            </View>

            {/* Blood Badge */}
            <View style={styles.bloodHexBadge}>
              <MaterialCommunityIcons name="water" size={13} color="#FFFFFF" />
              <Text style={styles.bloodHexText}>{profile.bloodType}</Text>
              <Text style={styles.bloodHexRh}>{profile.rhFactor}</Text>
            </View>
          </View>

          {/* Quick Action Pill Bar */}
          <View style={styles.heroActionPillRow}>
            <View style={styles.rankBadgePill}>
              <Ionicons name="trophy" size={12} color="#D97706" />
              <Text style={styles.rankBadgePillText}>
                জাবি র‍্যাংক #{profile.campusRank}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.qrPassPill}
              activeOpacity={0.8}
              onPress={() => setQrModalVisible(true)}
            >
              <Ionicons name="qr-code" size={12} color="#DC2626" />
              <Text style={styles.qrPassPillText}>QR</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.qrPassPill}
              activeOpacity={0.8}
              onPress={handleEditProfilePress}
            >
              <Ionicons name="create-outline" size={12} color="#DC2626" />
              <Text style={styles.qrPassPillText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sharePassPill}
              activeOpacity={0.8}
              onPress={handleShareCard}
            >
              <Ionicons name="share-social-outline" size={12} color="#475569" />
              <Text style={styles.sharePassPillText}>শেয়ার</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ========================================================= */}
        {/* 2. CAPSULE SEGMENTED TABS                                 */}
        {/* ========================================================= */}
        <View style={styles.segmentTrack}>
          <TouchableOpacity
            style={[
              styles.segmentBtn,
              activeTab === "showcase" && styles.segmentBtnActive,
            ]}
            activeOpacity={0.8}
            onPress={() => setActiveTab("showcase")}
          >
            <Ionicons
              name="analytics"
              size={13}
              color={activeTab === "showcase" ? "#DC2626" : "#64748B"}
            />
            <Text
              style={[
                styles.segmentBtnText,
                activeTab === "showcase" && styles.segmentBtnTextActive,
              ]}
            >
              গ্রাফ ও ডোনার স্ট্যাটাস
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentBtn,
              activeTab === "settings" && styles.segmentBtnActive,
            ]}
            activeOpacity={0.8}
            onPress={() => setActiveTab("settings")}
          >
            <Ionicons
              name="options"
              size={13}
              color={activeTab === "settings" ? "#DC2626" : "#64748B"}
            />
            <Text
              style={[
                styles.segmentBtnText,
                activeTab === "settings" && styles.segmentBtnTextActive,
              ]}
            >
              সেটিংস ও কন্ট্রোল
            </Text>
          </TouchableOpacity>
        </View>

        {/* ========================================================= */}
        {/* TAB 1: 📊 MODERN GRAPH & FITNESS RECOVERY METRICS         */}
        {/* ========================================================= */}
        {activeTab === "showcase" ? (
          <View style={styles.flowingTabContent}>
            {/* GRAPH 1: BLOOD DONATION READINESS & RECOVERY TIMELINE GAUGE */}
            <View style={styles.modernCardSurface}>
              <View style={styles.surfaceHeaderRow}>
                <View style={styles.surfaceHeaderLeft}>
                  <MaterialCommunityIcons
                    name="heart-pulse"
                    size={16}
                    color="#DC2626"
                  />
                  <Text style={styles.surfaceTitle}>
                    রক্তদান প্রস্তুতি ও রিকভারি টাইমলাইন
                  </Text>
                </View>
                <View style={styles.readyStatusBadge}>
                  <View style={styles.readyStatusDot} />
                  <Text style={styles.readyStatusText}>সম্পূর্ণ ফিট</Text>
                </View>
              </View>

              {/* Graphic Flow: Last Donated -> Recovery -> Ready Time */}
              <View style={styles.recoveryGaugeContainer}>
                {/* 100% Circular Progress Dial */}
                <View style={styles.recoveryDialRing}>
                  <View style={styles.recoveryDialInner}>
                    <MaterialCommunityIcons
                      name="water-check"
                      size={24}
                      color="#16A34A"
                    />
                    <Text style={styles.recoveryDialPercent}>১০০%</Text>
                    <Text style={styles.recoveryDialSub}>ফিট</Text>
                  </View>
                </View>

                {/* Timeline Info Details */}
                <View style={styles.recoveryDetailsCol}>
                  {/* Step 1: Last Donated */}
                  <View style={styles.recoveryStepRow}>
                    <View style={styles.stepPointActive} />
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>
                        সর্বশেষ রক্তদান (Last Donated)
                      </Text>
                      <Text style={styles.stepDataText}>
                        {profile.lastDonationDate} • জাবি মেডিকেল সেন্টার
                      </Text>
                    </View>
                  </View>

                  {/* Connector Line */}
                  <View style={styles.stepConnectorLine} />

                  {/* Step 2: Next Ready Time */}
                  <View style={styles.recoveryStepRow}>
                    <View
                      style={[
                        styles.stepPointActive,
                        { backgroundColor: "#16A34A" },
                      ]}
                    />
                    <View style={styles.stepContent}>
                      <Text style={[styles.stepTitle, { color: "#15803D" }]}>
                        পরবর্তী রক্তদানের সময় (Next Ready Time)
                      </Text>
                      <Text style={styles.stepDataTextHighlight}>
                        বর্তমানে সম্পূর্ণ প্রস্তুত • যেকোনো জরুরি প্রয়োজনে রক্ত
                        দিতে পারবেন
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Recovery Horizon Progress Bar */}
              <View style={styles.recoveryBarBlock}>
                <View style={styles.recoveryBarLabelRow}>
                  <Text style={styles.recoveryBarLeftLabel}>
                    বিশ্রাম পর্ব (৯০ দিন): সম্পন্ন
                  </Text>
                  <Text style={styles.recoveryBarRightLabel}>০ দিন বাকি</Text>
                </View>
                <View style={styles.recoveryTrack}>
                  <View style={styles.recoveryFillFull} />
                </View>
              </View>
            </View>

            {/* GRAPH 2: LIFETIME DONATION PROGRESSION BAR GRAPH */}
            <View style={styles.modernCardSurface}>
              <View style={styles.surfaceHeaderRow}>
                <View style={styles.surfaceHeaderLeft}>
                  <Ionicons name="bar-chart" size={15} color="#0284C7" />
                  <Text style={styles.surfaceTitle}>
                    বার্ষিক রক্তদান প্রবণতা ও ইতিহাস
                  </Text>
                </View>
                <Text style={styles.graphSubHeader}>মোট ৬ ব্যাগ</Text>
              </View>

              {/* Bar Chart Visualization */}
              <View style={styles.chartBarsRow}>
                {YEARLY_DONATIONS.map((item, index) => (
                  <View key={index} style={styles.chartCol}>
                    <Text
                      style={[
                        styles.chartCountLabel,
                        item.isCurrent && styles.chartCountActive,
                      ]}
                    >
                      {item.count} ব্যাগ
                    </Text>
                    <View style={styles.chartBarTrack}>
                      <View
                        style={[
                          styles.chartBarFill,
                          { height: `${item.percent}%` },
                          item.isCurrent && styles.chartBarFillActive,
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.chartYearLabel,
                        item.isCurrent && styles.chartYearActive,
                      ]}
                    >
                      {item.year}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Four Flowing Impact Counters (No Box-in-Box) */}
              <View style={styles.impactFlowRow}>
                <View style={styles.impactFlowItem}>
                  <Text style={[styles.impactFlowValue, { color: "#DC2626" }]}>
                    {profile.totalDonations} বার
                  </Text>
                  <Text style={styles.impactFlowLabel}>মোট অনুদান</Text>
                </View>
                <View style={styles.impactFlowDivider} />

                <View style={styles.impactFlowItem}>
                  <Text style={[styles.impactFlowValue, { color: "#0284C7" }]}>
                    {profile.livesSaved} জন
                  </Text>
                  <Text style={styles.impactFlowLabel}>জীবন রক্ষা</Text>
                </View>
                <View style={styles.impactFlowDivider} />

                <View style={styles.impactFlowItem}>
                  <Text style={[styles.impactFlowValue, { color: "#9333EA" }]}>
                    #{profile.campusRank}
                  </Text>
                  <Text style={styles.impactFlowLabel}>জাবি র‍্যাংক</Text>
                </View>
                <View style={styles.impactFlowDivider} />

                <View style={styles.impactFlowItem}>
                  <Text style={[styles.impactFlowValue, { color: "#EA580C" }]}>
                    {profile.currentStreak}x
                  </Text>
                  <Text style={styles.impactFlowLabel}>স্ট্রিক</Text>
                </View>
              </View>
            </View>

            {/* 3. TROPHY & ACHIEVEMENT BADGES (HORIZONTAL FLOW TRACK) */}
            <View style={styles.modernCardSurface}>
              <View style={styles.surfaceHeaderRow}>
                <View style={styles.surfaceHeaderLeft}>
                  <Ionicons name="medal" size={15} color="#D97706" />
                  <Text style={styles.surfaceTitle}>
                    অর্জিত পদক ও সম্মাননা (৫/৬)
                  </Text>
                </View>
                <Text style={styles.tapExplainerText}>ট্যাপ করে পদক দেখুন</Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.badgesTrack}
              >
                {PRESTIGE_BADGES.map((b) => (
                  <TouchableOpacity
                    key={b.id}
                    style={[
                      styles.badgeChip,
                      !b.unlocked && styles.badgeChipLocked,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => setSelectedBadge(b)}
                  >
                    <View
                      style={[
                        styles.badgeIconCircle,
                        { backgroundColor: b.bg },
                      ]}
                    >
                      <Ionicons
                        name={b.icon}
                        size={16}
                        color={b.unlocked ? b.color : "#94A3B8"}
                      />
                    </View>
                    <Text
                      style={[
                        styles.badgeChipName,
                        !b.unlocked && styles.badgeChipNameLocked,
                      ]}
                      numberOfLines={1}
                    >
                      {b.title}
                    </Text>
                    <Text style={styles.badgeChipStatus}>
                      {b.unlocked ? "✓ অর্জিত" : b.progress || "লকড"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        ) : (
          /* ========================================================= */
          /* TAB 2: ⚙️ UNIFIED SETTINGS WITH SAME TOGGLE DESIGN        */
          /* ========================================================= */
          <View style={styles.flowingTabContent}>
            {/* Section A: Emergency & Alerts */}
            <View style={styles.modernCardSurface}>
              <View style={styles.surfaceHeaderRow}>
                <View style={styles.surfaceHeaderLeft}>
                  <Ionicons name="notifications" size={15} color="#DC2626" />
                  <Text style={styles.surfaceTitle}>
                    জরুরি এলার্ট ও নোটিফিকেশন
                  </Text>
                </View>
              </View>

              {renderToggleRow(
                "flash",
                "#DC2626",
                "#FEF2F2",
                "কোড রেড পুশ নোটিফিকেশন",
                "জাবি মেডিকেল সেন্টার ও সাভারের ক্রিটিক্যাল জরুরি রক্তের ডাক পান",
                sosAlertsEnabled,
                setSosAlertsEnabled,
              )}

              <View style={styles.hairlineDivider} />

              {renderToggleRow(
                "volume-high",
                "#DC2626",
                "#FEF2F2",
                "জরুরি সাইরেন ও ভাইব্রেশন",
                "গভীর রাতেও জরুরি অপারেশনের ক্ষেত্রে বিশেষ রিংটোন বাজবে",
                highPrioritySound,
                setHighPrioritySound,
              )}

              <View style={styles.hairlineDivider} />

              {/* Radius Selector with consistent clean style */}
              <View style={styles.radiusBlock}>
                <View style={styles.radiusHeader}>
                  <View
                    style={[
                      styles.toggleIconBox,
                      { backgroundColor: "#FEF2F2" },
                    ]}
                  >
                    <Ionicons name="navigate" size={14} color="#DC2626" />
                  </View>
                  <View style={styles.toggleTextCol}>
                    <Text style={styles.toggleTitle}>
                      এলার্ট দূরত্ব সীমা (রেডিয়াস)
                    </Text>
                    <Text style={styles.toggleSub}>
                      যে এলাকার রক্তের অনুরোধ আপনি দেখতে চান
                    </Text>
                  </View>
                </View>

                <View style={styles.radiusSegment}>
                  {[
                    { id: "campus", label: "জাবি ক্যাম্পাস" },
                    { id: "savar", label: "সাভার (৫ কিমি)" },
                    { id: "dhaka", label: "ঢাকা (১৫ কিমি)" },
                  ].map((item) => {
                    const isSelected = alertRadius === item.id;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.radiusBtn,
                          isSelected && styles.radiusBtnActive,
                        ]}
                        activeOpacity={0.7}
                        onPress={() =>
                          setAlertRadius(item.id as typeof alertRadius)
                        }
                      >
                        <Text
                          style={[
                            styles.radiusBtnText,
                            isSelected && styles.radiusBtnTextActive,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Section B: Privacy & Visibility with Identical Toggles */}
            <View style={styles.modernCardSurface}>
              <View style={styles.surfaceHeaderRow}>
                <View style={styles.surfaceHeaderLeft}>
                  <Ionicons name="shield-checkmark" size={15} color="#DC2626" />
                  <Text style={styles.surfaceTitle}>
                    ডোনার ভিজিবিলিটি ও গোপনীয়তা
                  </Text>
                </View>
              </View>

              {renderToggleRow(
                "person-circle",
                "#DC2626",
                "#FEF2F2",
                "রক্তদানে প্রস্তুত (Active Visibility)",
                "ক্যাম্পাস ডিরেক্টরিতে আপনাকে রক্তদানে আগ্রহী হিসেবে প্রদর্শন করবে",
                readyToDonate,
                setReadyToDonate,
              )}

              <View style={styles.hairlineDivider} />

              {renderToggleRow(
                "call",
                "#DC2626",
                "#FEF2F2",
                "ফোন নম্বর উন্মুক্ত রাখুন",
                "জরুরি প্রয়োজনে রোগী বা রোগীর স্বজন আপনাকে সরাসরি কল করতে পারবে",
                showPhonePublic,
                setShowPhonePublic,
              )}

              <View style={styles.hairlineDivider} />

              {renderToggleRow(
                "finger-print",
                "#DC2626",
                "#FEF2F2",
                "বেনামে রক্তদান (Anonymous Mode)",
                "রক্তদানের পর আপনার নাম ও প্রোফাইল ফিডে গোপন রাখা হবে",
                anonymousMode,
                setAnonymousMode,
              )}
            </View>

            {/* Section C: Campus Emergency Helplines */}
            <View style={styles.modernCardSurface}>
              <View style={styles.surfaceHeaderRow}>
                <View style={styles.surfaceHeaderLeft}>
                  <Ionicons name="medkit" size={15} color="#16A34A" />
                  <Text style={styles.surfaceTitle}>
                    ক্যাম্পাস মেডিকেল ও জরুরি সহায়তা
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.helplineRow}
                activeOpacity={0.8}
                onPress={() =>
                  handleCallHelpline("01711223344", "জাবি মেডিকেল সেন্টার")
                }
              >
                <View
                  style={[styles.toggleIconBox, { backgroundColor: "#F0FDF4" }]}
                >
                  <Ionicons name="medical" size={15} color="#16A34A" />
                </View>
                <View style={styles.toggleTextCol}>
                  <Text style={styles.toggleTitle}>
                    জাবি মেডিকেল সেন্টার জরুরি হটলাইন
                  </Text>
                  <Text style={styles.toggleSub}>
                    ২৪/৭ মেডিকেল সাপোর্ট • ০১৭১১-২২৩৩৪৪
                  </Text>
                </View>
                <View style={styles.callCircleBtn}>
                  <Ionicons name="call" size={11} color="#16A34A" />
                </View>
              </TouchableOpacity>

              <View style={styles.hairlineDivider} />

              <TouchableOpacity
                style={styles.helplineRow}
                activeOpacity={0.8}
                onPress={() =>
                  handleCallHelpline(
                    "01324778899",
                    "জাবি অ্যাম্বুলেন্স কন্ট্রোল",
                  )
                }
              >
                <View
                  style={[styles.toggleIconBox, { backgroundColor: "#FEF2F2" }]}
                >
                  <MaterialCommunityIcons
                    name="ambulance"
                    size={16}
                    color="#DC2626"
                  />
                </View>
                <View style={styles.toggleTextCol}>
                  <Text style={styles.toggleTitle}>
                    জাবি জরুরি অ্যাম্বুলেন্স কন্ট্রোল
                  </Text>
                  <Text style={styles.toggleSub}>
                    জরুরি রোগী স্থানান্তর • ০১৩২৪-৭৭৮৮৯৯
                  </Text>
                </View>
                <View
                  style={[styles.callCircleBtn, { backgroundColor: "#FEF2F2" }]}
                >
                  <Ionicons name="call" size={11} color="#DC2626" />
                </View>
              </TouchableOpacity>

              <View style={styles.hairlineDivider} />

              <TouchableOpacity
                style={styles.helplineRow}
                activeOpacity={0.8}
                onPress={() => setShowSplash(true)}
              >
                <View
                  style={[styles.toggleIconBox, { backgroundColor: "#FAF5FF" }]}
                >
                  <Ionicons name="sparkles" size={15} color="#9333EA" />
                </View>
                <View style={styles.toggleTextCol}>
                  <Text style={styles.toggleTitle}>
                    সেতু অ্যাপ পরিচিতি গাইড দেখুন
                  </Text>
                  <Text style={styles.toggleSub}>
                    জরুরি রক্তদান ও ট্র্যাকিং টিউটোরিয়াল স্লাইডার
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* ACCOUNT & APP FLOW NAVIGATION */}
            <View style={styles.modernCardSurface}>
              <View style={styles.surfaceHeaderRow}>
                <View style={styles.surfaceHeaderLeft}>
                  <Ionicons name="person-circle" size={15} color="#DC2626" />
                  <Text style={styles.surfaceTitle}>
                    অ্যাকাউন্ট ও নেভিগেশন
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.helplineRow}
                activeOpacity={0.8}
                onPress={handleEditProfilePress}
              >
                <View
                  style={[styles.toggleIconBox, { backgroundColor: "#FEF2F2" }]}
                >
                  <Ionicons name="create" size={15} color="#DC2626" />
                </View>
                <View style={styles.toggleTextCol}>
                  <Text style={styles.toggleTitle}>
                    ডোনার প্রোফাইল সম্পূর্ণ বা সম্পাদন করুন
                  </Text>
                  <Text style={styles.toggleSub}>
                    রক্তের গ্রুপ, আবাসিক হল ও ভেরিফিকেশন তথ্য আপডেট
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
              </TouchableOpacity>

              <View style={styles.hairlineDivider} />

              <TouchableOpacity
                style={styles.helplineRow}
                activeOpacity={0.8}
                onPress={() => router.push('/notifications')}
              >
                <View
                  style={[styles.toggleIconBox, { backgroundColor: "#FEF3C7" }]}
                >
                  <Ionicons name="notifications" size={15} color="#D97706" />
                </View>
                <View style={styles.toggleTextCol}>
                  <Text style={styles.toggleTitle}>
                    ইনবক্স ও জরুরি নোটিফিকেশন সেন্টার
                  </Text>
                  <Text style={styles.toggleSub}>
                    কোড রেড এলার্ট ও ক্যাম্পাসের রক্তদানের বার্তা
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
              </TouchableOpacity>

              <View style={styles.hairlineDivider} />

              <TouchableOpacity
                style={styles.helplineRow}
                activeOpacity={0.8}
                onPress={() => {
                  if (isLoggedIn) {
                    Alert.alert(
                      'লগআউট নিশ্চিতকরণ',
                      'আপনি কি অ্যাকাউন্ট থেকে লগআউট করতে চান?',
                      [
                        { text: 'বাতিল', style: 'cancel' },
                        {
                          text: 'লগআউট',
                          style: 'destructive',
                          onPress: async () => {
                            await logoutUser();
                            Alert.alert('লগআউট সম্পন্ন', 'আপনি সফলভাবে লগআউট হয়েছেন।');
                          },
                        },
                      ]
                    );
                  } else {
                    router.push('/login');
                  }
                }}
              >
                <View
                  style={[
                    styles.toggleIconBox,
                    { backgroundColor: isLoggedIn ? "#FEF2F2" : "#F1F5F9" },
                  ]}
                >
                  <Ionicons
                    name={isLoggedIn ? "log-out-outline" : "log-in-outline"}
                    size={16}
                    color={isLoggedIn ? "#DC2626" : "#0F172A"}
                  />
                </View>
                <View style={styles.toggleTextCol}>
                  <Text style={styles.toggleTitle}>
                    {isLoggedIn
                      ? "অ্যাকাউন্ট থেকে লগআউট করুন"
                      : "Google সাইন ইন / লগইন করুন"}
                  </Text>
                  <Text style={styles.toggleSub}>
                    {isLoggedIn
                      ? "বর্তমান সেশন সমাপ্ত করতে ট্যাপ করুন"
                      : "জাবি ইমেইল অথবা Google অ্যাকাউন্ট দিয়ে লগইন করুন"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <View style={styles.appFooter}>
              <Text style={styles.appFooterText}>
                সেতু • সংস্করণ ১.২.০ (ক্যাম্পাস স্পেশাল)
              </Text>
              <Text style={styles.appFooterSub}>
                জাহাঙ্গীরনগর বিশ্ববিদ্যালয় ডোনার নেটওয়ার্ক
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ========================================================= */}
      {/* FULL-SCREEN QR DIGITAL PASS MODAL                         */}
      {/* ========================================================= */}
      <Modal
        visible={qrModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setQrModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalTitleCluster}>
                <Ionicons name="qr-code" size={17} color="#DC2626" />
                <Text style={styles.modalHeading}>ডিজিটাল ডোনার পাস</Text>
              </View>
              <TouchableOpacity onPress={() => setQrModalVisible(false)}>
                <Ionicons name="close-circle" size={22} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <View style={styles.qrVisualContainer}>
              <Ionicons name="qr-code" size={160} color="#0F172A" />
              <Text style={styles.qrSerialLabel}>{profile.donorId}</Text>
              <Text style={styles.qrHolderName}>{profile.name}</Text>
              <Text style={styles.qrHolderSub}>
                গ্রুপ: {profile.bloodType} {profile.rhFactor} •{" "}
                {profile.departmentOrOffice}
              </Text>
            </View>

            <View style={styles.qrHelpNote}>
              <Ionicons
                name="information-circle-outline"
                size={14}
                color="#64748B"
              />
              <Text style={styles.qrHelpNoteText}>
                মেডিকেল সেন্টারে বা ব্লাড ব্যাংকে দ্রুত নিবন্ধনের জন্য এই কোডটি
                স্ক্যান করান।
              </Text>
            </View>

            <TouchableOpacity
              style={styles.modalDismissBtn}
              activeOpacity={0.88}
              onPress={() => setQrModalVisible(false)}
            >
              <Text style={styles.modalDismissBtnText}>বন্ধ করুন</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* BADGE SHOWCASE DETAILS POPUP MODAL                        */}
      {/* ========================================================= */}
      <Modal
        visible={!!selectedBadge}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedBadge(null)}
      >
        <View style={styles.modalBackdrop}>
          {selectedBadge && (
            <View style={styles.modalBox}>
              <View style={styles.modalHeaderRow}>
                <View style={styles.modalTitleCluster}>
                  <Ionicons
                    name="medal"
                    size={17}
                    color={selectedBadge.color}
                  />
                  <Text style={styles.modalHeading}>
                    {selectedBadge.category}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedBadge(null)}>
                  <Ionicons name="close-circle" size={22} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <View style={styles.badgePopupCenter}>
                <View
                  style={[
                    styles.largeBadgeRing,
                    { backgroundColor: selectedBadge.bg },
                  ]}
                >
                  <Ionicons
                    name={selectedBadge.icon}
                    size={42}
                    color={
                      selectedBadge.unlocked ? selectedBadge.color : "#94A3B8"
                    }
                  />
                </View>

                <Text style={styles.badgePopupTitle}>
                  {selectedBadge.title}
                </Text>

                <View
                  style={[
                    styles.badgePillState,
                    selectedBadge.unlocked
                      ? styles.badgePillStateUnlocked
                      : styles.badgePillStateLocked,
                  ]}
                >
                  <Text
                    style={[
                      styles.badgePillStateText,
                      selectedBadge.unlocked
                        ? styles.badgePillStateTextUnlocked
                        : styles.badgePillStateTextLocked,
                    ]}
                  >
                    {selectedBadge.unlocked
                      ? "✓ পদকটি অর্জিত হয়েছে"
                      : selectedBadge.progress || "লকড পদক"}
                  </Text>
                </View>

                <Text style={styles.badgePopupDesc}>{selectedBadge.desc}</Text>

                {selectedBadge.date && (
                  <Text style={styles.badgePopupDate}>
                    ভেরিফিকেশন: {selectedBadge.date}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.modalDismissBtn}
                activeOpacity={0.88}
                onPress={() => setSelectedBadge(null)}
              >
                <Text style={styles.modalDismissBtnText}>ঠিক আছে</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    padding: 14,
    gap: 12,
  },

  /* ------------------------------------------------------------- */
  /* 1. SEAMLESS HERO BANNER                                       */
  /* ------------------------------------------------------------- */
  heroSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    gap: 12,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarWrap: {
    position: "relative",
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#DC2626",
  },
  avatarText: {
    fontSize: 17,
    fontWeight: "900",
    color: "#DC2626",
    letterSpacing: 0.5,
  },
  activePulseRing: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  activeDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: "#16A34A",
  },
  heroInfoCol: {
    flex: 1,
    gap: 2,
  },
  heroNameLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  heroNameText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  heroDeptLine: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
  },
  heroHallLine: {
    fontSize: 10,
    fontWeight: "500",
    color: "#94A3B8",
  },
  bloodHexBadge: {
    width: 48,
    height: 52,
    borderRadius: 10,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
    gap: 0.5,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  bloodHexText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 16,
  },
  bloodHexRh: {
    fontSize: 8,
    fontWeight: "800",
    color: "#FEE2E2",
    lineHeight: 10,
  },
  heroActionPillRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 0.8,
    borderTopColor: "#F1F5F9",
  },
  rankBadgePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF3C7",
    borderWidth: 0.8,
    borderColor: "#FDE68A",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  rankBadgePillText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#B45309",
  },
  qrPassPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF2F2",
    borderWidth: 0.8,
    borderColor: "#FECACA",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  qrPassPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#DC2626",
  },
  sharePassPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F8FAFC",
    borderWidth: 0.8,
    borderColor: "#E2E8F0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: "auto",
  },
  sharePassPillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#475569",
  },

  /* ------------------------------------------------------------- */
  /* 2. CAPSULE SEGMENTED TABS                                     */
  /* ------------------------------------------------------------- */
  segmentTrack: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    padding: 3,
    borderRadius: 12,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 36,
    borderRadius: 9,
  },
  segmentBtnActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },
  segmentBtnTextActive: {
    color: "#DC2626",
    fontWeight: "800",
  },
  flowingTabContent: {
    gap: 12,
  },

  /* ------------------------------------------------------------- */
  /* MODERN CARD SURFACES                                          */
  /* ------------------------------------------------------------- */
  modernCardSurface: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    gap: 12,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  surfaceHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  surfaceHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  surfaceTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
  },
  readyStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  readyStatusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#16A34A",
  },
  readyStatusText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#15803D",
  },

  /* ------------------------------------------------------------- */
  /* GRAPH 1: RECOVERY GAUGE & NEXT READY TRACKER                  */
  /* ------------------------------------------------------------- */
  recoveryGaugeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 2,
  },
  recoveryDialRing: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 3,
    borderColor: "#16A34A",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
  },
  recoveryDialInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  recoveryDialPercent: {
    fontSize: 11,
    fontWeight: "900",
    color: "#16A34A",
    lineHeight: 13,
  },
  recoveryDialSub: {
    fontSize: 8,
    fontWeight: "800",
    color: "#15803D",
  },
  recoveryDetailsCol: {
    flex: 1,
    gap: 2,
  },
  recoveryStepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  stepPointActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#DC2626",
    marginTop: 3,
  },
  stepContent: {
    flex: 1,
    gap: 1,
  },
  stepTitle: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#0F172A",
  },
  stepDataText: {
    fontSize: 9.5,
    fontWeight: "500",
    color: "#64748B",
  },
  stepDataTextHighlight: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#16A34A",
  },
  stepConnectorLine: {
    width: 1.5,
    height: 10,
    backgroundColor: "#E2E8F0",
    marginLeft: 3,
    marginVertical: 1,
  },
  recoveryBarBlock: {
    backgroundColor: "#F8FAFC",
    borderRadius: 9,
    padding: 9,
    gap: 6,
    borderWidth: 0.8,
    borderColor: "#E2E8F0",
  },
  recoveryBarLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recoveryBarLeftLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#475569",
  },
  recoveryBarRightLabel: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#16A34A",
  },
  recoveryTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
  },
  recoveryFillFull: {
    width: "100%",
    height: "100%",
    backgroundColor: "#16A34A",
    borderRadius: 3,
  },

  /* ------------------------------------------------------------- */
  /* GRAPH 2: YEARLY BAR CHART & IMPACT FLOW                       */
  /* ------------------------------------------------------------- */
  graphSubHeader: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0284C7",
  },
  chartBarsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 72,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  chartCol: {
    alignItems: "center",
    gap: 3,
    flex: 1,
  },
  chartCountLabel: {
    fontSize: 8.5,
    fontWeight: "700",
    color: "#94A3B8",
  },
  chartCountActive: {
    color: "#DC2626",
    fontWeight: "900",
  },
  chartBarTrack: {
    width: 14,
    height: 42,
    backgroundColor: "#F1F5F9",
    borderRadius: 7,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  chartBarFill: {
    width: "100%",
    backgroundColor: "#94A3B8",
    borderRadius: 7,
  },
  chartBarFillActive: {
    backgroundColor: "#DC2626",
  },
  chartYearLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: "#64748B",
  },
  chartYearActive: {
    color: "#DC2626",
    fontWeight: "800",
  },
  impactFlowRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 0.8,
    borderTopColor: "#F1F5F9",
  },
  impactFlowItem: {
    alignItems: "center",
    flex: 1,
    gap: 1,
  },
  impactFlowDivider: {
    width: 0.8,
    height: 22,
    backgroundColor: "#E2E8F0",
  },
  impactFlowValue: {
    fontSize: 14,
    fontWeight: "900",
  },
  impactFlowLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#64748B",
  },

  /* ------------------------------------------------------------- */
  /* BADGES TRACK (HORIZONTAL FLOW)                                */
  /* ------------------------------------------------------------- */
  tapExplainerText: {
    fontSize: 9.5,
    fontWeight: "600",
    color: "#94A3B8",
  },
  badgesTrack: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 2,
  },
  badgeChip: {
    width: 82,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: "center",
    gap: 3,
  },
  badgeChipLocked: {
    opacity: 0.5,
    backgroundColor: "#F1F5F9",
  },
  badgeIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeChipName: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },
  badgeChipNameLocked: {
    color: "#64748B",
  },
  badgeChipStatus: {
    fontSize: 8,
    fontWeight: "700",
    color: "#16A34A",
  },

  /* Role Picker Row */
  rolePickerRow: {
    flexDirection: "row",
    gap: 6,
  },
  rolePickerBtn: {
    flex: 1,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  rolePickerBtnActive: {
    backgroundColor: "#DC2626",
    borderColor: "#DC2626",
  },
  rolePickerBtnText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#475569",
  },
  rolePickerBtnTextActive: {
    color: "#FFFFFF",
  },

  /* ------------------------------------------------------------- */
  /* UNIFIED TOGGLES & SETTINGS                                    */
  /* ------------------------------------------------------------- */
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  toggleIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleTextCol: {
    flex: 1,
    gap: 1,
  },
  toggleTitle: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#0F172A",
  },
  toggleSub: {
    fontSize: 9.5,
    fontWeight: "500",
    color: "#64748B",
    lineHeight: 14,
  },
  hairlineDivider: {
    height: 0.8,
    backgroundColor: "#F1F5F9",
  },
  radiusBlock: {
    gap: 8,
  },
  radiusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  radiusSegment: {
    flexDirection: "row",
    gap: 6,
    paddingLeft: 40,
  },
  radiusBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 7,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  radiusBtnActive: {
    backgroundColor: "#DC2626",
    borderColor: "#DC2626",
  },
  radiusBtnText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#64748B",
  },
  radiusBtnTextActive: {
    color: "#FFFFFF",
  },

  /* Helplines */
  helplineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 2,
  },
  callCircleBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  appFooter: {
    alignItems: "center",
    paddingVertical: 12,
    gap: 2,
  },
  appFooterText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
  },
  appFooterSub: {
    fontSize: 9,
    fontWeight: "500",
    color: "#CBD5E1",
  },

  /* ------------------------------------------------------------- */
  /* MODALS                                                        */
  /* ------------------------------------------------------------- */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalBox: {
    width: "100%",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    padding: 20,
    alignItems: "center",
    gap: 12,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeaderRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitleCluster: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  modalHeading: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  qrVisualContainer: {
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
  },
  qrSerialLabel: {
    fontSize: 16,
    fontWeight: "900",
    color: "#DC2626",
    letterSpacing: 1.2,
    marginTop: 4,
  },
  qrHolderName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  qrHolderSub: {
    fontSize: 10,
    fontWeight: "500",
    color: "#64748B",
    textAlign: "center",
  },
  qrHelpNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  qrHelpNoteText: {
    fontSize: 9.5,
    fontWeight: "500",
    color: "#64748B",
    flex: 1,
  },
  modalDismissBtn: {
    width: "100%",
    height: 40,
    borderRadius: 10,
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  modalDismissBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  /* Badge Popup Center */
  badgePopupCenter: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
  },
  largeBadgeRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  badgePopupTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
  },
  badgePillState: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgePillStateUnlocked: {
    backgroundColor: "#DCFCE7",
  },
  badgePillStateLocked: {
    backgroundColor: "#F1F5F9",
  },
  badgePillStateText: {
    fontSize: 10,
    fontWeight: "800",
  },
  badgePillStateTextUnlocked: {
    color: "#15803D",
  },
  badgePillStateTextLocked: {
    color: "#64748B",
  },
  badgePopupDesc: {
    fontSize: 11,
    fontWeight: "500",
    color: "#475569",
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: 10,
  },
  badgePopupDate: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#94A3B8",
    marginTop: 4,
  },
});
