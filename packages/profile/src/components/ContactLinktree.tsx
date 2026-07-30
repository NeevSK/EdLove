/**
 * CONTACT LINKTREE
 * A premium Sanctuary social sharing interface.
 *
 * Supports elective sharing of social links with glassmorphism aesthetics.
 */

import type { SocialLink } from '@repo/core/types';
import { LivingGlow } from '@repo/ui/components/LivingGlow';
import { ExternalLink, Globe, Link, Mail, MessagesSquare, Pen, Plus, Trash2 } from '@repo/ui/icons';
import { Box, Button, ButtonText, HStack, Pressable, Text, VStack } from '@repo/ui/primitives';
import { openExternalURL, showExternalLinkOptions } from '@repo/ui/utils';
import { hapticHeavy, hapticLight } from '@repo/ui/utils/haptics';
import * as Clipboard from 'expo-clipboard';
import type React from 'react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSocialLinks } from '@repo/profile/hooks/useSocialLinks';
import { AddSocialLinkModal } from '@repo/profile/components/AddSocialLinkModal';
import { InlineSocialLinkEditor } from '@repo/profile/components/InlineSocialLinkEditor';

interface ContactLinktreeProps {
  links: SocialLink[];
  userName: string;
  userId?: string;
  bio?: string;
  isOwnProfile?: boolean;
  editable?: boolean;
  inline?: boolean;
}

const PRIVACY_ICONS: Record<string, string> = {
  public: '\uD83C\uDF10', // 🌐
  particulars: '\uD83D\uDC65', // 👥
  private: '\uD83D\uDD12', // 🔒
};

const PROVIDER_CONFIG: Record<
  string,
  {
    icon: React.ComponentType<any>;
    color: string;
    label: string;
    getUri: (value: string) => string;
  }
> = {
  whatsapp: {
    icon: MessagesSquare,
    color: '#25D366', // Brand color
    label: 'WhatsApp',
    getUri: (value) => `whatsapp://send?phone=${value.replace(/\D/g, '')}`,
  },
  linkedin: {
    icon: Link,
    color: '#0077B5', // Brand color
    label: 'LinkedIn',
    getUri: (value) => (value.startsWith('http') ? value : `https://www.linkedin.com/in/${value}`),
  },
  instagram: {
    icon: Link,
    color: '#E4405F', // Brand color
    label: 'Instagram',
    getUri: (value) => (value.startsWith('http') ? value : `https://instagram.com/${value}`),
  },
  portfolio: {
    icon: Globe,
    color: '#4A90E2', // Legacy portfolio color
    label: 'Portfolio',
    getUri: (value) => (value.startsWith('http') ? value : `https://${value}`),
  },
  email: {
    icon: Mail,
    color: '#F44336', // Semantic error/danger for alert
    label: 'Email',
    getUri: (value) => `mailto:${value}`,
  },
};

