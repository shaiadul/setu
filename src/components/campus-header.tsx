import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useBlood } from "@/context/blood-context";

export type CampusHeaderVariant = "standard" | "compact" | "prominent" | "card";

export interface CampusHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  hideIcons?: boolean;
  rightElement?: React.ReactNode;
  variant?: CampusHeaderVariant;
  showCampusBadge?: boolean;
  showLivePulse?: boolean;
  showQuickStats?: boolean;
  initialExpandedStats?: boolean;
  children?: React.ReactNode;
}

export function CampusHeader({
  title = "সেতু • রক্তের বন্ধন",
  subtitle = "জাহাঙ্গীরনগর বিশ্ববিদ্যালয় ডোনার নেটওয়ার্ক",
  showBack,
  onBack,
  hideIcons,
  rightElement,
  variant = "standard",
  showCampusBadge = true,
  showLivePulse = true,
  showQuickStats = false,
  initialExpandedStats = false,
  children,
}: CampusHeaderProps) {
  const insets = useSafeAreaInsets();
  const { requests, drives, donors, setShowSplash } = useBlood();

  // Adjustable tray state (expanded / collapsed)
  const [isStatsExpanded, setIsStatsExpanded] = useState(initialExpandedStats);
  const [isCompactMode, setIsCompactMode] = useState(variant === "compact");

  // Pulse animation for live beacon
  const pulseAnim = useRef(new Animated.Value(1)).current;
  // Tray animation
  const trayAnim = useRef(
    new Animated.Value(initialExpandedStats ? 1 : 0),
  ).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.4,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const toggleStatsTray = () => {
    const nextState = !isStatsExpanded;
    setIsStatsExpanded(nextState);
    Animated.spring(trayAnim, {
      toValue: nextState ? 1 : 0,
      friction: 8,
      tension: 40,
      useNativeDriver: false,
    }).start();
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleCallMedicalCenter = () => {
    Linking.openURL("tel:01700112233").catch(() => {
      // Fallback silently if simulator/unsupported
    });
  };

  const codeRedCount = requests.filter((r) => r.urgency === "Code Red").length;
  const activeDrivesCount = drives.length;
  const totalDonorsCount = donors.length > 0 ? donors.length : 24;

  const isCompact = isCompactMode || variant === "compact";
  const isProminent = variant === "prominent";

  return (
    <View style={styles.outerWrapper}>
      <LinearGradient
        colors={["#881337", "#BE123C", "#E11D48"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={[
          styles.gradientContainer,
          {
            paddingTop: Math.max(insets.top, 12) + (isCompact ? 4 : 8),
            paddingBottom: isCompact ? 10 : 14,
          },
        ]}
      >
        {/* Modern Ambient Glowing Backdrop Orbs for Dimensional Depth */}
        <View style={styles.ambientOrbLarge} pointerEvents="none" />
        <View style={styles.ambientOrbSmall} pointerEvents="none" />
        <View style={styles.ambientGlowLine} pointerEvents="none" />

        {/* TOP STATUS BAR ACCENT */}
        <View style={styles.headerTopBar}>
          {showCampusBadge && !showBack && (
            <View style={styles.campusTagPill}>
              <Ionicons name="school-outline" size={12} color="#FECDD3" />
              <Text style={styles.campusTagText}>
                JU • জাবি রক্তের নেটওয়ার্ক
              </Text>
            </View>
          )}

          {/* Quick Density Switcher (Adjustable Design Control) */}
          <View style={styles.densityAdjusterRow}>
            {showQuickStats && (
              <TouchableOpacity
                style={[
                  styles.adjustPillBtn,
                  isStatsExpanded && styles.adjustPillBtnActive,
                ]}
                activeOpacity={0.8}
                onPress={toggleStatsTray}
              >
                <Ionicons
                  name={isStatsExpanded ? "chevron-up" : "stats-chart"}
                  size={12}
                  color={isStatsExpanded ? "#FFE4E6" : "#FFFFFF"}
                />
                <Text style={styles.adjustPillText}>
                  {isStatsExpanded ? "সংক্ষেপ করুন" : "লাইভ স্ট্যাটাস"}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.modeToggleMiniBtn}
              activeOpacity={0.7}
              onPress={() => setIsCompactMode((prev) => !prev)}
              accessibilityLabel="টগল হেডার মোড"
              accessibilityHint="হেডার সাইজ পরিবর্তন করুন"
            >
              <Ionicons
                name={isCompact ? "expand-outline" : "contract-outline"}
                size={13}
                color="rgba(255, 255, 255, 0.9)"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* MAIN HEADER ROW */}
        <View style={styles.contentRow}>
          {showBack ? (
            <View style={styles.backTitleRow}>
              <TouchableOpacity
                style={styles.iconCircleBtn}
                activeOpacity={0.75}
                onPress={handleBack}
              >
                <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.titleCol}>
                <Text
                  style={[
                    styles.screenTitle,
                    isCompact && styles.screenTitleCompact,
                  ]}
                  numberOfLines={1}
                >
                  {title}
                </Text>
                {subtitle && !isCompact && (
                  <Text style={styles.screenSubtitle} numberOfLines={1}>
                    {subtitle}
                  </Text>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.brandTitleRow}>
              {/* Brand Emblem */}
              {!isCompact && (
                <View style={styles.brandEmblemBox}>
                  <MaterialCommunityIcons
                    name="water"
                    size={20}
                    color="#FFFFFF"
                  />
                </View>
              )}

              <View style={styles.titleCol}>
                <View style={styles.titleBadgeRow}>
                  <Text
                    style={[
                      styles.screenTitle,
                      isCompact && styles.screenTitleCompact,
                      isProminent && styles.screenTitleProminent,
                    ]}
                    numberOfLines={1}
                  >
                    {title}
                  </Text>

                  {showLivePulse && (
                    <View style={styles.livePill}>
                      <View style={styles.livePulseHolder}>
                        <Animated.View
                          style={[
                            styles.livePulseRing,
                            {
                              transform: [{ scale: pulseAnim }],
                              opacity: pulseAnim.interpolate({
                                inputRange: [1, 1.4],
                                outputRange: [0.8, 0],
                              }),
                            },
                          ]}
                        />
                        <View style={styles.liveDot} />
                      </View>
                      <Text style={styles.liveText}>লাইভ</Text>
                    </View>
                  )}
                </View>

                {subtitle && !isCompact && (
                  <Text style={styles.screenSubtitle} numberOfLines={1}>
                    {subtitle}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Right Action Icons */}
          {!hideIcons && (
            <View style={styles.actionsRow}>
              {rightElement ? (
                rightElement
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.iconCircleBtn}
                    activeOpacity={0.75}
                    onPress={() => {
                      router.push("/notifications");
                    }}
                  >
                    <Ionicons
                      name="notifications-outline"
                      size={16}
                      color="#FFFFFF"
                    />
                    {codeRedCount > 0 && (
                      <View style={styles.badgePill}>
                        <Text style={styles.badgeText}>{codeRedCount}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>

        {/* EXPANDABLE ADJUSTABLE CAMPUS LIVE TRAY */}
        {showQuickStats && (
          <Animated.View
            style={[
              styles.quickStatsShelf,
              {
                maxHeight: trayAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 160],
                }),
                opacity: trayAnim,
                marginTop: trayAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 12],
                }),
                transform: [
                  {
                    scaleY: trayAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* 3 Interactive Live Status Cards */}
            <View style={styles.statsCardsGrid}>
              {/* Code Red Card */}
              <TouchableOpacity
                style={[styles.statGlassCard, styles.statCardEmergency]}
                activeOpacity={0.8}
                onPress={() => router.push("/notifications")}
              >
                <View style={styles.statIconBadgeRed}>
                  <Ionicons name="warning" size={13} color="#BE123C" />
                </View>
                <View style={styles.statContentCol}>
                  <Text style={styles.statCardValue}>{codeRedCount} টি</Text>
                  <Text style={styles.statCardLabel}>জরুরি রেড অ্যালার্ট</Text>
                </View>
              </TouchableOpacity>

              {/* Drives Card */}
              <TouchableOpacity
                style={styles.statGlassCard}
                activeOpacity={0.8}
                onPress={() => router.push("/drives")}
              >
                <View style={styles.statIconBadgeRose}>
                  <Ionicons name="calendar-outline" size={13} color="#FB7185" />
                </View>
                <View style={styles.statContentCol}>
                  <Text style={styles.statCardValue}>
                    {activeDrivesCount} টি
                  </Text>
                  <Text style={styles.statCardLabel}>চলমান ক্যাম্প</Text>
                </View>
              </TouchableOpacity>

              {/* Verified Donors Card */}
              <View style={styles.statGlassCard}>
                <View style={styles.statIconBadgeEmerald}>
                  <Ionicons name="shield-checkmark" size={13} color="#34D399" />
                </View>
                <View style={styles.statContentCol}>
                  <Text style={styles.statCardValue}>{totalDonorsCount}+</Text>
                  <Text style={styles.statCardLabel}>সক্রিয় ডোনার</Text>
                </View>
              </View>
            </View>

            {/* Quick Hotline Quick-Action Bar */}
            <View style={styles.hotlineQuickRow}>
              <TouchableOpacity
                style={styles.hotlinePill}
                activeOpacity={0.85}
                onPress={handleCallMedicalCenter}
              >
                <Ionicons name="call" size={12} color="#FEE2E2" />
                <Text style={styles.hotlineText}>
                  জাবি মেডিকেল সেন্টার হটলাইন • কল দিন
                </Text>
              </TouchableOpacity>
              <View style={styles.verifiedCampusTag}>
                <Ionicons name="leaf" size={11} color="#A7F3D0" />
                <Text style={styles.verifiedCampusText}>
                  ক্যাম্পাস কানেক্টেড
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* OPTIONAL CHILDREN SLOT (Search Bar, Filter Pills, Tab Row) */}
        {children && <View style={styles.childrenSlot}>{children}</View>}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    backgroundColor: "transparent",
    zIndex: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#881337",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.22,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  gradientContainer: {
    paddingHorizontal: 16,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    position: "relative",
    overflow: "hidden",
  },
  /* Ambient glowing backdrop styling */
  ambientOrbLarge: {
    position: "absolute",
    top: -40,
    right: -30,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  ambientOrbSmall: {
    position: "absolute",
    bottom: -30,
    left: 20,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(254, 205, 211, 0.08)",
  },
  ambientGlowLine: {
    position: "absolute",
    bottom: 0,
    left: 40,
    right: 40,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },

  /* Top micro bar for tags and density adjuster */
  headerTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  campusTagPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0, 0, 0, 0.18)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  campusTagText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FECDD3",
    letterSpacing: 0.2,
  },
  densityAdjusterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: "auto",
  },
  adjustPillBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.24)",
  },
  adjustPillBtnActive: {
    backgroundColor: "rgba(255, 255, 255, 0.32)",
    borderColor: "rgba(255, 255, 255, 0.45)",
  },
  adjustPillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  modeToggleMiniBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
  },

  /* Main row */
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  brandTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  brandEmblemBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.35)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  titleCol: {
    flex: 1,
    justifyContent: "center",
    gap: 2,
  },
  titleBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  screenTitleCompact: {
    fontSize: 16,
    fontWeight: "700",
  },
  screenTitleProminent: {
    fontSize: 21,
    fontWeight: "900",
  },
  screenSubtitle: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.88)",
    letterSpacing: 0.1,
  },

  /* Live Pulse Indicator */
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0, 0, 0, 0.22)",
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.4)",
  },
  livePulseHolder: {
    width: 8,
    height: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  livePulseRing: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#4ADE80",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4ADE80",
  },
  liveText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#86EFAC",
    letterSpacing: 0.3,
  },

  /* Action Buttons */
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 10,
  },
  iconCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.28)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  badgePill: {
    position: "absolute",
    top: -3,
    right: -3,
    backgroundColor: "#FFFFFF",
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: "#BE123C",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  badgeText: {
    fontSize: 8.5,
    fontWeight: "900",
    color: "#BE123C",
  },

  /* Adjustable Quick Live Stats Shelf */
  quickStatsShelf: {
    overflow: "hidden",
  },
  statsCardsGrid: {
    flexDirection: "row",
    gap: 8,
  },
  statGlassCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.22)",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  statCardEmergency: {
    backgroundColor: "rgba(0, 0, 0, 0.22)",
    borderColor: "rgba(239, 68, 68, 0.45)",
  },
  statIconBadgeRed: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(239, 68, 68, 0.22)",
    justifyContent: "center",
    alignItems: "center",
  },
  statIconBadgeRose: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(251, 113, 133, 0.22)",
    justifyContent: "center",
    alignItems: "center",
  },
  statIconBadgeEmerald: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(52, 211, 153, 0.22)",
    justifyContent: "center",
    alignItems: "center",
  },
  statContentCol: {
    flex: 1,
  },
  statCardValue: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  statCardLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.82)",
  },

  /* Hotline Quick Action Row */
  hotlineQuickRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    backgroundColor: "rgba(0, 0, 0, 0.18)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  hotlinePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  hotlineText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#FEE2E2",
  },
  verifiedCampusTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  verifiedCampusText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#A7F3D0",
  },

  /* Children slot */
  childrenSlot: {
    marginTop: 10,
  },
});
