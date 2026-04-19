import React, { useState, useEffect } from 'react';
import { Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
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
    KeyboardAvoidingView,
    ScrollView,
    Modal,
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
 * Features premium glassmorphism and standardized Sanctuary primitives.
 */
export default function EditProfileModal({ visible, onClose, onSave, currentProfile }: EditProfileModalProps) {
    const { t } = useTranslation();
    const { ability, flags } = usePermissions();
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
            isOpen={visible}
            onClose={onClose}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <Box className="flex-1 justify-end bg-black/40">
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        className="w-full h-full justify-end"
                    >
                        <Box className="bg-phase-canvas rounded-t-[48px] p-8 border-t border-l border-r border-phase-surface shadow-[0_-20px_50px_rgba(0,0,0,0.3)]">
                            <HStack className="justify-between items-center mb-8">
                                <VStack>
                                    <Heading className="text-phase-text-primary text-2xl font-bold tracking-tight">
                                        {t('profile.settings') || 'Edit Profile'}
                                    </Heading>
                                    <Text className="text-phase-text-tertiary text-xs uppercase tracking-widest font-bold mt-1">IDENTITY HUB</Text>
                                </VStack>
                                <Pressable
                                    onPress={onClose}
                                    className="w-10 h-10 rounded-full bg-phase-surface items-center justify-center active:scale-95 transition-all"
                                >
                                    <X color="#9DA1A3" size={24} strokeWidth={2.5} />
                                </Pressable>
                            </HStack>

                            <ScrollView showsVerticalScrollIndicator={false} className="max-h-[75%]" contentContainerStyle={{ paddingBottom: 40 }}>
                                <VStack space="xl">
                                    <Center className="mb-4">
                                        <Box className="relative">
                                            <Box className="p-1 rounded-full border-2 border-phase-interactive border-dashed bg-phase-interactive/5">
                                                <Image
                                                    source={{ uri: avatarUrl || 'https://via.placeholder.com/150' }}
                                                    alt="Profile"
                                                    className="w-[120px] h-[120px] rounded-full"
                                                />
                                            </Box>
                                            <Pressable
                                                onPress={handlePickImage}
                                                className="absolute bottom-1 right-1 bg-phase-interactive p-3 rounded-2xl border-2 border-phase-canvas shadow-lg active:scale-90 transition-all"
                                            >
                                                <Camera size={18} color="white" />
                                            </Pressable>
                                        </Box>
                                        <Text className="text-phase-text-tertiary text-xs font-bold mt-4 tracking-widest uppercase">
                                            {t('profile.tapToChange') || 'Change Avatar'}
                                        </Text>
                                    </Center>

                                    <VStack space="sm">
                                        <Text className="text-phase-text-tertiary text-[10px] font-bold uppercase tracking-[2px] ml-1">
                                            {t('profile.fullName') || 'FULL NAME'}
                                        </Text>
                                        <Input
                                            className="h-16 rounded-3xl bg-phase-surface/30 border-phase-surface/50 px-2"
                                            isDisabled={loading}
                                        >
                                            <InputField
                                                className="text-phase-text-primary font-bold"
                                                value={fullName}
                                                onChangeText={setFullName}
                                                placeholder={t('auth.fullName') || 'Full Name'}
                                                placeholderTextColor="#9DA1A3"
                                            />
                                        </Input>
                                    </VStack>

                                    <VStack space="sm">
                                        <Text className="text-phase-text-tertiary text-[10px] font-bold uppercase tracking-[2px] ml-1">
                                            {t('profile.phone') || 'PHONE NUMBER'}
                                        </Text>
                                        <Input
                                            className="h-16 rounded-3xl bg-phase-surface/30 border-phase-surface/50 px-2"
                                            isDisabled={loading}
                                        >
                                            <InputField
                                                className="text-phase-text-primary font-bold"
                                                value={phone}
                                                onChangeText={setPhone}
                                                placeholder="+94 XX XXX XXXX"
                                                placeholderTextColor="#9DA1A3"
                                                keyboardType="phone-pad"
                                            />
                                        </Input>
                                    </VStack>

                                    <VStack space="sm">
                                        <HStack className="justify-between items-center ml-1 mb-1">
                                            <Text className="text-phase-text-tertiary text-[10px] font-bold uppercase tracking-[2px]">
                                                {t('profile.bio') || 'BIO'}
                                            </Text>
                                            {flags.isAIAssistantEnabled && (
                                                <Pressable 
                                                    onPress={() => hapticLight()}
                                                    className="bg-phase-interactive/10 px-2 py-0.5 rounded-md border border-phase-interactive/20"
                                                >
                                                    <Text className="text-[9px] font-black text-phase-interactive uppercase">AI GENERATE</Text>
                                                </Pressable>
                                            )}
                                        </HStack>
                                        <Input
                                            className="h-32 rounded-[32px] bg-phase-surface/30 border-phase-surface/50 p-2"
                                            isDisabled={loading}
                                        >
                                            <InputField
                                                className="text-phase-text-primary p-4 font-medium"
                                                style={{ textAlignVertical: 'top' }}
                                                value={bio}
                                                onChangeText={setBio}
                                                placeholder={t('profile.bioPlaceholder') || 'Share your sanctuary journey...'}
                                                placeholderTextColor="#9DA1A3"
                                                multiline
                                                numberOfLines={4}
                                            />
                                        </Input>
                                    </VStack>

                                    {ability.can('update', 'TeacherProfile') && (
                                        <VStack space="sm">
                                            <Text className="text-phase-text-tertiary text-[10px] font-bold uppercase tracking-[2px] ml-1">
                                                {t('profile.nicNumber') || 'NIC NUMBER'}
                                            </Text>
                                            <Input
                                                className="h-16 rounded-3xl bg-phase-surface/30 border-phase-surface/50 px-2"
                                                isDisabled={loading}
                                            >
                                                <InputField
                                                    className="text-phase-text-primary font-bold"
                                                    value={nicNumber}
                                                    onChangeText={setNicNumber}
                                                    placeholder="e.g. 19XXXXXXXXXX"
                                                    placeholderTextColor="#9DA1A3"
                                                />
                                            </Input>
                                        </VStack>
                                    )}

                                    {ability.can('update', 'StudentProfile') && (
                                        <VStack space="sm">
                                            <Text className="text-phase-text-tertiary text-[10px] font-bold uppercase tracking-[2px] ml-1">
                                                {t('profile.indexNumber') || 'INDEX NUMBER'}
                                            </Text>
                                            <Input
                                                className="h-16 rounded-3xl bg-phase-surface/30 border-phase-surface/50 px-2"
                                                isDisabled={loading}
                                            >
                                                <InputField
                                                    className="text-phase-text-primary font-bold"
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
                                            <Text className="text-phase-text-tertiary text-[10px] font-bold uppercase tracking-[2px] ml-1 mb-2">
                                                {t('profile.role') || 'Sovereign Role'}
                                            </Text>
                                            <Select
                                                selectedValue={selectedRole || 'student'}
                                                onValueChange={(value: string | null) => setSelectedRole(value as Role)}
                                            >
                                                <SelectTrigger
                                                    className="h-16 rounded-3xl bg-phase-surface/30 border-phase-surface/50 px-6"
                                                >
                                                    <SelectInput
                                                        placeholder="Select role"
                                                        className="text-phase-text-primary font-bold"
                                                    />
                                                    <SelectIcon className="mr-3" as={ChevronDown} />
                                                </SelectTrigger>
                                                <SelectPortal>
                                                    <SelectBackdrop />
                                                    <SelectContent className="bg-phase-canvas border-t border-phase-surface rounded-t-[40px] p-6 pb-12">
                                                        <SelectDragIndicatorWrapper>
                                                            <SelectDragIndicator className="bg-phase-surface w-12 h-1.5" />
                                                        </SelectDragIndicatorWrapper>
                                                        <Box className="mt-8">
                                                            <SelectItem label={t('role.student') || 'Student'} value="student" />
                                                            <SelectItem label={t('role.teacher') || 'Teacher'} value="teacher" />
                                                            <SelectItem label={t('role.section_head') || 'Section Head'} value="sectionHead" />
                                                            <SelectItem label={t('role.grade_head') || 'Grade Head'} value="gradeHead" />
                                                            <SelectItem label={t('role.principal') || 'Principal'} value="principal" />
                                                            <SelectItem label={t('role.developer') || 'Developer'} value="developer" />
                                                        </Box>
                                                    </SelectContent>
                                                </SelectPortal>
                                            </Select>
                                        </Box>
                                    )}

                                    <Button
                                        size="lg"
                                        className="mt-8 bg-phase-interactive rounded-3xl h-16 shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all"
                                        isDisabled={loading}
                                        onPress={handleSave}
                                    >
                                        <HStack space="sm" className="items-center">
                                            <ButtonText className="text-white font-bold text-lg">
                                                {loading ? t('common.processing') || 'Processing...' : t('common.save') || 'Save Changes'}
                                            </ButtonText>
                                            {!loading && <Save size={22} color="white" strokeWidth={2.5} />}
                                        </HStack>
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
