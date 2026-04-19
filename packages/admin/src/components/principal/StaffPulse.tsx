import React, { useState } from 'react';
import { View } from 'react-native';
import { 
    Text, 
    VStack, 
    HStack, 
    Box, 
    Icon,
    Heading,
    Pressable,
    ActivityIndicator
} from '@repo/ui';
import { useStaffPresence } from '../../hooks/useStaffPresence';
import {
    Clock,
    Calendar,
    CheckCircle2,
    LogIn,
    LogOut
} from 'lucide-react-native';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface StaffPresencePulseProps {
    userId: string;
    schoolId: string;
}

export const StaffPresencePulse: React.FC<StaffPresencePulseProps> = ({ userId, schoolId }) => {
    const { t, i18n } = useTranslation();
    const { attendance, isCheckedIn, checkIn, checkOut, loading } = useStaffPresence(userId, schoolId);
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
    const todayAttendance = attendance.find(a => 
        format(new Date(a.check_in), 'yyyy-MM-dd') === todayStr
    );

    return (
        <Box className="my-4 px-1">
            <Text className="mb-3 text-lg font-bold text-ink">
                {t('staffPresence.title')}
            </Text>
            
            <Box className="p-5 rounded-3xl bg-white/70 border border-border shadow-sm">
                <VStack className="gap-5">
                    <HStack className="justify-between items-center">
                        <VStack className="gap-0.5">
                            <Text className="text-sm font-bold text-ink">
                                {t('staffPresence.attendanceStatus')}
                            </Text>
                            <Text className="text-xs text-ink/60">
                                {new Intl.DateTimeFormat(i18n.language, { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                }).format(new Date())}
                            </Text>
                        </VStack>
                        <Box className={`flex-row items-center px-3 py-1.5 rounded-full ${isCheckedIn ? 'bg-phase-warning/10' : 'bg-phase-error/10'}`}>
                            <Box className={`w-1.5 h-1.5 rounded-full mr-2 ${isCheckedIn ? 'bg-primary' : 'bg-phase-error'}`} />
                            <Text className={`text-xs font-bold ${isCheckedIn ? 'text-primary' : 'text-phase-error'}`}>
                                {isCheckedIn ? t('staffPresence.checkedIn') : t('staffPresence.checkedOut')}
                            </Text>
                        </Box>
                    </HStack>

                    <HStack className="gap-3">
                        <VStack className="flex-1 bg-ink/5 p-3 rounded-2xl items-center gap-1">
                            <Icon as={Clock} size={18} className="text-primary" />
                            <Text className="text-[10px] text-ink/50 uppercase font-bold tracking-wider">
                                {t('staffPresence.checkedInAt')}
                            </Text>
                            <Text className="text-sm font-bold text-ink">
                                {todayAttendance ? new Intl.DateTimeFormat(i18n.language, { hour: '2-digit', minute: '2-digit' }).format(new Date(todayAttendance.check_in)) : '--:--'}
                            </Text>
                        </VStack>
                        <VStack className="flex-1 bg-ink/5 p-3 rounded-2xl items-center gap-1">
                            <Icon as={LogOut} size={18} className="text-secondary" />
                            <Text className="text-[10px] text-ink/50 uppercase font-bold tracking-wider">
                                {t('staffPresence.checkedOutAt')}
                            </Text>
                            <Text className="text-sm font-bold text-ink">
                                {todayAttendance?.check_out ? new Intl.DateTimeFormat(i18n.language, { hour: '2-digit', minute: '2-digit' }).format(new Date(todayAttendance.check_out)) : '--:--'}
                            </Text>
                        </VStack>
                    </HStack>

                    <Pressable
                        onPress={handleToggleAttendance}
                        disabled={actionLoading}
                        className={`h-12 rounded-2xl flex-row items-center justify-center gap-2 active:opacity-80 ${
                            isCheckedIn ? 'bg-phase-error' : 'bg-primary'
                        }`}>
                        {actionLoading ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <>
                                <Icon as={isCheckedIn ? LogOut : LogIn} size={20} className="text-white" />
                                <Text className="text-white font-bold">
                                    {isCheckedIn ? t('staffPresence.checkOutButton') : t('staffPresence.checkInButton')}
                                </Text>
                            </>
                        )}
                    </Pressable>
                </VStack>
            </Box>

            <HStack className="gap-3 mt-4">
                <Pressable className="flex-1 active:opacity-70">
                    <Box className="bg-white/50 p-4 rounded-2xl border border-border items-center gap-2">
                        <Icon as={Calendar} size={20} className="text-primary" />
                        <Text className="text-xs font-bold text-ink">
                            {t('staffPresence.requestLeave')}
                        </Text>
                    </Box>
                </Pressable>
                <Pressable className="flex-1 active:opacity-70">
                    <Box className="bg-white/50 p-4 rounded-2xl border border-border items-center gap-2">
                        <Icon as={CheckCircle2} size={20} className="text-primary" />
                        <Text className="text-xs font-bold text-ink">
                            {t('staffPresence.viewHistory')}
                        </Text>
                    </Box>
                </Pressable>
            </HStack>
        </Box>
    );
};

export default StaffPresencePulse;
