import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    useThemedColors,
    Theme,
    GlobalHeader,
    ScreenWrapper,
    useBottomTabPadding
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { MapPin, Mail, Phone, Shield, Edit3, Check, X, User, FileText } from 'lucide-react-native';
import { supabase } from '@repo/core';
import { hapticSuccess, hapticLight, hapticError } from '@repo/ui';
import IdentityCard from '../../components/profile/IdentityCard';

interface FullProfileScreenProps {
    route: {
        params: {
            profile: any;
        }
    };
    navigation: any;
}

interface EditState {
    value: string;
    saved: boolean;
    saving: boolean;
    error: string | null;
}

export default function FullProfileScreen({ route, navigation }: FullProfileScreenProps) {
    const { profile: initialProfile } = route.params;
    const { t } = useTranslation();
    const colors = useThemedColors();
    const bottomPadding = useBottomTabPadding();

    const [profile, setProfile] = useState<any>(initialProfile);
    const [editingField, setEditingField] = useState<string | null>(null);

    // Per-field edit state: { fieldKey: { value, saved, saving, error } }
    const [fieldStates, setFieldStates] = useState<Record<string, EditState>>({});

    // Track all auto-dismiss timers so they can be cleared on unmount
    const dismissTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
        if (initialProfile) {
            setProfile(initialProfile);
        }
    }, [initialProfile]);

    // Clear all pending dismiss timers when the screen unmounts
    useEffect(() => {
        return () => {
            dismissTimers.current.forEach(id => clearTimeout(id));
        };
    }, []);

    if (!profile) return null;

    const startEdit = (field: string, currentValue: string) => {
        hapticLight();
        setEditingField(field);
        setFieldStates(prev => ({
            ...prev,
            [field]: { value: currentValue || '', saved: false, saving: false, error: null }
        }));
    };

    const cancelEdit = (field: string) => {
        setEditingField(null);
        setFieldStates(prev => {
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const saveField = async (field: string) => {
        const state = fieldStates[field];
        if (!state || !profile?.id) return;

        setFieldStates(prev => ({ ...prev, [field]: { ...prev[field], saving: true, error: null } }));

        try {
            const { error } = await supabase
                .from('users')
                .update({ [field]: state.value })
                .eq('id', profile.id);

            if (error) throw error;

            setProfile((prev: any) => ({ ...prev, [field]: state.value }));
            setFieldStates(prev => ({ ...prev, [field]: { ...prev[field], saving: false, saved: true, error: null } }));
            setEditingField(null);
            hapticSuccess();

            // Clear the saved tick after 3 seconds; store the timer id to cancel on unmount
            const timerId = setTimeout(() => {
                setFieldStates(prev => {
                    if (prev[field]?.saved) {
                        const next = { ...prev };
                        delete next[field];
                        return next;
                    }
                    return prev;
                });
            }, 3000);
            dismissTimers.current.push(timerId);
        } catch (err) {
            console.error('Error saving field:', err);
            hapticError();
            setFieldStates(prev => ({
                ...prev,
                [field]: { ...prev[field], saving: false, error: t('common.saveFailed', 'Failed to save') },
            }));
        }
    };

    const EditableRow = ({
        field,
        label,
        currentValue,
        icon: Icon,
        multiline = false,
        readOnly = false,
    }: {
        field: string;
        label: string;
        currentValue: string;
        icon: any;
        multiline?: boolean;
        readOnly?: boolean;
    }) => {
        const state = fieldStates[field];
        const isEditing = editingField === field;
        const isSaved = state?.saved;

        return (
            <Box
                style={{
                    backgroundColor: colors.tertiary,
                    borderRadius: Theme.corners.comfortable,
                    padding: Theme.spacing.md,
                    borderWidth: 1,
                    borderColor: isSaved ? colors.success : colors.border,
                }}
            >
                <HStack justifyContent="space-between" alignItems="flex-start">
                    <HStack space="md" alignItems="flex-start" style={{ flex: 1 }}>
                        <Box
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                backgroundColor: `${colors.action}15`,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginTop: 2,
                            }}
                        >
                            <Icon size={18} color={colors.action} />
                        </Box>
                        <VStack style={{ flex: 1 }}>
                            <Text size="xs" color={colors.textSecondary} style={{ marginBottom: 4 }}>
                                {label}
                            </Text>
                            {isEditing ? (
                                <TextInput
                                    value={state?.value ?? ''}
                                    onChangeText={(val) =>
                                        setFieldStates(prev => ({ ...prev, [field]: { ...prev[field], value: val } }))
                                    }
                                    multiline={multiline}
                                    numberOfLines={multiline ? 3 : 1}
                                    style={{
                                        color: colors.text,
                                        fontSize: 16,
                                        borderBottomWidth: 1,
                                        borderBottomColor: colors.action,
                                        paddingVertical: 4,
                                        minHeight: multiline ? 64 : 32,
                                    }}
                                    autoFocus
                                    returnKeyType={multiline ? 'default' : 'done'}
                                />
                            ) : (
                                <Text size="md" color={colors.text} bold>
                                    {currentValue || t('common.notProvided', 'Not provided')}
                                </Text>
                            )}
                            {/* Inline error message */}
                            {state?.error && (
                                <Text size="xs" color={colors.error} style={{ marginTop: 4 }}>
                                    {state.error}
                                </Text>
                            )}
                        </VStack>
                    </HStack>

                    {/* Action icons */}
                    <HStack space="sm" alignItems="center" style={{ marginTop: 4 }}>
                        {isSaved && !isEditing && (
                            <Box
                                style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 14,
                                    backgroundColor: `${colors.success}20`,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Check size={16} color={colors.success} />
                            </Box>
                        )}
                        {!readOnly && (
                            isEditing ? (
                                <HStack space="sm">
                                    <TouchableOpacity
                                        onPress={() => cancelEdit(field)}
                                        style={styles.actionBtn}
                                    >
                                        <X size={16} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => saveField(field)}
                                        disabled={state?.saving}
                                        style={[styles.actionBtn, { backgroundColor: `${colors.action}20` }]}
                                    >
                                        <Check size={16} color={colors.action} />
                                    </TouchableOpacity>
                                </HStack>
                            ) : (
                                <TouchableOpacity
                                    onPress={() => startEdit(field, currentValue)}
                                    style={styles.actionBtn}
                                >
                                    <Edit3 size={16} color={colors.textTertiary} />
                                </TouchableOpacity>
                            )
                        )}
                    </HStack>
                </HStack>
            </Box>
        );
    };

    return (
        <ScreenWrapper scroll={false}>
            <GlobalHeader
                title={t('profile.editProfile', 'Edit Profile')}
                showBack
                onBack={() => navigation.goBack()}
            />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={{ paddingBottom: bottomPadding + Theme.spacing.xl }}
                    showsVerticalScrollIndicator={false}
                >
                    <VStack space="xl" style={{ padding: Theme.spacing.md }}>

                        {/* Identity Card */}
                        <IdentityCard profile={profile} />

                        {/* Centered User ID */}
                        <Box alignItems="center">
                            <Text size="xs" color={colors.textTertiary} style={{ textAlign: 'center' }}>
                                {t('profile.userId', 'User ID')}
                            </Text>
                            <Text
                                size="xs"
                                color={colors.textTertiary}
                                style={{ textAlign: 'center', fontFamily: 'monospace', marginTop: 2 }}
                            >
                                {profile.id}
                            </Text>
                        </Box>

                        {/* Editable Fields */}
                        <Box
                            style={{
                                backgroundColor: colors.secondary,
                                borderRadius: Theme.corners.comfortable,
                                padding: Theme.spacing.lg,
                                borderWidth: 1,
                                borderColor: colors.border,
                            }}
                        >
                            <Heading size="md" color={colors.text} style={{ marginBottom: Theme.spacing.md }}>
                                {t('profile.personalDetails', 'Personal Details')}
                            </Heading>

                            <VStack space="md">
                                <EditableRow
                                    field="full_name"
                                    label={t('profile.fullName', 'Full Name')}
                                    currentValue={profile.full_name}
                                    icon={User}
                                />
                                <EditableRow
                                    field="phone"
                                    label={t('profile.phone', 'Phone Number')}
                                    currentValue={profile.phone}
                                    icon={Phone}
                                />
                                <EditableRow
                                    field="bio"
                                    label={t('profile.bio', 'Bio')}
                                    currentValue={profile.bio}
                                    icon={FileText}
                                    multiline
                                />
                                <EditableRow
                                    field="email"
                                    label={t('profile.email', 'Email')}
                                    currentValue={profile.email}
                                    icon={Mail}
                                    readOnly
                                />
                                <EditableRow
                                    field="school_name"
                                    label={t('profile.school', 'School')}
                                    currentValue={profile.school_name}
                                    icon={MapPin}
                                    readOnly
                                />
                                <EditableRow
                                    field="role"
                                    label={t('profile.role', 'Role')}
                                    currentValue={t(`role.${profile.role}`, profile.role)}
                                    icon={Shield}
                                    readOnly
                                />
                            </VStack>
                        </Box>

                        {/* Member Since */}
                        {profile.created_at && (
                            <Box alignItems="center">
                                <Text size="xs" color={colors.textTertiary}>
                                    {t('profile.memberSince', 'Member since')} {new Date(profile.created_at).toLocaleDateString()}
                                </Text>
                            </Box>
                        )}

                    </VStack>
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    actionBtn: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
});

