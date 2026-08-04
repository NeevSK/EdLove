import { UserAvatar } from '@repo/ui/components/UserAvatar';
import { Camera } from '@repo/ui/icons';
import { Box, Pressable, Spinner } from '@repo/ui/primitives';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useProfileNavigation } from '@repo/profile/navigation';

let Paths: typeof import('expo-file-system').Paths | null = null;
let File: typeof import('expo-file-system').File | null = null;
if (Platform.OS !== 'web') {
  const fs = require('expo-file-system');
  Paths = fs.Paths;
  File = fs.File;
}

interface AvatarDisplayProps {
  userId: string;
  avatarUrl?: string | null;
  fullName?: string | null;
  size?: number;
  editable?: boolean;
  onAvatarSelected?: (localUri: string) => Promise<void>;
  style?: any;
  peekable?: boolean;
  peekType?: 'user' | 'school' | 'classroom' | 'community';
}

function getCachePath(userId: string): string | null {
  if (!Paths) return null;
  return `${Paths.cache}avatar_${userId}.jpg`;
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
    if (!userId || !File) return;
    const cachePath = getCachePath(userId);
    if (!cachePath) return;
    const file = new File(cachePath);
    if (file.exists) {
      setLocalCachePath(cachePath);
    }
  }, [userId]);

  const handlePickAndUpload = useCallback(async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') return;
    }

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
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG },
      );

      const cachePath = getCachePath(userId);
      if (File && cachePath) {
        const sourceFile = new File(manipulated.uri);
        const destFile = new File(cachePath);
        await sourceFile.copy(destFile);
        setLocalCachePath(cachePath);
      }

      await onAvatarSelected?.(manipulated.uri);
    } catch (error) {
      console.warn('[AvatarDisplay] Avatar selection failed:', error);
    } finally {
      setUploading(false);
    }
  }, [userId, onAvatarSelected]);

  const handleWebFileSelected = useCallback(
    async (event: any) => {
      const file = event?.target?.files?.[0];
      if (!file || !file.type?.startsWith?.('image/')) return;

      setUploading(true);
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(reader.error || new Error('Failed to read image file'));
          reader.readAsDataURL(file);
        });

        setLocalCachePath(dataUrl);
        await onAvatarSelected?.(dataUrl);
      } catch (error) {
        console.warn('[AvatarDisplay] Web avatar selection failed:', error);
      } finally {
        setUploading(false);
        if (event?.target) event.target.value = '';
      }
    },
    [onAvatarSelected],
  );

  const handlePeek = useCallback(() => {
    if (!peekable || !userId) return;
    openPublicProfile?.({
      id: userId,
      type: peekType,
    });
  }, [peekable, userId, peekType, openPublicProfile]);

  const displayUri = localCachePath || avatarUrl || null;

  const content = <UserAvatar avatarUrl={displayUri} fullName={fullName} size={size} />;

  const containerStyle = { width: size, height: size };

  if (!editable) {
    if (peekable) {
      return (
        <Pressable
          className="rounded-full overflow-hidden"
          style={[containerStyle, style]}
          onPress={handlePeek}
        >
          {content}
        </Pressable>
      );
    }
    return (
      <Box className="rounded-full overflow-hidden" style={[containerStyle, style]}>
        {content}
      </Box>
    );
  }

  return (
    <Pressable
      className="rounded-full overflow-hidden items-center justify-center"
      style={[containerStyle, style]}
      onPress={handlePickAndUpload}
    >
      {Platform.OS === 'web' && (
        <input
          aria-label="Upload profile image"
          type="file"
          accept="image/*"
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0,
            cursor: 'pointer',
            zIndex: 10,
          }}
          onClick={(event) => event.stopPropagation()}
          onChange={handleWebFileSelected}
        />
      )}
      {content}
      {uploading ? (
        <Box className="absolute inset-0 bg-black/40 items-center justify-center">
          <Spinner className="text-white" size="small" />
        </Box>
      ) : (
        <Box className="absolute inset-0 bg-black/20 items-center justify-center">
          <Box className="bg-black/30 p-2 rounded-full">
            <Camera size={size * 0.25} color="white" />
          </Box>
        </Box>
      )}
    </Pressable>
  );
}
