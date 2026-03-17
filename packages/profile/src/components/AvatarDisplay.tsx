import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from '@repo/core';
import { useTheme, getInitialsFromName } from '@repo/ui';
import { Camera } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

// expo-file-system/legacy has no web implementation.
// On native we use it for local caching; on web we skip that layer entirely.
let FileSystem: typeof import('expo-file-system/legacy') | null = null;
if (Platform.OS !== 'web') {
  FileSystem = require('expo-file-system/legacy');
}

interface AvatarDisplayProps {
  userId: string;
  avatarUrl?: string | null;
  fullName?: string | null;
  size?: number;
  editable?: boolean;
  onAvatarUpdated?: (newPublicUrl: string) => Promise<void>;
  style?: object;
  peekable?: boolean;
  peekType?: 'user' | 'school' | 'classroom' | 'community';
}

function getCachePath(userId: string): string | null {
  if (!FileSystem) return null;
  return `${FileSystem.cacheDirectory ?? ''}avatar_${userId}.jpg`;
}

/**
 * Decode base64 string to Uint8Array for Supabase Storage upload.
 * Using atob if available (React Native >= 0.72 with Hermes), else manual decode.
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function AvatarDisplay({
  userId,
  avatarUrl,
  fullName,
  size = 80,
  editable = false,
  onAvatarUpdated,
  style,
  peekable = false,
  peekType = 'user',
}: AvatarDisplayProps) {
  const { accent, text } = useTheme();
  const navigation = useNavigation<any>();
  const [localCachePath, setLocalCachePath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Load local cache on mount (native only — FileSystem is not available on web)
  useEffect(() => {
    if (!userId || !FileSystem) return;
    const cachePath = getCachePath(userId);
    if (!cachePath) return;
    FileSystem.getInfoAsync(cachePath).then(info => {
      if (info.exists) setLocalCachePath(cachePath);
    }).catch(() => {
      // Cache read failure is non-fatal; avatar will fall back to remote URL
    });
  }, [userId]);

  const handlePickAndUpload = useCallback(async () => {
    // 1. Request media library permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    // 2. Open picker (square crop enforced)
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (result.canceled || !result.assets?.[0]) return;

    setUploading(true);
    try {
      // 3. Resize to 400×400 JPEG
      const manipulated = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 400, height: 400 } }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
      );

      // 4. Cache locally (native only — FileSystem not available on web)
      const cachePath = FileSystem ? getCachePath(userId) : null;
      if (FileSystem && cachePath) {
        await FileSystem.copyAsync({ from: manipulated.uri, to: cachePath });
        setLocalCachePath(cachePath);
      }

      // 5. Read as base64 for Supabase upload
      let bytes: Uint8Array;
      if (FileSystem) {
        const base64 = await FileSystem.readAsStringAsync(manipulated.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        bytes = base64ToUint8Array(base64);
      } else {
        // On web, fetch the blob URL produced by expo-image-manipulator and convert.
        // expo-image-manipulator returns a local object URL on web that is always fetchable.
        const response = await fetch(manipulated.uri);
        if (!response.ok) throw new Error(`[AvatarDisplay] Failed to read image for upload (web): ${response.status}`);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        bytes = new Uint8Array(arrayBuffer);
      }

      // 6. Upload to Supabase Storage bucket 'avatars'
      const fileName = `${userId}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, bytes, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // 7. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // 8. Notify caller to persist to profile
      await onAvatarUpdated?.(publicUrl);
    } catch (error) {
      // Optimistic display already shown — user sees their photo.
      // Upload will retry on next session via sync queue.
      console.warn('[AvatarDisplay] Upload failed, keeping local cache:', error);
    } finally {
      setUploading(false);
    }
  }, [userId, onAvatarUpdated]);

  const handlePeek = useCallback(() => {
    if (!peekable || !userId) return;
    navigation.navigate('PublicProfile', { 
      id: userId, 
      type: peekType 
    });
  }, [peekable, userId, peekType, navigation]);

  // Display source priority: local cache > remote URL > initials
  const displayUri = localCachePath || avatarUrl || null;
  const initials = getInitialsFromName(fullName);
  const borderRadius = size / 2;

  const containerStyle = [
    { width: size, height: size, borderRadius },
    styles.container,
    style,
  ];

  const content = displayUri ? (
    <Image
      source={{ uri: displayUri }}
      style={[styles.image, { width: size, height: size, borderRadius }]}
    />
  ) : (
    <View style={[styles.initialsContainer, { backgroundColor: accent.action, borderRadius }]}>
      <Text style={[styles.initials, { fontSize: size * 0.35, color: text.inverse }]}>
        {initials}
      </Text>
    </View>
  );

  if (!editable) {
    if (peekable) {
      return (
        <TouchableOpacity style={containerStyle} onPress={handlePeek} activeOpacity={0.7}>
          {content}
        </TouchableOpacity>
      );
    }
    return <View style={containerStyle}>{content}</View>;
  }

  return (
    <TouchableOpacity style={containerStyle} onPress={handlePickAndUpload} activeOpacity={0.8}>
      {content}
      {/* Semi-transparent edit overlay with camera icon */}
      <View style={[styles.editOverlay, { borderRadius }]}>
        {uploading
          ? <ActivityIndicator color="white" size="small" />
          : <Camera size={size * 0.22} color="white" />
        }
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
  },
  initialsContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '700',
  },
  editOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
