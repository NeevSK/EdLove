import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Alert, Linking, Text } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { X, RefreshCw } from 'lucide-react-native';
import { Theme } from '../../constants/Theme';

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

    useEffect(() => {
        if (visible) {
            setScanned(false);
        }
    }, [visible]);

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

                        <View style={styles.scannerFrameContainer}>
                            <View style={styles.scannerFrame} />
                            <Text style={styles.instructionText}>
                                Position the QR code within the frame
                            </Text>
                        </View>

                        <View style={styles.controls}>
                            <TouchableOpacity onPress={toggleCameraFacing} style={styles.flipButton}>
                                <RefreshCw color="white" size={24} />
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
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingTop: 50, // Safe area padding proxy
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
    scannerFrameContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scannerFrame: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: Theme.colors.sanctuarySaffron,
        backgroundColor: 'transparent',
        borderRadius: 16,
    },
    instructionText: {
        color: 'white',
        marginTop: 16,
        fontSize: 14,
        textAlign: 'center',
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 30,
    },
    flipButton: {
        padding: 12,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 30,
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
