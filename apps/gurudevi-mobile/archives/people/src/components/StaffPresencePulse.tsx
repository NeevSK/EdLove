import { GlassCard } from '@repo/ui/components/GlassCard';
import { useThemedColors } from '@repo/ui/hooks';
import { Box, Button, ButtonText, HStack, Text, VStack } from '@repo/ui/primitives';

import { format } from 'date-fns';
import { Calendar, CircleCheck, Clock, LogIn, LogOut } from '@repo/ui/icons';
import type React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useStaffPresence } from '../hooks/useStaffPresence';

// —————————————————————————————————————————————————————————————————————————————
// TYPES
// —————————————————————————————————————————————————————————————————————————————
interface StaffPresencePulseProps {
  userId: string;
  schoolId: string;
}
// —————————————————————————————————————————————————————————————————————————————
// COMPONENT
// —————————————————————————————————————————————————————————————————————————————
export const StaffPresencePulse: React.FC<StaffPresencePulseProps> = ({ userId, schoolId }) => {
  const colors = useThemedColors();
  const { t, i18n } = useTranslation();
  const { attendance, isCheckedIn, checkIn, checkOut, loading } = useStaffPresence(
    userId,
    schoolId,
  );
  const [actionLoading, setActionLoading] = useState(false);
  const handleToggleAttendance = async () => {
    setActionLoading(true);
    try {
      if (isCheckedIn) {
        await checkOut();
      } else {
        await checkIn();
      }
    } catch (err) {
      console.error('Attendance toggle failed:', err);
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
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text, fontSize: 18, fontWeight: '700' }]}>
        {t('staffPresence.title')}
      </Text>

      <GlassCard style={styles.mainCard}>
        <VStack space="lg">
          <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <VStack>
              <Text sx={{ fontSize: 14, fontWeight: '700', color: colors.text }}>
                {t('staffPresence.attendanceStatus')}
              </Text>
              <Text sx={{ fontSize: 12, color: colors.textSecondary }}>
                {new Intl.DateTimeFormat(i18n.language, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }).format(new Date())}
              </Text>
            </VStack>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isCheckedIn ? `${colors.success}20` : `${colors.error}20`,
                },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: isCheckedIn ? colors.success : colors.error,
                  },
                ]}
              />
              <Text
                sx={{
                  fontSize: 12,
                  fontWeight: '700',
                  color: isCheckedIn ? colors.success : colors.error,
                }}
              >
                {isCheckedIn ? t('staffPresence.checkedIn') : t('staffPresence.checkedOut')}
              </Text>
            </View>
          </HStack>

          <HStack space="md">
            <VStack style={styles.statBox}>
              <Clock size={18} color={colors.primary} />
              <Text sx={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                {t('staffPresence.checkedInAt')}
              </Text>
              <Text sx={{ fontSize: 14, fontWeight: '700', color: colors.text }}>
                {todayAttendance
                  ? new Intl.DateTimeFormat(i18n.language, {
                      hour: '2-digit',
                      minute: '2-digit',
                    }).format(new Date(todayAttendance.check_in))
                  : '--:--'}
              </Text>
            </VStack>
            <VStack style={styles.statBox}>
              <LogOut size={18} color={colors.secondary} />
              <Text sx={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                {t('staffPresence.checkedOutAt')}
              </Text>
              <Text sx={{ fontSize: 14, fontWeight: '700', color: colors.text }}>
                {todayAttendance?.check_out
                  ? new Intl.DateTimeFormat(i18n.language, {
                      hour: '2-digit',
                      minute: '2-digit',
                    }).format(new Date(todayAttendance.check_out))
                  : '--:--'}
              </Text>
            </VStack>
          </HStack>

          <Button
            size="lg"
            onPress={handleToggleAttendance}
            isDisabled={actionLoading}
            style={{
              backgroundColor: isCheckedIn ? colors.error : colors.success,
              borderRadius: 12,
              height: 48,
            }}
          >
            <HStack space="xs" sx={{ alignItems: 'center', justifyContent: 'center' }}>
              {isCheckedIn ? <LogOut size={20} color="white" /> : <LogIn size={20} color="white" />}
              <ButtonText sx={{ color: 'white', fontWeight: '700' }}>
                {isCheckedIn ? t('staffPresence.checkOutButton') : t('staffPresence.checkInButton')}
              </ButtonText>
            </HStack>
          </Button>
        </VStack>
      </GlassCard>

      <HStack space="md" sx={{ marginTop: 16 }}>
        <TouchableOpacity style={styles.secondaryAction} activeOpacity={0.7}>
          <Box
            sx={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              padding: 16,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.1)',
              alignItems: 'center',
            }}
          >
            <Calendar size={20} color={colors.primary} />
            <Text sx={{ fontSize: 12, color: colors.text, marginTop: 8 }}>
              {t('staffPresence.requestLeave')}
            </Text>
          </Box>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryAction} activeOpacity={0.7}>
          <Box
            sx={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              padding: 16,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.1)',
              alignItems: 'center',
            }}
          >
            <CircleCheck size={20} color={colors.success} />
            <Text sx={{ fontSize: 12, color: colors.text, marginTop: 8 }}>
              {t('staffPresence.viewHistory')}
            </Text>
          </Box>
        </TouchableOpacity>
      </HStack>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 4,
  },
  title: {
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  mainCard: {
    padding: 20,
    borderRadius: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  secondaryAction: {
    flex: 1,
  },
});
export default StaffPresencePulse;
