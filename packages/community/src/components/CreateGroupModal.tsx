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

import React, { useState } from 'react';
import {
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Heading,
    Text,
    VStack,
    HStack,
    Box,
    useThemedColors,
    Theme,
    hapticLight,
    hapticSuccess,
} from '@repo/ui';
import { TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { TextInput } from 'react-native';
import { X, Users, Globe, Lock, CheckCircle, QrCode } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommunityStackParamList } from '@repo/core';
import { communityAPI } from '../api/community';
import { QRBuilder, QRCodeGenerator } from '@repo/scanner-kit';
import { useUserRole, useStore } from '@repo/core';

// ── Types ─────────────────────────────────────────────────────────────────────

type GroupType = 'general' | 'club' | 'interest' | 'subject';
type JoinPolicy = 'open' | 'approval_required' | 'invite_only';

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
}

// ── Static data ───────────────────────────────────────────────────────────────

const GROUP_TYPES: TypeOption[] = [
    { value: 'general',  label: 'General',       emoji: '💬', description: 'Open discussion and sharing' },
    { value: 'club',     label: 'Club',           emoji: '🏆', description: 'Activity or interest club' },
    { value: 'interest', label: 'Interest Group', emoji: '✨', description: 'Shared hobby or passion' },
    { value: 'subject',  label: 'Subject Group',  emoji: '📚', description: 'Academic subject focus' },
];

