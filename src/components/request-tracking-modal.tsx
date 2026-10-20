import { BloodGroupBadge } from "@/components/blood-group-badge";
import { JuBadge } from "@/components/ju-badge";
import { useTheme } from "@/hooks/use-theme";
import { BloodRequest, ResponderStatus } from "@/types/blood";
import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface RequestTrackingModalProps {
  visible: boolean;
  request: BloodRequest | null;
  onClose: () => void;
  onUpdateStatus: (requestId: string, status: ResponderStatus) => void;
}

export function RequestTrackingModal({
  visible,
  request,
  onClose,
  onUpdateStatus,
}: RequestTrackingModalProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  if (!visible || !request) return null;

  const handleCall = (phoneNumber: string) => {
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert("কল ব্যর্থ", `ফোন নম্বর: ${phoneNumber}`);
        }
      })
      .catch(() => Alert.alert("কল ব্যর্থ", `ফোন নম্বর: ${phoneNumber}`));
  };

  const handleSms = (phoneNumber: string) => {
    const url = `sms:${phoneNumber}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("মেসেজ ব্যর্থ", `ফোন নম্বর: ${phoneNumber}`),
    );
  };

  const hasResponders =
    (request.activeResponders && request.activeResponders.length > 0) ||
    request.userStatus !== "none";
  const isEnRoute = request.userStatus === "en_route";
  const isArrived = request.userStatus === "arrived";
  const isDonated = request.userStatus === "donated";

  const steps = [
    {
      titleBn: "অনুরোধ সম্প্রচারিত",
      titleEn: "Request Broadcasted",
      desc: `${request.hospital}-এ ${request.requiredUnits} ব্যাগ রক্ত প্রয়োজন`,
      completed: true,
      current: false,
    },
    {
      titleBn: "ডোনার সাড়া দিয়েছেন",
      titleEn: "Donor Confirmed",
      desc: hasResponders
        ? `${request.respondersCount} জন রক্তদাতা সাড়া দিয়েছেন`
        : "ক্যাম্পাস ডোনারদের উত্তরের অপেক্ষায়...",
      completed: hasResponders,
      current: hasResponders && !isEnRoute && !isArrived && !isDonated,
    },
    {
      titleBn: "হাসপাতালের উদ্দেশ্যে রওনা",
      titleEn: "En Route to Hospital",
      desc:
        isArrived || isDonated
          ? "রক্তদাতা ওয়ার্ডে পৌঁছেছেন"
          : isEnRoute
            ? "রক্তদাতা বর্তমানে পথে রয়েছেন"
            : "মেডিকেল সেন্টারে পৌঁছানোর প্রস্তুতি",
      completed: isArrived || isDonated,
      current: isEnRoute,
    },
    {
      titleBn: "রক্তদান সম্পন্ন",
      titleEn: "Donation Completed",
      desc: isDonated
        ? "রক্তদান সফলভাবে সম্পন্ন হয়েছে"
        : "স্ক্রিনিং ও রক্ত সংগ্রহ প্রক্রিয়া",
      completed: isDonated,
      current: isArrived,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: theme.background,
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          {/* Header Bar */}
          <View
            style={[styles.headerBar, { borderBottomColor: theme.cardBorder }]}
          >
            <View style={styles.dragPill} />
            <View style={styles.headerContentRow}>
              <View>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  লাইভ রক্তদান ট্র্যাকিং
                </Text>
                <Text
                  style={[styles.modalSubtitle, { color: theme.textSecondary }]}
                >
                  Live Donor Relay • SOS #{request.id.slice(-6)}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.closeBtn,
                  { backgroundColor: theme.backgroundElement },
                ]}
                onPress={onClose}
              >
                <Ionicons name="close" size={20} color={theme.text} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Request Summary Card */}
            <View
              style={[
                styles.summaryCard,
                { backgroundColor: theme.card, borderColor: theme.cardBorder },
              ]}
            >
              <View style={styles.summaryTop}>
                <BloodGroupBadge
                  bloodType={request.bloodType}
                  size="md"
                  highlightUniversal
                />
                <View style={styles.patientInfo}>
                  <Text style={[styles.patientName, { color: theme.text }]}>
                    {request.patientName}
                  </Text>
                  <Text
                    style={[
                      styles.hospitalText,
                      { color: theme.secondaryDark },
                    ]}
                  >
                    📍 {request.hospital}
                  </Text>
                  <Text
                    style={[styles.roomText, { color: theme.textSecondary }]}
                  >
                    {request.room} ({request.distance})
                  </Text>
                </View>
                <View
                  style={[
                    styles.urgencyBadge,
                    {
                      backgroundColor:
                        request.urgency === "Code Red"
                          ? theme.primaryContainer
                          : theme.secondaryLight,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.urgencyText,
                      {
                        color:
                          request.urgency === "Code Red"
                            ? theme.primary
                            : theme.secondaryDark,
                      },
                    ]}
                  >
                    {request.urgency}
                  </Text>
                </View>
              </View>

              {/* Requester Info & Direct Call */}
              <View
                style={[
                  styles.contactBox,
                  { backgroundColor: theme.backgroundElement },
                ]}
              >
                <View style={styles.contactLeft}>
                  <View style={styles.roleRow}>
                    <JuBadge role={request.requesterRole} size="sm" />
                    <Text
                      style={[styles.deptText, { color: theme.textSecondary }]}
                    >
                      {request.requesterDepartment}
                    </Text>
                  </View>
                  <Text style={[styles.phoneText, { color: theme.text }]}>
                    📞 {request.contactNumber}
                  </Text>
                </View>
              </View>
            </View>

            {/* Timeline Section */}
            <View
              style={[
                styles.timelineCard,
                { backgroundColor: theme.card, borderColor: theme.cardBorder },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                ট্র্যাকিং টাইমলাইন (Progress)
              </Text>

              <View style={styles.timelineList}>
                {steps.map((step, idx) => (
                  <View key={idx} style={styles.timelineItem}>
                    <View style={styles.timelineIndicator}>
                      <View
                        style={[
                          styles.timelineCircle,
                          {
                            backgroundColor: step.completed
                              ? theme.primary
                              : theme.backgroundElement,
                            borderColor: step.current
                              ? theme.primary
                              : step.completed
                                ? theme.primary
                                : theme.cardBorder,
                          },
                        ]}
                      >
                        <Ionicons
                          name={
                            step.completed ? "checkmark" : "radio-button-off"
                          }
                          size={12}
                          color={
                            step.completed ? "#FFFFFF" : theme.textSecondary
                          }
                        />
                      </View>
                      {idx < steps.length - 1 && (
                        <View
                          style={[
                            styles.timelineLine,
                            {
                              backgroundColor: step.completed
                                ? theme.primary
                                : theme.cardBorder,
                            },
                          ]}
                        />
                      )}
                    </View>

                    <View style={styles.timelineTextCol}>
                      <Text
                        style={[
                          styles.stepTitle,
                          {
                            color:
                              step.completed || step.current
                                ? theme.text
                                : theme.textSecondary,
                          },
                        ]}
                      >
                        {step.titleBn}
                      </Text>
                      <Text
                        style={[
                          styles.stepDesc,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {step.desc}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Responders Section */}
            <View
              style={[
                styles.respondersCard,
                { backgroundColor: theme.card, borderColor: theme.cardBorder },
              ]}
            >
              <View style={styles.respondersHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  রক্তদাতা রেসপন্ডারবৃন্দ ({request.respondersCount})
                </Text>
              </View>

              {request.activeResponders &&
              request.activeResponders.length > 0 ? (
                request.activeResponders.map((resp) => (
                  <View
                    key={resp.id}
                    style={[
                      styles.responderRow,
                      {
                        backgroundColor: theme.backgroundElement,
                        borderColor: theme.cardBorder,
                      },
                    ]}
                  >
                    <View style={styles.respInfo}>
                      <View style={styles.respTopRow}>
                        <Text style={[styles.respName, { color: theme.text }]}>
                          {resp.name}
                        </Text>
                        <JuBadge role={resp.role} size="sm" />
                      </View>
                      <Text
                        style={[
                          styles.respDept,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {resp.departmentOrOffice}
                      </Text>
                      <View style={styles.etaRow}>
                        <Ionicons
                          name="time-outline"
                          size={13}
                          color={theme.primary}
                        />
                        <Text
                          style={[styles.etaText, { color: theme.primary }]}
                        >
                          ETA: {resp.eta}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.respCallBtn,
                        { backgroundColor: theme.primaryLight },
                      ]}
                      activeOpacity={0.8}
                      onPress={() => handleCall(resp.phone)}
                    >
                      <Ionicons name="call" size={16} color={theme.primary} />
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <View style={styles.emptyResponders}>
                  <Ionicons
                    name="pulse"
                    size={28}
                    color={theme.textSecondary}
                  />
                  <Text
                    style={[styles.emptyText, { color: theme.textSecondary }]}
                  >
                    এখনও কোনো রক্তদাতা সাড়া দেননি। আপনি এগিয়ে আসুন!
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Bottom Action Footer for current user */}
          <View
            style={[
              styles.footerBar,
              { borderTopColor: theme.cardBorder, backgroundColor: theme.card },
            ]}
          >
            {request.userStatus === "none" ? (
              <TouchableOpacity
                style={[
                  styles.primaryActionBtn,
                  { backgroundColor: theme.primary },
                ]}
                activeOpacity={0.88}
                onPress={() => {
                  onUpdateStatus(request.id, "en_route");
                  Alert.alert(
                    "ধন্যবাদ!",
                    "আপনার রওনা হওয়ার খবর রোগীর স্বজন ও মেডিকেল টিমে পৌঁছে দেওয়া হয়েছে।",
                  );
                }}
              >
                <Ionicons name="navigate" size={18} color="#FFFFFF" />
                <Text style={styles.primaryActionText}>
                  আমি রক্ত দিতে রওনা হচ্ছি (En Route)
                </Text>
              </TouchableOpacity>
            ) : request.userStatus === "en_route" ? (
              <View style={styles.statusActionRow}>
                <TouchableOpacity
                  style={[
                    styles.secondaryActionBtn,
                    {
                      borderColor: theme.primary,
                      backgroundColor: theme.primaryLight,
                    },
                  ]}
                  activeOpacity={0.88}
                  onPress={() => onUpdateStatus(request.id, "arrived")}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={theme.primary}
                  />
                  <Text
                    style={[
                      styles.secondaryActionText,
                      { color: theme.primary },
                    ]}
                  >
                    পৌঁছেছি (Arrived)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.cancelActionBtn,
                    { borderColor: theme.cardBorder },
                  ]}
                  activeOpacity={0.88}
                  onPress={() => onUpdateStatus(request.id, "none")}
                >
                  <Text
                    style={[
                      styles.cancelActionText,
                      { color: theme.textSecondary },
                    ]}
                  >
                    বাতিল
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.statusActionRow}>
                <TouchableOpacity
                  style={[
                    styles.secondaryActionBtn,
                    {
                      backgroundColor: theme.success,
                      borderColor: theme.success,
                    },
                  ]}
                  activeOpacity={0.88}
                  onPress={() => {
                    onUpdateStatus(request.id, "donated");
                    Alert.alert(
                      "অভিনন্দন!",
                      "আপনার মহৎ রক্তদানের জন্য অসংখ্য ধন্যবাদ ও কৃতজ্ঞতা।",
                    );
                  }}
                >
                  <Ionicons name="heart" size={18} color="#FFFFFF" />
                  <Text
                    style={[styles.secondaryActionText, { color: "#FFFFFF" }]}
                  >
                    রক্তদান সম্পন্ন (Donated)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.cancelActionBtn,
                    { borderColor: theme.cardBorder },
                  ]}
                  activeOpacity={0.88}
                  onPress={() => onUpdateStatus(request.id, "none")}
                >
                  <Text
                    style={[
                      styles.cancelActionText,
                      { color: theme.textSecondary },
                    ]}
                  >
                    রিসেট
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    maxHeight: "92%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  headerBar: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  dragPill: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
    marginBottom: 8,
  },
  headerContentRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "800",
  },
  modalSubtitle: {
    fontSize: 11,
    fontWeight: "500",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollArea: {
    flexGrow: 0,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  summaryTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  patientInfo: {
    flex: 1,
    gap: 2,
  },
  patientName: {
    fontSize: 15,
    fontWeight: "800",
  },
  hospitalText: {
    fontSize: 12,
    fontWeight: "700",
  },
  roomText: {
    fontSize: 11,
    fontWeight: "500",
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: "800",
  },
  contactBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
  },
  contactLeft: {
    gap: 4,
  },
  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  deptText: {
    fontSize: 11,
    fontWeight: "600",
  },
  phoneText: {
    fontSize: 13,
    fontWeight: "700",
  },
  contactButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    height: 30,
    borderRadius: 7,
  },
  callBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  smsBtn: {
    width: 30,
    height: 30,
    borderRadius: 7,
    borderWidth: 0.8,
    justifyContent: "center",
    alignItems: "center",
  },
  timelineCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 10,
  },
  timelineList: {
    gap: 0,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  timelineIndicator: {
    alignItems: "center",
    width: 22,
  },
  timelineCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  timelineLine: {
    width: 2,
    height: 34,
    marginVertical: 2,
  },
  timelineTextCol: {
    flex: 1,
    paddingBottom: 14,
    gap: 2,
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: "700",
  },
  stepDesc: {
    fontSize: 10,
    fontWeight: "500",
    lineHeight: 15,
  },
  respondersCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  respondersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  responderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  respInfo: {
    gap: 2,
  },
  respTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  respName: {
    fontSize: 12,
    fontWeight: "800",
  },
  respDept: {
    fontSize: 10,
    fontWeight: "500",
  },
  etaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  etaText: {
    fontSize: 10,
    fontWeight: "700",
  },
  respCallBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyResponders: {
    alignItems: "center",
    paddingVertical: 14,
    gap: 6,
  },
  emptyText: {
    fontSize: 11,
    textAlign: "center",
    maxWidth: 240,
  },
  footerBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 0.8,
  },
  primaryActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 38,
    borderRadius: 10,
  },
  primaryActionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  statusActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  secondaryActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    height: 36,
    borderRadius: 9,
    borderWidth: 1.2,
  },
  secondaryActionText: {
    fontSize: 12,
    fontWeight: "800",
  },
  cancelActionBtn: {
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 9,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelActionText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
