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
    SanctuaryCard,
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
        <SanctuaryCard variant="glass" className="mb-3 border border-[#F6BF8C]">
            <VStack space="md" className="p-4">
                {/* Platform Selection */}
                <HStack space="sm" className="flex-wrap">
                    {PLATFORMS.map((p) => (
                        <Pressable
                            key={p.value}
                            onPress={() => setPlatform(p.value)}
                            className={`w-9 h-9 rounded-full border-[1.5px] items-center justify-center ${
                                platform === p.value ? '' : 'border-phase-surface'
                            }`}
                            style={{ 
                                borderColor: platform === p.value ? p.color : undefined,
                                backgroundColor: platform === p.value ? `${p.color}22` : 'transparent'
                            }}
                        >
                            <p.icon size={16} color={platform === p.value ? p.color : '#9DA1A3'} />
                        </Pressable>
                    ))}
                </HStack>

                {/* URL Input */}
                <HStack space="sm" className="items-center">
                    <TextInput
                        value={url}
                        onChangeText={setUrl}
                        placeholder={platform === 'whatsapp' ? 'Phone number' : 'Username or link'}
                        placeholderTextColor="#9DA1A3"
                        className="flex-1 h-11 px-3 rounded-lg border border-phase-surface bg-phase-canvas text-phase-text-primary text-sm"
                        style={Platform.OS === 'web' ? (({ outline: 'none' } as any)) : {}}
                    />
                    
                    {/* Privacy Selection */}
                    <HStack space="xs" className="rounded-lg p-[2px] bg-phase-surface">
                        {PRIVACY_LEVELS.map((pl) => (
                            <Pressable
                                key={pl.value}
                                onPress={() => setPrivacy(pl.value)}
                                className={`w-8 h-8 rounded-md items-center justify-center border ${
                                    privacy === pl.value 
                                        ? 'bg-phase-interactive/20 border-phase-interactive' 
                                        : 'border-transparent'
                                }`}
                            >
                                <Text className="text-base">{pl.emoji}</Text>
                            </Pressable>
                        ))}
                    </HStack>
                </HStack>

                {/* Actions */}
                <HStack space="md" className="justify-end items-center">
                    {!isNew && onDelete && link?.id && (
                        <Pressable 
                            onPress={() => onDelete(link.id!)} 
                            className="p-2"
                            disabled={isSaving}
                        >
                            <Trash2 size={18} color="#FF6B6B" />
                        </Pressable>
                    )}
                    <Pressable onPress={onCancel} className="p-2" disabled={isSaving}>
                        <X size={20} color="#9DA1A3" />
                    </Pressable>
                    <Pressable 
                        onPress={handleSave} 
                        className="w-10 h-10 rounded-full items-center justify-center bg-phase-interactive shadow-sm"
                        disabled={isSaving || !url.trim()}
                    >
                        {isSaving ? (
                            <Text className="text-white font-bold">...</Text>
                        ) : (
                            <Check size={20} color="white" />
                        )}
                    </Pressable>
                </HStack>
            </VStack>
        </SanctuaryCard>
    );
}
