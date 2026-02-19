// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import {
    Box,
    VStack,
    Text,
    Button,
    ButtonText,
    Input,
    InputField,
    Heading,
    HStack,
    Pressable,
    Select,
    SelectTrigger,
    SelectInput,
    SelectIcon,
    SelectPortal,
    SelectBackdrop,
    SelectContent,
    SelectDragIndicatorWrapper,
    SelectDragIndicator,
    SelectItem,
    Image,
    Center,
} from '@repo/ui';
import { X, Save, User, Briefcase, ChevronDown, Camera } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Theme } from '@repo/ui';
import { supabase, useStore, UserRole } from '@repo/core';
import * as ImagePicker from 'expo-image-picker';

interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: () => void;
    currentProfile: any;
}

export default function EditProfileModal({ visible, onClose, onSave, currentProfile }: EditProfileModalProps) {
    const { t } = useTranslation();
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [bio, setBio] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const setStoreRole = useStore(state => state.setUserRole);

    useEffect(() => {
        if (currentProfile) {
            setFullName(currentProfile.full_name || '');
            setPhone(currentProfile.phone || '');
            setBio(currentProfile.bio || '');
            setSelectedRole(currentProfile.role);
            setAvatarUrl(currentProfile.avatar_url);
        }
    }, [currentProfile]);

    const handlePickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                // Show the image optimistically in UI
                setAvatarUrl(result.assets[0].uri);
                // Note: Upload will be handled when user saves the profile
                // The actual upload to Supabase Storage should happen in handleSave
            }
        } catch (error) {
            console.error('Error picking image:', error);
            hapticError();
        }
    };

    // Remove unused uploadAvatar function
    // const uploadAvatar = async (asset: ImagePicker.ImagePickerAsset) => {
    //     // This function is no longer needed as upload will be handled in handleSave
    // };

    const handleSave = async () => {
        if (!currentProfile?.id) return;

        setLoading(true);
        hapticLight();

        try {
            const updates: any = {
                full_name: fullName,
                phone: phone,
                bio: bio
            };

            // Only update avatar if it's a remote URL (already uploaded to Supabase Storage)
            // Don't persist local file:// URIs to the database
            if (avatarUrl &&
                avatarUrl !== (currentProfile?.avatar_url || null) &&
                (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://'))) {
                updates.avatar_url = avatarUrl;
            }
            // TODO: Implement actual Supabase Storage upload for local file URIs
            // Example flow:
            // if (avatarUrl && avatarUrl.startsWith('file://')) {
            //     const uploadedUrl = await uploadToSupabaseStorage(avatarUrl);
            //     updates.avatar_url = uploadedUrl;
            // }

            // Only update role if changed
            if (selectedRole && selectedRole !== currentProfile.role) {
                updates.role = selectedRole;
            }

            const { error } = await supabase
                .from('users')
                .update(updates)
                .eq('id', currentProfile.id);

            if (error) throw error;

            // Update local store immediately for instant feedback
            if (updates.role) {
                setStoreRole(updates.role);
            }

            hapticSuccess();
            onSave(); // Refresh parent
            onClose();
        } catch (error) {
            console.error('Error updating profile:', error);
            hapticError();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <Box style={styles.overlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={{ width: '100%', height: '100%', justifyContent: 'flex-end' }}
                    >
                        <Box style={styles.modalContent}>
                            {/* Header */}
                            <HStack justifyContent="space-between" alignItems="center" mb={Theme.spacing.xl}>
                                <Heading color={Theme.colors.sacredWhite} size="lg">
                                    {t('profile.settings')}
                                </Heading>
                                <Pressable onPress={onClose} p={Theme.spacing.xs}>
                                    <X color={Theme.colors.mistGray} size={24} />
                                </Pressable>
                            </HStack>

                            <VStack space="xl">
                                {/* Photo Edit Section */}
                                <Center>
                                    <Box>
                                        <Image
                                            source={{ uri: avatarUrl || 'https://via.placeholder.com/150' }}
                                            alt="Profile"
                                            style={{
                                                width: 100,
                                                height: 100,
                                                borderRadius: 50,
                                                borderWidth: 2,
                                                borderColor: Theme.colors.sanctuarySaffron
                                            }}
                                        />
                                        <Pressable
                                            onPress={handlePickImage}
                                            style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                right: 0,
                                                backgroundColor: Theme.colors.midnightBlue,
                                                padding: 8,
                                                borderRadius: 20,
                                                borderWidth: 1,
                                                borderColor: Theme.colors.sanctuarySaffron
                                            }}
                                        >
                                            <Camera size={16} color={Theme.colors.sanctuarySaffron} />
                                        </Pressable>
                                    </Box>
                                    <Text color={Theme.colors.mistGray} size="xs" mt="$2">
                                        {t('profile.uploadComingSoon') || 'Upload feature coming soon'}
                                    </Text>
                                </Center>

                                {/* Name Input */}
                                <VStack space="xs">
                                    <Text color={Theme.colors.dimGray} size="sm">{t('profile.fullName')}</Text>
                                    <Input
                                        size="xl"
                                        variant="outline"
                                        style={styles.input}
                                        isInvalid={false}
                                        isDisabled={loading}
                                    >
                                        <InputField
                                            color={Theme.colors.sacredWhite}
                                            value={fullName}
                                            onChangeText={setFullName}
                                            placeholder={t('auth.fullName')}
                                            placeholderTextColor={Theme.colors.stoneGray}
                                        />
                                    </Input>
                                </VStack>

                                {/* Phone Input */}
                                <VStack space="xs">
                                    <Text color={Theme.colors.dimGray} size="sm">{t('profile.phone') || 'Phone Number'}</Text>
                                    <Input
                                        size="xl"
                                        variant="outline"
                                        style={styles.input}
                                        isInvalid={false}
                                        isDisabled={loading}
                                    >
                                        <InputField
                                            color={Theme.colors.sacredWhite}
                                            value={phone}
                                            onChangeText={setPhone}
                                            placeholder="+94 XX XXX XXXX"
                                            placeholderTextColor={Theme.colors.stoneGray}
                                            keyboardType="phone-pad"
                                        />
                                    </Input>
                                </VStack>

                                {/* Bio Input */}
                                <VStack space="xs">
                                    <Text color={Theme.colors.dimGray} size="sm">{t('profile.bio') || 'Bio'}</Text>
                                    <Input
                                        size="xl"
                                        variant="outline"
                                        style={[styles.input, { height: 100 }]}
                                        isInvalid={false}
                                        isDisabled={loading}
                                    >
                                        <InputField
                                            color={Theme.colors.sacredWhite}
                                            value={bio}
                                            onChangeText={setBio}
                                            placeholder="Tell us about yourself..."
                                            placeholderTextColor={Theme.colors.stoneGray}
                                            multiline
                                            numberOfLines={4}
                                        />
                                    </Input>
                                </VStack>

                                {/* Role Selector (Developer Mode) */}
                                <Box>
                                    <Text color={Theme.colors.dimGray} size="sm" mb="$1">{t('profile.role')} (Developer Access)</Text>
                                    <Select
                                        selectedValue={selectedRole || 'student'}
                                        onValueChange={(value) => setSelectedRole(value as UserRole)}
                                    >
                                        <SelectTrigger
                                            variant="outline"
                                            size="xl"
                                            style={styles.input}
                                        >
                                            <SelectInput
                                                placeholder="Select role"
                                                color={Theme.colors.sacredWhite}
                                            />
                                            <SelectIcon mr="$3" as={ChevronDown} color={Theme.colors.mistGray} />
                                        </SelectTrigger>
                                        <SelectPortal>
                                            <SelectBackdrop />
                                            <SelectContent>
                                                <SelectDragIndicatorWrapper>
                                                    <SelectDragIndicator />
                                                </SelectDragIndicatorWrapper>
                                                <SelectItem label={t('role.student')} value="student" />
                                                <SelectItem label={t('role.teacher')} value="teacher" />
                                                <SelectItem label={t('role.section_head')} value="section_head" />
                                                <SelectItem label={t('role.grade_head')} value="grade_head" />
                                                <SelectItem label={t('role.principal')} value="principal" />
                                                <SelectItem label={t('role.developer')} value="developer" />
                                            </SelectContent>
                                        </SelectPortal>
                                    </Select>
                                </Box>

                                {/* Action Buttons */}
                                <Button
                                    size="xl"
                                    variant="solid"
                                    action="primary"
                                    isDisabled={loading}
                                    onPress={handleSave}
                                    style={{
                                        backgroundColor: Theme.colors.sanctuarySaffron,
                                        borderRadius: Theme.corners.comfortable
                                    }}
                                >
                                    <ButtonText color={Theme.colors.sacredWhite}>
                                        {loading ? t('common.processing') : t('common.save')}
                                    </ButtonText>
                                    {!loading && <Save size={20} color={Theme.colors.sacredWhite} style={{ marginLeft: 8 }} />}
                                </Button>
                            </VStack>
                        </Box>
                    </KeyboardAvoidingView>
                </Box>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Theme.colors.voidIndigo,
        borderTopLeftRadius: Theme.corners.generous,
        borderTopRightRadius: Theme.corners.generous,
        padding: Theme.spacing.xl,
        paddingBottom: 40,
        ...Theme.shadows.lg,
    },
    input: {
        borderColor: Theme.colors.deepIndigo,
        backgroundColor: Theme.colors.midnightBlue,
        borderRadius: Theme.corners.comfortable,
        height: 56,
    },
    readOnlyBox: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: Theme.spacing.md,
        borderRadius: Theme.corners.comfortable,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    }
});
