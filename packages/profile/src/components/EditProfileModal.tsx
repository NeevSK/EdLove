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
    Theme
} from '@repo/ui';
import { X, Save, ChevronDown, Camera } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { usePermissions, Role, handleAPIError } from '@repo/core';
import { hapticSuccess, hapticLight, hapticError } from '@repo/ui';
import * as ImagePicker from 'expo-image-picker';
import { profileAPI } from '../api/profile';

interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: () => void;
    currentProfile: any;
}

export default function EditProfileModal({ visible, onClose, onSave, currentProfile }: EditProfileModalProps) {
    const { t } = useTranslation();
    const { text, accent, glass } = useTheme();
    const { ability } = usePermissions();
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [bio, setBio] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [nicNumber, setNicNumber] = useState('');
    const [indexNumber, setIndexNumber] = useState('');

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
                setAvatarUrl(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            hapticError();
        }
    };

    const handleSave = async () => {
        if (!currentProfile?.id) return;

        setLoading(true);
        hapticLight();

        try {
            const isStaff = ability.can('update', 'TeacherProfile');
            const isStudent = ability.can('update', 'StudentProfile');

            const updates: Record<string, any> = {
                full_name: fullName,
                phone: phone,
                bio: bio,
                nic_number: isStaff ? nicNumber : null,
                index_number: isStudent ? indexNumber : null
            };

            if (avatarUrl && avatarUrl.startsWith('file://')) {
                try {
                    const updatedProfile = await profileAPI.uploadAvatar(currentProfile.id, avatarUrl);
                    updates.avatar_url = updatedProfile?.avatar_url;
                } catch (uploadError) {
                    handleAPIError(new Error('Failed to upload profile picture. Using current profile data.'));
                }
            } else if (avatarUrl && (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://'))) {
                updates.avatar_url = avatarUrl;
            }

            if (selectedRole && selectedRole !== currentProfile.role && ability.can('manage', 'all')) {
                updates.role = selectedRole;
            }

            await profileAPI.updateProfile(currentProfile.id, updates);

            hapticSuccess();
            onSave();
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
                        <Box sx={{ 
                            backgroundColor: glass.modal.bg, 
                            borderTopLeftRadius: Theme.corners.generous,
                            borderTopRightRadius: Theme.corners.generous,
                            padding: Theme.spacing.xl,
                            paddingBottom: 40,
                            borderTopWidth: 1, 
                            borderLeftWidth: 1, 
                            borderRightWidth: 1, 
                            borderColor: glass.modal.border,
                            ...Theme.shadows.lg
                        }}>
                            <HStack sx={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: Theme.spacing.xl }}>
                                <Heading sx={{ color: text.primary }} size="lg">
                                    {t('profile.settings') || 'Edit Profile'}
                                </Heading>
                                <Pressable
                                    onPress={onClose}
                                    sx={{ padding: Theme.spacing.xs }}
                                >
                                    <X color={text.muted} size={24} />
                                </Pressable>
                            </HStack>

                            <VStack space="xl">
                                <Center>
                                    <Box sx={{ position: 'relative' }}>
                                        <Image
                                            source={{ uri: avatarUrl || 'https://via.placeholder.com/150' }}
                                            alt="Profile"
                                            sx={{
                                                width: 100,
                                                height: 100,
                                                borderRadius: 50,
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
                                    <Text sx={{ color: text.muted, marginTop: 8 }} size="xs">
                                        {t('profile.tapToChange') || 'Tap to change photo'}
                                    </Text>
                                </Center>

                                <VStack space="xs">
                                    <Text sx={{ color: text.secondary }} size="sm">
                                        {t('profile.fullName') || 'Full Name'}
                                    </Text>
                                    <Input
                                        size="xl"
                                        variant="outline"
                                        style={[styles.input, { borderColor: glass.interact.border, backgroundColor: glass.interact.bg }]}
                                        isDisabled={loading}
                                    >
                                        <InputField
                                            sx={{ color: text.primary }}
                                            value={fullName}
                                            onChangeText={setFullName}
                                            placeholder={t('auth.fullName') || 'Full Name'}
                                            placeholderTextColor={text.muted}
                                        />
                                    </Input>
                                </VStack>

                                <VStack space="xs">
                                    <Text sx={{ color: text.secondary }} size="sm">
                                        {t('profile.phone') || 'Phone Number'}
                                    </Text>
                                    <Input
                                        size="xl"
                                        variant="outline"
                                        style={[styles.input, { borderColor: glass.interact.border, backgroundColor: glass.interact.bg }]}
                                        isDisabled={loading}
                                    >
                                        <InputField
                                            sx={{ color: text.primary }}
                                            value={phone}
                                            onChangeText={setPhone}
                                            placeholder="+94 XX XXX XXXX"
                                            placeholderTextColor={text.muted}
                                            keyboardType="phone-pad"
                                        />
                                    </Input>
                                </VStack>

                                <VStack space="xs">
                                    <Text sx={{ color: text.secondary }} size="sm">
                                        {t('profile.bio') || 'Bio'}
                                    </Text>
                                    <Input
                                        size="xl"
                                        variant="outline"
                                        style={[styles.input, { height: 100, borderColor: glass.interact.border, backgroundColor: glass.interact.bg }]}
                                        isDisabled={loading}
                                    >
                                        <InputField
                                            sx={{ color: text.primary, textAlignVertical: 'top' }}
                                            value={bio}
                                            onChangeText={setBio}
                                            placeholder={t('profile.bioPlaceholder') || 'Tell us about yourself...'}
                                            placeholderTextColor={text.muted}
                                            multiline
                                            numberOfLines={4}
                                        />
                                    </Input>
                                </VStack>

                                {ability.can('update', 'TeacherProfile') && (
                                    <VStack space="xs">
                                        <Text sx={{ color: text.secondary }} size="sm">
                                            {t('profile.nicNumber') || 'NIC Number'}
                                        </Text>
                                        <Input
                                            size="xl"
                                            variant="outline"
                                            style={[styles.input, { borderColor: glass.interact.border, backgroundColor: glass.interact.bg }]}
                                            isDisabled={loading}
                                        >
                                            <InputField
                                                sx={{ color: text.primary }}
                                                value={nicNumber}
                                                onChangeText={setNicNumber}
                                                placeholder="e.g. 19XXXXXXXXXX"
                                                placeholderTextColor={text.muted}
                                            />
                                        </Input>
                                    </VStack>
                                )}

                                {ability.can('update', 'StudentProfile') && (
                                    <VStack space="xs">
                                        <Text sx={{ color: text.secondary }} size="sm">
                                            {t('profile.indexNumber') || 'Index Number'}
                                        </Text>
                                        <Input
                                            size="xl"
                                            variant="outline"
                                            style={[styles.input, { borderColor: glass.interact.border, backgroundColor: glass.interact.bg }]}
                                            isDisabled={loading}
                                        >
                                            <InputField
                                                sx={{ color: text.primary }}
                                                value={indexNumber}
                                                onChangeText={setIndexNumber}
                                                placeholder="e.g. STU-XXXXX"
                                                placeholderTextColor={text.muted}
                                            />
                                        </Input>
                                    </VStack>
                                )}

                                {ability.can('manage', 'all') && (
                                    <Box>
                                        <Text sx={{ color: text.secondary, marginBottom: 4 }} size="sm">
                                            {t('profile.role') || 'Role'} (Developer Access)
                                        </Text>
                                        <Select
                                            selectedValue={selectedRole || 'student'}
                                            onValueChange={(value: string | null) => setSelectedRole(value as Role)}
                                        >
                                            <SelectTrigger
                                                variant="outline"
                                                size="xl"
                                                style={[styles.input, { borderColor: glass.interact.border, backgroundColor: glass.interact.bg }]}
                                            >
                                                <SelectInput
                                                    placeholder="Select role"
                                                    sx={{ color: text.primary }}
                                                />
                                                <SelectIcon sx={{ marginRight: 12 }} as={ChevronDown} />
                                            </SelectTrigger>
                                            <SelectPortal>
                                                <SelectBackdrop />
                                                <SelectContent>
                                                    <SelectDragIndicatorWrapper>
                                                        <SelectDragIndicator />
                                                    </SelectDragIndicatorWrapper>
                                                    <SelectItem label={t('role.student') || 'Student'} value="student" />
                                                    <SelectItem label={t('role.teacher') || 'Teacher'} value="teacher" />
                                                    <SelectItem label={t('role.section_head') || 'Section Head'} value="sectionHead" />
                                                    <SelectItem label={t('role.grade_head') || 'Grade Head'} value="gradeHead" />
                                                    <SelectItem label={t('role.principal') || 'Principal'} value="principal" />
                                                    <SelectItem label={t('role.developer') || 'Developer'} value="developer" />
                                                </SelectContent>
                                            </SelectPortal>
                                        </Select>
                                    </Box>
                                )}

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
                                    <ButtonText sx={{ color: text.inverse }}>
                                        {loading ? t('common.processing') || 'Processing...' : t('common.save') || 'Save Changes'}
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
        backgroundColor: Theme.colors.ink + '99',
        justifyContent: 'flex-end',
    },
    input: {
        borderRadius: Theme.corners.comfortable,
        height: 56,
    }
});