export function ContactLinktree({
  links,
  userName,
  bio,
  isOwnProfile,
  userId,
  editable,
  inline,
}: ContactLinktreeProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | undefined>();
  const { deleteLink, addLink, updateLink } = useSocialLinks(userId || '');
  const [inlineAdding, setInlineAdding] = useState(false);
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);

  const displayLinks = isOwnProfile
    ? links
    : links.filter(
        (l) => l.privacy_level === 'public' || (l.is_public && l.privacy_level !== 'private'),
      );

  const handlePress = useCallback(async (provider: string, value: string) => {
    const config = PROVIDER_CONFIG[provider];
    if (!config) return;

    const uri = config.getUri(value);

    const webUrl = uri.startsWith('http')
      ? uri
      : uri.startsWith('whatsapp://')
        ? `https://wa.me/${value.replace(/\D/g, '')}`
        : null;

    if (Platform.OS === 'web') {
      if (webUrl) {
        openExternalURL(webUrl, {
          title: config.label,
          sourceLabel: 'Profile',
          sourceBadge: 'Public contact link',
          trustLevel: 'external',
        });
      } else {
        openExternalURL(uri);
      }
      return;
    }

    try {
      await openExternalURL(uri, {
        title: config.label,
        sourceLabel: 'Profile',
        sourceBadge: 'Public contact link',
        trustLevel: uri.startsWith('http') ? 'external' : undefined,
      });
    } catch {
      if (uri.startsWith('whatsapp://')) {
        await openExternalURL(`https://wa.me/${value.replace(/\D/g, '')}`, {
          title: config.label,
          sourceLabel: 'Profile',
          sourceBadge: 'Public contact link',
          trustLevel: 'external',
        });
      } else if (!uri.startsWith('http')) {
        console.warn('Unhandled URI scheme:', uri);
      }
    }
  }, []);

  const handleLinkOptions = useCallback(async (provider: string, value: string) => {
    const config = PROVIDER_CONFIG[provider];
    if (!config) return;

    const uri = config.getUri(value);
    const webUrl = uri.startsWith('http')
      ? uri
      : uri.startsWith('whatsapp://')
        ? `https://wa.me/${value.replace(/\D/g, '')}`
        : null;

    if (!webUrl) return;

    await showExternalLinkOptions(webUrl, {
      title: config.label,
      sourceLabel: 'Profile',
      sourceBadge: 'Public contact link',
      trustLevel: 'external',
    });
  }, []);

  const handleCopyProfileLink = useCallback(async () => {
    const url =
      typeof window !== 'undefined' ? window.location.href : `https://app.gurudevi.edlove.org`;
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: `${userName} on Gurudevi`, url });
        return; // Share succeeded  no clipboard needed
      } catch {
        // User cancelled or Share unavailable  fall through to clipboard
      }
    }
    // Clipboard fallback (native path + web Share cancel/unavailable)
    await Clipboard.setStringAsync(url).catch(() => {
      /* non-fatal */
    });
  }, [userName]);

  const handleEditLink = (link: SocialLink) => {
    hapticLight();
    if (inline) {
      setInlineEditingId(link.id);
    } else {
      setEditingLink(link);
      setIsAddModalOpen(true);
    }
  };

  const handleDeleteLink = (id: string) => {
    hapticHeavy();
    deleteLink(id);
  };

  const handleAddLink = () => {
    hapticLight();
    if (inline) {
      setInlineAdding(true);
    } else {
      setEditingLink(undefined);
      setIsAddModalOpen(true);
    }
  };

  return (
    <VStack space="lg" className="w-full">
      {/* Header / Intro */}
      <VStack space="xs" className="items-center mb-10">
        <LivingGlow size={72} glowColor="#F6BF8C">
          <Box className="w-[72px] h-[72px] rounded-full bg-phase-canvas items-center justify-center border-2 border-phase-interactive">
            <Text className="text-2xl font-bold text-phase-text-primary">{userName.charAt(0)}</Text>
          </Box>
        </LivingGlow>
        <Text className="text-xl font-bold text-phase-text-primary mt-4">{userName}</Text>
        {bio && (
          <Text className="text-sm text-phase-text-secondary text-center px-10 mt-1">{bio}</Text>
        )}

        <HStack space="md" className="mt-6">
          {(Platform.OS === 'web' || isOwnProfile) && (
            <Button
              size="sm"
              variant="outline"
              onPress={handleCopyProfileLink}
              className="border-phase-surface rounded-xl px-4"
            >
              <HStack space="xs" className="items-center">
                <Link size={14} color="#4A90E2" />
                <ButtonText className="text-phase-text-primary text-xs">
                  {Platform.OS === 'web' ? 'Share Profile' : 'Copy Link'}
                </ButtonText>
              </HStack>
            </Button>
          )}

          {isOwnProfile && editable && (
            <Button
              size="sm"
              variant={isEditing ? 'solid' : 'outline'}
              onPress={() => {
                hapticLight();
                setIsEditing(!isEditing);
              }}
              className={`${isEditing ? 'bg-phase-interactive' : 'border-phase-surface'} rounded-xl px-4`}
            >
              <HStack space="xs" className="items-center">
                <Pen size={14} color={isEditing ? 'white' : '#4A90E2'} />
                <ButtonText
                  className={`${isEditing ? 'text-white' : 'text-phase-text-primary'} text-xs`}
                >
                  {isEditing ? 'Done' : 'Edit Hub'}
                </ButtonText>
              </HStack>
            </Button>
          )}
        </HStack>
      </VStack>

      {/* Link List */}
      <VStack space="md">
        {displayLinks.map((link, index) => {
          if (inline && inlineEditingId === link.id) {
            return (
              <InlineSocialLinkEditor
                key={link.id}
                link={link}
                onSave={async (updates) => {
                  await updateLink(link.id, updates);
                  setInlineEditingId(null);
                }}
                onCancel={() => setInlineEditingId(null)}
                onDelete={async (id) => {
                  await deleteLink(id);
                  setInlineEditingId(null);
                }}
              />
            );
          }

          const config = PROVIDER_CONFIG[link.platform];
          if (!config) return null;
          const Icon = config.icon;
          const PrivacyEmoji = PRIVACY_ICONS[link.privacy_level || 'public'];

          return (
            <Animated.View
              key={`${link.platform}-${index}`}
              entering={FadeInDown.delay(index * 100).springify()}
            >
              <Pressable
                onPress={() =>
                  isEditing ? handleEditLink(link) : handlePress(link.platform, link.url)
                }
                onLongPress={() => !isEditing && handleLinkOptions(link.platform, link.url)}
                className="bg-phase-canvas border border-phase-surface rounded-3xl overflow-hidden shadow-sm"
              >
                <HStack space="md" className="items-center p-5">
                  <Box
                    className="w-12 h-12 rounded-2xl items-center justify-center"
                    style={{ backgroundColor: `${config.color}15` }}
                  >
                    <Icon color={config.color} size={24} />
                  </Box>
                  <VStack className="flex-1">
                    <HStack space="xs" className="items-center">
                      <Text className="text-lg font-bold text-phase-text-primary">
                        {config.label}
                      </Text>
                      {isOwnProfile && PrivacyEmoji && (
                        <Text className="text-[14px] ml-1">{PrivacyEmoji}</Text>
                      )}
                    </HStack>
                    <Text className="text-xs text-phase-text-tertiary" numberOfLines={1}>
                      {link.url}
                    </Text>
                  </VStack>
                  {isEditing ? (
                    <HStack space="md">
                      <Pressable
                        onPress={() => handleEditLink(link)}
                        className="p-2 rounded-lg bg-phase-surface"
                      >
                        <Pen size={18} color="#4A90E2" />
                      </Pressable>
                      <Pressable
                        onPress={() => handleDeleteLink(link.id)}
                        className="p-2 rounded-lg bg-phase-surface"
                      >
                        <Trash2 size={18} color="#FF6B6B" />
                      </Pressable>
                    </HStack>
                  ) : (
                    <ExternalLink size={18} color="#9DA1A3" />
                  )}
                </HStack>
              </Pressable>
            </Animated.View>
          );
        })}

        {isEditing && (
          <>
            {inline && inlineAdding && (
              <InlineSocialLinkEditor
                isNew
                onSave={async (newLink) => {
                  await addLink({
                    ...newLink,
                    user_id: userId!,
                    order_index: links.length,
                  } as any);
                  setInlineAdding(false);
                }}
                onCancel={() => setInlineAdding(false)}
              />
            )}
            <Animated.View entering={FadeInDown.springify()}>
              <Pressable
                onPress={handleAddLink}
                className="bg-phase-canvas border-2 border-dashed border-phase-surface rounded-3xl p-5 items-center justify-center"
              >
                <HStack space="sm" className="items-center">
                  <Plus size={20} color="#4A90E2" />
                  <Text className="font-bold text-phase-interactive text-base">
                    Add Social Link
                  </Text>
                </HStack>
              </Pressable>
            </Animated.View>
          </>
        )}
      </VStack>

      {userId && (
        <AddSocialLinkModal
          visible={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          userId={userId}
          initialLink={editingLink}
        />
      )}

      {displayLinks.length === 0 && (
        <Box className="py-12 items-center">
          <Text className="text-phase-text-tertiary italic text-sm">
            {isOwnProfile
              ? t('community.profile.noContactsYet') || 'No public contacts shared yet.'
              : t('community.profile.noPublicContacts') || 'No public contacts shared yet.'}
          </Text>
        </Box>
      )}
    </VStack>
  );
}
