import type { WorkspaceSwitcherTarget } from '@repo/core/types';
import { usePerspectiveSwitch } from '@repo/core/hooks/usePerspectiveSwitch';
import { useBreakpoint } from '@repo/ui/components/layout';
import { Briefcase, Check, ChevronRight, Heart, Plus, School, Settings, Sparkles, Users, X } from '@repo/ui/icons';
import { Box, HStack, Modal, ModalContent, Pressable, ScrollView, Text, VStack } from '@repo/ui/primitives';
import { tokens } from '@repo/ui/tokens';
import { hapticSuccess } from '@repo/ui/utils/haptics';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export interface PerspectiveSwitcherSheetProps {
  isOpen: boolean;
  onClose: () => void;
  targets: WorkspaceSwitcherTarget[];
  onSelectTarget?: (target: WorkspaceSwitcherTarget) => void;
  onAddCommercialBatch?: () => void;
  onLinkSchoolBond?: () => void;
  onLinkWard?: () => void;
  onManagePerspectives?: () => void;
}

export function PerspectiveSwitcherSheet({
  isOpen,
  onClose,
  targets,
  onSelectTarget,
  onAddCommercialBatch,
  onLinkSchoolBond,
  onLinkWard,
  onManagePerspectives,
}: PerspectiveSwitcherSheetProps) {
  const { t } = useTranslation();
  const breakpoint = useBreakpoint();
  const isDesktopOrTablet = breakpoint === 'desktop' || breakpoint === 'tablet';
  const { activePerspective, switchPerspective, isTransitioning } = usePerspectiveSwitch();

  const groupedTargets = useMemo(() => {
    const personal = targets.filter((tgt) => tgt.category === 'personal' || tgt.id === 'personal');
    const commercial = targets.filter((tgt) => tgt.category === 'commercial' || tgt.id === 'commercial');
    const institutional = targets.filter((tgt) => tgt.category === 'institutional');
    const guardian = targets.filter((tgt) => tgt.category === 'guardian' || tgt.id === 'guardian');

    return {
      personal,
      commercial,
      institutional,
      guardian,
    };
  }, [targets]);

  const handleSelect = async (target: WorkspaceSwitcherTarget) => {
    if (!target.enabled || isTransitioning) return;
    hapticSuccess();

    if (target.perspectiveId) {
      await switchPerspective(target.perspectiveId);
    }

    if (onSelectTarget) {
      onSelectTarget(target);
    }
    onClose();
  };

  const getCategoryStyles = (category?: string, isCurrent?: boolean) => {
    switch (category) {
      case 'personal':
        return {
          accent: tokens.colors.primary,
          bgActive: 'rgba(212, 132, 58, 0.08)',
          borderActive: 'rgba(212, 132, 58, 0.45)',
          iconBg: isCurrent ? 'rgba(212, 132, 58, 0.22)' : 'rgba(212, 132, 58, 0.12)',
        };
      case 'commercial':
        return {
          accent: tokens.colors.info,
          bgActive: 'rgba(79, 125, 163, 0.08)',
          borderActive: 'rgba(79, 125, 163, 0.45)',
          iconBg: isCurrent ? 'rgba(79, 125, 163, 0.22)' : 'rgba(79, 125, 163, 0.12)',
        };
      case 'guardian':
        return {
          accent: '#7B61FF',
          bgActive: 'rgba(123, 97, 255, 0.08)',
          borderActive: 'rgba(123, 97, 255, 0.45)',
          iconBg: isCurrent ? 'rgba(123, 97, 255, 0.22)' : 'rgba(123, 97, 255, 0.12)',
        };
      case 'institutional':
      default:
        return {
          accent: tokens.colors.success,
          bgActive: 'rgba(91, 140, 79, 0.08)',
          borderActive: 'rgba(91, 140, 79, 0.45)',
          iconBg: isCurrent ? 'rgba(91, 140, 79, 0.22)' : 'rgba(91, 140, 79, 0.12)',
        };
    }
  };

  const renderTargetCard = (
    target: WorkspaceSwitcherTarget,
    defaultIcon: React.ReactNode,
    categoryKey: 'personal' | 'commercial' | 'institutional' | 'guardian',
  ) => {
    const isCurrent = Boolean(
      target.status === 'current' ||
        (target.perspectiveId && activePerspective.id === target.perspectiveId),
    );
    const catStyle = getCategoryStyles(categoryKey, isCurrent);

    return (
      <Pressable
        key={`${target.id}-${target.perspectiveId || target.title}`}
        accessibilityRole="button"
        accessibilityLabel={target.title}
        accessibilityState={{ selected: isCurrent, disabled: !target.enabled }}
        onPress={() => void handleSelect(target)}
        disabled={!target.enabled}
        style={{
          borderRadius: tokens.radii.lg,
          borderWidth: 1.5,
          borderColor: isCurrent
            ? catStyle.borderActive
            : target.enabled
              ? tokens.semantic.border.base
              : tokens.semantic.border.subtle,
          backgroundColor: isCurrent
            ? catStyle.bgActive
            : target.enabled
              ? tokens.colors.surface
              : tokens.colors.surfaceSubtle,
          padding: tokens.spacing.md,
          opacity: target.enabled ? 1 : 0.6,
          marginBottom: tokens.spacing.sm,
          shadowColor: tokens.colors.shadowColor,
          shadowOffset: { width: 0, height: isCurrent ? 2 : 1 },
          shadowOpacity: isCurrent ? 0.08 : 0.03,
          shadowRadius: 4,
          elevation: isCurrent ? 2 : 1,
        }}
      >
        <HStack style={{ alignItems: 'center', justifyContent: 'space-between', gap: tokens.spacing.md }}>
          <HStack style={{ alignItems: 'center', gap: tokens.spacing.md, flex: 1 }}>
            <Box
              style={{
                width: 40,
                height: 40,
                borderRadius: tokens.radii.md,
                backgroundColor: catStyle.iconBg,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {defaultIcon}
            </Box>

            <VStack style={{ flex: 1, gap: 2 }}>
              <HStack style={{ alignItems: 'center', gap: tokens.spacing.xs, flexWrap: 'wrap' }}>
                <Text
                  style={{
                    fontSize: tokens.typography.sizes.sm,
                    fontWeight: '700',
                    color: tokens.semantic.text.primary,
                  }}
                  numberOfLines={1}
                >
                  {target.title}
                </Text>

                {target.badge ? (
                  <Box
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 1,
                      borderRadius: tokens.radii.full,
                      backgroundColor: catStyle.iconBg,
                      borderWidth: 1,
                      borderColor: catStyle.borderActive,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: '700',
                        color: catStyle.accent,
                      }}
                    >
                      {target.badge}
                    </Text>
                  </Box>
                ) : null}
              </HStack>

              <Text
                style={{
                  fontSize: tokens.typography.sizes.xs,
                  color: tokens.semantic.text.secondary,
                  lineHeight: 16,
                }}
                numberOfLines={2}
              >
                {target.enabled ? target.description : target.reason || target.description}
              </Text>
            </VStack>
          </HStack>

          {isCurrent ? (
            <Box
              style={{
                width: 26,
                height: 26,
                borderRadius: 13,
                backgroundColor: catStyle.accent,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Check size={14} color="#FFFFFF" />
            </Box>
          ) : (
            <ChevronRight size={18} color={tokens.colors.inkSubtle} />
          )}
        </HStack>
      </Pressable>
    );
  };

  const renderAddButton = (label: string, icon: React.ReactNode, onPress?: () => void) => {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={() => {
          onClose();
          if (onPress) onPress();
        }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          paddingVertical: 10,
          paddingHorizontal: 14,
          borderRadius: tokens.radii.md,
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: tokens.semantic.border.base,
          backgroundColor: tokens.colors.surfaceSubtle,
          marginTop: 2,
          marginBottom: tokens.spacing.sm,
        }}
      >
        {icon}
        <Text
          style={{
            fontSize: tokens.typography.sizes.xs,
            fontWeight: '600',
            color: tokens.semantic.text.secondary,
          }}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent
        style={{
          backgroundColor: tokens.colors.background,
          borderColor: tokens.semantic.border.base,
          borderWidth: 1,
          maxHeight: isDesktopOrTablet ? 680 : '90%',
          width: isDesktopOrTablet ? 580 : '100%',
          maxWidth: '100%',
          borderRadius: isDesktopOrTablet ? tokens.radii.lg : undefined,
          borderTopLeftRadius: tokens.radii.lg,
          borderTopRightRadius: tokens.radii.lg,
          alignSelf: 'center',
          overflow: 'hidden',
          shadowColor: tokens.colors.shadowColor,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.18,
          shadowRadius: 24,
          elevation: 10,
        }}
      >
        {/* Mobile drag handle */}
        {!isDesktopOrTablet ? (
          <Box
            style={{
              width: 44,
              height: 4,
              borderRadius: 2,
              backgroundColor: tokens.colors.borderStrong,
              opacity: 0.3,
              alignSelf: 'center',
              marginTop: 10,
              marginBottom: 4,
            }}
          />
        ) : null}

        {/* Header */}
        <Box
          style={{
            paddingHorizontal: tokens.spacing.lg,
            paddingTop: isDesktopOrTablet ? tokens.spacing.lg : tokens.spacing.sm,
            paddingBottom: tokens.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: tokens.semantic.border.subtle,
          }}
        >
          <HStack style={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <VStack style={{ gap: 2 }}>
              <HStack style={{ alignItems: 'center', gap: 6 }}>
                <Sparkles size={16} color={tokens.colors.primary} />
                <Text
                  style={{
                    fontSize: tokens.typography.sizes.md,
                    fontWeight: '800',
                    color: tokens.semantic.text.primary,
                  }}
                >
                  {t('perspective.switchTitle', 'Operational Perspectives')}
                </Text>
              </HStack>
              <Text
                style={{
                  fontSize: tokens.typography.sizes.xs,
                  color: tokens.semantic.text.secondary,
                }}
              >
                {t(
                  'perspective.switchSubtitle',
                  'Select your active studio, commercial batch, or institutional school workspace.',
                )}
              </Text>
            </VStack>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close switcher"
              onPress={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: tokens.colors.surfaceInteractive,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={16} color={tokens.colors.ink} />
            </Pressable>
          </HStack>
        </Box>

        {/* Categorized List */}
        <ScrollView
          style={{ paddingHorizontal: tokens.spacing.lg, paddingTop: tokens.spacing.md }}
          showsVerticalScrollIndicator={false}
        >
          <VStack style={{ gap: tokens.spacing.lg, paddingBottom: tokens.spacing.lg }}>
            {/* 1. Personal Sanctuary */}
            {groupedTargets.personal.length > 0 ? (
              <VStack style={{ gap: tokens.spacing.xs }}>
                <HStack style={{ alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '800',
                      letterSpacing: 0.8,
                      textTransform: 'uppercase',
                      color: tokens.colors.primary,
                    }}
                  >
                    🌿 {t('perspective.personalSanctuary', 'Personal Sanctuary Studio')}
                  </Text>
                </HStack>
                {groupedTargets.personal.map((target) =>
                  renderTargetCard(
                    target,
                    <Heart size={20} color={tokens.colors.primary} />,
                    'personal',
                  ),
                )}
              </VStack>
            ) : null}

            {/* 2. Commercial Tuition */}
            <VStack style={{ gap: tokens.spacing.xs }}>
              <HStack style={{ alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '800',
                    letterSpacing: 0.8,
                    textTransform: 'uppercase',
                    color: tokens.colors.info,
                  }}
                >
                  💼 {t('perspective.commercialBatches', 'Commercial Tuition Batches')}
                </Text>
              </HStack>
              {groupedTargets.commercial.length > 0 ? (
                groupedTargets.commercial.map((target) =>
                  renderTargetCard(
                    target,
                    <Briefcase size={20} color={tokens.colors.info} />,
                    'commercial',
                  ),
                )
              ) : (
                <Text
                  style={{
                    fontSize: tokens.typography.sizes.xs,
                    color: tokens.semantic.text.muted,
                    fontStyle: 'italic',
                    marginBottom: 4,
                  }}
                >
                  No private institute or tuition batches linked yet.
                </Text>
              )}
              {renderAddButton(
                '+ Add / Create Tuition Batch',
                <Plus size={14} color={tokens.colors.info} />,
                onAddCommercialBatch,
              )}
            </VStack>

            {/* 3. Institutional Bonds */}
            <VStack style={{ gap: tokens.spacing.xs }}>
              <HStack style={{ alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '800',
                    letterSpacing: 0.8,
                    textTransform: 'uppercase',
                    color: tokens.colors.success,
                  }}
                >
                  🏛️ {t('perspective.institutionalBonds', 'Institutional School Bonds')}
                </Text>
              </HStack>
              {groupedTargets.institutional.length > 0 ? (
                groupedTargets.institutional.map((target) =>
                  renderTargetCard(
                    target,
                    <School size={20} color={tokens.colors.success} />,
                    'institutional',
                  ),
                )
              ) : (
                <Text
                  style={{
                    fontSize: tokens.typography.sizes.xs,
                    color: tokens.semantic.text.muted,
                    fontStyle: 'italic',
                    marginBottom: 4,
                  }}
                >
                  No verified formal school bonds connected to this account.
                </Text>
              )}
              {renderAddButton(
                '+ Connect School (Invite Code)',
                <Plus size={14} color={tokens.colors.success} />,
                onLinkSchoolBond,
              )}
            </VStack>

            {/* 4. Guardian / Family */}
            <VStack style={{ gap: tokens.spacing.xs }}>
              <HStack style={{ alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '800',
                    letterSpacing: 0.8,
                    textTransform: 'uppercase',
                    color: '#7B61FF',
                  }}
                >
                  👨‍👧 {t('perspective.guardianWards', 'Family & Ward Guardianship')}
                </Text>
              </HStack>
              {groupedTargets.guardian.length > 0 ? (
                groupedTargets.guardian.map((target) =>
                  renderTargetCard(
                    target,
                    <Users size={20} color="#7B61FF" />,
                    'guardian',
                  ),
                )
              ) : (
                <Text
                  style={{
                    fontSize: tokens.typography.sizes.xs,
                    color: tokens.semantic.text.muted,
                    fontStyle: 'italic',
                    marginBottom: 4,
                  }}
                >
                  No student wards linked to your guardian profile.
                </Text>
              )}
              {renderAddButton(
                '+ Link Student Ward (Parent Portal)',
                <Plus size={14} color="#7B61FF" />,
                onLinkWard,
              )}
            </VStack>
          </VStack>
        </ScrollView>

        {/* Footer */}
        {onManagePerspectives ? (
          <Box
            style={{
              paddingHorizontal: tokens.spacing.lg,
              paddingVertical: tokens.spacing.sm,
              borderTopWidth: 1,
              borderTopColor: tokens.semantic.border.subtle,
              backgroundColor: tokens.colors.surfaceSubtle,
              alignItems: 'center',
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Manage all perspectives and bonds"
              onPress={() => {
                onClose();
                onManagePerspectives();
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingVertical: 4,
              }}
            >
              <Settings size={14} color={tokens.semantic.text.secondary} />
              <Text
                style={{
                  fontSize: tokens.typography.sizes.xs,
                  fontWeight: '700',
                  color: tokens.semantic.text.secondary,
                }}
              >
                Manage & Configure Perspectives
              </Text>
            </Pressable>
          </Box>
        ) : null}
      </ModalContent>
    </Modal>
  );
}

export default PerspectiveSwitcherSheet;