const JOIN_POLICIES: PolicyOption[] = [
    {
        value: 'open',
        label: 'Open',
        description: 'Anyone can join instantly',
        Icon: Globe,
    },
    {
        value: 'approval_required',
        label: 'Approval Required',
        description: 'You approve each request',
        Icon: Users,
    },
    {
        value: 'invite_only',
        label: 'Invite Only',
        description: 'Members join via QR or link only',
        Icon: Lock,
    },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function CreateGroupModal({ isOpen, onClose, onCreated }: CreateGroupModalProps) {
    const colors = useThemedColors();
    const navigation = useNavigation<NativeStackNavigationProp<CommunityStackParamList>>();
    const { userId, schoolId } = useUserRole();
    const user = useStore(state => state.user);

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [groupType, setGroupType] = useState<GroupType>('general');
    const [joinPolicy, setJoinPolicy] = useState<JoinPolicy>('open');

    // Async state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Success state
    const [createdGroupId, setCreatedGroupId] = useState<string | null>(null);
    const [createdGroupName, setCreatedGroupName] = useState('');

    // ── Derived ────────────────────────────────────────────────────────────────
    const canSubmit = name.trim().length >= 2 && !isSubmitting;
    const groupQRValue = createdGroupId ? QRBuilder.group(createdGroupId) : '';

    // ── Handlers ───────────────────────────────────────────────────────────────

    const handleClose = () => {
        if (isSubmitting) return;
        resetForm();
        onClose();
    };

    const resetForm = () => {
        setName('');
        setDescription('');
        setGroupType('general');
        setJoinPolicy('open');
        setError(null);
        setCreatedGroupId(null);
        setCreatedGroupName('');
    };

    const handleSubmit = async () => {
        if (!canSubmit || !userId) return;
        hapticLight();
        setIsSubmitting(true);
        setError(null);

        try {
            const group = await communityAPI.createGroupWithAdmin(
                {
                    name: name.trim(),
                    description: description.trim() || null,
                    group_type: groupType,
                    join_policy: joinPolicy,
                    school_id: schoolId ?? null,
                },
                userId,
            );
            hapticSuccess();
            setCreatedGroupId(group.id);
            setCreatedGroupName(group.name ?? name.trim());
            onCreated?.(group.id);
        } catch (err: any) {
            setError(err?.message ?? 'Failed to create group. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenGroup = () => {
        if (!createdGroupId) return;
        handleClose();
        navigation.navigate('GroupDetails', { groupId: createdGroupId });
    };

    // ── Render: Success screen (QR code) ──────────────────────────────────────

    if (createdGroupId) {
        return (
            <Modal isOpen={isOpen} onClose={handleClose}>
                <ModalBackdrop />
                <ModalContent sx={{ backgroundColor: colors.secondary, borderRadius: Theme.corners.generous, marginHorizontal: 16 }}>
                    <ModalHeader>
                        <HStack justifyContent="space-between" alignItems="center" w="$full">
                            <HStack space="sm" alignItems="center">
                                <CheckCircle size={20} color={Theme.colors.sageGreen} />
                                <Heading color={Theme.colors.sageGreen} size="md">Circle Founded!</Heading>
                            </HStack>
                            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <X size={20} color={colors.textTertiary} />
                            </TouchableOpacity>
                        </HStack>
                    </ModalHeader>

                    <ModalBody>
                        <VStack space="md" alignItems="center" py="$2">
                            <Text color={colors.text} sx={{ fontWeight: '700', fontSize: Theme.typography.fontSize.lg, textAlign: 'center' }}>
                                {createdGroupName}
                            </Text>
                            <Text color={colors.textSecondary} sx={{ fontSize: Theme.typography.fontSize.sm, textAlign: 'center' }}>
                                Share this QR code with others so they can instantly join your circle.
                            </Text>

                            {/* QR Code */}
                            <Box
                                sx={{
                                    backgroundColor: Theme.colors.sacredWhite,
                                    borderRadius: Theme.corners.comfortable,
                                    padding: Theme.spacing.md,
                                    alignItems: 'center',
                                    marginVertical: Theme.spacing.sm,
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

                            <Box
                                sx={{
                                    backgroundColor: `${Theme.colors.sanctuarySaffron}15`,
                                    borderRadius: Theme.corners.comfortable,
                                    paddingHorizontal: Theme.spacing.md,
                                    paddingVertical: Theme.spacing.sm,
                                    borderWidth: 1,
                                    borderColor: `${Theme.colors.sanctuarySaffron}33`,
                                    width: '100%',
                                }}
                            >
                                <HStack space="sm" alignItems="flex-start">
                                    <QrCode size={16} color={Theme.colors.sanctuarySaffron} style={{ marginTop: 2 }} />
                                    <Text sx={{ flex: 1, fontSize: Theme.typography.fontSize.xs, color: colors.textSecondary, lineHeight: 18 }}>
                                        You are the admin of this circle. Manage members, set join policy, and post announcements from the group settings.
                                    </Text>
                                </HStack>
                            </Box>
                        </VStack>
                    </ModalBody>

                    <ModalFooter sx={{ borderTopWidth: 0 }}>
                        <VStack space="sm" w="$full">
                            <TouchableOpacity onPress={handleOpenGroup} style={[styles.primaryBtn, { backgroundColor: Theme.colors.sanctuarySaffron }]}>
                                <Text sx={{ color: Theme.colors.sacredWhite, fontWeight: '700', fontSize: Theme.typography.fontSize.md }}>
                                    Open Group →
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleClose} style={styles.ghostBtn}>
                                <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.sm }}>Done</Text>
                            </TouchableOpacity>
                        </VStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        );
    }

    // ── Render: Creation form ─────────────────────────────────────────────────

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <ModalBackdrop />
            <ModalContent sx={{ backgroundColor: colors.secondary, borderRadius: Theme.corners.generous, marginHorizontal: 16 }}>
                <ModalHeader>
                    <HStack justifyContent="space-between" alignItems="center" w="$full">
                        <Heading color={colors.text} size="lg">Found a New Circle</Heading>
                        <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <X size={20} color={colors.textTertiary} />
                        </TouchableOpacity>
                    </HStack>
                </ModalHeader>

                <ModalBody>
                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                        <VStack space="lg" py="$1">

                            {/* Name */}
                            <VStack space="xs">
                                <Text sx={{ fontSize: Theme.typography.fontSize.sm, fontWeight: '600', color: colors.text }}>
                                    Circle Name <Text sx={{ color: Theme.colors.emberRed }}>*</Text>
                                </Text>
                                <TextInput
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="e.g. Science Explorers, Reading Circle…"
                                    placeholderTextColor={colors.textTertiary}
                                    maxLength={60}
                                    style={[styles.input, { color: colors.text, backgroundColor: colors.tertiary, borderColor: colors.border }]}
                                />
                                <Text sx={{ fontSize: 11, color: colors.textTertiary, textAlign: 'right' }}>
                                    {name.length}/60
                                </Text>
                            </VStack>

                            {/* Description */}
                            <VStack space="xs">
                                <Text sx={{ fontSize: Theme.typography.fontSize.sm, fontWeight: '600', color: colors.text }}>
                                    Description <Text sx={{ color: colors.textTertiary }}>(optional)</Text>
                                </Text>
                                <TextInput
                                    value={description}
                                    onChangeText={setDescription}
                                    placeholder="What is this circle about?"
                                    placeholderTextColor={colors.textTertiary}
                                    multiline
                                    numberOfLines={3}
                                    maxLength={200}
                                    style={[styles.textarea, { color: colors.text, backgroundColor: colors.tertiary, borderColor: colors.border }]}
                                />
                            </VStack>

                            {/* Group Type */}
                            <VStack space="xs">
                                <Text sx={{ fontSize: Theme.typography.fontSize.sm, fontWeight: '600', color: colors.text }}>
                                    Type
                                </Text>
                                <HStack flexWrap="wrap" sx={{ gap: 8 }}>
                                    {GROUP_TYPES.map((t) => {
                                        const active = groupType === t.value;
                                        return (
                                            <TouchableOpacity
                                                key={t.value}
                                                onPress={() => { hapticLight(); setGroupType(t.value); }}
                                                style={[
                                                    styles.typeChip,
                                                    {
                                                        backgroundColor: active ? Theme.colors.sanctuarySaffron : colors.tertiary,
                                                        borderColor: active ? Theme.colors.sanctuarySaffron : colors.border,
                                                    },
                                                ]}
                                            >
                                                <Text sx={{ fontSize: 14 }}>{t.emoji}</Text>
                                                <Text sx={{ fontSize: 12, fontWeight: active ? '700' : '400', color: active ? Theme.colors.sacredWhite : colors.text, marginLeft: 4 }}>
                                                    {t.label}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </HStack>
                            </VStack>

                            {/* Join Policy */}
                            <VStack space="xs">
                                <Text sx={{ fontSize: Theme.typography.fontSize.sm, fontWeight: '600', color: colors.text }}>
                                    Who Can Join?
                                </Text>
                                <VStack space="sm">
                                    {JOIN_POLICIES.map((p) => {
                                        const active = joinPolicy === p.value;
                                        const { Icon } = p;
                                        return (
                                            <TouchableOpacity
                                                key={p.value}
                                                onPress={() => { hapticLight(); setJoinPolicy(p.value); }}
                                                style={[
                                                    styles.policyRow,
                                                    {
                                                        backgroundColor: active ? `${Theme.colors.sanctuarySaffron}15` : colors.tertiary,
                                                        borderColor: active ? Theme.colors.sanctuarySaffron : colors.border,
                                                    },
                                                ]}
                                            >
                                                <Box sx={{
                                                    width: 36,
                                                    height: 36,
                                                    borderRadius: 18,
                                                    backgroundColor: active ? Theme.colors.sanctuarySaffron : colors.secondary,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}>
                                                    <Icon size={16} color={active ? Theme.colors.sacredWhite : colors.textSecondary} />
                                                </Box>
                                                <VStack sx={{ flex: 1, marginLeft: 12, gap: 2 }}>
                                                    <Text sx={{ fontWeight: '600', fontSize: Theme.typography.fontSize.sm, color: colors.text }}>
                                                        {p.label}
                                                    </Text>
                                                    <Text sx={{ fontSize: 12, color: colors.textSecondary }}>
                                                        {p.description}
                                                    </Text>
                                                </VStack>
                                                {active && <CheckCircle size={18} color={Theme.colors.sanctuarySaffron} />}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </VStack>
                            </VStack>

                            {/* Error */}
                            {error && (
                                <Box sx={{
                                    backgroundColor: `${Theme.colors.emberRed}15`,
                                    borderRadius: Theme.corners.comfortable,
                                    paddingHorizontal: Theme.spacing.md,
                                    paddingVertical: Theme.spacing.sm,
                                    borderWidth: 1,
                                    borderColor: `${Theme.colors.emberRed}40`,
                                }}>
                                    <Text sx={{ fontSize: Theme.typography.fontSize.sm, color: Theme.colors.emberRed }}>
                                        {error}
                                    </Text>
                                </Box>
                            )}
                        </VStack>
                    </ScrollView>
                </ModalBody>

                <ModalFooter sx={{ borderTopWidth: 0 }}>
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={!canSubmit}
                        style={[
                            styles.primaryBtn,
                            {
                                backgroundColor: canSubmit ? Theme.colors.sanctuarySaffron : colors.border,
                                opacity: isSubmitting ? 0.8 : 1,
                            },
                        ]}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator size="small" color={Theme.colors.sacredWhite} />
                        ) : (
                            <Text sx={{ color: Theme.colors.sacredWhite, fontWeight: '700', fontSize: Theme.typography.fontSize.md }}>
                                Found this Circle
                            </Text>
                        )}
                    </TouchableOpacity>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    input: {
        height: 44,
        borderRadius: Theme.corners.comfortable,
        borderWidth: 1,
        paddingHorizontal: Theme.spacing.md,
        fontSize: Theme.typography.fontSize.sm,
    },
    textarea: {
        borderRadius: Theme.corners.comfortable,
        borderWidth: 1,
        paddingHorizontal: Theme.spacing.md,
        paddingVertical: Theme.spacing.sm,
        fontSize: Theme.typography.fontSize.sm,
        minHeight: 88,
        textAlignVertical: 'top',
    },
    typeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: Theme.corners.full,
        borderWidth: 1,
    },
    policyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: Theme.corners.comfortable,
        borderWidth: 1,
        padding: 12,
    },
    primaryBtn: {
        height: 48,
        borderRadius: Theme.corners.comfortable,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    ghostBtn: {
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
