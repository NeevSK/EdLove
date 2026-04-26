/**
 * ANNOUNCEMENTS SCREEN
 *
 * School-wide news feed for announcements.
 * Refactored for Sanctuary V3.
 */

import { type AuthorityTier, usePermissions } from '@repo/core';
import {
  Box,
  Heading,
  HStack,
  Icon,
  InputField,
  SanctuaryButton,
  SanctuaryModal,
  ScreenWrapper,
  ScrollView,
  Spinner,
  Switch,
  Text,
  VStack,
} from '@repo/ui';
import { Globe, Megaphone, Pin, Plus, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { communityAPI as community } from '../api/community';
import type { AnnouncementWithAuthor } from '../types/Community';

interface AnnouncementsScreenProps {
  schoolId: string;
  userId: string;
  userAuthority: AuthorityTier;
}

export default function AnnouncementsScreen({
  schoolId,
  userId,
  userAuthority,
}: AnnouncementsScreenProps) {
  const { t } = useTranslation();
  const { can } = usePermissions();
  const [announcements, setAnnouncements] = useState<AnnouncementWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAnnouncementContent, setNewAnnouncementContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnnouncements();
  }, [schoolId]);

  const loadAnnouncements = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await community.getAnnouncements(schoolId);
      setAnnouncements(data);
    } catch (err: any) {
      console.error('Failed to load announcements:', err);
      setError(err.message || 'Failed to load announcements');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncementContent.trim()) {
      setError('Announcement content cannot be empty');
      return;
    }

    setIsCreating(true);
    setError(null);
    try {
      await community.createAnnouncement(schoolId, userId, newAnnouncementContent, isPinned);
      setNewAnnouncementContent('');
      setIsPinned(false);
      setShowCreateModal(false);
      await loadAnnouncements();
    } catch (err: any) {
      console.error('Failed to create announcement:', err);
      setError(err.message || 'Failed to create announcement');
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return t('announcements.justNow') || 'Just now';
    } else if (diffHours < 24) {
      return t('announcements.hoursAgo', { hours: diffHours }) || `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return t('announcements.daysAgo', { days: diffDays }) || `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const pinnedAnnouncements = announcements.filter((a) => a.is_pinned);
  const regularAnnouncements = announcements.filter((a) => !a.is_pinned);

  return (
    <ScreenWrapper noTopInset scroll={false} className="bg-phase-canvas">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <VStack className="p-5 gap-6">
          {/* Hero Section */}
          <Box className="bg-phase-surface p-6 rounded-[32px] border border-border shadow-sm">
            <VStack className="gap-4">
              <HStack className="items-center gap-3">
                <Box className="w-12 h-12 rounded-2xl bg-phase-interactive/10 items-center justify-center">
                  <Icon as={Megaphone} size="md" className="text-phase-interactive" />
                </Box>
                <VStack className="gap-0.5">
                  <Heading className="text-2xl font-black text-ink">The Broadcaster</Heading>
                  <Text className="text-ink/60 text-sm">
                    School-wide resonance and critical updates.
                  </Text>
                </VStack>
              </HStack>

              {can('create', 'Announcement') && (
                <SanctuaryButton
                  action="primary"
                  className="h-12 rounded-xl mt-2"
                  onPress={() => setShowCreateModal(true)}
                >
                  <HStack className="items-center gap-2">
                    <Icon as={Plus} size="sm" className="text-white" />
                    <Text className="text-white font-bold">New Announcement</Text>
                  </HStack>
                </SanctuaryButton>
              )}
            </VStack>
          </Box>

          {/* Loading State */}
          {isLoading && (
            <Box className="py-20 items-center">
              <Spinner />
              <Text className="text-ink/40 text-sm mt-4 font-medium uppercase tracking-widest">
                Gathering Updates...
              </Text>
            </Box>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <Box className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
              <Text className="text-red-500 font-medium text-center">{error}</Text>
            </Box>
          )}

          {/* Pinned Announcements */}
          {!isLoading && pinnedAnnouncements.length > 0 && (
            <VStack className="gap-4">
              <HStack className="items-center gap-2 px-1">
                <Icon as={Pin} size="xs" className="text-phase-interactive" />
                <Text className="text-ink/40 text-[10px] font-bold tracking-[2px] uppercase">
                  {t('announcements.pinned') || 'Pinned to Top'}
                </Text>
              </HStack>
              {pinnedAnnouncements.map((announcement) => (
                <Box
                  key={announcement.id}
                  className="p-5 bg-phase-interactive/5 rounded-3xl border border-phase-interactive/20"
                >
                  <VStack className="gap-3">
                    <HStack className="justify-between items-center">
                      <Text className="text-ink font-bold text-sm">
                        {announcement.author_name || 'Authority'}
                      </Text>
                      <Text className="text-ink/40 text-[10px] font-bold">
                        {formatDate(announcement.created_at)}
                      </Text>
                    </HStack>
                    <Text className="text-ink text-base leading-relaxed">
                      {announcement.content}
                    </Text>
                  </VStack>
                </Box>
              ))}
            </VStack>
          )}

          {/* Regular Announcements */}
          {!isLoading && regularAnnouncements.length > 0 && (
            <VStack className="gap-4">
              <HStack className="items-center gap-2 px-1">
                <Icon as={Globe} size="xs" className="text-ink/40" />
                <Text className="text-ink/40 text-[10px] font-bold tracking-[2px] uppercase">
                  {t('announcements.recent') || 'Recent Streams'}
                </Text>
              </HStack>

              {regularAnnouncements.map((announcement) => (
                <Box
                  key={announcement.id}
                  className="p-5 bg-phase-surface rounded-3xl border border-border shadow-sm"
                >
                  <VStack className="gap-3">
                    <HStack className="justify-between items-center">
                      <Text className="text-ink font-bold text-sm">
                        {announcement.author_name || 'Staff Member'}
                      </Text>
                      <Text className="text-ink/40 text-[10px] font-bold">
                        {formatDate(announcement.created_at)}
                      </Text>
                    </HStack>
                    <Text className="text-ink/70 text-base leading-relaxed">
                      {announcement.content}
                    </Text>
                  </VStack>
                </Box>
              ))}
            </VStack>
          )}

          {/* Empty State */}
          {!isLoading && announcements.length === 0 && (
            <Box className="py-20 items-center justify-center">
              <Box className="w-16 h-16 rounded-full bg-ink/5 items-center justify-center mb-4">
                <Icon as={Megaphone} size="lg" className="text-ink/20" />
              </Box>
              <Text className="text-lg text-ink/20 font-bold text-center">All is Quiet</Text>
              <Text className="text-sm text-ink/40 text-center px-10 mt-2">
                No school-wide resonance has been broadcast yet. Check back for future updates.
              </Text>
            </Box>
          )}
        </VStack>
      </ScrollView>

      <SanctuaryModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewAnnouncementContent('');
          setIsPinned(false);
        }}
        title="Draft Resonance"
      >
        <VStack className="gap-6 py-6 px-4">
          <VStack className="gap-2">
            <Text className="text-ink/60 text-xs font-bold uppercase tracking-wider">
              Announcement Content
            </Text>
            <Box className="bg-ink/5 rounded-2xl border border-border p-1">
              <InputField
                className="text-ink text-base py-3 px-4 min-h-[150px]"
                placeholder={t('announcements.contentPlaceholder') || 'What needs to be heard?'}
                placeholderTextColor="#94a3b8"
                value={newAnnouncementContent}
                onChangeText={setNewAnnouncementContent}
                multiline
              />
            </Box>
          </VStack>

          <HStack className="justify-between items-center p-3 bg-ink/5 rounded-2xl">
            <HStack className="items-center gap-3">
              <Icon
                as={Pin}
                size="sm"
                className={isPinned ? 'text-phase-interactive' : 'text-ink/40'}
              />
              <Text className="text-ink text-sm font-bold">
                {t('announcements.pinAnnouncement') || 'Pin to Sanctuary Top'}
              </Text>
            </HStack>
            <Switch value={isPinned} onValueChange={setIsPinned} />
          </HStack>

          <HStack className="gap-3 mt-4">
            <SanctuaryButton
              action="secondary"
              className="flex-1 h-14 rounded-2xl"
              onPress={() => {
                setShowCreateModal(false);
                setNewAnnouncementContent('');
                setIsPinned(false);
              }}
              isDisabled={isCreating}
            >
              <Text className="text-ink font-bold">Withdraw</Text>
            </SanctuaryButton>
            <SanctuaryButton
              action="primary"
              className="flex-[2] h-14 rounded-2xl"
              onPress={handleCreateAnnouncement}
              isDisabled={isCreating}
            >
              {isCreating ? (
                <Spinner />
              ) : (
                <Text className="text-white font-bold text-lg">Broadcast</Text>
              )}
            </SanctuaryButton>
          </HStack>
        </VStack>
      </SanctuaryModal>
    </ScreenWrapper>
  );
}
