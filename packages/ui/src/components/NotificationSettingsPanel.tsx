import { BellRing, Mail, Moon, Smartphone } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import { useNotificationPreferences } from '../hooks/useNotificationPreferences';
import { Box, Divider, Heading, HStack, Icon, Spinner, Switch, Text, VStack } from '../primitives';

/**
 * NotificationSettingsPanel
 *
 * A premium, platform-aware component for managing granular notification preferences.
 * Designed to look like a high-end system setting across Mobile and Web.
 */
export const NotificationSettingsPanel = () => {
  const { t } = useTranslation();
  const { preferences, loading, toggleChannel, toggleCategory } = useNotificationPreferences();

  if (loading) {
    return (
      <Box className="p-8 items-center justify-center">
        <Spinner />
      </Box>
    );
  }

  const settings = preferences?.notification_settings;
  if (!settings) {
    return (
      <Box className="p-8 bg-phase-surface rounded-2xl border border-dashed border-phase-surface items-center">
        <Text className="text-phase-text-secondary italic">{t('settings.noPreferencesFound')}</Text>
      </Box>
    );
  }

  return (
    <VStack space="xl" className={Platform.OS === 'web' ? 'max-w-4xl mx-auto' : ''}>
      {/* Platform Branding Header (Web Only) */}
      {Platform.OS === 'web' && (
        <VStack space="xs" className="mb-4">
          <Heading size="xl" className="text-phase-text-primary font-bold">
            {t('settings.notificationPreferences')}
          </Heading>
          <Text className="text-phase-text-secondary">
            Manage how and when you receive updates from the Sanctuary.
          </Text>
        </VStack>
      )}

      {/* Global Delivery Channels */}
      <VStack space="md">
        <Heading
          size="xs"
          className="text-phase-text-secondary uppercase tracking-widest font-bold px-1"
        >
          {t('settings.deliveryChannels')}
        </Heading>
        <Box className="bg-phase-canvas rounded-3xl border border-phase-surface p-6 shadow-sm">
          <VStack space="lg">
            {/* Push */}
            <HStack className="justify-between items-center">
              <HStack space="md" className="items-center">
                <Box className="p-2 bg-blue-500/10 rounded-xl">
                  <Icon as={Smartphone} size={20} color="#3B82F6" />
                </Box>
                <VStack>
                  <Text className="text-phase-text-primary font-bold">
                    {t('settings.pushNotifications')}
                  </Text>
                  <Text size="xs" className="text-phase-text-secondary">
                    Direct to your mobile device
                  </Text>
                </VStack>
              </HStack>
              <Switch value={settings.channels.push} onValueChange={() => toggleChannel('push')} />
            </HStack>

            <Divider className="opacity-50" />

            {/* Email */}
            <HStack className="justify-between items-center">
              <HStack space="md" className="items-center">
                <Box className="p-2 bg-purple-500/10 rounded-xl">
                  <Icon as={Mail} size={20} color="#A855F7" />
                </Box>
                <VStack>
                  <Text className="text-phase-text-primary font-bold">
                    {t('settings.emailNotifications')}
                  </Text>
                  <Text size="xs" className="text-phase-text-secondary">
                    Digests and important alerts
                  </Text>
                </VStack>
              </HStack>
              <Switch
                value={settings.channels.email}
                onValueChange={() => toggleChannel('email')}
              />
            </HStack>

            <Divider className="opacity-50" />

            {/* In-App */}
            <HStack className="justify-between items-center">
              <HStack space="md" className="items-center">
                <Box className="p-2 bg-amber-500/10 rounded-xl">
                  <Icon as={BellRing} size={20} color="#F59E0B" />
                </Box>
                <VStack>
                  <Text className="text-phase-text-primary font-bold">
                    {t('settings.inAppNotifications')}
                  </Text>
                  <Text size="xs" className="text-phase-text-secondary">
                    Visible within the application
                  </Text>
                </VStack>
              </HStack>
              <Switch
                value={settings.channels.in_app}
                onValueChange={() => toggleChannel('in_app')}
              />
            </HStack>
          </VStack>
        </Box>
      </VStack>

      {/* Category Gating */}
      <VStack space="md">
        <Heading
          size="xs"
          className="text-phase-text-secondary uppercase tracking-widest font-bold px-1"
        >
          {t('settings.topicPreferences')}
        </Heading>
        <Box className="bg-phase-canvas rounded-3xl border border-phase-surface p-6 shadow-sm">
          <VStack space="xl">
            {Object.keys(settings.categories).map((category, idx) => (
              <React.Fragment key={category}>
                <VStack space="md">
                  <Text className="font-bold text-phase-text-primary capitalize text-lg">
                    {category}
                  </Text>
                  <HStack space="xl">
                    <HStack className="flex-1 justify-between items-center bg-phase-surface p-3 rounded-2xl">
                      <Text size="sm" className="text-phase-text-secondary font-medium">
                        Push
                      </Text>
                      <Switch
                        value={settings.categories[category]?.push ?? false}
                        onValueChange={() => toggleCategory(category, 'push')}
                      />
                    </HStack>
                    <HStack className="flex-1 justify-between items-center bg-phase-surface p-3 rounded-2xl">
                      <Text size="sm" className="text-phase-text-secondary font-medium">
                        Email
                      </Text>
                      <Switch
                        value={settings.categories[category]?.email ?? false}
                        onValueChange={() => toggleCategory(category, 'email')}
                      />
                    </HStack>
                  </HStack>
                </VStack>
                {idx < Object.keys(settings.categories).length - 1 && (
                  <Divider className="opacity-30" />
                )}
              </React.Fragment>
            ))}
          </VStack>
        </Box>
      </VStack>

      {/* Quiet Hours */}
      <VStack space="md" className="mb-10">
        <Heading
          size="xs"
          className="text-phase-text-secondary uppercase tracking-widest font-bold px-1"
        >
          {t('settings.focusMode')}
        </Heading>
        <Box className="bg-phase-canvas rounded-3xl border border-phase-surface p-6 shadow-sm">
          <HStack className="justify-between items-center">
            <HStack space="md" className="items-center">
              <Box className="p-2 bg-indigo-500/10 rounded-xl">
                <Icon as={Moon} size={20} color="#6366F1" />
              </Box>
              <VStack>
                <Text className="text-phase-text-primary font-bold">
                  {t('settings.quietHours')}
                </Text>
                <Text size="xs" className="text-phase-text-secondary font-mono tracking-tighter">
                  {settings.quiet_hours.start} — {settings.quiet_hours.end}
                </Text>
              </VStack>
            </HStack>
            <Switch
              value={settings.quiet_hours.enabled}
              onValueChange={() => {
                /* TODO: Implement quiet hours toggle */
              }}
            />
          </HStack>
        </Box>
      </VStack>
    </VStack>
  );
};
