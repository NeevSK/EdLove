/**
 * CreateGroupModal
 *
 * Allows any authenticated user to found a new community group.
 * On success:
 *  1. Group is created in community_groups table
 *  2. Creator is added as admin in community_group_members
 *  3. A QR code is shown so others can instantly scan to join
 *  4. "Open Group" navigates to the new GroupDetails screen
 *
 * All other group rules (admin controls, join policy, member management,
 * group chat) apply automatically once the group exists — because they
 * all key off the group_id in community_group_members.
 */

import React, { useState } from "react";
import {
  SanctuaryModal as SanctuaryModalComponent,
  Heading,
  Text,
  VStack,
  HStack,
  Box,
  useThemedColors,
  Theme,
  hapticLight,
  hapticSuccess,
  SanctuaryInput,
  Icon,
  Button,
  ButtonText,
  Spinner,
} from "@repo/ui";
import {
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from "react-native";
import {
  X,
  Users,
  Globe,
  Lock,
  CheckCircle,
  QrCode,
  Camera,
  ChevronRight,
  ChevronLeft,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { CommunityStackParamList } from "@repo/core";
import { communityAPI } from "../api/community";
import { QRBuilder, QRCodeGenerator } from "@repo/scanner-kit";
import { 
  useUserRole, 
  useStore, 
  uploadToCloudinary, 
  useGroupCreation 
} from "@repo/core";
import * as ImagePicker from "expo-image-picker";

// ── Types ─────────────────────────────────────────────────────────────────────

type GroupType = "general" | "club" | "interest" | "subject";
type JoinPolicy = "open" | "approval_required" | "invite_only";
type ModalStep = 'details' | 'setup' | 'success';

interface TypeOption {
  value: GroupType;
  label: string;
  emoji: string;
  description: string;
}

interface PolicyOption {
  value: JoinPolicy;
  label: string;
  description: string;
  Icon: React.ComponentType<any>;
}

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called with the new group id after successful creation */
  onCreated?: (groupId: string) => void;
  /** Mode: create or edit */
  mode?: "create" | "edit";
  /** Initial data for edit mode */
  initialData?: {
    id: string;
    name: string;
    handle?: string;
    description?: string;
    groupType?: GroupType;
    joinPolicy?: JoinPolicy;
    imageUrl?: string;
  };
  /** Called after successful creation or update */
  onSuccess?: (group: any) => void;
}

// ── Static data ───────────────────────────────────────────────────────────────

const getGroupTypes = (t: (key: string) => string): TypeOption[] => [
  {
    value: "general",
    label: t("community.createGroup.types.general.label"),
    emoji: "💬",
    description: t("community.createGroup.types.general.description"),
  },
  {
    value: "club",
    label: t("community.createGroup.types.club.label"),
    emoji: "🏆",
    description: t("community.createGroup.types.club.description"),
  },
  {
    value: "interest",
    label: t("community.createGroup.types.interest.label"),
    emoji: "✨",
    description: t("community.createGroup.types.interest.description"),
  },
  {
    value: "subject",
    label: t("community.createGroup.types.subject.label"),
    emoji: "📚",
    description: t("community.createGroup.types.subject.description"),
  },
];

const getJoinPolicies = (t: (key: string) => string): PolicyOption[] => [
  {
    value: "open",
    label: t("community.createGroup.policies.open.label"),
    description: t("community.createGroup.policies.open.description"),
    Icon: Globe,
  },
  {
    value: "approval_required",
    label: t("community.createGroup.policies.approval_required.label"),
    description: t(
      "community.createGroup.policies.approval_required.description",
    ),
    Icon: Users,
  },
  {
    value: "invite_only",
    label: t("community.createGroup.policies.invite_only.label"),
    description: t("community.createGroup.policies.invite_only.description"),
    Icon: Lock,
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function CreateGroupModal({
  isOpen,
  onClose,
  onCreated,
  mode = "create",
  initialData,
  onSuccess,
}: CreateGroupModalProps) {
  const { t } = useTranslation();
  const colors = useThemedColors();
  const navigation =
    useNavigation<NativeStackNavigationProp<CommunityStackParamList>>();
  const { userId, schoolId } = useUserRole();
  const user = useStore((state) => state.user);

  const {
    state,
    updateStep,
    updateDetails,
    updateSetup,
    resetProgress
  } = useGroupCreation();

  // Derived state from hook
  const step = state.step as unknown as ModalStep;
  const { details, setup } = state;

  // Local UI state
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdGroupId, setCreatedGroupId] = useState<string | null>(null);
  const [createdGroupName, setCreatedGroupName] = useState("");
  const [createdGroupAvatar, setCreatedGroupAvatar] = useState<string | null>(null);

  const isEdit = mode === "edit";

  // Effect to sync initialData (only for edit mode)
  React.useEffect(() => {
    if (isOpen && initialData && isEdit) {
      updateDetails({
        name: initialData.name,
        description: initialData.description || '',
        handle: initialData.handle || '',
        avatarUrl: initialData.imageUrl || null,
      });
      updateSetup({
        groupType: initialData.groupType || 'general',
        joinPolicy: initialData.joinPolicy || 'open',
      });
    }
  }, [isOpen, initialData, mode]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const canContinueDetails = details.name.trim().length >= 2;
  const canSubmit = canContinueDetails && !isSubmitting && !isUploadingAvatar;
  const groupQRValue = createdGroupId ? QRBuilder.group(createdGroupId, details.handle || undefined) : "";
  const GROUP_TYPES = getGroupTypes(t);
  const JOIN_POLICIES = getJoinPolicies(t);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleClose = () => {
    if (isSubmitting) return;
    resetProgress();
    setError(null);
    onClose();
  };

  const handlePickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      updateDetails({ avatarUrl: result.assets[0].uri });
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit || !userId) return;
    hapticLight();
    setIsSubmitting(true);
    setError(null);

    try {
      let imageUrl: string | undefined = details.avatarUrl ?? undefined;
      if (details.avatarUrl && !details.avatarUrl.startsWith("http")) {
        setIsUploadingAvatar(true);
        imageUrl = await uploadToCloudinary(details.avatarUrl, "image");
        setIsUploadingAvatar(false);
      }

      const groupPayload = {
        name: details.name.trim(),
        description: details.description.trim() || undefined,
        group_type: setup.groupType,
        join_policy: setup.joinPolicy,
        school_id: schoolId ?? undefined,
        image_url: imageUrl ?? undefined,
        handle: details.handle.trim() || undefined,
      };

      if (isEdit && initialData?.id) {
        const updated = await communityAPI.updateGroup(initialData.id, groupPayload as any);
        hapticSuccess();
        onSuccess?.(updated);
        onClose();
      } else {
        const group = await communityAPI.createGroupWithOwner(groupPayload, userId);
        hapticSuccess();
        setCreatedGroupId(group.id);
        setCreatedGroupName(group.name ?? details.name.trim());
        setCreatedGroupAvatar(imageUrl ?? null);
        updateStep(2); // Success step
        onCreated?.(group.id);
        onSuccess?.(group);
      }
    } catch (err: any) {
      setError(err?.message ?? "Failed to save group. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenGroup = () => {
    if (!createdGroupId) return;
    const gId = createdGroupId;
    handleClose();
    navigation.navigate("GroupDetails", { groupId: gId });
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const renderFooter = () => {
    if (step === 'success') {
      return (
        <VStack sx={{ gap: Theme.spacing.sm, width: '100%' }}>
          <Button
            size="lg"
            onPress={handleOpenGroup}
            sx={{
              backgroundColor: Theme.colors.sanctuarySaffron,
              borderRadius: Theme.corners.comfortable,
            }}
          >
            <ButtonText color={Theme.colors.sacredWhite} sx={{ fontWeight: '700' }}>
              Enter Group Space
            </ButtonText>
            <Icon as={ChevronRight} color={Theme.colors.sacredWhite} sx={{ marginLeft: Theme.spacing.xs }} />
          </Button>
          <Button
            variant="outline"
            size="lg"
            onPress={handleClose}
            sx={{
              borderColor: colors.border,
            }}
          >
            <ButtonText color={colors.textSecondary}>Dismiss</ButtonText>
          </Button>
        </VStack>
      );
    }

    if (step === 'details') {
      return (
        <HStack sx={{ gap: Theme.spacing.md, width: '100%' }}>
          <Button
            variant="outline"
            sx={{ flex: 1, borderColor: colors.border }}
            onPress={handleClose}
          >
            <ButtonText color={colors.textSecondary}>Cancel</ButtonText>
          </Button>
          <Button
            sx={{
              flex: 1,
              backgroundColor: canContinueDetails ? Theme.colors.sanctuarySaffron : colors.border,
            }}
            disabled={!canContinueDetails}
            onPress={() => {
              hapticLight();
              updateStep(1);
            }}
          >
            <ButtonText color={Theme.colors.sacredWhite}>Next Step</ButtonText>
            <Icon as={ChevronRight} color={Theme.colors.sacredWhite} sx={{ marginLeft: Theme.spacing.xs }} />
          </Button>
        </HStack>
      );
    }

    return (
      <HStack sx={{ gap: Theme.spacing.md, width: '100%' }}>
        <Button
          variant="outline"
          sx={{ flex: 1, borderColor: colors.border }}
          onPress={() => updateStep(0)}
        >
          <Icon as={ChevronLeft} color={colors.textSecondary} sx={{ marginRight: Theme.spacing.xs }} />
          <ButtonText color={colors.textSecondary}>Back</ButtonText>
        </Button>
        <Button
          sx={{
            flex: 2,
            backgroundColor: canSubmit ? Theme.colors.sanctuarySaffron : colors.border,
          }}
          disabled={!canSubmit}
          onPress={handleSubmit}
        >
          {isSubmitting ? (
            <Spinner color={Theme.colors.sacredWhite} />
          ) : (
            <ButtonText color={Theme.colors.sacredWhite}>
              {isEdit ? "Update Group" : "Found Community"}
            </ButtonText>
          )}
        </Button>
      </HStack>
    );
  };

  const SanctuaryModal = SanctuaryModalComponent as any;

  return (
    <SanctuaryModal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? "Edit Group" : "Found New Community"}
      footer={renderFooter()}
    >
      <VStack sx={{ gap: Theme.spacing.lg }}>
        {step === 'details' && (
          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 450 }}>
            <VStack sx={{ gap: Theme.spacing.lg, paddingBottom: 20 }}>
              {/* Avatar Picker */}
              <TouchableOpacity onPress={handlePickAvatar} style={styles.avatarPickerRow}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: details.avatarUrl ? 'transparent' : 'rgba(246,191,140,0.1)',
                    borderWidth: 1,
                    borderColor: 'rgba(246,191,140,0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {details.avatarUrl ? (
                    <Image source={{ uri: details.avatarUrl }} style={{ width: '100%', height: '100%' }} />
                  ) : (
                    <Icon as={Camera} size={32} color={Theme.colors.sanctuarySaffron} />
                  )}
                </Box>
                <VStack sx={{ flex: 1, marginLeft: Theme.spacing.md }}>
                  <Text sx={{ fontWeight: '700', color: colors.text }}>Group Identity</Text>
                  <Text sx={{ fontSize: 13, color: colors.textSecondary }}>
                    {details.avatarUrl ? "Tap to change photo" : "Add a soulful image for your community"}
                  </Text>
                </VStack>
              </TouchableOpacity>

              <SanctuaryInput
                label="Community Name"
                placeholder="e.g. Ancient Wisdom Seekers"
                value={details.name}
                onChangeText={(text: string) => updateDetails({ name: text })}
              />

              <SanctuaryInput
                label="Unique Handle (@)"
                placeholder="e.g. seekers"
                value={details.handle}
                onChangeText={(text: string) => updateDetails({ handle: text.toLowerCase().replace(/[^a-z0-9_-]/g, "") })}
                leftIcon={Globe}
                helperText="A shared identity for your group link"
              />

              <SanctuaryInput
                label="Vision / Description"
                placeholder="What is the heartbeat of this community?"
                value={details.description}
                onChangeText={(text: string) => updateDetails({ description: text })}
                multiline
                numberOfLines={3}
              />
            </VStack>
          </ScrollView>
        )}

        {step === 'setup' && (
          <VStack sx={{ gap: Theme.spacing.xl }}>
            {/* Group Type */}
            <VStack sx={{ gap: Theme.spacing.sm }}>
              <Text sx={{ fontWeight: '700', color: colors.text, fontSize: 14 }}>
                Community Heartbeat (Type)
              </Text>
              <HStack flexWrap="wrap" sx={{ gap: Theme.spacing.sm }}>
                {GROUP_TYPES.map((t) => {
                  const active = setup.groupType === t.value;
                  return (
                    <TouchableOpacity
                      key={t.value}
                      onPress={() => {
                        hapticLight();
                        updateSetup({ groupType: t.value });
                      }}
                      style={[
                        styles.typeChip,
                        {
                          backgroundColor: active ? Theme.colors.sanctuarySaffron : 'rgba(246,191,140,0.05)',
                          borderColor: active ? Theme.colors.sanctuarySaffron : 'rgba(246,191,140,0.2)',
                        },
                      ]}
                    >
                      <Text sx={{ fontSize: 14 }}>{t.emoji}</Text>
                      <Text
                        sx={{
                          fontSize: 12,
                          fontWeight: active ? '700' : '500',
                          color: active ? Theme.colors.sacredWhite : colors.text,
                          marginLeft: 4,
                        }}
                      >
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </HStack>
            </VStack>

            {/* Join Policy */}
            <VStack sx={{ gap: Theme.spacing.sm }}>
              <Text sx={{ fontWeight: '700', color: colors.text, fontSize: 14 }}>
                Sanctuary Intent (Privacy)
              </Text>
              <VStack sx={{ gap: Theme.spacing.sm }}>
                {JOIN_POLICIES.map((p) => {
                  const active = setup.joinPolicy === p.value;
                  const { Icon: PolicyIcon } = p;
                  return (
                    <TouchableOpacity
                      key={p.value}
                      onPress={() => {
                        hapticLight();
                        updateSetup({ joinPolicy: p.value });
                      }}
                      style={[
                        styles.policyRow,
                        {
                          backgroundColor: active ? 'rgba(246,191,140,0.1)' : 'rgba(246,191,140,0.05)',
                          borderColor: active ? Theme.colors.sanctuarySaffron : 'rgba(246,191,140,0.2)',
                        },
                      ]}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: active ? Theme.colors.sanctuarySaffron : 'rgba(246,191,140,0.2)',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon
                          as={PolicyIcon}
                          size={18}
                          color={active ? Theme.colors.sacredWhite : colors.textSecondary}
                        />
                      </Box>
                      <VStack sx={{ flex: 1, marginLeft: Theme.spacing.md }}>
                        <Text sx={{ fontWeight: '700', color: colors.text, fontSize: 14 }}>{p.label}</Text>
                        <Text sx={{ fontSize: 12, color: colors.textSecondary }}>{p.description}</Text>
                      </VStack>
                      {active && (
                        <Icon as={CheckCircle} color={Theme.colors.sanctuarySaffron} size={20} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </VStack>
            </VStack>

            {error && (
              <Box sx={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: Theme.spacing.md, borderRadius: Theme.corners.comfortable }}>
                <Text sx={{ color: Theme.colors.emberRed, fontSize: 13 }}>{error}</Text>
              </Box>
            )}
          </VStack>
        )}

        {step === 'success' && (
          <VStack sx={{ gap: Theme.spacing.xl, alignItems: 'center', paddingVertical: Theme.spacing.lg }}>
            <Box sx={{ backgroundColor: 'rgba(246,191,140,0.1)', padding: 24, borderRadius: 60 }}>
              <Icon as={CheckCircle} color={Theme.colors.sanctuarySaffron} size={64} />
            </Box>
            
            <VStack sx={{ gap: Theme.spacing.sm, alignItems: 'center' }}>
              <Heading color={colors.text} size="xl" sx={{ textAlign: 'center' }}>
                Community Founded!
              </Heading>
              <Text sx={{ textAlign: 'center', color: colors.textSecondary }}>
                Your group <Text sx={{ fontWeight: 'bold', color: colors.text }}>{details.name}</Text> is ready to welcome its members.
              </Text>
            </VStack>

            {/* QR Code */}
            <Box
              sx={{
                backgroundColor: Theme.colors.sacredWhite,
                borderRadius: Theme.corners.generous,
                padding: Theme.spacing.lg,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
                elevation: 5,
              }}
            >
              <QRCodeGenerator
                value={groupQRValue}
                size={180}
                color={Theme.colors.obsidian}
                backgroundColor={Theme.colors.sacredWhite}
                label={createdGroupName}
                errorCorrectionLevel="H"
              />
            </Box>

            <HStack sx={{ gap: Theme.spacing.sm, alignItems: 'center', backgroundColor: colors.tertiary, padding: Theme.spacing.md, borderRadius: Theme.corners.comfortable, width: '100%' }}>
              <Icon as={QrCode} color={Theme.colors.sanctuarySaffron} size={16} />
              <Text sx={{ fontSize: 12, color: colors.textSecondary, flex: 1 }}>
                Others can scan this to join your community instantly.
              </Text>
            </HStack>
          </VStack>
        )}
      </VStack>
    </SanctuaryModal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Theme.corners.full,
    borderWidth: 1,
  },
  policyRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Theme.corners.comfortable,
    borderWidth: 1,
    padding: 16,
  },
  avatarPickerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: 'rgba(246,191,140,0.02)',
    padding: Theme.spacing.md,
    borderRadius: Theme.corners.comfortable,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(246,191,140,0.3)',
  },
});
