import { type CameraType, CameraView, scanFromURLAsync, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Modal, StyleSheet, Text, View, Pressable } from 'react-native';

/**
 * ScannerModal — QR code scanner for Gurudevi
 *
 * Live camera:  expo-camera → CameraView.onBarcodeScanned
 *               ↳ Android: Google ML Kit Barcode API (on-device, free, fast)
 *               ↳ iOS:     Apple Vision / AVFoundation
 *
 * Gallery pick: expo-camera → scanFromURLAsync
 *               ↳ On-device ML Kit / Apple Vision directly on static device images
 *
 * No API keys. No network calls. Works 100% offline.
 */

interface ScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
  title?: string;
  /** Optional accent color for buttons */
  accentColor?: string;
}

export default function ScannerModal({
  visible,
  onClose,
  onScan,
  title,
  accentColor = '#f5a623',
}: ScannerModalProps) {
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [processing, setProcessing] = useState(false);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const modalTitle = title ?? t('scanner.title');

  useEffect(() => {
    if (visible) {
      setScanned(false);
      setProcessing(false);
      setGalleryError(null);
      void activateKeepAwakeAsync().catch((err) => {
        console.warn('Failed to activate keep awake:', err);
      });
    } else {
      void deactivateKeepAwake().catch((err) => {
        console.warn('Failed to deactivate keep awake:', err);
      });
    }
    return () => {
      void deactivateKeepAwake().catch((err) => {
        console.warn('Failed to deactivate keep awake:', err);
      });
    };
  }, [visible]);

  /**
   * Gallery scan — uses expo-camera scanFromURLAsync (Google ML Kit / Apple Vision on-device).
   */
  const processImage = async (uri: string) => {
    setProcessing(true);
    setGalleryError(null);
    try {
      const barcodes = await scanFromURLAsync(uri, ['qr']);
      const qr = barcodes.find((b) => b.data);

      if (qr?.data) {
        handleBarCodeScanned({ data: qr.data });
      } else {
        setGalleryError(t('scanner.errors.noQrFound'));
      }
    } catch (error) {
      console.error('Gallery Scan Error:', error);
      setGalleryError(t('scanner.errors.scanFailed'));
    } finally {
      setProcessing(false);
    }
  };

  const pickImage = async () => {
    setGalleryError(null);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, // let user crop to QR area
        quality: 1,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Pick Image Error:', error);
    }
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    onScan(data);
    onClose();
  };

  function toggleCameraFacing() {
    setFacing((current: CameraType) => (current === 'back' ? 'front' : 'back'));
  }

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.container}>
          <View style={styles.permissionContainer}>
            <View style={{ gap: 10, alignItems: 'center' }}>
              <Text style={{ textAlign: 'center', color: '#fff' }}>
                {t('scanner.permission.message')}
              </Text>
              <Pressable
                onPress={() => {
                  void requestPermission();
                }}
                style={[styles.button, { backgroundColor: accentColor }]}
              >
                <Text style={styles.buttonText}>{t('scanner.permission.grant')}</Text>
              </Pressable>
              <Pressable onPress={onClose}>
                <Text style={{ color: '#888' }}>{t('common.cancel')}</Text>
              </Pressable>
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
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        >
          <View style={styles.overlay}>
            <View style={styles.header}>
              <Text style={styles.heading}>{modalTitle}</Text>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Text style={{ color: 'white', fontSize: 20 }}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.scannerArea}>
              {processing ? (
                <View
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    padding: 20,
                    borderRadius: 10,
                    alignItems: 'center',
                  }}
                >
                  <ActivityIndicator size="large" color={accentColor} />
                  <Text style={{ color: 'white', marginTop: 10 }}>{t('scanner.status.mlKit')}</Text>
                </View>
              ) : galleryError ? (
                <View
                  style={{
                    backgroundColor: 'rgba(220,50,50,0.85)',
                    padding: 14,
                    borderRadius: 10,
                    maxWidth: 260,
                  }}
                >
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                      fontSize: 13,
                    }}
                  >
                    {galleryError}
                  </Text>
                  <Pressable
                    onPress={() => setGalleryError(null)}
                    style={{ marginTop: 8, alignSelf: 'center' }}
                  >
                    <Text
                      style={{
                        color: 'white',
                        textDecorationLine: 'underline',
                        fontSize: 12,
                      }}
                    >
                      {t('scanner.dismiss')}
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <Text style={styles.instructionText}>{t('scanner.instructions')}</Text>
              )}
            </View>

            <View style={styles.controls}>
              <Pressable
                onPress={() => {
                  void pickImage();
                }}
                style={[styles.controlButton, { marginRight: 20 }]}
                disabled={processing}
              >
                <Text style={{ fontSize: 24 }}>🖼️</Text>
                <Text style={[styles.controlLabel, processing && { color: 'gray' }]}>
                  {t('scanner.controls.gallery')}
                </Text>
              </Pressable>

              <Pressable
                onPress={toggleCameraFacing}
                style={styles.controlButton}
                disabled={processing}
              >
                <Text style={{ fontSize: 24 }}>🔄</Text>
                <Text style={[styles.controlLabel, processing && { color: 'gray' }]}>
                  {t('scanner.controls.flip')}
                </Text>
              </Pressable>
            </View>
          </View>
        </CameraView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1a1a2e',
  },
  camera: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  scannerArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heading: { color: 'white', fontSize: 18, fontWeight: 'bold' },
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
  button: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  buttonText: { color: 'white', fontWeight: 'bold' },
}) as any;
