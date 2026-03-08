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
    useTheme,
} from '@repo/ui';
import { X, Save, ChevronDown, Camera } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Theme } from '@repo/ui';
import { supabase, useStore, UserRole, uploadToCloudinary, handleAPIError } from '@repo/core';
import { hapticSuccess, hapticLight, hapticError } from '@repo/ui';
import * as ImagePicker from 'expo-image-picker';

interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: () => void;
    currentProfile: any;
}

export default function EditProfileModal({ visible, onClose, onSave, currentProfile }: EditProfileModalProps) {
    const { t } = useTranslation();
    const { text, accent, glass } = useTheme();
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [bio, setBio] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [nicNumber, setNicNumber] = useState('');
    const [indexNumber, setIndexNumber] = useState('');
    const setStoreRole = useStore(state => state.setUserRole);

    useEffect(() => {
        if (currentProfile) {
            setFullName(currentProfile.full_name || '');
            setPhone(currentProfile.phone || '');
            setBio(currentProfile.bio || '');
            setSelectedRole(currentProfile.role);
            setAvatarUrl(currentProfile.avatar_url);
            setNicNumber(currentProfile.nic_number || '');
            setIndexNumber(currentProfile.index_number || '');
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
                bio: bio,
                nic_number: (selectedRole === 'teacher' || selectedRole === 'principal') ? nicNumber : null,
                index_number: selectedRole === 'student' ? indexNumber : null
            };

            // Handle Avatar Upload
            if (avatarUrl && avatarUrl.startsWith('file://')) {
                try {
                    const uploadedUrl = await uploadToCloudinary(avatarUrl, 'image');
                    updates.avatar_url = uploadedUrl;
                } catch (uploadError) {
                    handleAPIError(new Error('Failed to upload profile picture. Using current profile data.'));
                    // Continue with other updates even if upload fails
                }
            } else if (avatarUrl && (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://'))) {
                updates.avatar_url = avatarUrl;
            }

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
                        <Box style={[styles.modalContent, { backgroundColor: glass.modal.bg, borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1, borderColor: glass.modal.border }]}>
                            {/* Header */}
                            <HStack justifyContent="space-between" alignItems="center" mb={Theme.spacing.xl}>
                                <Heading {...({ color: text.primary, size: "lg" } as any)}>
                                    {t('profile.settings')}
                                </Heading>
                                <Pressable
                                    onPress={onClose}
                                    sx={{ padding: Theme.spacing.xs }}
                                >
                                    <X color={text.muted} size={24} />
                                </Pressable>
                            </HStack>

                            <VStack space="xl">
                                {/* Photo Edit Section */}
                                <Center>
                                    <Box>
                                        <Image
                                            source={{ uri: avatarUrl || 'https://via.placeholder.com/150' }}
                                            alt="Profile"
                                            sx={{
                                                width: 100,
                                                height: 100,
                                                borderRadius: "$full" as any,
                                                borderWidth: 2,
                                                borderColor: accent.action
                                            }}
                                        />
                                        <Pressable
                                            onPress={handlePickImage}
                                            style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                right: 0,
                                                backgroundColor: glass.modal.bg,
                                                padding: 8,
                                                borderRadius: 20,
                                                borderWidth: 1,
                                                borderColor: accent.action
                                            }}
                                        >
                                            <Camera size={16} color={accent.action} />
                                        </Pressable>
                                    </Box>
                                    <Text {...({ color: text.muted, size: "xs", mt: "$2" } as any)}>
                                        {t('profile.tapToChange')}
                                    </Text>
                                </Center>

                                {/* Name Input */}
                                <VStack space="xs">
                                    <Text {...({ color: text.secondary, size: "sm" } as any)}>{t('profile.fullName')}</Text>
                                    <Input
                                        size="xl"
                                        variant="outline"
                                        style={[styles.input, { borderColor: glass.interact.border, backgroundColor: glass.interact.bg }]}
                                        isInvalid={false}
                                        isDisabled={loading}
                                    >
                                        <InputField
                                            {...({ color: text.primary } as any)}
                                            value={fullName}
                                            onChangeText={setFullName}
                                            placeholder={t('auth.fullName')}
                                            placeholderTextColor={text.muted}
                                        />
                                    </Input>
                                </VStack>

                                {/* Phone Input */}
                                <VStack space="xs">
                                    <Text {...({ color: text.secondary, size: "sm" } as any)}>{t('profile.phone') || 'Phone Number'}</Text>
                                    <Input
                                        size="xl"
                                        variant="outline"
                                        style={[styles.input, { borderColor: glass.interact.border, backgroundColor: glass.interact.bg }]}
                                        isInvalid={false}
                                        isDisabled={loading}
                                    >
                                        <InputField
                                            {...({ color: text.primary } as any)}
                                            value={phone}
                                            onChangeText={setPhone}
                                            placeholder="+94 XX XXX XXXX"
                                            placeholderTextColor={text.muted}
                                            keyboardType="phone-pad"
                                        />
                                    </Input>
                                </VStack>

                                {/* Bio Input */}
                                <VStack space="xs">
                                    <Text {...({ color: text.secondary, size: "sm" } as any)}>{t('profile.bio') || 'Bio'}</Text>
                                    <Input
                                        size="xl"
                                        variant="outline"
                                        style={[styles.input, { height: 100, borderColor: glass.interact.border, backgroundColor: glass.interact.bg }]}
                                        isInvalid={false}
                                        isDisabled={loading}
                                    >
                                        <InputField
                                            {...({ color: text.primary } as any)}
                                            value={bio}
                                            onChangeText={setBio}
                                            placeholder="Tell us about yourself..."
                                            placeholderTextColor={text.muted}
                                            multiline
                                            numberOfLines={4}
                                        />
                                    </Input>
                                </VStack>

                                {/* NIC Number (Teachers/Principals) */}
                                {(selectedRole === 'teacher' || selectedRole === 'principal') && (
                                    <VStack space="xs">
                                        <Text {...({ color: text.secondary, size: "sm" } as any)}>{t('profile.nicNumber') || 'NIC Number'}</Text>
                                        <Input
                                            size="xl"
                                            variant="outline"
                                            style={[styles.input, { borderColor: glass.interact.border, backgroundColor: glass.interact.bg }]}
                                            isDisabled={loading}
                                        >
                                            <InputField
                                                {...({ color: text.primary } as any)}
                                                value={nicNumber}
                                                onChangeText={setNicNumber}
                                                placeholder="e.g. 19XXXXXXXXXX"
                                                placeholderTextColor={text.muted}
                                            />
                                        </Input>
                                    </VStack>
                                )}

                                {/* Index Number (Students) */}
                                {selectedRole === 'student' && (
                                    <VStack space="xs">
                                        <Text {...({ color: text.secondary, size: "sm" } as any)}>{t('profile.indexNumber') || 'Index Number'}</Text>
                                        <Input
                                            size="xl"
                                            variant="outline"
                                            style={[styles.input, { borderColor: glass.interact.border, backgroundColor: glass.interact.bg }]}
                                            isDisabled={loading}
                                        >
                                            <InputField
                                                {...({ color: text.primary } as any)}
                                                value={indexNumber}
                                                onChangeText={setIndexNumber}
                                                placeholder="e.g. STU-XXXXX"
                                                placeholderTextColor={text.muted}
                                            />
                                        </Input>
                                    </VStack>
                                )}

                                {/* Role Selector (Developer Mode) */}
                                <Box>
                                    <Text {...({ color: text.secondary, size: "sm", mb: "$1" } as any)}>{t('profile.role')} (Developer Access)</Text>
                                    <Select
                                        selectedValue={selectedRole || 'student'}
                                        onValueChange={(value: string | null) => setSelectedRole(value as UserRole)}
                                    >
                                        <SelectTrigger
                                            variant="outline"
                                            size="xl"
                                            style={[styles.input, { borderColor: glass.interact.border, backgroundColor: glass.interact.bg }]}
                                        >
                                            <SelectInput
                                                placeholder="Select role"
                                                {...({ color: text.primary } as any)}
                                            />
                                            <SelectIcon mr="$3" as={ChevronDown} color={text.muted} />
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
                                        backgroundColor: accent.action,
                                        borderRadius: Theme.corners.comfortable
                                    }}
                                >
                                    <ButtonText {...({ color: text.inverse } as any)}>
                                        {loading ? t('common.processing') : t('common.save')}
                                    </ButtonText>
                                    {!loading && <Save size={20} color={text.inverse} style={{ marginLeft: 8 }} />}
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
        // Ink-based dimming derived from Theme.colors.ink — not black rgba(0,0,0,x)
        backgroundColor: Theme.colors.ink + '99',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: Theme.corners.generous,
        borderTopRightRadius: Theme.corners.generous,
        padding: Theme.spacing.xl,
        paddingBottom: 40,
        ...Theme.shadows.lg,
    },
    input: {
        borderRadius: Theme.corners.comfortable,
        height: 56,
    },
    readOnlyBox: {
        padding: Theme.spacing.md,
        borderRadius: Theme.corners.comfortable,
        borderWidth: 1,
    }
});
