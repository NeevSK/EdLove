import { api } from '@repo/core/api/client';

import { BookOpen, CircleAlert, Lightbulb, Package, Users, Wifi } from '@repo/ui/icons';
import {
  ActivityIndicator,
  Box,
  Button,
  ButtonText,
  Heading,
  HStack,
  Text,
  Icon as UIIcon,
  VStack,
} from '@repo/ui/primitives';

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ResourceNeed {
  id: string;
  resource_type: string;
  description: string;
  requested_by_count: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  icon: string;
}

interface ResourceNeedsDashboardProps {
  schoolId: string;
}

const ICON_MAP: Record<string, any> = {
  projector: Lightbulb,
  books: BookOpen,
  internet: Wifi,
  supplies: Package,
  support: Users,
  other: CircleAlert,
};

export default function ResourceNeedsDashboard({ schoolId }: ResourceNeedsDashboardProps) {
  const { t } = useTranslation();
  const [needs, setNeeds] = useState<ResourceNeed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const getPriorityClasses = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return {
          text: 'text-phase-danger',
          border: 'border-phase-danger',
          bg: 'bg-phase-danger/10',
        };
      case 'high':
        return {
          text: 'text-phase-warning',
          border: 'border-phase-warning',
          bg: 'bg-phase-warning/10',
        };
      case 'medium':
        return {
          text: 'text-phase-interactive',
          border: 'border-phase-interactive',
          bg: 'bg-phase-interactive/10',
        };
      default:
        return {
          text: 'text-phaseText-muted',
          border: 'border-phase-border',
          bg: 'bg-phase-canvas',
        };
    }
  };

  const fetchResourceNeeds = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const data = await api.inventory.getSchoolResourceNeeds(schoolId);
      setNeeds(data || []);
    } catch (error) {
      console.error('Failed to fetch resource needs:', error);
      setLoadError('Resource needs could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    if (schoolId) {
      fetchResourceNeeds();
    }
  }, [schoolId, fetchResourceNeeds]);

  if (isLoading) {
    return (
      <Box className="p-12 items-center justify-center">
        <ActivityIndicator className="text-phase-interactive" />
      </Box>
    );
  }

  if (needs.length === 0) {
    if (loadError) {
      return (
        <Box className="p-10 bg-phase-danger/10 rounded-3xl items-center border border-phase-danger/20">
          <Text className="text-phase-danger font-bold text-center">{loadError}</Text>
          <Button
            variant="outline"
            onPress={() => void fetchResourceNeeds()}
            className="mt-4 border-phase-danger/30"
            accessibilityLabel="Retry loading resource needs"
          >
            <ButtonText className="text-phase-danger font-bold">Try again</ButtonText>
          </Button>
        </Box>
      );
    }
    return (
      <Box className="p-10 bg-phase-canvas rounded-3xl items-center border border-dashed border-phase-border">
        <Heading className="text-xl font-black text-phase-success text-center">
          {t('principal.resources.emptyState') || 'Sanctuary is Well-Equipped'}
        </Heading>
        <Text className="mt-3 text-[13px] text-phaseText-muted font-bold text-center leading-relaxed">
          {t('principal.resources.emptyStateDesc') ||
            'No resource requests or damaged items reported.'}
        </Text>
      </Box>
    );
  }

  return (
    <VStack className="gap-8">
      <VStack className="gap-1.5">
        <Heading className="text-2xl font-black text-phaseText-primary">
          {t('principal.resources.title') || 'Resource Vistas'}
        </Heading>
        <Text className="text-[13px] font-bold text-phaseText-muted uppercase tracking-widest">
          {t('principal.resources.subtitle') || 'Aggregated Institutional Needs'}
        </Text>
      </VStack>

      <VStack className="gap-5">
        {needs.map((need) => {
          const Icon = ICON_MAP[need.icon] || ICON_MAP.other;
          const classes = getPriorityClasses(need.priority);

          return (
            <Box
              key={need.id}
              className={`p-6 bg-phase-surface rounded-3xl border-l-[6px] border-y border-r border-phase-border shadow-sm active:scale-98 transition-all ${classes.border.replace('border-', 'border-l-')}`}
            >
              <HStack className="items-center gap-5">
                <Box className={`w-14 h-14 rounded-2xl items-center justify-center ${classes.bg}`}>
                  <UIIcon as={Icon} className={classes.text} size="md" />
                </Box>

                <VStack className="flex-1 gap-1">
                  <Text className="text-[18px] font-black text-phaseText-primary">
                    {t('principal.resources.needUnit', {
                      count: need.requested_by_count,
                    }) || `${need.requested_by_count} requests`}
                  </Text>
                  <Text className="text-[14px] text-phaseText-secondary font-bold leading-relaxed">
                    {need.description}
                  </Text>
                  {need.priority === 'urgent' && (
                    <HStack className="items-center gap-1.5 mt-1.5">
                      <UIIcon as={CircleAlert} size="xs" className="text-phase-danger" />
                      <Text className="text-[10px] font-black uppercase tracking-widest text-phase-danger">
                        {t('principal.resources.urgent') || 'Urgent Priority'}
                      </Text>
                    </HStack>
                  )}
                </VStack>
              </HStack>
            </Box>
          );
        })}
      </VStack>

      <Box className="p-5 bg-phase-canvas rounded-2xl border border-phase-border shadow-inner">
        <Text className="italic text-[12px] text-phaseText-muted font-bold text-center leading-relaxed">
          {t('principal.resources.philosophy') ||
            'Infrastructure is the scaffolding of possibility.'}
        </Text>
      </Box>
    </VStack>
  );
}
