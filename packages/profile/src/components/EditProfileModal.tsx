import { profileAPI } from '@repo/core/api/client';
import { type Capacity, handleAPIError, usePermissions } from '@repo/core/logic';
import { Camera, ChevronDown, Save, X } from '@repo/ui/icons';
import {
  Box,
  Button,
  ButtonText,
  Center,
  Heading,
  HStack,
  Icon,
  Image,
  Input,
  InputField,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { hapticError, hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, Modal, Platform, TouchableWithoutFeedback } from 'react-native';
import type { UserProfile } from '@repo/profile/types';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  currentProfile: UserProfile | null;
}

type EditState = {
  fullName: string;
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
  bio: string;
  loading: boolean;
  selectedCapacity: Capacity | null;
  avatarUrl: string | null;
  nicNumber: string;
  indexNumber: string;
};

type EditAction =
  | { type: 'INITIALIZE'; payload: UserProfile }
  | {
      type: 'SET_FIELD';
      field: keyof Omit<EditState, 'loading'>;
      value: string | string[] | number | null;
    }
  | { type: 'SET_SAVING'; value: boolean };

function editReducer(state: EditState, action: EditAction): EditState {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        ...state,
        fullName: action.payload.display_name || '',
        firstName: action.payload.first_name || '',
        lastName: action.payload.last_name || '',
        username: action.payload.username || '',
        phone: action.payload.phone || '',
        bio: action.payload.bio || '',
        selectedCapacity: action.payload.bonds?.[0]?.capacity || 'student',
        avatarUrl: action.payload.avatar_url || null,
        nicNumber: (action.payload as UserProfile & { nic_number?: string }).nic_number || '',
        indexNumber: (action.payload as UserProfile & { index_number?: string }).index_number || '',
      };
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_SAVING':
      return { ...state, loading: action.value };
    default:
      return state;
  }
}

const initialState: EditState = {
  fullName: '',
  firstName: '',
  lastName: '',
  username: '',
  phone: '',
  bio: '',
  loading: false,
  selectedCapacity: null,
  avatarUrl: null,
  nicNumber: '',
  indexNumber: '',
};

/**
 * EDIT PROFILE MODAL
 * Sanctuary V3 standard for managing user identity and settings.
 * Features premium glassmorphism and standardized Sanctuary primitives.
 */
