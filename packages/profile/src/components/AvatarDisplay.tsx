import React, { useState, useEffect, useCallback } from 'react';
import {
  View, TouchableOpacity,
  StyleSheet, ActivityIndicator, Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useTheme, UserAvatar } from '@repo/ui';
import { Camera } from 'lucide-react-native';
import { useProfileNavigation } from '../navigation';

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
  onAvatarSelected?: (localUri: string) => Promise<void>;
  style?: object;
  peekable?: boolean;
  peekType?: 'user' | 'school' | 'classroom' | 'community';
}

function getCachePath(userId: string): string | null {
  if (!FileSystem) return null;
  return `${FileSystem.cacheDirectory ?? ''}avatar_${userId}.jpg`;
}

export function AvatarDisplay({
  userId,
  avatarUrl,
  fullName,
  size = 80,
  editable = false,
  onAvatarSelected,
  style,
  peekable = false,
  peekType = 'user',
}: AvatarDisplayProps) {
  const { openPublicProfile } = useProfileNavigation();
  const [localCachePath, setLocalCachePath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!userId || !FileSystem) return;
    const cachePath = getCachePath(userId);
    if (!cachePath) return;
    FileSystem.getInfoAsync(cachePath).then(info => {
      if (info.exists) setLocalCachePath(cachePath);
    }).catch(() => {});
  }, [userId]);

  const handlePickAndUpload = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (result.canceled || !result.assets?.[0]) return;

    setUploading(true);
    try {
      const manipulated = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 400, height: 400 } }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
      );

      const cachePath = FileSystem ? getCachePath(userId) : null;
      if (FileSystem && cachePath) {
        await FileSystem.copyAsync({ from: manipulated.uri, to: cachePath });
        setLocalCachePath(cachePath);
      }

      await onAvatarSelected?.(manipulated.uri);
    } catch (error) {
      console.warn('[AvatarDisplay] Avatar selection failed:', error);
    } finally {
      setUploading(false);
    }
  }, [userId, onAvatarSelected]);

  const handlePeek = useCallback(() => {
    if (!peekable || !userId) return;
    openPublicProfile?.({
      id: userId,
      type: peekType
    });
  }, [peekable, userId, peekType, openPublicProfile]);

  const displayUri = localCachePath || avatarUrl || null;
  const borderRadius = size / 2;
  const containerStyle = [
    { width: size, height: size, borderRadius, overflow: 'hidden' as const },
    style,
  ];

  const content = (
    <UserAvatar/>
      avatarUrl={displayUri}
      fullName={fullName}
      size={size}
      borderRadius={borderRadius}
    /  );

  if (!editable) {
    if (peekable) {
      return (
        <TouchableOpacity style={containerStyle} onPress={handlePeek} activeOpacity={0.7}          {content}>
        </TouchableOpacity      >);
    }
    return <View style={containerStyle}>{content}</View>;
  }

  return (
    <TouchableOpacity style={containerStyle} onPress={handlePickAndUpload} activeOpacity={0.8}      {content}>
      <View style={[styles.editOverlay, { borderRadius }]}        {uploading
          ? <ActivityIndicator color="white" size="small" /          >: <Camera size={size * 0.22} color="white" /        >}>
      </View    ></TouchableOpacity  >);
}

const styles = StyleSheet.create({
  editOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
