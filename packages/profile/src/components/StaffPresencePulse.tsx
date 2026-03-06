
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, GlassCard, useTheme, SanctuaryCard, Button, ButtonText, HStack, VStack, Center, useThemedColors, Box } from '@repo/ui';
import { useStaffPresence } from '../hooks/useStaffPresence';
import {
    Clock,
    Calendar,
    CheckCircle2,
    XCircle,
    AlertCircle,
    LogIn,
    LogOut,
    Plus
} from 'lucide-react-native';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface StaffPresencePulseProps {
    userId: string;
    schoolId: string;
}

export const StaffPresencePulse: React.FC<StaffPresencePulseProps> = ({ userId, schoolId }) => {
    const colors = useThemedColors();
    const { t, i18n } = useTranslation();
    const { attendance, isCheckedIn, checkIn, checkOut, loading } = useStaffPresence(userId, schoolId);
    const [actionLoading, setActionLoading] = useState(false);

    const handleToggleAttendance = async () => {
        setActionLoading(true);
        if (isCheckedIn) {
            await checkOut();
        } else {
            await checkIn();
        }
        setActionLoading(false);
    };

    if (loading) return null;

    const todayAttendance = attendance.find(a =>
        format(new Date(a.check_in), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    );

    return (
        <View style={styles.container}>
            <Text variant="h3" style={styles.title}>{t('staffPresence.title')}</Text>

            <GlassCard style={styles.mainCard}>
                <VStack space="lg">
                    <HStack justifyContent="space-between" alignItems="center">
                        <VStack>
                            <Text variant="p2" weight="bold">{t('staffPresence.attendanceStatus')}</Text>
                            <Text variant="p3" color={colors.textSecondary}>
                                {new Intl.DateTimeFormat(i18n.language, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date())}
                            </Text>
                        </VStack>
                        <View style={[
                            styles.statusBadge,
                            { backgroundColor: isCheckedIn ? colors.success + '20' : colors.error + '20' }
                        ]}>
                            <View style={[
                                styles.statusDot,
                                { backgroundColor: isCheckedIn ? colors.success : colors.error }
                            ]} />
                            <Text variant="p4" color={isCheckedIn ? colors.success : colors.error} weight="bold">
                                {isCheckedIn ? t('staffPresence.checkedIn') : t('staffPresence.checkedOut')}
                            </Text>
                        </View>
                    </HStack>

                    <HStack space="md">
                        <VStack style={styles.statBox}>
                            <Clock size={18} color={colors.primary} />
                            <Text variant="p4" mt="$1">{t('staffPresence.checkedInAt')}</Text>
                            <Text variant="p3" weight="bold">
                                {todayAttendance ? new Intl.DateTimeFormat(i18n.language, { hour: '2-digit', minute: '2-digit' }).format(new Date(todayAttendance.check_in)) : '--:--'}
                            </Text>
                        </VStack>
                        <VStack style={styles.statBox}>
                            <LogOut size={18} color={colors.secondary} />
                            <Text variant="p4" mt="$1">{t('staffPresence.checkedOutAt')}</Text>
                            <Text variant="p3" weight="bold">
                                {todayAttendance?.check_out ? new Intl.DateTimeFormat(i18n.language, { hour: '2-digit', minute: '2-digit' }).format(new Date(todayAttendance.check_out)) : '--:--'}
                            </Text>
                        </VStack>
                    </HStack>

                    <Button
                        size="lg"
                        onPress={handleToggleAttendance}
                        isDisabled={actionLoading}
                        style={{
                            backgroundColor: isCheckedIn ? colors.error : colors.success,
                            borderRadius: 12
                        }}
                    >
                        <HStack space="xs" alignItems="center">
                            {isCheckedIn ? <LogOut size={20} color="white" /> : <LogIn size={20} color="white" />}
                            <ButtonText color="white">
                                {isCheckedIn ? t('staffPresence.checkOutButton') : t('staffPresence.checkInButton')}
                            </ButtonText>
                        </HStack>
                    </Button>
                </VStack>
            </GlassCard>

            <HStack space="md" mt="$4">
                <TouchableOpacity style={styles.secondaryAction} activeOpacity={0.7}>
                    <SanctuaryCard variant="glass">
                        <VStack alignItems="center">
                            <Calendar size={20} color={colors.primary} />
                            <Text variant="p4" mt="$2">{t('staffPresence.requestLeave')}</Text>
                        </VStack>
                    </SanctuaryCard>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryAction} activeOpacity={0.7}>
                    <SanctuaryCard variant="glass">
                        <VStack alignItems="center">
                            <CheckCircle2 size={20} color={colors.success} />
                            <Text variant="p4" mt="$2">{t('staffPresence.viewHistory')}</Text>
                        </VStack>
                    </SanctuaryCard>
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
    actionCard: {
        padding: 16,
        alignItems: 'center',
        borderRadius: 16,
    }
});