export default function EditProfileModal({
  visible,
  onClose,
  onSave,
  currentProfile,
}: EditProfileModalProps) {
  const { t } = useTranslation();
  const { can } = usePermissions();
  const [state, dispatch] = useReducer(editReducer, initialState);

  const {
    fullName,
    firstName,
    lastName,
    username,
    phone,
    bio,
    loading,
    selectedCapacity,
    avatarUrl,
    nicNumber,
    indexNumber,
  } = state;

  useEffect(() => {
    if (currentProfile) {
      dispatch({ type: 'INITIALIZE', payload: currentProfile });
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
        dispatch({ type: 'SET_FIELD', field: 'avatarUrl', value: result.assets[0].uri });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      hapticError();
    }
  };

  const handleSave = async () => {
    if (!currentProfile?.id) return;

    dispatch({ type: 'SET_SAVING', value: true });
    hapticLight();

    try {
      const isStaff = can('update', 'TeacherProfile');
      const isStudent = can('update', 'StudentProfile');

      const updates: Record<string, unknown> = {
        display_name: fullName,
        first_name: firstName,
        last_name: lastName,
        username: username || null,
        phone: phone,
        bio: bio,
        nic_number: isStaff ? nicNumber : null,
        index_number: isStudent ? indexNumber : null,
      };

      if (avatarUrl?.startsWith('file://')) {
        try {
          const updatedProfile = (await profileAPI.uploadAvatar(
            currentProfile.id,
            avatarUrl,
          )) as UserProfile;
          updates.avatar_url = updatedProfile.avatar_url;
        } catch (uploadError) {
          handleAPIError(uploadError);
        }
      } else if (
        avatarUrl &&
        (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://'))
      ) {
        updates.avatar_url = avatarUrl;
      }

      // Capacity updates are restricted to platform admins in V3
      // Normal users update their profile, but their capacity is managed via Bonds
      if (selectedCapacity && can('manage', 'all')) {
        // POA: In a real ReBAC system, this would involve a Bond update API
        // For now, we'll track this as a requirement for the Bond Manager
      }

      await profileAPI.updateProfile(currentProfile.id, updates);

      hapticSuccess();
      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      hapticError();
    } finally {
      dispatch({ type: 'SET_SAVING', value: false });
    }
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
                  <Text className="text-phase-text-tertiary text-xs uppercase tracking-widest font-bold mt-1">
                    IDENTITY HUB
                  </Text>
                </VStack>
                <Pressable
                  onPress={onClose}
                  accessibilityRole="button"
                  accessibilityLabel="Close settings"
                  accessibilityHint="Closes the profile editing modal without saving"
                  className="w-10 h-10 rounded-full bg-phase-surface items-center justify-center active:scale-95 transition-all"
                >
                  <X color="#9DA1A3" size={24} strokeWidth={2.5} />
                </Pressable>
              </HStack>

              <ScrollView
                showsVerticalScrollIndicator={false}
                className="max-h-[75%]"
                contentContainerStyle={{ paddingBottom: 40 }}
              >
                <VStack space="xl">
                  <Center className="mb-4">
                    <Box className="relative">
                      <Box className="p-1 rounded-full border-2 border-phase-interactive border-dashed bg-phase-interactive/5">
                        <Image
                          source={{
                            uri: avatarUrl || 'https://via.placeholder.com/150',
                          }}
                          alt="Profile"
                          className="w-[120px] h-[120px] rounded-full"
                        />
                      </Box>
                      <Pressable
                        onPress={handlePickImage}
                        accessibilityRole="button"
                        accessibilityLabel="Change profile picture"
                        accessibilityHint="Opens the device image gallery to select a new profile photo"
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
                      {t('profile.firstName') || 'FIRST NAME'}
                    </Text>
                    <Input
                      className="h-16 rounded-3xl bg-phase-surface/30 border-phase-surface/50 px-2"
                      isDisabled={loading}
                    >
                      <InputField
                        className="text-phase-text-primary font-bold"
                        value={firstName}
                        onChangeText={(text) =>
                          dispatch({ type: 'SET_FIELD', field: 'firstName', value: text })
                        }
                        placeholder={t('profile.firstNamePlaceholder') || 'First name'}
                        placeholderTextColor="#9DA1A3"
                      />
                    </Input>
                  </VStack>

                  <VStack space="sm">
                    <Text className="text-phase-text-tertiary text-[10px] font-bold uppercase tracking-[2px] ml-1">
                      {t('profile.lastName') || 'LAST NAME'}
                    </Text>
                    <Input
                      className="h-16 rounded-3xl bg-phase-surface/30 border-phase-surface/50 px-2"
                      isDisabled={loading}
                    >
                      <InputField
                        className="text-phase-text-primary font-bold"
                        value={lastName}
                        onChangeText={(text) =>
                          dispatch({ type: 'SET_FIELD', field: 'lastName', value: text })
                        }
                        placeholder={t('profile.lastNamePlaceholder') || 'Last name'}
                        placeholderTextColor="#9DA1A3"
                      />
                    </Input>
                  </VStack>

                  <VStack space="sm">
                    <Text className="text-phase-text-tertiary text-[10px] font-bold uppercase tracking-[2px] ml-1">
                      {t('profile.username') || 'USERNAME'}
                    </Text>
                    <Input
                      className="h-16 rounded-3xl bg-phase-surface/30 border-phase-surface/50 px-2"
                      isDisabled={loading}
                    >
                      <InputField
                        className="text-phase-text-primary font-bold"
                        value={username}
                        onChangeText={(text) =>
                          dispatch({ type: 'SET_FIELD', field: 'username', value: text })
                        }
                        placeholder={t('profile.handlePlaceholder') || 'your-handle'}
                        placeholderTextColor="#9DA1A3"
                        autoCapitalize="none"
                      />
                    </Input>
                  </VStack>

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
                        onChangeText={(text) =>
                          dispatch({ type: 'SET_FIELD', field: 'fullName', value: text })
                        }
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
                        onChangeText={(text) =>
                          dispatch({ type: 'SET_FIELD', field: 'phone', value: text })
                        }
                        placeholder="+94 XX XXX XXXX"
                        placeholderTextColor="#9DA1A3"
                        keyboardType="phone-pad"
                      />
                    </Input>
                  </VStack>

                  <VStack space="sm">
                    <Text className="text-phase-text-tertiary text-[10px] font-bold uppercase tracking-[2px] ml-1">
                      {t('profile.bio') || 'BIO'}
                    </Text>
                    <Input
                      className="h-32 rounded-[32px] bg-phase-surface/30 border-phase-surface/50 p-2"
                      isDisabled={loading}
                    >
                      <InputField
                        className="text-phase-text-primary p-4 font-medium"
                        style={{ textAlignVertical: 'top' }}
                        value={bio}
                        onChangeText={(text) =>
                          dispatch({ type: 'SET_FIELD', field: 'bio', value: text })
                        }
                        placeholder={
                          t('profile.bioPlaceholder') || 'Share your sanctuary journey...'
                        }
                        placeholderTextColor="#9DA1A3"
                        multiline
                        numberOfLines={4}
                      />
                    </Input>
                  </VStack>

                  {can('update', 'TeacherProfile') && (
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
                          onChangeText={(text) =>
                            dispatch({ type: 'SET_FIELD', field: 'nicNumber', value: text })
                          }
                          placeholder="e.g. 19XXXXXXXXXX"
                          placeholderTextColor="#9DA1A3"
                        />
                      </Input>
                    </VStack>
                  )}

                  {can('update', 'StudentProfile') && (
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
                          onChangeText={(text) =>
                            dispatch({ type: 'SET_FIELD', field: 'indexNumber', value: text })
                          }
                          placeholder="e.g. STU-XXXXX"
                          placeholderTextColor="#9DA1A3"
                        />
                      </Input>
                    </VStack>
                  )}

                  {can('manage', 'all') && (
                    <Box>
                      <Text className="text-phase-text-tertiary text-[10px] font-bold uppercase tracking-[2px] ml-1 mb-2">
                        {t('profile.role') || 'Sovereign Identity'}
                      </Text>
                      <Select
                        value={selectedCapacity || 'student'}
                        onValueChange={(value: string | null) =>
                          dispatch({
                            type: 'SET_FIELD',
                            field: 'selectedCapacity',
                            value: value as Capacity,
                          })
                        }
                      >
                        <SelectTrigger className="h-16 rounded-3xl bg-phase-surface/30 border-phase-surface/50 px-6">
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
                              <SelectItem
                                label={t('identity.student') || 'Student'}
                                value="student"
                              />
                              <SelectItem
                                label={t('identity.teacher') || 'Teacher'}
                                value="teacher"
                              />
                              <SelectItem
                                label={t('identity.sectionHead') || 'Section Head'}
                                value="sectionHead"
                              />
                              <SelectItem
                                label={t('identity.gradeHead') || 'Grade Head'}
                                value="gradeHead"
                              />
                              <SelectItem
                                label={t('identity.principal') || 'Principal'}
                                value="principal"
                              />
                              <SelectItem
                                label={t('identity.developer') || 'Developer'}
                                value="developer"
                              />
                            </Box>
                          </SelectContent>
                        </SelectPortal>
                      </Select>
                    </Box>
                  )}

                  <Button
                    action="primary"
                    size="lg"
                    className="mt-8 bg-phase-interactive rounded-3xl h-16 shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all"
                    isDisabled={loading}
                    onPress={handleSave}
                  >
                    <HStack space="sm" className="items-center">
                      <ButtonText className="text-white font-bold text-lg">
                        {loading
                          ? t('common.processing') || 'Processing...'
                          : t('common.save') || 'Save Changes'}
                      </ButtonText>
                      {!loading && <Icon as={Save} size={22} color="white" strokeWidth={2.5} />}
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
