import React from 'react';
import { StyleSheet } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    Pressable,
    Divider,
} from '@gluestack-ui/themed';
import { Globe, Moon, Database, ChevronRight, Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Theme } from '../../constants/Theme';
import { hapticLight, hapticSuccess } from '../../utils/haptics';

interface ControlScrollProps {
    currentLanguage: string;
    onLanguageChange: (lang: 'si' | 'ta' | 'en') => void;
}

export default function ControlScroll({ currentLanguage, onLanguageChange }: ControlScrollProps) {
    const { t } = useTranslation();

    const renderLanguageItem = (lang: 'si' | 'ta' | 'en', label: string) => {
        const isActive = currentLanguage === lang;
        return (
            <Pressable
                onPress={() => {
                    if (!isActive) {
                        hapticSuccess();
                        onLanguageChange(lang);
                    }
                }}
            >
                <Box
                    sx={{
                        paddingVertical: Theme.spacing.md,
                        paddingHorizontal: Theme.spacing.lg,
                        backgroundColor: isActive ? 'rgba(230, 126, 34, 0.1)' : 'transparent',
                        borderRadius: Theme.corners.comfortable,
                    }}
                >
                    <HStack justifyContent="space-between" alignItems="center">
                        <Text
                            color={isActive ? Theme.colors.sanctuarySaffron : Theme.colors.sacredWhite}
                            bold={isActive}
                        >
                            {label}
                        </Text>
                        {isActive && <Check size={18} color={Theme.colors.sanctuarySaffron} />}
                    </HStack>
                </Box>
            </Pressable>
        );
    };

    return (
        <VStack space="2xl" pb={100}>
            {/* Language Section */}
            <VStack space="sm">
                <Text color={Theme.colors.dimGray} size="xs" ml={Theme.spacing.md} textTransform="uppercase" bold>
                    {t('profile.language') || 'LANGUAGE'}
                </Text>

                <Box style={styles.sectionContainer}>
                    <HStack p={Theme.spacing.md} space="md" alignItems="center">
                        <Box style={styles.iconBox}>
                            <Globe size={20} color={Theme.colors.sanctuarySaffron} />
                        </Box>
                        <VStack>
                            <Text color={Theme.colors.sacredWhite} bold>
                                {t('profile.appLanguage') || 'App Language'}
                            </Text>
                            <Text color={Theme.colors.mistGray} size="xs">
                                Choose your preferred language
                            </Text>
                        </VStack>
                    </HStack>

                    <Divider bg={Theme.colors.deepIndigo} />

                    <Box p={Theme.spacing.xs}>
                        {renderLanguageItem('si', 'සිංහල')}
                        {renderLanguageItem('ta', 'தமிழ்')}
                        {renderLanguageItem('en', 'English')}
                    </Box>
                </Box>
            </VStack>

            {/* App Settings Section */}
            <VStack space="sm">
                <Text color={Theme.colors.dimGray} size="xs" ml={Theme.spacing.md} textTransform="uppercase" bold>
                    {t('profile.settings') || 'SETTINGS'}
                </Text>

                <Box style={styles.sectionContainer}>
                    {/* Theme (Placeholder) */}
                    <Pressable onPress={hapticLight}>
                        <HStack p={Theme.spacing.md} justifyContent="space-between" alignItems="center">
                            <HStack space="md" alignItems="center">
                                <Box style={[styles.iconBox, { backgroundColor: 'rgba(142, 68, 173, 0.1)' }]}>
                                    <Moon size={20} color="#9B59B6" />
                                </Box>
                                <VStack>
                                    <Text color={Theme.colors.sacredWhite}>Dark Mode</Text>
                                    <Text color={Theme.colors.dimGray} size="xs">System Default</Text>
                                </VStack>
                            </HStack>
                            <Box style={styles.comingSoonBadge}>
                                <Text color={Theme.colors.midnightBlue} size="2xs" bold>SOON</Text>
                            </Box>
                        </HStack>
                    </Pressable>

                    <Divider bg={Theme.colors.deepIndigo} ml={56} />

                    {/* Data Saver (Placeholder) */}
                    <Pressable onPress={hapticLight}>
                        <HStack p={Theme.spacing.md} justifyContent="space-between" alignItems="center">
                            <HStack space="md" alignItems="center">
                                <Box style={[styles.iconBox, { backgroundColor: 'rgba(46, 204, 113, 0.1)' }]}>
                                    <Database size={20} color="#2ECC71" />
                                </Box>
                                <VStack>
                                    <Text color={Theme.colors.sacredWhite}>Data Saver</Text>
                                    <Text color={Theme.colors.dimGray} size="xs">Reduce usage</Text>
                                </VStack>
                            </HStack>
                            <Box style={styles.comingSoonBadge}>
                                <Text color={Theme.colors.midnightBlue} size="2xs" bold>SOON</Text>
                            </Box>
                        </HStack>
                    </Pressable>
                </Box>
            </VStack>
        </VStack>
    );
}

const styles = StyleSheet.create({
    sectionContainer: {
        backgroundColor: Theme.colors.midnightBlue,
        borderRadius: Theme.corners.generous,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: 'rgba(230, 126, 34, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    comingSoonBadge: {
        backgroundColor: Theme.colors.stoneGray,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    }
});
