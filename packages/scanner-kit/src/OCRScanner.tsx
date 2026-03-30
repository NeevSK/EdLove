// OCR Scanner Component
// Supports Sinhala, Tamil, English handwritten and printed text
// Provider-agnostic: uses OCRPipeline (MLKit by default, cloud for Pro users)

import React, { useState } from "react";
import {
  Image,
  Alert,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";
import { defaultOCRPipeline, OCRPipeline } from "./ocr/OCRPipeline";
import { parseStudents, ParsedStudent } from "./ocr/parsers/StudentParser";
import type { OCRProviderName } from "./ocr/types";

import { ScannedStudent } from "./types";

interface OCRScannerProps {
  onStudentsScanned: (students: ScannedStudent[]) => void;
  onCancel: () => void;
  /** Optional theme colors \u2014 pass from the host app */
  colors?: {
    primary?: string;
    secondary?: string;
    border?: string;
    text?: string;
    textSecondary?: string;
    tertiary?: string;
    accent?: string;
    success?: string;
    warning?: string;
  };
  /**
   * OCR provider to use. Defaults to 'mlkit' (free, on-device).
   * Pass 'google_vision' or 'openai_vision' for Pro cloud backends.
   * The pipeline auto-falls back to mlkit if the cloud provider fails.
   */
  providerName?: OCRProviderName;
  /**
   * Custom pipeline instance. If omitted, uses defaultOCRPipeline.
   * Inject a Pro pipeline (with cloud providers registered) from the host app.
   */
  pipeline?: OCRPipeline;
}

const DEFAULT_COLORS = {
  primary: "#1a1a2e",
  secondary: "#16213e",
  border: "#2a2a4a",
  text: "#ffffff",
  textSecondary: "#a0a0b0",
  tertiary: "#0f3460",
  accent: "#f5a623",
  success: "#4caf50",
  warning: "#f59e0b",
};

export default function OCRScanner({
  onStudentsScanned,
  onCancel,
  colors: colorsProp,
  providerName = "mlkit",
  pipeline = defaultOCRPipeline,
}: OCRScannerProps) {
  const { t } = useTranslation();
  const colors = { ...DEFAULT_COLORS, ...colorsProp };
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [scannedText, setScannedText] = useState<string>("");
  const [parsedStudents, setParsedStudents] = useState<ParsedStudent[]>([]);
  const [step, setStep] = useState<"capture" | "processing" | "review">(
    "capture",
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Request camera permissions
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(t("ocr.permission.title"), t("ocr.permission.description"), [
        { text: t("common.ok") },
      ]);
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

  // Process image using the injected OCR pipeline
  const processImage = async (uri: string) => {
    setStep("processing");

    try {
      const ocrResult = await pipeline.recognize(uri, {
        provider: providerName,
      });

      if (!ocrResult.text && ocrResult.blocks.length === 0) {
        throw new Error("No text detected in image");
      }

      setScannedText(ocrResult.text);
      const students = parseStudents(ocrResult);

      if (students.length === 0) {
        throw new Error("No student data could be parsed from the image");
      }

      setParsedStudents(students);
      setStep("review");
      showToast(`Found ${students.length} student(s)! Review and confirm.`);
    } catch (error) {
      console.error("OCR Error:", error);
      showToast("Failed to scan register. Try manual entry instead.");
      setStep("capture");
      setImageUri(null);
    }
  };

  const handleConfirm = () => {
    if (parsedStudents.length === 0) {
      showToast("No students to add");
      return;
    }
    onStudentsScanned(parsedStudents);
  };

  const handleRetry = () => {
    setImageUri(null);
    setScannedText("");
    setParsedStudents([]);
    setStep("capture");
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.primary }}
      {/* Toast */}
      {toastMessage && (
        <View
          style={{
            position: "absolute",
            top: 60,
            left: 16,
            right: 16,
            zIndex: 999,
            backgroundColor: colors.accent,
            padding: 12,
            borderRadius: 8,
          }}
        
          <Text style={{ color: "#fff", textAlign: "center" }}
            {toastMessage}
          </Text
        </View
      )}

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 24,
          paddingTop: 48,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      
        <Text
          style={{ color: colors.accent, fontSize: 20, fontWeight: "bold" }}
        
          {t("ocr.title")}
        </Text
        <TouchableOpacity onPress={onCancel}
          <Text style={{ color: colors.textSecondary, fontSize: 24 }}>\u2715</Text
        </TouchableOpacity
      </View

      {/* Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}
        {step === "capture" && (
          <View style={{ gap: 16 }}
            <Text style={{ color: colors.textSecondary, textAlign: "center" }}
              {t("ocr.captureDescription")}
            </Text

            <TouchableOpacity
              onPress={handleCaptureImage}
              style={{
                backgroundColor: colors.accent,
                padding: 16,
                borderRadius: 12,
                alignItems: "center",
              }}
            
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}
                \uD83D\uDCF7 {t("ocr.takePhoto")}
              </Text
            </TouchableOpacity

            <TouchableOpacity
              onPress={handlePickImage}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                padding: 16,
                borderRadius: 12,
                alignItems: "center",
              }}
            
              <Text style={{ color: colors.text, fontSize: 16 }}
                {t("ocr.chooseFromGallery")}
              </Text
            </TouchableOpacity

            <View
              style={{
                backgroundColor: colors.tertiary,
                padding: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
                gap: 6,
              }}
            
              <Text
                style={{
                  color: colors.accent,
                  fontWeight: "600",
                  fontSize: 13,
                }}
              
                {t("ocr.tipsTitle")}
              </Text
              {[
                "Good lighting (avoid shadows)",
                "Clear, focused image",
                "Straight angle (not tilted)",
                "Include column headers if possible",
              ].map((tip) => (
                <Text
                  key={tip}
                  style={{ color: colors.textSecondary, fontSize: 13 }}
                
                  \u2022 {tip}
                </Text
              ))}
            </View
          </View
        )}

        {step === "processing" && (
          <View style={{ alignItems: "center", marginTop: 48, gap: 16 }}
            {imageUri && (
              <Image
                source={{ uri: imageUri }}
                style={{ width: 300, height: 400, borderRadius: 12 }}
                resizeMode="contain"
              /
            )}
            <ActivityIndicator size="large" color={colors.accent} /
            <Text style={{ color: colors.textSecondary, textAlign: "center" }}
              {t("ocr.scanning")}
            </Text
          </View
        )}

        {step === "review" && (
          <View style={{ gap: 16 }}
            <Text style={{ color: colors.textSecondary, textAlign: "center" }}
              Found {parsedStudents.length} student(s). Review and confirm or
              edit manually.
            </Text

            {imageUri && (
              <Image
                source={{ uri: imageUri }}
                style={{ width: "100%", height: 150, borderRadius: 12 }}
                resizeMode="contain"
              /
            )}

            <View style={{ gap: 8 }}
              {parsedStudents.map((student, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: colors.tertiary,
                    padding: 16,
                    borderRadius: 12,
                    borderLeftWidth: 4,
                    borderLeftColor: student.uncertain
                      ? colors.warning
                      : colors.success,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  
                    <View style={{ flex: 1, gap: 4 }}
                      <Text style={{ color: colors.text, fontWeight: "600" }}
                        {student.name}
                      </Text
                      <Text
                        style={{ color: colors.textSecondary, fontSize: 13 }}
                      
                        Index: {student.index_number}
                      </Text
                      {student.notes && (
                        <Text
                          style={{ color: colors.textSecondary, fontSize: 13 }}
                        
                          {student.notes}
                        </Text
                      )}
                      {student.uncertain && (
                        <Text style={{ color: colors.warning, fontSize: 11 }}
                          \u26A0 Low confidence \u2014 please verify
                        </Text
                      )}
                    </View
                    <Text
                      style={{
                        color: student.uncertain
                          ? colors.warning
                          : colors.success,
                        fontSize: 18,
                      }}
                    
                      {student.uncertain ? "?" : "\u2713"}
                    </Text
                  </View
                </View
              ))}
            </View

            {scannedText && (
              <View
                style={{
                  backgroundColor: colors.tertiary,
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 11,
                    fontFamily: "monospace",
                  }}
                
                  {scannedText.substring(0, 200)}
                  {scannedText.length > 200 && "..."}
                </Text
              </View
            )}

            <View style={{ flexDirection: "row", gap: 12 }}
              <TouchableOpacity
                onPress={handleRetry}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: 16,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              
                <Text style={{ color: colors.text }}>{t("ocr.tryAgain")}</Text
              </TouchableOpacity
              <TouchableOpacity
                onPress={handleConfirm}
                style={{
                  flex: 1,
                  backgroundColor: colors.accent,
                  padding: 16,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              
                <Text style={{ color: "#fff", fontWeight: "bold" }}
                  Confirm ({parsedStudents.length})
                </Text
              </TouchableOpacity
            </View
          </View
        )}
      </ScrollView
    </View
  );
}
