import React, { useState } from 'react';
import { Box, VStack, Heading, Text, Button, Theme, useThemedColors, HStack, Pressable, hapticLight, LoadingOverlay, ScreenWrapper, SkeletonCard, useLotusToast } from '@repo/ui';
import { Search, QrCode, User, School as SchoolIcon, ArrowLeft, CheckCircle } from 'lucide-react-native';
import { onboardingAPI, schoolAPI, School, UserRole, useUserRole } from '@repo/core';
import { useNavigation } from '@react-navigation/native';
import CreateSchoolModal from './CreateSchoolModal';

interface NoSchoolOnboardingProps {
    userId: string;
    profileCompleted: boolean;
    onRefresh: () => void;
}

export default function NoSchoolOnboarding({ userId, profileCompleted, onRefresh }: NoSchoolOnboardingProps) {
    const colors = useThemedColors();
    const { showToast } = useLotusToast();
    const { role } = useUserRole();
    const navigation = useNavigation<any>();
    const [step, setStep] = useState<'profile' | 'choice' | 'search' | 'scan' | 'pending'>(profileCompleted ? 'choice' : 'profile');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Profile State
    const [fullName, setFullName] = useState('');
    const [roleLabel, setRoleLabel] = useState('');
    const [indexNumber, setIndexNumber] = useState('');
    const [nicNumber, setNicNumber] = useState('');

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<School[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (val: string) => {
        setSearchQuery(val);
        if (val.length < 3) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const results = await schoolAPI.searchSchools(val);
            setSearchResults(results);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleRequestJoin = async (schoolId: string) => {
        setLoading(true);
        try {
            await onboardingAPI.requestSchoolJoin(userId, schoolId, role as UserRole);
            hapticLight();
            showToast({ message: "Your request has been sent to the Sanctuary Principal.", type: 'sanctuary' });
            setStep('pending');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteProfile = async () => {
        if (!fullName || !roleLabel) return;
        if (role === 'student' && !indexNumber) return;
        if (role === 'teacher' && !nicNumber) return;

        setLoading(true);
        try {
            await onboardingAPI.completeProfile(userId, fullName, roleLabel, undefined, indexNumber, nicNumber);
            hapticLight();
            setStep('choice');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (step === 'profile') {
        return (
            <VStack sx={{ flex: 1, padding: Theme.spacing.xl, justifyContent: 'center', gap: Theme.spacing.lg }}>
                <VStack sx={{ alignItems: 'center', gap: Theme.spacing.md }}>
                    <Box sx={{ padding: 20, borderRadius: 100, backgroundColor: Theme.colors.sanctuarySaffron + '20' }}>
                        <User size={48} color={Theme.colors.sanctuarySaffron} />
                    </Box>
                    <Heading sx={{ textAlign: 'center' }}>Complete Your Sanctuary Profile</Heading>
                    <Text sx={{ textAlign: 'center', color: colors.textSecondary }}>Tell us who you are before entering the school.</Text>
                </VStack>

                <VStack sx={{ gap: Theme.spacing.md }}>
                    {/* Placeholder for Input components which should be exported from @repo/ui */}
                    <Text sx={{ fontWeight: '600' }}>Full Name</Text>
                    <Button
                        label={fullName || "Tap to enter name"}
                        onPress={() => setFullName("Naween")} // Mocking for now, need a real input
                        variant="secondary"
                    />

                    <Text sx={{ fontWeight: '600' }}>Role Description (e.g. Physics Teacher)</Text>
                    <Button
                        label={roleLabel || "Tap to enter role"}
                        onPress={() => setRoleLabel("Science Teacher")} // Mocking
                        variant="secondary"
                    />

                    {role === 'student' && (
                        <VStack sx={{ gap: Theme.spacing.xs }}>
                            <Text sx={{ fontWeight: '600' }}>Index Number</Text>
                            <Button
                                label={indexNumber || "Tap to enter Index ID"}
                                onPress={() => setIndexNumber("STU-001")} // Mocking
                                variant="secondary"
                            />
                        </VStack>
                    )}

                    {role === 'teacher' && (
                        <VStack sx={{ gap: Theme.spacing.xs }}>
                            <Text sx={{ fontWeight: '600' }}>NIC Number</Text>
                            <Button
                                label={nicNumber || "Tap to enter NIC"}
                                onPress={() => setNicNumber("199012345678")} // Mocking
                                variant="secondary"
                            />
                        </VStack>
                    )}
                </VStack>

                <Button
                    label="Complete Setup"
                    onPress={handleCompleteProfile}
                    disabled={!fullName || !roleLabel || (role === 'student' && !indexNumber) || (role === 'teacher' && !nicNumber)}
                />
            </VStack>
        );
    }

    if (step === 'search') {
        return (
            <VStack sx={{ flex: 1, padding: Theme.spacing.lg, gap: Theme.spacing.lg }}>
                <HStack sx={{ alignItems: 'center', gap: Theme.spacing.md }}>
                    <Pressable onPress={() => setStep('choice')}>
                        <ArrowLeft size={24} color={colors.textPrimary} />
                    </Pressable>
                    <Heading>Search Schools</Heading>
                </HStack>

                <VStack sx={{ gap: Theme.spacing.md }}>
                    <Button
                        label={searchQuery || "Type school name..."}
                        onPress={() => handleSearch("Wisdom")} // Mocking interaction for now
                        variant="secondary"
                        icon={Search}
                    />
                </VStack>

                <VStack sx={{ flex: 1, gap: Theme.spacing.md }}>
                    {isSearching ? (
                        <SkeletonCard height={80} />
                    ) : searchResults.length > 0 ? (
                        searchResults.map(school => (
                            <Pressable
                                key={school.id}
                                onPress={() => handleRequestJoin(school.id)}
                                sx={{
                                    padding: Theme.spacing.md,
                                    borderRadius: Theme.corners.comfortable,
                                    backgroundColor: colors.tertiary,
                                    borderWidth: 1,
                                    borderColor: colors.border
                                }}
                            >
                                <HStack sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                                    <VStack>
                                        <Text sx={{ fontWeight: '700', fontSize: Theme.typography.fontSize.md }}>{school.name}</Text>
                                        <Text sx={{ fontSize: Theme.typography.fontSize.xs, color: colors.textSecondary }}>{school.type.toUpperCase()} Sanctuary</Text>
                                    </VStack>
                                    <Text sx={{ color: Theme.colors.sanctuarySaffron, fontWeight: '600' }}>Request Join</Text>
                                </HStack>
                            </Pressable>
                        ))
                    ) : searchQuery.length >= 3 && (
                        <Text sx={{ textAlign: 'center', color: colors.textSecondary }}>No schools found matching "{searchQuery}"</Text>
                    )}
                </VStack>
                <LoadingOverlay visible={loading} />
            </VStack>
        );
    }

    if (step === 'pending') {
        return (
            <VStack sx={{ flex: 1, padding: Theme.spacing.xl, justifyContent: 'center', alignItems: 'center', gap: Theme.spacing.xl }}>
                <Box sx={{ p: 20, borderRadius: 100, backgroundColor: '#10B98120' }}>
                    <CheckCircle size={64} color="#10B981" />
                </Box>
                <VStack sx={{ alignItems: 'center', gap: Theme.spacing.md }}>
                    <Heading sx={{ textAlign: 'center' }}>Request Sent!</Heading>
                    <Text sx={{ textAlign: 'center', color: colors.textSecondary }}>
                        Your join request has been sent to the Principal. You will be notified once they verify your sanctuary profile.
                    </Text>
                </VStack>
                <Button label="Got it" onPress={onRefresh} variant="secondary" />
            </VStack>
        );
    }

    return (
        <VStack sx={{ flex: 1, padding: Theme.spacing.xl, justifyContent: 'center', gap: Theme.spacing.xl }}>
            <VStack sx={{ alignItems: 'center', gap: Theme.spacing.md }}>
                <Box sx={{ padding: 20, borderRadius: 100, backgroundColor: colors.tertiary }}>
                    <SchoolIcon size={48} color={colors.textSecondary} />
                </Box>
                <Heading sx={{ textAlign: 'center' }}>Welcome to the Sanctuary Hive</Heading>
                <Text sx={{ textAlign: 'center', color: colors.textSecondary }}>
                    You are not currently affiliated with a school. Scan a QR code or search to join.
                </Text>
            </VStack>

            <VStack sx={{ gap: Theme.spacing.md }}>
                <Button
                    label="Scan School QR Code"
                    icon={QrCode}
                    onPress={() => { hapticLight(); setStep('scan'); }}
                />
                <Button
                    label="Search for School"
                    icon={Search}
                    variant="secondary"
                    onPress={() => { hapticLight(); setStep('search'); }}
                />
                
                {role === 'principal' && (
                    <Box sx={{ marginTop: Theme.spacing.md, paddingTop: Theme.spacing.md, borderTopWidth: 1, borderColor: colors.border }}>
                        <Text sx={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginBottom: Theme.spacing.sm }}>
                            Or establish your own institution
                        </Text>
                        <Button
                            label="Create New Sanctuary"
                            variant="outline"
                            onPress={() => {
                                hapticLight();
                                setIsCreateModalOpen(true);
                            }}
                        />
                    </Box>
                )}
            </VStack>

            <CreateSchoolModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    onRefresh();
                }}
            />

            <LoadingOverlay visible={loading} />
        </VStack>
    );
}
