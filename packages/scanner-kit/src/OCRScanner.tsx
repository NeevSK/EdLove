// OCR Scanner Component
// Uses @react-native-ml-kit/text-recognition to scan student registers
// Supports Sinhala, Tamil, English handwritten and printed text

import React, { useState } from 'react';
import { Image, Alert, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import TextRecognition from '@react-native-ml-kit/text-recognition';

export interface ScannedStudent {
    name: string;
    index_number: string;
    notes?: string;
}

interface OCRScannerProps {
    onStudentsScanned: (students: ScannedStudent[]) => void;
    onCancel: () => void;
    /** Optional theme colors — pass from the host app */
    colors?: {
        primary?: string;
        secondary?: string;
        border?: string;
        text?: string;
        textSecondary?: string;
        tertiary?: string;
        accent?: string;
        success?: string;
    };
}

const DEFAULT_COLORS = {
    primary: '#1a1a2e',
    secondary: '#16213e',
    border: '#2a2a4a',
    text: '#ffffff',
    textSecondary: '#a0a0b0',
    tertiary: '#0f3460',
    accent: '#f5a623',
    success: '#4caf50',
};

export default function OCRScanner({ onStudentsScanned, onCancel, colors: colorsProp }: OCRScannerProps) {
    const colors = { ...DEFAULT_COLORS, ...colorsProp };
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [scannedText, setScannedText] = useState<string>('');
    const [parsedStudents, setParsedStudents] = useState<ScannedStudent[]>([]);
    const [step, setStep] = useState<'capture' | 'processing' | 'review'>('capture');
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

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
        setStep('processing');

        try {
            const result = await TextRecognition.recognize(uri);

            if (!result || !result.text) {
                throw new Error('No text detected in image');
            }

            setScannedText(result.text);
            const students = parseStudentData(result.text);

            if (students.length === 0) {
                throw new Error('No student data could be parsed from the image');
            }

            setParsedStudents(students);
            setStep('review');
            showToast(`Found ${students.length} student(s)! Review and confirm.`);
        } catch (error) {
            console.error('OCR Error:', error);
            showToast('Failed to scan register. Try manual entry instead.');
            setStep('capture');
            setImageUri(null);
        }
    };

    // Parse student data from recognized text
    const parseStudentData = (text: string): ScannedStudent[] => {
        const students: ScannedStudent[] = [];
        const lines = text.split('\n').filter(line => line.trim().length > 0);

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            if (
                line.toLowerCase().includes('name') ||
                line.toLowerCase().includes('index') ||
                line.toLowerCase().includes('no.') ||
                line.toLowerCase().includes('නම') ||
                line.toLowerCase().includes('எண்') ||
                line.length < 3
            ) {
                continue;
            }

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

            const spaceSplit = line.split(/\s{2,}/).map(p => p.trim());
            if (spaceSplit.length >= 2) {
                const possibleIndex = spaceSplit.find(part => /\d+/.test(part));
                const name = spaceSplit[0];
                if (possibleIndex && name) {
                    students.push({
                        name,
                        index_number: possibleIndex,
                        notes: spaceSplit.slice(1).filter(p => p !== possibleIndex).join(' ') || undefined,
                    });
                    continue;
                }
            }

            const hasNumbers = /\d+/.test(line);
            const hasText = /[a-zA-Z\u0D80-\u0DFF\u0B80-\u0BFF]{3,}/.test(line);

            if (hasNumbers && hasText) {
                const nameMatch = line.match(/^([a-zA-Z\u0D80-\u0DFF\u0B80-\u0BFF\s]+)/);
                const indexMatch = line.match(/(\d+)/);
                if (nameMatch && indexMatch) {
                    students.push({
                        name: nameMatch[1].trim(),
                        index_number: indexMatch[1],
                    });
                }
            }
        }

        return students.filter(
            (student, index, self) =>
                index === self.findIndex(s => s.name === student.name)
        );
    };

    const handleConfirm = () => {
        if (parsedStudents.length === 0) {
            showToast('No students to add');
            return;
        }
        onStudentsScanned(parsedStudents);
    };

    const handleRetry = () => {
        setImageUri(null);
        setScannedText('');
        setParsedStudents([]);
        setStep('capture');
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.primary }}>
            {/* Toast */}
            {toastMessage && (
                <View style={{
                    position: 'absolute', top: 60, left: 16, right: 16, zIndex: 999,
                    backgroundColor: colors.accent, padding: 12, borderRadius: 8,
                }}>
                    <Text style={{ color: '#fff', textAlign: 'center' }}>{toastMessage}</Text>
                </View>
            )}

            {/* Header */}
            <View style={{
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                paddingHorizontal: 24, paddingTop: 48, paddingBottom: 16,
                borderBottomWidth: 1, borderBottomColor: colors.border,
            }}>
                <Text style={{ color: colors.accent, fontSize: 20, fontWeight: 'bold' }}>
                    Scan Student Register
                </Text>
                <TouchableOpacity onPress={onCancel}>
                    <Text style={{ color: colors.textSecondary, fontSize: 24 }}>✕</Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
                {step === 'capture' && (
                    <View style={{ gap: 16 }}>
                        <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
                            Take a photo of your student register. Works with Sinhala, Tamil, and English text.
                        </Text>

                        <TouchableOpacity
                            onPress={handleCaptureImage}
                            style={{
                                backgroundColor: colors.accent, padding: 16,
                                borderRadius: 12, alignItems: 'center',
                            }}
                        >
                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>📷 Take Photo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handlePickImage}
                            style={{
                                borderWidth: 1, borderColor: colors.border, padding: 16,
                                borderRadius: 12, alignItems: 'center',
                            }}
                        >
                            <Text style={{ color: colors.text, fontSize: 16 }}>Choose from Gallery</Text>
                        </TouchableOpacity>

                        <View style={{
                            backgroundColor: colors.tertiary, padding: 16,
                            borderRadius: 12, borderWidth: 1, borderColor: colors.border, gap: 6,
                        }}>
                            <Text style={{ color: colors.accent, fontWeight: '600', fontSize: 13 }}>Tips for best results:</Text>
                            {['Good lighting (avoid shadows)', 'Clear, focused image', 'Straight angle (not tilted)', 'Include column headers if possible'].map(tip => (
                                <Text key={tip} style={{ color: colors.textSecondary, fontSize: 13 }}>• {tip}</Text>
                            ))}
                        </View>
                    </View>
                )}

                {step === 'processing' && (
                    <View style={{ alignItems: 'center', marginTop: 48, gap: 16 }}>
                        {imageUri && (
                            <Image source={{ uri: imageUri }} style={{ width: 300, height: 400, borderRadius: 12 }} resizeMode="contain" />
                        )}
                        <ActivityIndicator size="large" color={colors.accent} />
                        <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>Scanning and analyzing text...</Text>
                    </View>
                )}

                {step === 'review' && (
                    <View style={{ gap: 16 }}>
                        <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
                            Found {parsedStudents.length} student(s). Review and confirm or edit manually.
                        </Text>

                        {imageUri && (
                            <Image source={{ uri: imageUri }} style={{ width: '100%', height: 150, borderRadius: 12 }} resizeMode="contain" />
                        )}

                        <View style={{ gap: 8 }}>
                            {parsedStudents.map((student, index) => (
                                <View key={index} style={{
                                    backgroundColor: colors.tertiary, padding: 16, borderRadius: 12,
                                    borderLeftWidth: 4, borderLeftColor: colors.success,
                                    borderWidth: 1, borderColor: colors.border,
                                }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <View style={{ flex: 1, gap: 4 }}>
                                            <Text style={{ color: colors.text, fontWeight: '600' }}>{student.name}</Text>
                                            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Index: {student.index_number}</Text>
                                            {student.notes && <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{student.notes}</Text>}
                                        </View>
                                        <Text style={{ color: colors.success, fontSize: 18 }}>✓</Text>
                                    </View>
                                </View>
                            ))}
                        </View>

                        {scannedText && (
                            <View style={{
                                backgroundColor: colors.tertiary, padding: 16, borderRadius: 12,
                                borderWidth: 1, borderColor: colors.border,
                            }}>
                                <Text style={{ color: colors.textSecondary, fontSize: 11, fontFamily: 'monospace' }}>
                                    {scannedText.substring(0, 200)}{scannedText.length > 200 && '...'}
                                </Text>
                            </View>
                        )}

                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity
                                onPress={handleRetry}
                                style={{
                                    flex: 1, borderWidth: 1, borderColor: colors.border,
                                    padding: 16, borderRadius: 12, alignItems: 'center',
                                }}
                            >
                                <Text style={{ color: colors.text }}>Try Again</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleConfirm}
                                style={{
                                    flex: 1, backgroundColor: colors.accent,
                                    padding: 16, borderRadius: 12, alignItems: 'center',
                                }}
                            >
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Confirm ({parsedStudents.length})</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
