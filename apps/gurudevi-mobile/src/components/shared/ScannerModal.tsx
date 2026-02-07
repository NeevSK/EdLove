import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Alert, Text, ActivityIndicator } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { X, RefreshCw, Image as ImageIcon } from 'lucide-react-native';
import { Theme } from '../../constants/Theme';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import jsQR from 'jsqr';
import jpeg from 'jpeg-js';
import { Buffer } from 'buffer';

interface ScannerModalProps {
    visible: boolean;
    onClose: () => void;
    onScan: (data: string) => void;
    title?: string;
}

export default function ScannerModal({ visible, onClose, onScan, title = 'Scan QR Code' }: ScannerModalProps) {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [facing, setFacing] = useState<CameraType>('back');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (visible) {
            setScanned(false);
            setProcessing(false);
        }
    }, [visible]);

    const processImage = async (uri: string) => {
        try {
            setProcessing(true);

            // 1. Resize/Normalize the image to JPEG for consistent decoding
            // Resizing to ~1000px width ensures we have enough detail for small QRs
            // but keep memory usage reasonable for JS decoding.
            const manipResult = await ImageManipulator.manipulateAsync(
                uri,
                [{ resize: { width: 1000 } }],
                { base64: true, format: ImageManipulator.SaveFormat.JPEG, compress: 1.0 }
            );

            if (!manipResult.base64) {
                throw new Error("Could not get image data");
            }

            // 2. Decode JPEG to raw pixel data
            const buffer = Buffer.from(manipResult.base64, 'base64');
            const rawData = jpeg.decode(buffer, { useTArray: true }); // Returns { width, height, data: Uint8Array }

            // 3. Scan for QR code in raw pixel data
            // jsQR expects Uint8ClampedArray, but jpeg-js returns Uint8Array.
            // Explicitly cast or re-create array to satisfy TS
            const clampedData = Uint8ClampedArray.from(rawData.data);
            const code = jsQR(clampedData, rawData.width, rawData.height);

            if (code) {
                handleBarCodeScanned({ data: code.data });
            } else {
                Alert.alert(
                    "No QR Code Found",
                    "Could not detect a QR code. Would you like to try cropping the image?",
                    [
                        { text: "Cancel", style: "cancel" },
                        {
                            text: "Crop & Retry",
                            onPress: () => pickImage(true)
                        }
                    ]
                );
            }

        } catch (error) {
            console.error("Gallery Scan Error:", error);
            Alert.alert("Error", "Failed to process image.");
        } finally {
            setProcessing(false);
        }
    };

    const pickImage = async (useCropping = false) => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: useCropping,
                quality: 1,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                await processImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error("Pick Image Error:", error);
        }
    };

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        if (scanned) return;
        setScanned(true);
        // Haptic feedback could be added here
        onScan(data);
        onClose();
    };

    function toggleCameraFacing() {
        setFacing((current: CameraType) => (current === 'back' ? 'front' : 'back'));
    }

    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <Modal visible={visible} animationType="slide" transparent>
                <View style={styles.container}>
                    <View style={styles.permissionContainer}>
                        <View style={{ gap: 10, alignItems: 'center' }}>
                            <Text style={{ textAlign: 'center', color: Theme.colors.sacredWhite }}>
                                We need your permission to show the camera
                            </Text>
                            <TouchableOpacity onPress={requestPermission} style={styles.button}>
                                <Text style={styles.buttonText}>Grant Permission</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onClose}>
                                <Text style={{ color: Theme.colors.mistGray }}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    }

    return (
        <Modal
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
            presentationStyle="pageSheet"
        >
            <View style={styles.container}>
                <CameraView
                    style={styles.camera}
                    facing={facing}
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: ["qr"],
                    }}
                >
                    <View style={styles.overlay}>
                        <View style={styles.header}>
                            <Text style={styles.heading}>{title}</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <X color="white" size={24} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.scannerArea}>
                            {processing ? (
                                <View style={{ backgroundColor: 'rgba(0,0,0,0.7)', padding: 20, borderRadius: 10 }}>
                                    <ActivityIndicator size="large" color={Theme.colors.sanctuarySaffron} />
                                    <Text style={{ color: 'white', marginTop: 10 }}>Processing Image...</Text>
                                </View>
                            ) : (
                                <Text style={styles.instructionText}>
                                    Point camera at QR code{'\n'}
                                    or select from gallery
                                </Text>
                            )}
                        </View>

                        <View style={styles.controls}>
                            <TouchableOpacity onPress={() => pickImage(false)} style={[styles.controlButton, { marginRight: 20 }]} disabled={processing}>
                                <ImageIcon color={processing ? 'gray' : 'white'} size={24} />
                                <Text style={[styles.controlLabel, processing && { color: 'gray' }]}>Gallery</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={toggleCameraFacing} style={styles.controlButton} disabled={processing}>
                                <RefreshCw color={processing ? 'gray' : 'white'} size={24} />
                                <Text style={[styles.controlLabel, processing && { color: 'gray' }]}>Flip</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </CameraView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: Theme.colors.voidIndigo,
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'transparent', // Full screen scanning
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingTop: 50, // Safe area padding proxy
        backgroundColor: 'rgba(0,0,0,0.3)', // Semi-transparent header
    },
    scannerArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heading: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
    },
    instructionText: {
        color: 'white',
        fontSize: 14,
        textAlign: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 10,
        borderRadius: 8,
        overflow: 'hidden',
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 40,
        paddingBottom: 60,
    },
    flipButton: {
        padding: 12,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 30,
    },
    controlButton: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 16,
        borderRadius: 16,
        minWidth: 80,
    },
    controlLabel: {
        color: 'white',
        fontSize: 12,
        marginTop: 4,
        fontWeight: '500',
    },
    button: {
        backgroundColor: Theme.colors.sanctuarySaffron,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
