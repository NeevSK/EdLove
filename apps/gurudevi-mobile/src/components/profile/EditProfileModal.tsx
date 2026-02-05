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
} from '@gluestack-ui/themed';
import { X, Save, User, Briefcase } from 'lucide-react-native';
import { Theme } from '../../constants/Theme';
import { supabase } from '../../lib/supabase';
import { hapticLight, hapticSuccess, hapticError } from '../../utils/haptics';

interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: () => void;
    currentProfile: any;
}

export default function EditProfileModal({ visible, onClose, onSave, currentProfile }: EditProfileModalProps) {
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentProfile) {
            setFullName(currentProfile.full_name || '');
        }
    }, [currentProfile]);

    const handleSave = async () => {
        if (!currentProfile?.id) return;

        setLoading(true);
        hapticLight();

        try {
            const { error } = await supabase
                .from('users')
                .update({ full_name: fullName })
                .eq('id', currentProfile.id);

            if (error) throw error;

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
                                    Edit Profile
                                </Heading>
                                <Pressable onPress={onClose} p={Theme.spacing.xs}>
                                    <X color={Theme.colors.mistGray} size={24} />
                                </Pressable>
                            </HStack>

                            <VStack space="xl">
                                {/* Name Input */}
                                <VStack space="xs">
                                    <Text color={Theme.colors.dimGray} size="sm">Full Name</Text>
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
                                            placeholder="Enter your name"
                                            placeholderTextColor={Theme.colors.stoneGray}
                                        />
                                    </Input>
                                </VStack>

                                {/* Read-only Fields */}
                                <Box style={styles.readOnlyBox}>
                                    <HStack space="md" alignItems="center">
                                        <Briefcase size={20} color={Theme.colors.dimGray} />
                                        <VStack>
                                            <Text color={Theme.colors.dimGray} size="xs" textTransform="uppercase">Role</Text>
                                            <Text color={Theme.colors.mistGray}>{currentProfile?.role || 'User'}</Text>
                                        </VStack>
                                    </HStack>
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
                                        {loading ? 'Saving...' : 'Save Changes'}
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
