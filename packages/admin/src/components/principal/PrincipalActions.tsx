import React from 'react';
import { Icon, VStack,
  HStack,
  Box,
  Text,
  Pressable,
  
  useThemedColors,
  hapticLight} from '@repo/ui';
import { Banknote, CalendarDays, UserCheck, TrendingUp } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface PrincipalActionsProps {
  onAction?: (action: string) => void;
}

export default function PrincipalActions({ onAction }: PrincipalActionsProps) {
  const { t } = useTranslation();
  const colors = useTheme().scene;

  interface ActionCardProps {
    icon: React.ElementType;
    label: string;
    description: string;
    color?: string;
    onPress?: () => void;
  }

  const ActionCard = ({ icon: LucideIcon, label, description, color, onPress }: ActionCardProps) => (
    <Pressable
      onPress={() => {
        hapticLight();
        if (onPress) onPress();
        if (onAction) onAction(label);
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={description}
      sx={{
        flex: 1,
        backgroundColor: colors?.secondary || '#2A2318',
        padding: Theme.spacing.lg,
        borderRadius: Theme.corners.generous,
        borderWidth: 1,
        borderColor: colors?.border || 'rgba(255,255,255,0.1)'}}
    >
      <VStack sx={{ gap: Theme.spacing.sm }}>
        <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Box
            sx={{
              padding: Theme.spacing.sm,
              borderRadius: Theme.corners.medium,
              backgroundColor: (color || sanctuarySaffron) + '22'}}
          >
            <LucideIcon size={24} color={color || sanctuarySaffron} />
          </Box>
          <TrendingUp size={16} color={colors?.textTertiary || '#666'} style={{ opacity: 0.3 }} />
        </HStack>
        <VStack>
          <Text sx={{ color: colors?.text || '#fff', fontSize: 14, fontWeight: '700' }}>
            {label}
          </Text>
          <Text sx={{ color: colors?.textSecondary || '#aaa', fontSize: 11 }}>
            {description}
          </Text>
        </VStack>
      </VStack>
    </Pressable>
  );

  return (
    <VStack sx={{ gap: Theme.spacing.md }}>
      <Text
        sx={{ 
          color: colors?.textSecondary || '#aaa', 
          fontSize: 13, 
          fontWeight: '700', 
          textTransform: 'uppercase', 
          letterSpacing: 1 
        }}
      >
        {t('principal.admin.title') || 'Governance Dashboard'} 
      </Text>
      
      <VStack sx={{ gap: Theme.spacing.md }}>
        <HStack sx={{ gap: Theme.spacing.md }}>
          <ActionCard
            icon={Banknote}
            label={t('principal.admin.finance') || 'Financials'}
            description={t('principal.admin.financeDesc') || 'Fees & Dues Summary'}
            color={sageGreen}
          />
          <ActionCard
            icon={CalendarDays}
            label={t('principal.admin.events') || 'Event Approvals'}
            description={t('principal.admin.eventsDesc') || 'Approve school events'}
            color={amberGlow}
          />
        </HStack>

        {/* Staff Leave Requests Wide Card */}
        <Box
          sx={{
            backgroundColor: colors?.secondary || '#2A2318',
            padding: Theme.spacing.lg,
            borderRadius: Theme.corners.generous,
            borderWidth: 1,
            borderColor: colors?.border || 'rgba(255,255,255,0.1)'}}
        >
          <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <HStack sx={{ gap: Theme.spacing.md, alignItems: 'center' }}>
              <Box
                sx={{
                  padding: Theme.spacing.sm,
                  borderRadius: Theme.corners.medium,
                  backgroundColor: (colors?.action || '#2196f3') + '22'}}
              >
                <Icon as={User}Check size={24} color={colors?.action || '#2196f3'} />
              </Box>
              <VStack>
                <Text sx={{ color: colors?.text || '#fff', fontSize: 14, fontWeight: '700' }}>
                  {t('principal.admin.leaves') || 'Staff Leave Requests'}
                </Text>
                <Text sx={{ color: colors?.textSecondary || '#aaa', fontSize: 11 }}>
                  {t('principal.admin.leavesDesc') || 'Review and approve staff absences'}
                </Text>
              </VStack>
            </HStack>
            
            <Pressable
              onPress={() => {
                hapticLight();
                if (onAction) onAction('Leaves');
              }}
              accessibilityRole="button"
              accessibilityLabel="View All Staff Leave Requests"
              accessibilityHint="Opens the staff leaves management dashboard"
              sx={{
                backgroundColor: colors?.tertiary || 'rgba(255,255,255,0.05)',
                paddingHorizontal: Theme.spacing.md,
                paddingVertical: Theme.spacing.xs,
                borderRadius: 20}}
            >
              <Text sx={{ color: colors?.action || '#2196f3', fontSize: 12, fontWeight: '700' }}>
                View All
              </Text>
            </Pressable>
          </HStack>
        </Box>
      </VStack>
    </VStack>
  );
}
