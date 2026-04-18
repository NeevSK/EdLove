import React, { useState } from 'react';
import { TextInput, Platform } from 'react-native';
import { 
    X, 
    Check, 
    Trash2, 
    MessagesSquare, 
    Linkedin, 
    Instagram, 
    Globe, 
    Users, 
    Lock,
} from 'lucide-react-native';
import { 
    HStack, 
    VStack, 
    Text, 
    Box,
    hapticLight,
    Pressable,
} from '@repo/ui';
import type { SocialLink, SocialPlatform, PrivacyLevel } from '@repo/core';

interface InlineSocialLinkEditorProps {
    link?: Partial<SocialLink>;
    onSave: (link: Partial<SocialLink>) => Promise<void>;
    onCancel: () => void;
    onDelete?: (id: string) => Promise<void>;
    isNew?: boolean;
}

const PLATFORMS: { label: string; value: SocialPlatform; icon: any; color: string }[] = [
    { label: 'WhatsApp', value: 'whatsapp', icon: MessagesSquare, color: '#25D366' },
    { label: 'LinkedIn', value: 'linkedin', icon: Linkedin, color: '#0077B5' },
    { label: 'Instagram', value: 'instagram', icon: Instagram, color: '#E4405F' },
    { label: 'Website', value: 'website', icon: Globe, color: '#4A90E2' },
];

const PRIVACY_LEVELS: { value: PrivacyLevel; icon: any; emoji: string; label: string }[] = [
    { value: 'public', icon: Globe, emoji: '🌍', label: 'Public' },
    { value: 'particulars', icon: Users, emoji: '👥', label: 'Friends' },
    { value: 'private', icon: Lock, emoji: '🔒', label: 'Private' },
];

/**
 * INLINE SOCIAL LINK EDITOR
 * Sanctuary V3 standard for editing social links in-place.
 */
export function InlineSocialLinkEditor({ link, onSave, onCancel, onDelete, isNew }: InlineSocialLinkEditorProps) {
    const [platform, setPlatform] = useState<SocialPlatform>(link?.platform || 'whatsapp');
    const [url, setUrl] = useState(link?.url || '');
    const [privacy, setPrivacy] = useState<PrivacyLevel>(link?.privacy_level || 'public');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!url.trim()) return;
        setIsSaving(true);
        try {
            await onSave({
                ...link,
                platform,
                url: url.trim(),
                privacy_level: privacy,
                is_public: privacy !== 'private'
            });
            hapticLight();
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Box className="mb-4 bg-phase-canvas border border-phase-interactive rounded-3xl shadow-md overflow-hidden">
            <VStack space="md" className="p-5">
                {/* Platform Selection */}
                <VStack space="xs">
                    <Text className="text-[10px] font-bold text-phase-text-tertiary uppercase tracking-wider mb-1">PLATFORM</Text>
                    <HStack space="sm" className="flex-wrap">
                        {PLATFORMS.map((p) => (
                            <Pressable
                                key={p.value}
                                onPress={() => setPlatform(p.value)}
                                className={`w-10 h-10 rounded-xl border-2 items-center justify-center ${
                                    platform === p.value 
                                        ? 'border-phase-interactive bg-phase-interactive/5' 
                                        : 'border-phase-surface bg-phase-surface/30'
                                }`}
                                style={{ 
                                    borderColor: platform === p.value ? p.color : undefined,
                                }}
                            >
                                <p.icon size={18} color={platform === p.value ? p.color : '#9DA1A3'} />
                            </Pressable>
                        ))}
                    </HStack>
                </VStack>

                {/* URL Input */}
                <VStack space="xs">
                    <Text className="text-[10px] font-bold text-phase-text-tertiary uppercase tracking-wider mb-1">CONTACT INFO</Text>
                    <HStack space="sm" className="items-center">
                        <TextInput
                            value={url}
                            onChangeText={setUrl}
                            placeholder={platform === 'whatsapp' ? 'Phone number' : 'Username or link'}
                            placeholderTextColor="#9DA1A3"
                            className="flex-1 h-12 px-4 rounded-xl border border-phase-surface bg-phase-canvas text-phase-text-primary text-sm font-medium"
                            style={Platform.OS === 'web' ? (({ outline: 'none' } as any)) : {}}
                        />
                    </HStack>
                </VStack>

                {/* Privacy and Actions */}
                <HStack className="justify-between items-center mt-2">
                    <HStack space="xs" className="rounded-xl p-1 bg-phase-surface">
                        {PRIVACY_LEVELS.map((pl) => (
                            <Pressable
                                key={pl.value}
                                onPress={() => setPrivacy(pl.value)}
                                className={`w-9 h-9 rounded-lg items-center justify-center border ${
                                    privacy === pl.value 
                                        ? 'bg-phase-canvas border-phase-interactive shadow-sm' 
                                        : 'border-transparent'
                                }`}
                            >
                                <Text className="text-base">{pl.emoji}</Text>
                            </Pressable>
                        ))}
                    </HStack>

                    <HStack space="md" className="items-center">
                        {!isNew && onDelete && link?.id && (
                            <Pressable 
                                onPress={() => onDelete(link.id!)} 
                                className="p-2 bg-phase-error/10 rounded-xl"
                                disabled={isSaving}
                            >
                                <Trash2 size={18} color="#FF6B6B" />
                            </Pressable>
                        )}
                        <Pressable onPress={onCancel} className="p-2" disabled={isSaving}>
                            <X size={22} color="#9DA1A3" />
                        </Pressable>
                        <Pressable 
                            onPress={handleSave} 
                            className="w-12 h-12 rounded-2xl items-center justify-center bg-phase-interactive shadow-lg shadow-blue-500/30"
                            disabled={isSaving || !url.trim()}
                        >
                            {isSaving ? (
                                <Box className="scale-75"><Text>...</Text></Box>
                            ) : (
                                <Check size={24} color="white" strokeWidth={3} />
                            )}
                        </Pressable>
                    </HStack>
                </HStack>
            </VStack>
        </Box>
    );
}
