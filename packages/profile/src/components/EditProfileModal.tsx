import React, { useState, useEffect } from 'react';
import { Modal, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
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

/**
 * EDIT PROFILE MODAL
 * Sanctuary V3 standard for managing user identity and settings.
 */
export default function EditProfileModal({ visible, onClose, onSave, currentProfile }: EditProfileModalProps) {
    const { t } = useTranslation();
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
                <Box className="flex-1 justify-end bg-[#6B6480]/60">
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        className="w-full h-full justify-end"
                    >
                        <Box className="bg-phase-canvas rounded-t-generous p-6 border-t border-l border-r border-phase-surface shadow-2xl">
                            <HStack className="justify-between items-center mb-6">
                                <Heading className="text-phase-text-primary text-lg">
                                    {t('profile.settings') || 'Edit Profile'}
                                </Heading>
                                <Pressable
                                    onPress={onClose}
                                    className="p-1"
                                >
                                    <X color="#9DA1A3" size={24} />
                                </Pressable>
                            </HStack>

                            <ScrollView showsVerticalScrollIndicator={false} className="max-h-[80%]">
                                <VStack space="xl">
                                    <Center>
                                        <Box className="relative">
                                            <Image
                                                source={{ uri: avatarUrl || 'https://via.placeholder.com/150' }}
                                                alt="Profile"
                                                className="w-[100px] h-[100px] rounded-full border-2 border-phase-interactive"
                                            />
                                            <Pressable
                                                onPress={handlePickImage}
                                                className="absolute bottom-0 right-0 bg-phase-canvas p-2 rounded-full border border-phase-interactive shadow-sm"
                                            >
                                                <Camera size={16} color="#4A90E2" />
                                            </Pressable>
                                        </Box>
                                        <Text className="text-phase-text-tertiary text-xs mt-2 text-center">
                                            {t('profile.tapToChange') || 'Tap to change photo'}
                                        </Text>
                                    </Center>

                                    <VStack space="xs">
                                        <Text className="text-phase-text-secondary text-sm">
                                            {t('profile.fullName') || 'Full Name'}
                                        </Text>
                                        <Input
                                            className="h-14 rounded-comfortable bg-phase-surface border-phase-surface"
                                            isDisabled={loading}
                                        >
                                            <InputField
                                                className="text-phase-text-primary"
                                                value={fullName}
                                                onChangeText={setFullName}
                                                placeholder={t('auth.fullName') || 'Full Name'}
                                                placeholderTextColor="#9DA1A3"
                                            />
                                        </Input>
                                    </VStack>

                                    <VStack space="xs">
                                        <Text className="text-phase-text-secondary text-sm">
                                            {t('profile.phone') || 'Phone Number'}
                                        </Text>
                                        <Input
                                            className="h-14 rounded-comfortable bg-phase-surface border-phase-surface"
                                            isDisabled={loading}
                                        >
                                            <InputField
                                                className="text-phase-text-primary"
                                                value={phone}
                                                onChangeText={setPhone}
                                                placeholder="+94 XX XXX XXXX"
                                                placeholderTextColor="#9DA1A3"
                                                keyboardType="phone-pad"
                                            />
                                        </Input>
                                    </VStack>

                                    <VStack space="xs">
                                        <Text className="text-phase-text-secondary text-sm">
                                            {t('profile.bio') || 'Bio'}
                                        </Text>
                                        <Input
                                            className="h-28 rounded-comfortable bg-phase-surface border-phase-surface"
                                            isDisabled={loading}
                                        >
                                            <InputField
                                                className="text-phase-text-primary p-3"
                                                style={{ textAlignVertical: 'top' }}
                                                value={bio}
                                                onChangeText={setBio}
                                                placeholder={t('profile.bioPlaceholder') || 'Tell us about yourself...'}
                                                placeholderTextColor="#9DA1A3"
                                                multiline
                                                numberOfLines={4}
                                            />
                                        </Input>
                                    </VStack>

                                    {ability.can('update', 'TeacherProfile') && (
                                        <VStack space="xs">
                                            <Text className="text-phase-text-secondary text-sm">
                                                {t('profile.nicNumber') || 'NIC Number'}
                                            </Text>
                                            <Input
                                                className="h-14 rounded-comfortable bg-phase-surface border-phase-surface"
                                                isDisabled={loading}
                                            >
                                                <InputField
                                                    className="text-phase-text-primary"
                                                    value={nicNumber}
                                                    onChangeText={setNicNumber}
                                                    placeholder="e.g. 19XXXXXXXXXX"
                                                    placeholderTextColor="#9DA1A3"
                                                />
                                            </Input>
                                        </VStack>
                                    )}

                                    {ability.can('update', 'StudentProfile') && (
                                        <VStack space="xs">
                                            <Text className="text-phase-text-secondary text-sm">
                                                {t('profile.indexNumber') || 'Index Number'}
                                            </Text>
                                            <Input
                                                className="h-14 rounded-comfortable bg-phase-surface border-phase-surface"
                                                isDisabled={loading}
                                            >
                                                <InputField
                                                    className="text-phase-text-primary"
                                                    value={indexNumber}
                                                    onChangeText={setIndexNumber}
                                                    placeholder="e.g. STU-XXXXX"
                                                    placeholderTextColor="#9DA1A3"
                                                />
                                            </Input>
                                        </VStack>
                                    )}

                                    {ability.can('manage', 'all') && (
                                        <Box>
                                            <Text className="text-phase-text-secondary text-sm mb-1">
                                                {t('profile.role') || 'Role'} (Developer Access)
                                            </Text>
                                            <Select
                                                selectedValue={selectedRole || 'student'}
                                                onValueChange={(value: string | null) => setSelectedRole(value as Role)}
                                            >
                                                <SelectTrigger
                                                    className="h-14 rounded-comfortable bg-phase-surface border-phase-surface px-4"
                                                >
                                                    <SelectInput
                                                        placeholder="Select role"
                                                        className="text-phase-text-primary"
                                                    />
                                                    <SelectIcon className="mr-3" as={ChevronDown} />
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
                                        className="mt-6 bg-phase-interactive rounded-comfortable h-14"
                                        isDisabled={loading}
                                        onPress={handleSave}
                                    >
                                        <ButtonText className="text-white font-bold">
                                            {loading ? t('common.processing') || 'Processing...' : t('common.save') || 'Save Changes'}
                                        </ButtonText>
                                        {!loading && <Save size={20} color="white" className="ml-2" />}
                                    </Button>
                                </VStack>
                            </ScrollView>
                        </Box>
                    </KeyboardAvoidingView>
                </Box>
            </TouchableWithoutFeedback>
        </Modal>
    );
}
