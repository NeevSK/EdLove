// OCR Scanner Component
// Uses @react-native-ml-kit/text-recognition to scan student registers
// Supports Sinhala, Tamil, English handwritten and printed text

import React, { useState } from 'react';
import {
    Box,
    VStack,
    HStack,
    Button,
    ButtonText,
    Text,
    Heading,
    ScrollView,
    Pressable,
    Spinner,
    useToast,
    Toast,
    ToastTitle,
} from '@gluestack-ui/themed';
import { Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, X, Check } from 'lucide-react-native';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { Theme } from '../../constants/Theme';
import { hapticLight, hapticSuccess, hapticError } from '../../utils/haptics';

export interface ScannedStudent {
    name: string;
    index_number: string;
    notes?: string;
}

interface OCRScannerProps {
    onStudentsScanned: (students: ScannedStudent[]) => void;
    onCancel: () => void;
}

export default function OCRScanner({ onStudentsScanned, onCancel }: OCRScannerProps) {
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [scannedText, setScannedText] = useState<string>('');
    const [parsedStudents, setParsedStudents] = useState<ScannedStudent[]>([]);
    const [step, setStep] = useState<'capture' | 'processing' | 'review'>('capture');
    const toast = useToast();

    // Request camera permissions
    const requestPermissions = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Camera Permission',
                'We need camera permission to scan student registers.',
                [{ text: 'OK' }]
            );
            return false;
        }
        return true;
    };

    // Capture image from camera
    const handleCaptureImage = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        hapticLight();
        
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 1,
        });

        if (!result.canceled && result.assets[0]) {
            setImageUri(result.assets[0].uri);
            processImage(result.assets[0].uri);
        }
    };

    // Pick image from gallery
    const handlePickImage = async () => {
        hapticLight();
        
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 1,
        });

        if (!result.canceled && result.assets[0]) {
            setImageUri(result.assets[0].uri);
            processImage(result.assets[0].uri);
        }
    };

    // Process image with ML Kit Text Recognition
    const processImage = async (uri: string) => {
        setIsProcessing(true);
        setStep('processing');

        try {
            // Recognize text from image
            const result = await TextRecognition.recognize(uri);
            
            if (!result || !result.text) {
                throw new Error('No text detected in image');
            }

            setScannedText(result.text);
            
            // Parse the recognized text
            const students = parseStudentData(result.text);
            
            if (students.length === 0) {
                throw new Error('No student data could be parsed from the image');
            }

            setParsedStudents(students);
            setStep('review');
            hapticSuccess();
            
            toast.show({
                placement: 'bottom',
                render: ({ id }) => (
                    <Toast nativeID={id} action="success" variant="solid">
                        <ToastTitle>Found {students.length} student(s)! Review and confirm.</ToastTitle>
                    </Toast>
                ),
            });
        } catch (error) {
            console.error('OCR Error:', error);
            hapticError();
            
            toast.show({
                placement: 'bottom',
                render: ({ id }) => (
                    <Toast nativeID={id} action="error" variant="solid">
                        <ToastTitle>Failed to scan register. Try manual entry instead.</ToastTitle>
                    </Toast>
                ),
            });
            
            // Go back to capture
            setStep('capture');
            setImageUri(null);
        } finally {
            setIsProcessing(false);
        }
    };

    // Parse student data from recognized text
    // This is a heuristic parser - may need tuning based on actual register formats
    const parseStudentData = (text: string): ScannedStudent[] => {
        const students: ScannedStudent[] = [];
        const lines = text.split('\n').filter(line => line.trim().length > 0);

        // Try to identify patterns:
        // Pattern 1: "Name | Index" or "Name    Index"
        // Pattern 2: Lines alternating Name then Index
        // Pattern 3: Table format with columns

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Skip header lines
            if (
                line.toLowerCase().includes('name') || 
                line.toLowerCase().includes('index') ||
                line.toLowerCase().includes('no.') ||
                line.toLowerCase().includes('නම') || // Sinhala for "name"
                line.toLowerCase().includes('எண்') || // Tamil for "number"
                line.length < 3
            ) {
                continue;
            }

            // Pattern 1: Pipe or tab separated
            if (line.includes('|') || line.includes('\t')) {
                const parts = line.split(/[|\t]/).map(p => p.trim());
                if (parts.length >= 2) {
                    students.push({
                        name: parts[0],
                        index_number: parts[1],
                        notes: parts.length > 2 ? parts.slice(2).join(' ') : undefined,
                    });
                    continue;
                }
            }

            // Pattern 2: Multiple spaces (assume table-like format)
            const spaceSplit = line.split(/\s{2,}/).map(p => p.trim());
            if (spaceSplit.length >= 2) {
                // First part is name, last part that looks like a number is index
                const possibleIndex = spaceSplit.find(part => /\d+/.test(part));
                const name = spaceSplit[0];
                
                if (possibleIndex && name) {
                    students.push({
                        name: name,
                        index_number: possibleIndex,
                        notes: spaceSplit.slice(1).filter(p => p !== possibleIndex).join(' ') || undefined,
                    });
                    continue;
                }
            }

            // Pattern 3: Line has both text and numbers - try to split
            const hasNumbers = /\d+/.test(line);
            const hasText = /[a-zA-Z\u0D80-\u0DFF\u0B80-\u0BFF]{3,}/.test(line); // Latin, Sinhala, Tamil
            
            if (hasNumbers && hasText) {
                // Extract first continuous text as name
                const nameMatch = line.match(/^([a-zA-Z\u0D80-\u0DFF\u0B80-\u0BFF\s]+)/);
                // Extract first number sequence as index
                const indexMatch = line.match(/(\d+)/);
                
                if (nameMatch && indexMatch) {
                    students.push({
                        name: nameMatch[1].trim(),
                        index_number: indexMatch[1],
                    });
                }
            }
        }

        // Deduplicate by name
        const uniqueStudents = students.filter(
            (student, index, self) =>
                index === self.findIndex(s => s.name === student.name)
        );

        return uniqueStudents;
    };

    // Confirm and submit parsed students
    const handleConfirm = () => {
        if (parsedStudents.length === 0) {
            toast.show({
                placement: 'bottom',
                render: ({ id }) => (
                    <Toast nativeID={id} action="error" variant="solid">
                        <ToastTitle>No students to add</ToastTitle>
                    </Toast>
                ),
            });
            return;
        }

        hapticSuccess();
        onStudentsScanned(parsedStudents);
    };

    // Retry with different image
    const handleRetry = () => {
        hapticLight();
        setImageUri(null);
        setScannedText('');
        setParsedStudents([]);
        setStep('capture');
    };

    return (
        <Box sx={{ flex: 1, backgroundColor: Theme.colors.voidIndigo }}>
            {/* Header */}
            <HStack 
                px="$6" 
                pt="$12" 
                pb="$4" 
                justifyContent="space-between" 
                alignItems="center"
                borderBottomWidth={1}
                borderBottomColor={Theme.colors.mistGray}
            >
                <Heading color={Theme.colors.sanctuarySaffron} size="xl">
                    Scan Student Register
                </Heading>
                <Pressable onPress={onCancel}>
                    <X size={24} color={Theme.colors.mistGray} />
                </Pressable>
            </HStack>

            {/* Content */}
            <ScrollView sx={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
                {step === 'capture' && (
                    <VStack space="lg">
                        <Text color={Theme.colors.pearlGray} size="md" textAlign="center">
                            Take a photo of your student register. Works with Sinhala, Tamil, and English text.
                        </Text>

                        {/* Capture/Pick Buttons */}
                        <VStack space="md">
                            <Button
                                size="lg"
                                onPress={handleCaptureImage}
                                sx={{
                                    backgroundColor: Theme.colors.sanctuarySaffron,
                                    borderRadius: Theme.corners.comfortable,
                                }}
                            >
                                <Camera size={20} color={Theme.colors.white} style={{ marginRight: 8 }} />
                                <ButtonText>Take Photo</ButtonText>
                            </Button>

                            <Button
                                size="lg"
                                variant="outline"
                                onPress={handlePickImage}
                                sx={{
                                    borderColor: Theme.colors.mistGray,
                                    borderRadius: Theme.corners.comfortable,
                                }}
                            >
                                <ButtonText color={Theme.colors.sacredWhite}>Choose from Gallery</ButtonText>
                            </Button>
                        </VStack>

                        {/* Tips */}
                        <VStack 
                            space="sm" 
                            p="$4" 
                            sx={{
                                backgroundColor: Theme.colors.deepIndigo,
                                borderRadius: Theme.corners.comfortable,
                            }}
                        >
                            <Text color={Theme.colors.sanctuarySaffron} size="sm" fontWeight="$semibold">
                                Tips for best results:
                            </Text>
                            <Text color={Theme.colors.mistGray} size="sm">
                                • Good lighting (avoid shadows)
                            </Text>
                            <Text color={Theme.colors.mistGray} size="sm">
                                • Clear, focused image
                            </Text>
                            <Text color={Theme.colors.mistGray} size="sm">
                                • Straight angle (not tilted)
                            </Text>
                            <Text color={Theme.colors.mistGray} size="sm">
                                • Include column headers if possible
                            </Text>
                        </VStack>
                    </VStack>
                )}

                {step === 'processing' && (
                    <VStack space="lg" alignItems="center" mt="$12">
                        {imageUri && (
                            <Image
                                source={{ uri: imageUri }}
                                style={{
                                    width: 300,
                                    height: 400,
                                    borderRadius: 12,
                                }}
                                resizeMode="contain"
                            />
                        )}
                        <Spinner size="large" color={Theme.colors.sanctuarySaffron} />
                        <Text color={Theme.colors.pearlGray} size="md" textAlign="center">
                            Scanning and analyzing text...
                        </Text>
                    </VStack>
                )}

                {step === 'review' && (
                    <VStack space="lg">
                        <Text color={Theme.colors.pearlGray} size="md" textAlign="center">
                            Found {parsedStudents.length} student(s). Review and confirm or edit manually.
                        </Text>

                        {/* Preview Image (small) */}
                        {imageUri && (
                            <Image
                                source={{ uri: imageUri }}
                                style={{
                                    width: '100%',
                                    height: 150,
                                    borderRadius: 12,
                                }}
                                resizeMode="contain"
                            />
                        )}

                        {/* Parsed Students */}
                        <VStack space="sm">
                            {parsedStudents.map((student, index) => (
                                <Box
                                    key={index}
                                    p="$4"
                                    sx={{
                                        backgroundColor: Theme.colors.deepIndigo,
                                        borderRadius: Theme.corners.comfortable,
                                        borderLeftWidth: 4,
                                        borderLeftColor: Theme.colors.sageGreen,
                                    }}
                                >
                                    <HStack justifyContent="space-between" alignItems="center">
                                        <VStack space="xs" flex={1}>
                                            <Text color={Theme.colors.sacredWhite} size="md" fontWeight="$semibold">
                                                {student.name}
                                            </Text>
                                            <Text color={Theme.colors.mistGray} size="sm">
                                                Index: {student.index_number}
                                            </Text>
                                            {student.notes && (
                                                <Text color={Theme.colors.mistGray} size="sm">
                                                    {student.notes}
                                                </Text>
                                            )}
                                        </VStack>
                                        <Check size={20} color={Theme.colors.sageGreen} />
                                    </HStack>
                                </Box>
                            ))}
                        </VStack>

                        {/* Raw Text Preview (collapsible) */}
                        {scannedText && (
                            <Box
                                p="$4"
                                sx={{
                                    backgroundColor: Theme.colors.deepIndigo,
                                    borderRadius: Theme.corners.comfortable,
                                }}
                            >
                                <Text color={Theme.colors.mistGray} size="xs" fontFamily="$mono">
                                    {scannedText.substring(0, 200)}
                                    {scannedText.length > 200 && '...'}
                                </Text>
                            </Box>
                        )}

                        {/* Action Buttons */}
                        <HStack space="md">
                            <Button
                                size="lg"
                                variant="outline"
                                onPress={handleRetry}
                                flex={1}
                                sx={{
                                    borderColor: Theme.colors.mistGray,
                                    borderRadius: Theme.corners.comfortable,
                                }}
                            >
                                <ButtonText color={Theme.colors.sacredWhite}>Try Again</ButtonText>
                            </Button>
                            
                            <Button
                                size="lg"
                                onPress={handleConfirm}
                                flex={1}
                                sx={{
                                    backgroundColor: Theme.colors.sanctuarySaffron,
                                    borderRadius: Theme.corners.comfortable,
                                }}
                            >
                                <ButtonText>Confirm ({parsedStudents.length})</ButtonText>
                            </Button>
                        </HStack>
                    </VStack>
                )}
            </ScrollView>
        </Box>
    );
}
