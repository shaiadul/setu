import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/primary-button";
import { useBlood } from "@/context/blood-context";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { profile, updateProfile, loginUser } = useBlood();
  const params = useLocalSearchParams<{ redirectTo?: string }>();

  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [identifier, setIdentifier] = useState("saidul.ju48@juniv.edu");
  const [password, setPassword] = useState("••••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  // Simulated Google Sign-In Flow
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);

    try {
      // Simulate real OAuth latency
      await new Promise((resolve) => setTimeout(resolve, 900));

      await loginUser(
        "saidul.ju48@juniv.edu",
        profile.name || "Md. Saidul Bashar",
      );

      // Update mock profile with Google user data
      await updateProfile({
        name: profile.name || "Md. Saidul Bashar",
        role: "student",
      });

      if (params.redirectTo === "complete-profile") {
        router.replace("/complete-profile");
        return;
      }

      Alert.alert(
        "Google সাইন ইন সফল!",
        `স্বাগতম, ${profile.name}! আপনার Google অ্যাকাউন্ট (saidul.ju48@juniv.edu) সফলভাবে সংযুক্ত হয়েছে।`,
        [
          {
            text: "প্রোফাইল সম্পূর্ণ করুন",
            onPress: () => router.push("/complete-profile"),
          },
          {
            text: "ফিডে যান",
            style: "default",
            onPress: () => router.replace("/"),
          },
        ],
      );
    } catch {
      Alert.alert(
        "ত্রুটি",
        "Google দিয়ে সাইন ইন সম্পন্ন করা সম্ভব হয়নি। আবার চেষ্টা করুন।",
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleManualLogin = async () => {
    if (!identifier.trim()) {
      Alert.alert(
        "অসম্পূর্ণ তথ্য",
        "অনুগ্রহ করে আপনার জাবি ইমেইল অথবা মোবাইল নম্বর দিন।",
      );
      return;
    }

    setIsSubmitLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    await loginUser(identifier, profile.name || "Md. Saidul Bashar");
    setIsSubmitLoading(false);

    if (params.redirectTo === "complete-profile") {
      router.replace("/complete-profile");
      return;
    }

    Alert.alert(
      "লগইন সফল",
      "সেতু রক্তদান নেটওয়ার্কে আপনি সফলভাবে প্রবেশ করেছেন।",
      [{ text: "ঠিক আছে", onPress: () => router.replace("/") }],
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          {
            paddingTop: Math.max(insets.top, 20) + 10,
            paddingBottom: Math.max(insets.bottom, 20) + 20,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topNavRow}>
          <TouchableOpacity
            style={styles.backBtn}
            activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#0F172A" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipPill}
            activeOpacity={0.7}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.skipPillText}>জরুরি মোড (লগইন ছাড়া)</Text>
            <Ionicons name="chevron-forward" size={12} color="#BE123C" />
          </TouchableOpacity>
        </View>

        <View style={styles.centerWrapper}>
          <View style={styles.authCard}>
          {/* 1. OFFICIAL GOOGLE SIGN-IN BUTTON */}
          <TouchableOpacity
            style={[
              styles.googleBtn,
              isGoogleLoading && styles.googleBtnDisabled,
            ]}
            activeOpacity={0.85}
            disabled={isGoogleLoading}
            onPress={handleGoogleSignIn}
          >
            {isGoogleLoading ? (
              <ActivityIndicator size="small" color="#EA4335" />
            ) : (
              <View style={styles.googleBtnContent}>
                {/* Authentic 4-Color Google Icon Emulation */}
                <View style={styles.googleIconBox}>
                  <Ionicons name="logo-google" size={18} color="#EA4335" />
                </View>
                <Text style={styles.googleBtnText}>
                  Google দিয়ে এক ক্লিকে সাইন ইন
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Elegant Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>
              অথবা আইডি বা মোবাইল দিয়ে প্রবেশ
            </Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Segment Selector for Email / Phone */}
          <View style={styles.segmentTrack}>
            <TouchableOpacity
              style={[
                styles.segmentBtn,
                loginMethod === "email" && styles.segmentBtnActive,
              ]}
              activeOpacity={0.8}
              onPress={() => setLoginMethod("email")}
            >
              <Ionicons
                name="school-outline"
                size={14}
                color={loginMethod === "email" ? "#BE123C" : "#64748B"}
              />
              <Text
                style={[
                  styles.segmentBtnText,
                  loginMethod === "email" && styles.segmentBtnTextActive,
                ]}
              >
                ইমেইল
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.segmentBtn,
                loginMethod === "phone" && styles.segmentBtnActive,
              ]}
              activeOpacity={0.8}
              onPress={() => setLoginMethod("phone")}
            >
              <Ionicons
                name="call-outline"
                size={14}
                color={loginMethod === "phone" ? "#BE123C" : "#64748B"}
              />
              <Text
                style={[
                  styles.segmentBtnText,
                  loginMethod === "phone" && styles.segmentBtnTextActive,
                ]}
              >
                মোবাইল নম্বর
              </Text>
            </TouchableOpacity>
          </View>

          {/* Identifier Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {loginMethod === "email"
                ? "প্রাতিষ্ঠানিক ইমেইল বা শিক্ষার্থী আইডি"
                : "নিবন্ধিত মোবাইল নম্বর"}
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name={
                  loginMethod === "email"
                    ? "mail-outline"
                    : "phone-portrait-outline"
                }
                size={17}
                color="#64748B"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder={
                  loginMethod === "email"
                    ? "উদাহরণ: saidul.ju48@juniv.edu"
                    : "উদাহরণ: 01700112233"
                }
                placeholderTextColor="#94A3B8"
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
                keyboardType={
                  loginMethod === "email" ? "email-address" : "phone-pad"
                }
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <View style={styles.inputLabelRow}>
              <Text style={styles.inputLabel}>পাসওয়ার্ড বা ওটিপি পিন</Text>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    "পাসওয়ার্ড পুনরুদ্ধার",
                    "আপনার জাবি ইমেইল বা মোবাইলে পাসওয়ার্ড রিসেট লিংক বা ওটিপি পাঠানো হবে।",
                  )
                }
              >
                <Text style={styles.forgotPassText}>ভুলে গেছেন?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={17}
                color="#64748B"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="পাসওয়ার্ড লিখুন"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Unified Toggle Row for "Remember Me" */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleIconBox}>
              <Ionicons name="key-outline" size={14} color="#BE123C" />
            </View>
            <View style={styles.toggleTextCol}>
              <Text style={styles.toggleTitle}>
                পরবর্তী সময়ের জন্য মনে রাখুন
              </Text>
              <Text style={styles.toggleSub}>
                বারবার লগইন করার প্রয়োজন হবে না
              </Text>
            </View>
            <Switch
              value={rememberMe}
              onValueChange={setRememberMe}
              trackColor={{ false: "#E2E8F0", true: "#BE123C" }}
              thumbColor={Platform.OS === "android" ? "#FFFFFF" : undefined}
            />
          </View>

          {/* Reusable Primary Button */}
          <PrimaryButton
            title="লগইন করুন"
            icon="arrow-forward"
            loading={isSubmitLoading}
            onPress={handleManualLogin}
            style={{ marginTop: 4 }}
          />

          {/* Complete Profile Onboarding Link */}
          <TouchableOpacity
            style={styles.newDonorAction}
            activeOpacity={0.8}
            onPress={() => router.push("/complete-profile")}
          >
            <Text style={styles.newDonorPrompt}>নতুন রক্তদাতা? </Text>
            <Text style={styles.newDonorLink}>প্রোফাইল নিবন্ধন করুন</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  topNavRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  centerWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  skipPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF2F2",
    borderWidth: 0.8,
    borderColor: "#FECDD3",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  skipPillText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#BE123C",
  },
  brandHero: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
  },
  logoBadgeContainer: {
    position: "relative",
    marginBottom: 4,
  },
  logoHex: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#FECDD3",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#881337",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 3,
  },
  verifiedDot: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#16A34A",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  appTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  appSubtitle: {
    fontSize: 11.5,
    fontWeight: "500",
    color: "#64748B",
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: 12,
  },

  /* Auth Card */
  authCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 18,
    gap: 14,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  /* Google Button */
  googleBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.2,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  googleBtnDisabled: {
    opacity: 0.65,
  },
  googleBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  googleIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
  },
  googleBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E293B",
    letterSpacing: -0.2,
  },
  trustRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 6,
  },
  trustText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#475569",
    textAlign: "center",
  },

  /* Divider */
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 2,
  },
  dividerLine: {
    flex: 1,
    height: 0.8,
    backgroundColor: "#E2E8F0",
  },
  dividerText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
  },

  /* Segments */
  segmentTrack: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    padding: 3,
    borderRadius: 10,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 32,
    borderRadius: 8,
  },
  segmentBtnActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentBtnText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#64748B",
  },
  segmentBtnTextActive: {
    color: "#BE123C",
    fontWeight: "800",
  },

  /* Inputs */
  inputGroup: {
    gap: 5,
  },
  inputLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#334155",
  },
  forgotPassText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#BE123C",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: "600",
    color: "#0F172A",
    height: "100%",
  },
  eyeBtn: {
    padding: 6,
  },

  /* Unified Toggle */
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 2,
  },
  toggleIconBox: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
  },
  toggleTextCol: {
    flex: 1,
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
  },

  /* Submit Button */
  submitBtn: {
    height: 46,
    borderRadius: 12,
    backgroundColor: "#BE123C",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#881337",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
    marginTop: 4,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  submitBtnText: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },

  /* New Donor Action */
  newDonorAction: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 4,
  },
  newDonorPrompt: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#64748B",
  },
  newDonorLink: {
    fontSize: 11.5,
    fontWeight: "800",
    color: "#BE123C",
  },

  /* Safety Notice */
  campusSafetyNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12,
  },
  safetyNoticeCol: {
    flex: 1,
  },
  safetyNoticeTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0F172A",
  },
  safetyNoticeSub: {
    fontSize: 9.5,
    fontWeight: "500",
    color: "#64748B",
  },
});
