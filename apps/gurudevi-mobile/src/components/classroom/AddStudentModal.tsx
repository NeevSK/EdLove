import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Heading,
    Icon,
    CloseIcon,
    VStack,
    HStack,
    Box,
    Text,
    Input,
    InputField,
    Button,
    ButtonText,
    FormControl,
    FormControlLabel,
    FormControlLabelText,
    Pressable,
    Center,
    Spinner,
    FlatList,
} from '@gluestack-ui/themed';
import { Search, QrCode, UserPlus, Info, Plus } from 'lucide-react-native';
import { Theme } from '../../constants/Theme';
import { api, ClassroomStudent } from '../../lib/api';
import { hapticLight, hapticSuccess } from '../../utils/haptics';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';

interface AddStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    classroomId: string;
    studentToEdit?: ClassroomStudent | null;
}

export function AddStudentModal({
    isOpen,
    onClose,
    onSuccess,
    classroomId,
    studentToEdit
}: AddStudentModalProps) {
    const [activeTab, setActiveTab] = useState<'search' | 'entry' | 'qr'>('search');
    const [searchQuery, setSearchQuery] = useState('');
    const [availableStudents, setAvailableStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createdShadow, setCreatedShadow] = useState<ClassroomStudent | null>(null);

    // Manual Entry State
    const [shadowName, setShadowName] = useState('');

    // Edit Mode State
    const [rollNumber, setRollNumber] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isOpen) {
            setCreatedShadow(null);
            if (studentToEdit) {
                setRollNumber(studentToEdit.roll_number?.toString() || '');
                setNotes(studentToEdit.notes || '');
                setActiveTab('search');
            } else {
                setRollNumber('');
                setNotes('');
                setShadowName('');
                fetchStudents();
            }
        }
    }, [isOpen, studentToEdit]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            // Get user's school ID first
            const user = await api.auth.getUser();
            if (!user) return;

            const userData = await api.auth.getUserProfile(user.id);
            if (userData?.school_id) {
                const students = await api.school.getStudentsBySchool(userData.school_id);
                setAvailableStudents(students);
            }
        } catch (error) {
            console.error('Failed to fetch school students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStudent = async (studentId?: string) => {
        try {
            setIsSubmitting(true);
            if (activeTab === 'entry') {
                if (!shadowName.trim()) throw new Error('Name is required');
                const shadow = await api.classroomStudents.addShadowStudent(
                    classroomId,
                    shadowName,
                    parseInt(rollNumber) || undefined,
                    notes
                );
                setCreatedShadow(shadow);
                hapticLight(); // Changed from hapticSuccess to hapticLight as per instruction
            } else if (studentId) {
                await api.classroomStudents.add(classroomId, studentId, parseInt(rollNumber) || undefined, notes);
                hapticSuccess();
                onSuccess();
            }
        } catch (error: any) {
            console.error('Failed to add student:', error);
            alert(error.message || 'Failed to add student');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateStudent = async () => {
        if (!studentToEdit) return;
        try {
            setIsSubmitting(true);
            await api.classroomStudents.updateById(studentToEdit.id, {
                roll_number: parseInt(rollNumber) || undefined,
                notes: notes,
            });
            hapticSuccess();
            onSuccess();
        } catch (error: any) {
            console.error('Failed to update student:', error);
            alert(error.message || 'Failed to update student');
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyToClipboard = async (text: string) => {
        await Clipboard.setStringAsync(text);
        hapticLight();
    };

    const filteredStudents = availableStudents.filter(s =>
        s.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalBackdrop />
            <ModalContent sx={{ backgroundColor: Theme.colors.midnightBlue, borderColor: Theme.colors.deepIndigo, borderWidth: 1 }}>
                <ModalHeader>
                    <Heading color={Theme.colors.sacredWhite}>{studentToEdit ? 'Edit Student' : 'Add Student'}</Heading>
                    <ModalCloseButton>
                        <Icon as={CloseIcon} color={Theme.colors.mistGray} />
                    </ModalCloseButton>
                </ModalHeader>
                <ModalBody>
                    <VStack space="lg" pb="$4">
                        {!studentToEdit && !createdShadow && (
                            <HStack sx={{ backgroundColor: Theme.colors.deepIndigo, borderRadius: Theme.corners.comfortable, padding: 4 }}>
                                <Pressable
                                    onPress={() => setActiveTab('search')}
                                    sx={{
                                        flex: 1,
                                        paddingVertical: Theme.spacing.sm,
                                        backgroundColor: activeTab === 'search' ? Theme.colors.sanctuarySaffron : 'transparent',
                                        borderRadius: Theme.corners.comfortable,
                                        alignItems: 'center'
                                    }}
                                >
                                    <HStack space="xs" alignItems="center">
                                        <Search size={16} color={activeTab === 'search' ? Theme.colors.white : Theme.colors.mistGray} />
                                        <Text color={activeTab === 'search' ? Theme.colors.white : Theme.colors.mistGray} size="sm" fontWeight="$bold">Search</Text>
                                    </HStack>
                                </Pressable>
                                <Pressable
                                    onPress={() => setActiveTab('entry')}
                                    sx={{
                                        flex: 1,
                                        paddingVertical: Theme.spacing.sm,
                                        backgroundColor: activeTab === 'entry' ? Theme.colors.sanctuarySaffron : 'transparent',
                                        borderRadius: Theme.corners.comfortable,
                                        alignItems: 'center'
                                    }}
                                >
                                    <HStack space="xs" alignItems="center">
                                        <UserPlus size={16} color={activeTab === 'entry' ? Theme.colors.white : Theme.colors.mistGray} />
                                        <Text color={activeTab === 'entry' ? Theme.colors.white : Theme.colors.mistGray} size="sm" fontWeight="$bold">Manual Entry</Text>
                                    </HStack>
                                </Pressable>
                                <Pressable
                                    onPress={() => setActiveTab('qr')}
                                    sx={{
                                        flex: 1,
                                        paddingVertical: Theme.spacing.sm,
                                        backgroundColor: activeTab === 'qr' ? Theme.colors.sanctuarySaffron : 'transparent',
                                        borderRadius: Theme.corners.comfortable,
                                        alignItems: 'center'
                                    }}
                                >
                                    <HStack space="xs" alignItems="center">
                                        <QrCode size={16} color={activeTab === 'qr' ? Theme.colors.white : Theme.colors.mistGray} />
                                        <Text color={activeTab === 'qr' ? Theme.colors.white : Theme.colors.mistGray} size="sm" fontWeight="$bold">Join QR</Text>
                                    </HStack>
                                </Pressable>
                            </HStack>
                        )}

                        {createdShadow ? (
                            <VStack space="lg" alignItems="center" py="$4">
                                <Box sx={{ padding: Theme.spacing.lg, backgroundColor: 'white', borderRadius: Theme.corners.generous }}>
                                    <QRCode
                                        value={createdShadow.invite_code || ''}
                                        size={180}
                                        color="black"
                                        backgroundColor="white"
                                    />
                                </Box>
                                <VStack space="xs" alignItems="center">
                                    <Heading size="md" color={Theme.colors.sacredWhite}>{createdShadow.full_name}</Heading>
                                    <Text color={Theme.colors.mistGray} size="sm">Individual Invite Code</Text>
                                    <Pressable onPress={() => copyToClipboard(createdShadow.invite_code || '')}>
                                        <Text color={Theme.colors.sanctuarySaffron} fontWeight="$bold">{createdShadow.invite_code}</Text>
                                    </Pressable>
                                </VStack>
                                <Button
                                    onPress={onSuccess}
                                    sx={{ backgroundColor: Theme.colors.sanctuarySaffron, width: '100%' }}
                                >
                                    <ButtonText>Done</ButtonText>
                                </Button>
                            </VStack>
                        ) : activeTab === 'search' ? (
                            <VStack space="md">
                                {studentToEdit ? (
                                    <Box sx={{ padding: Theme.spacing.md, backgroundColor: Theme.colors.deepIndigo, borderRadius: Theme.corners.comfortable }}>
                                        <Text color={Theme.colors.sacredWhite} fontWeight="$bold">{studentToEdit.full_name}</Text>
                                        <Text size="xs" color={Theme.colors.mistGray}>Role: Student</Text>
                                    </Box>
                                ) : (
                                    <VStack space="xs">
                                        <FormControlLabel><FormControlLabelText color={Theme.colors.mistGray}>Select Student</FormControlLabelText></FormControlLabel>
                                        <Input sx={{ borderColor: Theme.colors.deepIndigo, backgroundColor: Theme.colors.voidIndigo }}>
                                            <InputField
                                                placeholder="Search student by name..."
                                                color={Theme.colors.sacredWhite}
                                                value={searchQuery}
                                                onChangeText={setSearchQuery}
                                            />
                                        </Input>

                                        <Box sx={{ height: 200, marginTop: Theme.spacing.sm, backgroundColor: Theme.colors.voidIndigo, borderRadius: Theme.corners.comfortable, padding: Theme.spacing.xs }}>
                                            {loading ? (
                                                <Center sx={{ flex: 1 }}><Spinner color={Theme.colors.sanctuarySaffron} /></Center>
                                            ) : (
                                                <FlatList
                                                    data={filteredStudents}
                                                    keyExtractor={(item: any) => item.id}
                                                    renderItem={({ item }: any) => (
                                                        <Pressable
                                                            onPress={() => handleAddStudent(item.id)}
                                                            sx={{
                                                                padding: Theme.spacing.sm,
                                                                borderBottomWidth: 1,
                                                                borderBottomColor: Theme.colors.deepIndigo,
                                                                opacity: isSubmitting ? 0.5 : 1
                                                            }}
                                                            disabled={isSubmitting}
                                                        >
                                                            <HStack justifyContent="space-between" alignItems="center">
                                                                <Text color={Theme.colors.sacredWhite}>{item.full_name}</Text>
                                                                <Plus size={16} color={Theme.colors.sanctuarySaffron} />
                                                            </HStack>
                                                        </Pressable>
                                                    )}
                                                />
                                            )}
                                        </Box>
                                    </VStack>
                                )}

                                <HStack space="md">
                                    <FormControl sx={{ flex: 1 }}>
                                        <FormControlLabel><FormControlLabelText color={Theme.colors.mistGray}>Roll Number</FormControlLabelText></FormControlLabel>
                                        <Input sx={{ borderColor: Theme.colors.deepIndigo }}>
                                            <InputField
                                                keyboardType="numeric"
                                                placeholder="e.g. 10"
                                                color={Theme.colors.sacredWhite}
                                                value={rollNumber}
                                                onChangeText={setRollNumber}
                                            />
                                        </Input>
                                    </FormControl>
                                </HStack>

                                <FormControl>
                                    <FormControlLabel><FormControlLabelText color={Theme.colors.mistGray}>Notes (Optional)</FormControlLabelText></FormControlLabel>
                                    <Input sx={{ borderColor: Theme.colors.deepIndigo }}>
                                        <InputField
                                            placeholder="Special requirements, etc."
                                            color={Theme.colors.sacredWhite}
                                            value={notes}
                                            onChangeText={setNotes}
                                        />
                                    </Input>
                                </FormControl>
                            </VStack>
                        ) : activeTab === 'entry' ? (
                            <VStack space="md">
                                <FormControl isRequired>
                                    <FormControlLabel><FormControlLabelText color={Theme.colors.mistGray}>Student Full Name</FormControlLabelText></FormControlLabel>
                                    <Input sx={{ borderColor: Theme.colors.deepIndigo, backgroundColor: Theme.colors.voidIndigo }}>
                                        <InputField
                                            placeholder="Enter student's full name..."
                                            color={Theme.colors.sacredWhite}
                                            value={shadowName}
                                            onChangeText={setShadowName}
                                        />
                                    </Input>
                                </FormControl>

                                <HStack space="md">
                                    <FormControl sx={{ flex: 1 }}>
                                        <FormControlLabel><FormControlLabelText color={Theme.colors.mistGray}>Roll Number</FormControlLabelText></FormControlLabel>
                                        <Input sx={{ borderColor: Theme.colors.deepIndigo }}>
                                            <InputField
                                                keyboardType="numeric"
                                                placeholder="e.g. 10"
                                                color={Theme.colors.sacredWhite}
                                                value={rollNumber}
                                                onChangeText={setRollNumber}
                                            />
                                        </Input>
                                    </FormControl>
                                </HStack>

                                <FormControl>
                                    <FormControlLabel><FormControlLabelText color={Theme.colors.mistGray}>Notes (Optional)</FormControlLabelText></FormControlLabel>
                                    <Input sx={{ borderColor: Theme.colors.deepIndigo }}>
                                        <InputField
                                            placeholder="Special requirements, etc."
                                            color={Theme.colors.sacredWhite}
                                            value={notes}
                                            onChangeText={setNotes}
                                        />
                                    </Input>
                                </FormControl>

                                <Button
                                    onPress={() => handleAddStudent()}
                                    disabled={isSubmitting || !shadowName.trim()}
                                    sx={{ backgroundColor: Theme.colors.sanctuarySaffron, marginTop: Theme.spacing.md }}
                                >
                                    {isSubmitting ? <Spinner color="white" /> : <ButtonText>Create Shadow Profile</ButtonText>}
                                </Button>
                            </VStack>
                        ) : (
                            <VStack space="lg" alignItems="center" py="$4">
                                <Box sx={{ padding: Theme.spacing.lg, backgroundColor: 'white', borderRadius: Theme.corners.generous }}>
                                    <QRCode
                                        value={classroomId}
                                        size={200}
                                        color="black"
                                        backgroundColor="white"
                                    />
                                </Box>
                                <VStack space="xs" alignItems="center">
                                    <Text color={Theme.colors.sacredWhite} fontWeight="$bold">Classroom Join Code</Text>
                                    <Pressable onPress={() => copyToClipboard(classroomId)}>
                                        <Text color={Theme.colors.sanctuarySaffron} size="sm">{classroomId}</Text>
                                    </Pressable>
                                </VStack>
                                <Box sx={{ padding: Theme.spacing.md, backgroundColor: Theme.colors.deepIndigo, borderRadius: Theme.corners.comfortable }}>
                                    <HStack space="sm" alignItems="center">
                                        <Info size={16} color={Theme.colors.amberGlow} />
                                        <Text size="xs" color={Theme.colors.mistGray} sx={{ flex: 1 }}>
                                            Students can scan this QR code or enter the code manually in their app to join this classroom.
                                        </Text>
                                    </HStack>
                                </Box>
                                <Button
                                    onPress={() => copyToClipboard(classroomId)}
                                    sx={{ backgroundColor: Theme.colors.deepIndigo, width: '100%' }}
                                >
                                    <ButtonText>Copy Class ID</ButtonText>
                                </Button>
                            </VStack>
                        )}
                    </VStack>
                </ModalBody>
                {studentToEdit && activeTab === 'search' && (
                    <ModalFooter>
                        <Button
                            onPress={handleUpdateStudent}
                            disabled={isSubmitting}
                            sx={{ backgroundColor: Theme.colors.sanctuarySaffron, width: '100%' }}
                        >
                            {isSubmitting ? <Spinner color="white" /> : <ButtonText>Save Changes</ButtonText>}
                        </Button>
                    </ModalFooter>
                )}
            </ModalContent>
        </Modal>
    );
}
