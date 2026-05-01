import { SocialLink, SocialPlatform } from '@repo/core/types';
import { Box } from '@repo/ui/primitives';
import { HStack, Icon, Text, VStack } from '@repo/ui/primitives';
import { openExternalURL, showExternalLinkOptions } from '@repo/ui/utils';
import { Pressable } from '@repo/ui/primitives';

import * as Clipboard from 'expo-clipboard';
import {
  ExternalLink,
  Facebook,
  Github,
  Globe,
  Instagram,
  Linkedin,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Twitter,
  Phone as WhatsApp,
} from 'lucide-react-native';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Share } from 'react-native';
import { useSocialLinks } from '../hooks/useSocialLinks';

interface SocialSanctuaryProps {
  userId: string;
  isOwnProfile: boolean;
}

const PLATFORM_ICONS: Record<SocialPlatform, any> = {
  whatsapp: WhatsApp,
  instagram: Instagram,
  linkedin: Linkedin,
  facebook: Facebook,
  twitter: Twitter,
  github: Github,
  website: Globe,
};

const PRIVACY_ICONS = {
  public: ShieldCheck,
  particulars: Shield,
  private: ShieldAlert,
};

/**
 * SOCIAL SANCTUARY
 * Sanctuary V3 standard for displaying and sharing social connections.
 */
export const SocialSanctuary: React.FC<SocialSanctuaryProps> = ({ userId, isOwnProfile }) => {
  const { t } = useTranslation();
  const { links, loading } = useSocialLinks(userId);

  const handlePress = async (link: SocialLink) => {
    let url = link.url;
    if (link.platform === 'whatsapp' && !url.startsWith('http')) {
      url = `https://wa.me/${url.replace(/[^0-9]/g, '')}`;
    } else if (!url.startsWith('http')) {
      url = `https://${url}`;
    }

    try {
      await openExternalURL(url, {
        title: `${link.platform.charAt(0).toUpperCase() + link.platform.slice(1)} link`,
        sourceLabel: 'Profile',
        sourceBadge: 'Public social link',
        trustLevel: 'external',
      });
    } catch (error) {
      console.error('Failed to open URL:', error);
    }
  };

  const handleOpenOptions = async (link: SocialLink) => {
    let url = link.url;
    if (link.platform === 'whatsapp' && !url.startsWith('http')) {
      url = `https://wa.me/${url.replace(/[^0-9]/g, '')}`;
    } else if (!url.startsWith('http')) {
      url = `https://${url}`;
    }

    await showExternalLinkOptions(url, {
      title: `${link.platform.charAt(0).toUpperCase() + link.platform.slice(1)} link`,
      sourceLabel: 'Profile',
      sourceBadge: 'Public social link',
      trustLevel: 'external',
    });
  };

  const shareProfile = async () => {
    const profileUrl = `https://app.gurudevi.edlove.org/app`;
    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && navigator.share) {
        try {
          await navigator.share({ title: 'Gurudevi Profile', url: profileUrl });
        } catch {
          try {
            await Clipboard.setStringAsync(profileUrl);
          } catch {
            /* ignore */
          }
        }
      } else {
        await Clipboard.setStringAsync(profileUrl);
      }
    } else {
      Share.share({ message: `Connect with me on Gurudevi!`, url: profileUrl });
    }
  };

  if (loading) return null;

  const visibleLinks = isOwnProfile
    ? links
    : links.filter((l) => l.is_public && l.privacy_level !== 'private');

  if (visibleLinks.length === 0 && !isOwnProfile) return null;

  return (
    <VStack className="my-6 px-4" space="lg">
      <HStack className="justify-between items-center px-1">
        <Text className="text-phase-text-primary text-xl font-bold tracking-tight">
          {t('socialSanctuary.title', 'Social Connections')}
        </Text>
        {isOwnProfile && (
          <Pressable
            onPress={shareProfile}
            className="w-10 h-10 rounded-full bg-phase-surface items-center justify-center hover:bg-phase-interactive/10 transition-colors"
          >
            <Share2 size={18} color="#4A90E2" />
          </Pressable>
        )}
      </HStack>

      <VStack space="sm">
        {visibleLinks.map((link) => {
          const PlatformIcon = PLATFORM_ICONS[link.platform] || ExternalLink;
          const PrivacyIcon =
            PRIVACY_ICONS[link.privacy_level as keyof typeof PRIVACY_ICONS] || Shield;

          return (
            <Pressable
              key={link.id}
              onPress={() => handlePress(link)}
              onLongPress={() => handleOpenOptions(link)}
              className="bg-phase-canvas border border-phase-surface rounded-3xl overflow-hidden shadow-sm active:scale-[0.98] transition-all"
            >
              <HStack className="items-center p-4">
                <Box className="w-12 h-12 rounded-2xl justify-center items-center mr-4 bg-phase-interactive/10 border border-phase-interactive/10">
                  <PlatformIcon size={24} color="#4A90E2" />
                </Box>
                <VStack className="flex-1">
                  <Text className="text-base font-bold text-phase-text-primary">
                    {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                  </Text>
                  <Text
                    className="text-xs text-phase-text-tertiary font-medium mt-0.5"
                    numberOfLines={1}
                  >
                    {link.url}
                  </Text>
                </VStack>
                <HStack space="md" className="items-center">
                  {isOwnProfile && PrivacyIcon && (
                    <Box className="p-1.5 rounded-lg bg-phase-surface/50">
                      <PrivacyIcon size={14} color="#9DA1A3" />
                    </Box>
                  )}
                  <Icon as={ExternalLink} size={18} color="#9DA1A3" className="opacity-40" />
                </HStack>
              </HStack>
            </Pressable>
          );
        })}

        {isOwnProfile && visibleLinks.length === 0 && (
          <Box className="bg-phase-canvas border border-dashed border-phase-surface rounded-3xl p-8 items-center justify-center">
            <Text className="text-sm text-phase-text-tertiary text-center italic leading-relaxed">
              {t('socialSanctuary.empty', 'No social links added yet.')}
            </Text>
          </Box>
        )}
      </VStack>
    </VStack>
  );
};
