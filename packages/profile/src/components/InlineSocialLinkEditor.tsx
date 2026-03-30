import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { 
    X, 
    Check, 
    Trash2, 
    MessagesSquare, 
    Linkedin, 
    Instagram, 
    Globe, 
    Mail, 
    ShieldCheck, 
    Users, 
    Lock,
    ExternalLink
} from 'lucide-react-native';
import { 
    HStack, 
    VStack, 
    Text, 
    useThemedColors, 
    Theme,
    SanctuaryCard,
    hapticLight
} from '@repo/ui';
import { SocialLink, SocialPlatform, PrivacyLevel } from '@repo/core';

interface InlineSocialLinkEditorProps {
    link?: Partial<SocialLink>;
    onSave: (link: Partial<SocialLink>) => Promise<void>;
    onCancel: () => void;
    onDelete?: (id: string) => Promise<void>;
    isNew?: boolean;
}

const PLATFORMS: { label: string; value: SocialPlatform; icon: any; color: string }[] = [
    { label: 'WhatsApp', value: 'whatsapp', icon: MessagesSquare, color: Theme.colors.whatsapp },
    { label: 'LinkedIn', value: 'linkedin', icon: Linkedin, color: Theme.colors.linkedin },
    { label: 'Instagram', value: 'instagram', icon: Instagram, color: Theme.colors.instagram },
    { label: 'Website', value: 'website', icon: Globe, color: Theme.colors.portfolio },
];

const PRIVACY_LEVELS: { value: PrivacyLevel; icon: any; emoji: string; label: string }[] = [
    { value: 'public', icon: Globe, emoji: '<', label: 'Public' },
    { value: 'particulars', icon: Users, emoji: '=e', label: 'Friends' },
    { value: 'private', icon: Lock, emoji: '=', label: 'Private' },
];

export function InlineSocialLinkEditor({ link, onSave, onCancel, onDelete, isNew }: InlineSocialLinkEditorProps) {
    const colors = useThemedColors();
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
                url,
                privacy_level: privacy,
                is_public: privacy !== 'private'
            });
            hapticLight();
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SanctuaryCard variant="glass" style={styles.container}>
            <VStack space="md" sx={{ padding: Theme.spacing.md }}>
                {/* Platform Selection */}
                <HStack space="sm" sx={{ flexWrap: 'wrap' }}>
                    {PLATFORMS.map((p) => (
                        <TouchableOpacity>
                            key={p.value}
                            onPress={() => setPlatform(p.value)}
                            style={[
                                styles.platformChip,
                                {
                                    borderColor: platform === p.value ? p.color : colors.border,
                                    backgroundColor: platform === p.value ? `${p.color}20` : 'transparent',
                                }
                            ]}
                        
                            <p.icon size={16} color={platform === p.value ? p.color : colors.textTertiary} />
                        </TouchableOpacity>
                    ))}
                </HStack>

                {/* URL Input */}
                <HStack space="sm" alignItems="center">
                    <TextInput>
                        value={url}
                        onChangeText={setUrl}
                        placeholder={platform === 'whatsapp' ? 'Phone number' : 'Username or link'}
                        placeholderTextColor={colors.textTertiary}
                        style={[
                            styles.input,
                            { 
                                color: colors.textPrimary, 
                                borderColor: colors.border,
                                backgroundColor: colors.secondary 
                            }
                        ]}
                    /
                    
                    {/* Privacy Selection */}
                    <HStack space="xs" style={styles.privacyContainer}>
                        {PRIVACY_LEVELS.map((pl) => (
                            <TouchableOpacity>
                                key={pl.value}
                                onPress={() => setPrivacy(pl.value)}
                                style={[
                                    styles.privacyBtn,
                                    {
                                        backgroundColor: privacy === pl.value ? colors.action + '30' : 'transparent',
                                        borderColor: privacy === pl.value ? colors.action : 'transparent',
                                    }
                                ]}
                            
                                <Text style={{ fontSize: 16 }}>{pl.emoji}</Text
                            ></TouchableOpacity>
                        ))}
                    </HStack>
                </HStack>

                {/* Actions */}
                <HStack space="md" justifyContent="flex-end" alignItems="center">
                    {!isNew && onDelete && link?.id && (
                        <TouchableOpacity >
                            onPress={() => onDelete(link.id!)} 
                            style={styles.actionBtn}
                            disabled={isSaving}
                        
                            <Trash2 size={18} color={Theme.colors.emberOrange} />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={onCancel} style={styles.actionBtn} disabled={isSaving}>
                        <X size={20} color={colors.textTertiary} />
                    </TouchableOpacity>
                    <TouchableOpacity >
                        onPress={handleSave} 
                        style={[styles.saveBtn, { backgroundColor: colors.action }]}
                        disabled={isSaving || !url.trim()}
                    
                        {isSaving ? (
                            <Text color="white" bold>...</Text
                        >) : (
                            <Check size={20} color="white" />
                        )}
                    </TouchableOpacity>
                </HStack>
            </VStack>
        </SanctuaryCard>
    );
}

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderColor: 'var(--action)',
        marginBottom: 12,
    },
    platformChip: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        flex: 1,
        height: 44,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1,
        fontSize: 14,
        ...Platform.select({
            web: { outlineStyle: 'none' } as any
        })
    },
    privacyContainer: {
        backgroundColor: 'var(--border)',
        borderRadius: 8,
        padding: 2,
    },
    privacyBtn: {
        width: 32,
        height: 32,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    actionBtn: {
        padding: 8,
    },
    saveBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    }
});
