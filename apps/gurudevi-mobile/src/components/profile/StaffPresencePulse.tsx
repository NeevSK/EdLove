
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, GlassCard, useTheme, SanctuaryCard, Button, ButtonText, HStack, VStack, Center, useThemedColors, Box } from '@repo/ui';
import { useStaffPresence } from '@repo/profile';
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

interface StaffPresencePulseProps {
    userId: string;
    schoolId: string;
}

export const StaffPresencePulse: React.FC<StaffPresencePulseProps> = ({ userId, schoolId }) => {
    const colors = useThemedColors();
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
            <Text variant="h3" style={styles.title}>Professional Pulse</Text>

            <GlassCard style={styles.mainCard}>
                <VStack space="lg">
                    <HStack justifyContent="space-between" alignItems="center">
                        <VStack>
                            <Text variant="p2" weight="bold">Attendance Status</Text>
                            <Text variant="p3" color={colors.textSecondary}>
                                {format(new Date(), 'EEEE, MMMM do')}
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
                                {isCheckedIn ? 'CHECKED IN' : 'CHECKED OUT'}
                            </Text>
                        </View>
                    </HStack>

                    <HStack space="md">
                        <VStack style={styles.statBox}>
                            <Clock size={18} color={colors.primary} />
                            <Text variant="p4" mt="$1">Checked In At</Text>
                            <Text variant="p3" weight="bold">
                                {todayAttendance ? format(new Date(todayAttendance.check_in), 'hh:mm a') : '--:--'}
                            </Text>
                        </VStack>
                        <VStack style={styles.statBox}>
                            <LogOut size={18} color={colors.secondary} />
                            <Text variant="p4" mt="$1">Checked Out At</Text>
                            <Text variant="p3" weight="bold">
                                {todayAttendance?.check_out ? format(new Date(todayAttendance.check_out), 'hh:mm a') : '--:--'}
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
                                {isCheckedIn ? 'Check Out for Today' : 'Begin Your Sanctuary Day'}
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
                            <Text variant="p4" mt="$2">Request Leave</Text>
                        </VStack>
                    </SanctuaryCard>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryAction} activeOpacity={0.7}>
                    <SanctuaryCard variant="glass">
                        <VStack alignItems="center">
                            <CheckCircle2 size={20} color={colors.success} />
                            <Text variant="p4" mt="$2">View History</Text>
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
