/**
 * ScannerModal — Web fallback (Pattern A: platform file pair)
 *
 * expo-camera is a native-only module. On web, Metro resolves this .web.tsx
 * file instead of ScannerModal.tsx, preventing the unconditional
 * `import { CameraView } from 'expo-camera'` from crashing the bundle before
 * React even mounts (the root cause of the white screen on web).
 *
 * Web-superior UX: many school-admin users on desktop receive QR codes via
 * email or screenshot. Pasting the code value is faster and more reliable
 * than pointing a webcam at a printed page.
 *
 * Design tokens: Vellum (#F5EDD6) bg · Ink (#2A2318) text · Saffron (#D4843A) accent
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

interface ScannerModalProps {
    visible: boolean;
    onClose: () => void;
    onScan: (data: string) => void;
    title?: string;
    accentColor?: string;
}

export default function ScannerModal({
    visible,
    onClose,
    onScan,
    title = 'Enter QR Code',
    accentColor = '#D4843A',
}: ScannerModalProps) {
    const [value, setValue] = useState('');
    const [error, setError] = useState('');
    const inputRef = useRef<TextInput>(null);

    // Reset state each time the modal opens and focus the input
    useEffect(() => {
        if (visible) {
            setValue('');
            setError('');
            // Small delay so the modal animation completes before focusing
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [visible]);

    const handleSubmit = () => {
        const trimmed = value.trim();
        if (!trimmed) {
            setError('Please paste or type a QR code value.');
            return;
        }
        onScan(trimmed);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.backdrop}>
                {/* The browser handles keyboard avoidance natively for web modals */}
                <View style={styles.centeredView}>
                    <View style={styles.card}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.titleText}>{title}</Text>
                            <TouchableOpacity
                                onPress={onClose}
                                style={styles.closeButton}
                                accessibilityLabel="Close scanner"
                            >
                                <Text style={styles.closeText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Icon + message */}
                        <View style={styles.iconArea}>
                            {/* Lotus / QR icon — inline SVG-style using text */}
                            <View style={[styles.iconCircle, { backgroundColor: accentColor + '1A' }]}>
                                <Text style={[styles.iconGlyph, { color: accentColor }]}>⊞</Text>
                            </View>
                            <Text style={styles.messageText}>
                                Camera scanning is available in the{'\n'}Gurudevi mobile app.
                            </Text>
                            <Text style={styles.subText}>
                                On desktop, paste the QR code value below.
                            </Text>
                        </View>

                        {/* Input */}
                        <TextInput
                            ref={inputRef}
                            style={[
                                styles.input,
                                error ? styles.inputError : null,
                                { borderColor: error ? '#E74C3C' : '#DED5BC' },
                            ]}
                            placeholder="Paste QR code value here…"
                            placeholderTextColor="#A09070"
                            value={value}
                            onChangeText={(v) => { setValue(v); setError(''); }}
                            // Enter key submits on web
                            onSubmitEditing={handleSubmit}
                            returnKeyType="go"
                            autoCorrect={false}
                            autoCapitalize="none"
                        />
                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        {/* Submit */}
                        <TouchableOpacity
                            style={[styles.submitButton, { backgroundColor: accentColor }]}
                            onPress={handleSubmit}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.submitText}>Submit Code</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(42, 35, 24, 0.55)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    centeredView: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    card: {
        width: '100%',
        maxWidth: 420,
        backgroundColor: '#F5EDD6',
        borderRadius: 24,
        padding: 28,
        shadowColor: 'rgba(107, 100, 128, 1)',
        shadowOpacity: 0.22,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 8 },
        gap: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    titleText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2A2318',
        letterSpacing: 0.2,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#DED5BC',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeText: {
        fontSize: 14,
        color: '#2A2318',
        fontWeight: '600',
    },
    iconArea: {
        alignItems: 'center',
        gap: 10,
        paddingVertical: 8,
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    iconGlyph: {
        fontSize: 36,
    },
    messageText: {
        fontSize: 15,
        color: '#2A2318',
        textAlign: 'center',
        lineHeight: 22,
        fontWeight: '500',
    },
    subText: {
        fontSize: 13,
        color: '#5D4E37',
        textAlign: 'center',
        lineHeight: 18,
    },
    input: {
        borderWidth: 1.5,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: '#2A2318',
        backgroundColor: '#FFFDF7',
    },
    inputError: {
        borderColor: '#E74C3C',
    },
    errorText: {
        fontSize: 12,
        color: '#E74C3C',
        marginTop: -12,
    },
    submitButton: {
        borderRadius: 50,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: 'rgba(107, 100, 128, 1)',
        shadowOpacity: 0.18,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
    },
    submitText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFDF7',
        letterSpacing: 0.3,
    },
});
