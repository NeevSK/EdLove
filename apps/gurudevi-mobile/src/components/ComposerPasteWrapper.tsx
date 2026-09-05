import { useCallback, useEffect, useRef } from "react";
import { Platform, TextInput, TextInputProps } from "react-native";
import { isComposerPasteEnabled } from "@/lib/fetchFn";

type PasteEventPayload =
  | { type: "text"; value: string }
  | { type: "images"; uris: string[] }
  | { type: "unsupported" }
  | { type: "consent_required"; uris: string[] };

// Extended props to include onPaste from expo-paste-input
interface ComposerPasteWrapperProps extends Omit<TextInputProps, "onPaste"> {
  onPaste?: (payload: PasteEventPayload) => void;
  children?: never;
  consentGiven?: boolean;
}

const TEMP_PASTE_DIR = "paste-attachments";

export function ComposerPasteWrapper({
  onPaste,
  style,
  consentGiven = false,
  ...props
}: ComposerPasteWrapperProps) {
  const tempUrisRef = useRef<string[]>([]);

  // Feature flag check - if disabled, render normal TextInput
  const featureEnabled = isComposerPasteEnabled();

  // On native, expo-paste-input adds onPaste to TextInput
  // On web, we fall back to clipboard API
  const handlePaste = useCallback(
    (payload: PasteEventPayload) => {
      if (payload.type === "text") {
        onPaste?.(payload);
        return;
      }

      if (payload.type === "images") {
        // Store temp URIs for attachment flow
        tempUrisRef.current = payload.uris;

        if (!consentGiven) {
          // Trigger consent flow - caller should show consent UI
          onPaste?.({ type: "consent_required", uris: payload.uris });
          return;
        }

        // Consent already given - proceed with attachment
        onPaste?.({ type: "images", uris: payload.uris });
        return;
      }

      if (payload.type === "consent_required") {
        onPaste?.(payload);
        return;
      }

      onPaste?.(payload);
    },
    [onPaste, consentGiven],
  );

  // Cleanup temp files on unmount or consent revoke
  useEffect(() => {
    return () => {
      if (!consentGiven && tempUrisRef.current.length > 0) {
        // Best effort cleanup - actual purge happens in attachment flow
        console.log("[ComposerPasteWrapper] Temp URIs pending cleanup:", tempUrisRef.current);
      }
    };
  }, [consentGiven]);

  // On web, use clipboard API fallback
  useEffect(() => {
    if (Platform.OS !== "web") return;

    const handleClipboardPaste = async (e: ClipboardEvent) => {
      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

      const items = clipboardData.items;
      const imageItems = Array.from(items).filter((item) => item.type.startsWith("image/"));

      if (imageItems.length > 0) {
        e.preventDefault();
        const uris = await Promise.all(
          imageItems.map((item) => {
            const file = item.getAsFile();
            if (!file) return null;
            return URL.createObjectURL(file);
          }),
        );
        const validUris = uris.filter((u): u is string => u !== null);
        handlePaste({ type: "images", uris: validUris });
      }
    };

    document.addEventListener("paste", handleClipboardPaste);
    return () => document.removeEventListener("paste", handleClipboardPaste);
  }, [handlePaste]);

  // If feature is disabled, render normal TextInput without paste handling
  if (!featureEnabled) {
    return <TextInput {...props} style={style} />;
  }

  return <TextInput {...props} onPaste={handlePaste} style={style} />;
}

// Export temp dir name for attachment flow
export { TEMP_PASTE_DIR };

// Type extension for onPaste payload (expo-paste-input adds this to TextInput)
declare module "react-native" {
  interface TextInputProps {
    onPaste?: (payload: PasteEventPayload) => void;
  }
}
