import { useStaffPresence } from '@repo/people/hooks/useStaffPresence';
import { Clock, LogIn, LogOut } from '@repo/ui/icons';
import { Box, Heading, HStack, Icon, Pressable, Spinner, Text, VStack } from '@repo/ui/primitives';
import { hapticLight } from '@repo/ui/utils/haptics';
import { useSanctuaryToast } from '@repo/ui/providers/ToastProvider';
import { format } from 'date-fns';
import type React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface StaffPresencePulseProps {
  userId: string;
  schoolId: string;
}

export const StaffPresencePulse: React.FC<StaffPresencePulseProps> = ({ userId, schoolId }) => {
  const { t, i18n } = useTranslation();
  const { attendance, isCheckedIn, checkIn, checkOut, loading } = useStaffPresence(
    userId,
    schoolId,
  );
  const { showToast } = useSanctuaryToast();
  const [actionLoading, setActionLoading] = useState(false);

  const handleToggleAttendance = async () => {
    hapticLight();
    setActionLoading(true);
    try {
      const result = isCheckedIn ? await checkOut() : await checkIn();
      if (!result.success) {
        showToast({
          message: isCheckedIn
            ? 'Your check-out could not be recorded. Please try again.'
            : 'Your check-in could not be recorded. Please try again.',
          type: 'error',
        });
      }
    } catch (err) {
      console.error('Attendance toggle failed:', err);
      showToast({ message: 'Attendance could not be updated. Please try again.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return null;

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayAttendance = attendance.find(
    (a) => format(new Date(a.check_in), 'yyyy-MM-dd') === todayStr,
  );

  return (
    <VStack className="gap-5">
      <VStack className="gap-1.5 px-1">
        <Heading className="text-[20px] font-black text-phaseText-primary tracking-tight">
          {t('staffPresence.title') || 'Presence Pulse'}
        </Heading>
        <Text className="text-[11px] font-bold text-phaseText-muted uppercase tracking-[2px]">
          Gate Monitoring
        </Text>
      </VStack>

      <Box className="p-6 rounded-[32px] bg-phase-surface border border-phase-border shadow-sm">
        <VStack className="gap-6">
          <HStack className="justify-between items-center">
            <VStack className="gap-0.5">
              <Text className="text-[14px] font-black text-phaseText-primary tracking-tight">
                {t('staffPresence.attendanceStatus') || 'Shift Identity'}
              </Text>
              <Text className="text-[11px] font-bold text-phaseText-muted uppercase tracking-wider">
                {new Intl.DateTimeFormat(i18n.language, {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'short',
                }).format(new Date())}
              </Text>
            </VStack>
            <Box
              className={`flex-row items-center px-4 py-1.5 rounded-full border ${isCheckedIn ? 'bg-phase-success/10 border-phase-success/20' : 'bg-phase-danger/10 border-phase-danger/20'}`}
            >
              <Box
                className={`w-1.5 h-1.5 rounded-full mr-2 ${isCheckedIn ? 'bg-phase-success' : 'bg-phase-danger'}`}
              />
              <Text
                className={`text-[10px] font-black uppercase tracking-widest ${isCheckedIn ? 'text-phase-success' : 'text-phase-danger'}`}
              >
                {isCheckedIn
                  ? t('staffPresence.checkedIn') || 'ACTIVE'
                  : t('staffPresence.checkedOut') || 'STATIONED'}
              </Text>
            </Box>
          </HStack>

          <HStack className="gap-3">
            <VStack className="flex-1 bg-phase-canvas p-4 rounded-[20px] items-center gap-1 border border-phase-border/50">
              <Icon as={Clock} size="sm" className="text-phase-interactive" />
              <Text className="text-[9px] text-phaseText-muted uppercase font-black tracking-widest mt-1">
                {t('staffPresence.checkedInAt') || 'CHECK-IN'}
              </Text>
              <Text className="text-[15px] font-black text-phaseText-primary">
                {todayAttendance
                  ? new Intl.DateTimeFormat(i18n.language, {
                      hour: '2-digit',
                      minute: '2-digit',
                    }).format(new Date(todayAttendance.check_in))
                  : '--:--'}
              </Text>
            </VStack>
            <VStack className="flex-1 bg-phase-canvas p-4 rounded-[20px] items-center gap-1 border border-phase-border/50">
              <Icon as={LogOut} size="sm" className="text-phaseText-muted" />
              <Text className="text-[9px] text-phaseText-muted uppercase font-black tracking-widest mt-1">
                {t('staffPresence.checkedOutAt') || 'CHECK-OUT'}
              </Text>
              <Text className="text-[15px] font-black text-phaseText-primary">
                {todayAttendance?.check_out
                  ? new Intl.DateTimeFormat(i18n.language, {
                      hour: '2-digit',
                      minute: '2-digit',
                    }).format(new Date(todayAttendance.check_out))
                  : '--:--'}
              </Text>
            </VStack>
          </HStack>

          <Pressable
            onPress={() => {
              void handleToggleAttendance();
            }}
            accessibilityRole="button"
            disabled={actionLoading}
            className={`h-14 rounded-[20px] flex-row items-center justify-center gap-3 shadow-md active:scale-95 transition-all ${
              isCheckedIn ? 'bg-phase-danger' : 'bg-phase-interactive'
            }`}
          >
            {actionLoading ? (
              <Spinner size="small" color="white" />
            ) : (
              <>
                <Icon as={isCheckedIn ? LogOut : LogIn} size="sm" className="text-white" />
                <Text className="text-white text-[12px] font-black uppercase tracking-widest">
                  {isCheckedIn
                    ? t('staffPresence.checkOutButton') || 'COMMIT SHIFT EXIT'
                    : t('staffPresence.checkInButton') || 'AUTHORIZE ENTRANCE'}
                </Text>
              </>
            )}
          </Pressable>
        </VStack>
      </Box>

    </VStack>
  );
};

export default StaffPresencePulse;
