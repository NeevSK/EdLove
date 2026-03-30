/**
 * ONBOARDING SCREEN - Web Edition
 * 
 * \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
 * \u2502  LEFT PANEL (desktop)\u2502  RIGHT PANEL (always)       \u2502
 * \u2502  Branding + pillars  \u2502  Current step content       \u2502
 * \u2502  Step progress tracker\u2502  Input / Role / Tour / Auth \u2502
 * \u2502  Language selector   \u2502  Primary/Back actions       \u2502
 * \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518
 * 
 * Flow:
 * 0. Name Entry
 * Narrow (< 900px): single-column scroll with compact header.
 * Same API as native: onComplete(name, role, wantsAccount?) and isAnonymous.
 * Roles: teacher \u00B7 student \u00B7 principal (NOT founder / admin / developer).
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthorityTier, identityAPI, authAPI, supabase } from '@repo/core';

import { hapticLight, hapticSuccess, hapticError } from '../utils/haptics';
// Using direct i18n calls for language switching on web.

// \u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC
// Constants
// \u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC
const LANGUAGES = [
    { code: 'en', label: 'EN' },
    { code: 'si', label: '\u0DC3\u0DD2\u0D82' },
    { code: 'ta', label: '\u0BA4\u0BAE\u00BF\u0BB4\u0BCD' },
];

const PILLARS = [
    { name: 'Self', emoji: '\uD83E\uDDD8' },
    { name: 'Classroom', emoji: '\uD83C\uDFEB' },
    { name: 'Community', emoji: '\uD83E\uDD1D' },
    { name: 'Library', emoji: '\uD83D\uDCDA' },
    { name: 'Profile', emoji: '\uD83D\uDC64' },
];

const ROLES = [
    { value: 'teacher', emoji: '\uD83E\uDDD1\u200D\uD83C\uDFEB', descKey: 'onboarding.roleDesc.teacher' },
    { value: 'student', emoji: '\uD83C\uDF93', descKey: 'onboarding.roleDesc.student' },
    { value: 'principal', emoji: '\uD83C\uDFEB', descKey: 'onboarding.roleDesc.principal' },
];

const TOTAL_STEPS = 7; // 0: Name, 1: Role, 2-6: Tour

// Visible steps for the left-panel progress tracker
const TRACKED_STEPS = [
    { idx: 0, label: 'Name' },
    { idx: 1, label: 'Role' },
    { idx: 2, label: 'Tour' },
] as const;

// \u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC
// Props
// \u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC
interface OnboardingScreenProps {
    onComplete: (name: string, authority: AuthorityTier, wantsAccount?: boolean) => void;
    isAnonymous?: boolean;
}

// \u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC
// Main Component
// \u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC
export default function OnboardingScreenWeb({ onComplete, isAnonymous = false }: OnboardingScreenProps) {
    const { t, i18n } = useTranslation();
    const { width } = useWindowDimensions();

    const [currentStep, setCurrentStep] = useState(0);
    const [name, setName] = useState('');
    const [authority, setAuthority] = useState<AuthorityTier>('teacher');
    const [isCompleting, setIsCompleting] = useState(false);
    const [completionError, setCompletionError] = useState<string | null>(null);

    const isNarrow = width < 900;

    // \u00E2\u201D\u20AC\u00E2\u201D\u20AC Restore saved progress or pre-fill from existing auth \u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC
    useEffect(() => {
        const initOnboarding = async () => {
            try {
                const internalId = await identityAPI.getMyInternalId();
                try {
                    const saved = await AsyncStorage.getItem('onboarding_progress');
                    if (saved) {
                        const progress = JSON.parse(saved);
                        if (progress.userId === internalId || !progress.userId || isAnonymous) {
                            if (progress.name) setName(progress.name);
                            if (progress.role) setAuthority(progress.role as AuthorityTier);
                            if (typeof progress.step === 'number' && progress.step >= 0 && progress.step < 7) {
                                setCurrentStep(progress.step);
                                return;
                            }
                        }
                    }
                } catch (e) {
                    console.warn('[Onboarding] Failed to restore progress from storage:', e);
                }

                if (!internalId) {
                    // This is likely a deep-link where the session wasn't initialized yet.
                    // We trigger an anonymous sign-in here to ensure the wizard has an ID.
                    console.log('\uD83D\u00A7\u00AD OnboardingScreen.web: No internalId found, initiating anonymous session...');
                    await authAPI.signInAnonymously();
                    // Re-run the initialization once signed in
                    return initOnboarding();
                }
                const { data: profile } = await supabase
                    .from('users')
                    .select('full_name, is_anonymous, authority:role')
                    .eq('id', internalId)
                    .maybeSingle();
                
                if (!profile) return;

                const PLACEHOLDER_NAMES = ['Guest User', 'Gurudevi User', 'Sanctuary User'];
                if (!profile.is_anonymous && profile.full_name && !PLACEHOLDER_NAMES.includes(profile.full_name)) {
                    setName(profile.full_name);
                    if (profile.authority) setAuthority(profile.authority as AuthorityTier);
                    setCurrentStep(1);
                }
            } catch (error) {
                console.error('[Onboarding] Initialization error:', error);
            }
        };
        initOnboarding();
    }, [isAnonymous]);

    // \u00E2\u201D\u20AC\u00E2\u201D\u20AC Tour content \u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC
    const tourScreens = useMemo(() => [
        {
            emoji: '\uD83E\uDEB7',
            title: t('onboarding.philosophyTitle'),
            subtitle: t('onboarding.philosophySubtitle'),
            content: t('onboarding.philosophyContent'),
        },
        {
            emoji: '\uD83C\uDFEB',
            title: t('onboarding.sectionsTitle'),
            subtitle: t('onboarding.sectionsSubtitle'),
            content: t('onboarding.sectionsContent'),
        },
        {
            emoji: '\uD83C\uDF31',
            title: t('onboarding.ecologyTitle'),
            subtitle: t('onboarding.ecologySubtitle'),
            content: t('onboarding.ecologyContent'),
        },
        {
            emoji: '\uD83D\uDD12',
            title: t('onboarding.privacyTitle'),
            subtitle: t('onboarding.privacySubtitle'),
            content: t('onboarding.privacyContent'),
        },
        {
            emoji: '\uD83E\uDDED',
            title: t('onboarding.navigationTitle'),
            subtitle: t('onboarding.navigationSubtitle'),
            content: t('onboarding.navigationContent'),
        },
    ], [t]);

    // \u00E2\u201D\u20AC\u00E2\u201D\u20AC Navigation helpers \u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC
    const handleNext = () => {
        if (currentStep === 6) { // Final step (Tour 4)
            handleCompleteOnboarding();
        } else {
            setCurrentStep(prev => prev + 1);
            hapticLight();
        }
    };
    const handleBack = () => { hapticLight(); setCurrentStep(prev => Math.max(0, prev - 1)); };
    const handleSkipTour = () => { hapticLight(); handleCompleteOnboarding(); };

    // Save progress whenever step/name/role/seeds change
    useEffect(() => {
        if (currentStep === 0 && !name) return;
        identityAPI.getMyInternalId().then((userId) => {
            AsyncStorage.setItem('onboarding_progress', JSON.stringify({
                userId, step: currentStep, name, authority,
            })).catch(() => {/* silent */ });
        });
    }, [currentStep, name, authority]);

    const changeLanguage = async (code: string) => {
        hapticLight();
        await i18n.changeLanguage(code);
    };

    // \u00E2\u201D\u20AC\u00E2\u201D\u20AC Complete onboarding \u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC
    const handleCompleteOnboarding = async () => {
        console.log('\uD83E\uDEB7 OnboardingScreen.web: handleCompleteOnboarding started...', { name, authority, isAnonymous });
        setIsCompleting(true);
        try {
            const internalId = await identityAPI.getMyInternalId();
            console.log('\uD83D\u00AA\u00B7 [Onboarding] Resolved internalId:', internalId);
            
            if (!internalId) {
                console.error('[OnboardingScreen.web] No internal user ID \u2014 anonymous session may not have been created yet.');
                throw new Error('Failed to resolve internal user ID during onboarding completion');
            }

            // Verify if profile already exists
            const { data: existingProfile, error: fetchError } = await supabase
                .from('users')
                .select('school_id, onboarding_completed')
                .eq('id', internalId)
                .maybeSingle();

            if (fetchError) {
                console.warn('\uD83D\u00AA\u00B7 [Onboarding] Error fetching existing profile:', fetchError);
            }

            console.log('\uD83D\u00AA\u00B7 [Onboarding] Existing profile state:', existingProfile);

            let schoolId = existingProfile?.school_id;
            if (!schoolId) {
                console.log('\uD83C\uDF00 [Onboarding] No existing workspace found, attempting creation...');
                const schoolName = `${name || 'My'}'s Workspace`;
                
                // Note: The schools table currently has a broken trigger referencing 
                // "create_personal_workspace_unified()". We wrap this in a try/catch-style 
                // logic to ensure onboarding completes even if workspace creation fails.
                const { data: schoolData, error: schoolError } = await supabase
                    .from('schools')
                    .insert({ 
                        name: schoolName, 
                        type: 'personal_workspace', 
                        created_by: internalId 
                    })
                    .select()
                    .single();
                
                if (schoolError) {
                    console.warn('\u26A0\uFE0F [Onboarding] Workspace creation failed (likely broken DB trigger):', schoolError.message);
                    // We continue with schoolId = null. The app will render the "Guest Gate" 
                    // (Join/Create Workspace) as a fallback, which is a stable state.
                } else {
                    schoolId = schoolData?.id;
                    console.log('\u2705 [Onboarding] Personal workspace created:', schoolId);
                }
            }

            console.log('\uD83D\u00AA\u00B7 [Onboarding] Finalizing profile update...');
            const { error: profileError } = await supabase
                .from('users')
                .upsert({
                    id: internalId,
                    full_name: name || 'Gurudevi User',
                    role: authority,
                    school_id: schoolId,
                    onboarding_completed: true,
                    onboarding_completed_at: new Date().toISOString(),
                    is_anonymous: isAnonymous,
                });

            if (profileError) {
                console.error('\uD83D\u00AA\u00B7 [Onboarding] Profile update failed:', profileError);
                throw profileError;
            }

            console.log('\uD83D\u00AA\u00B7 [Onboarding] Profile updated successfully. Cleaning up storage...');
            await AsyncStorage.removeItem('onboarding_progress');
            
            hapticSuccess();
            console.log('\uD83D\u00AA\u00B7 [Onboarding] Calling onComplete callback...');
            
            // Artificial delay to ensure DB replication / state synchronization
            await new Promise(resolve => setTimeout(resolve, 300));
            
            onComplete(name, authority, false);
            console.log('\uD83D\u00AA\u00B7 [Onboarding] onComplete called successfully.');
        } catch (error: any) {
            console.error('\u00E2\u009D\u0152 Error completing onboarding:', error);
            hapticError();
            setIsCompleting(false);
            setCompletionError(error?.message || 'Failed to save your profile. Please try again.');
        }
    };

    const renderError = () => {
        if (!completionError) return null;
        return (
            <div className="ob-error-banner">
                <span className="ob-error-icon">\u00E2\u0161 \u00EF\u00B8 </span
                ><span className="ob-error-text">{completionError}</span
            ></div
        );
    };


    // \u00E2\u201D\u20AC\u00E2\u201D\u20AC Step content renderer \u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC
    const renderStep = () => {
        // Step 0: Name
        if (currentStep === 0) {
            return (
                <div className="ob-step">
                    <div className="ob-step-shell">
                        <div className="ob-step-meta">Step 1 \u00C2\u00B7 Arrival</div
                        ><div className="ob-step-icon">\uD83D\u2018\u2039</div
                    ></div
                    ><h2 className="ob-step-title"
                        {t('onboarding.nameTitle')}>
                    </h2>
                    <p className="ob-step-subtitle">
                        {t('onboarding.nameSubtitle')}>
                    </p>
                    {renderError()}
                    <input>
                        className="ob-input"
                        type="text"
                        placeholder={t('onboarding.namePlaceholder')}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) handleNext(); }}
                        autoFocus
                        autoComplete="given-name"
                    /
                    ><div className="ob-actions"
                        <button>
                            className="ob-btn-primary"
                            onClick={handleNext}
                            disabled={!name.trim()}>
                        
                            {t('onboarding.continue')} \u00E2\u2020\u2019
                        </button>
                    </div>
                </div>
            );
        }

        // Step 1: Role
        if (currentStep === 1) {
            return (
                <div className="ob-step">
                    <div className="ob-step-shell">
                        <div className="ob-step-meta">Step 2 \u00C2\u00B7 Belonging</div
                        ><div className="ob-step-icon">\uD83D\u017D\u00AF</div
                    ></div
                    ><h2 className="ob-step-title"
                        {t('onboarding.roleTitle')}>
                    </h2>
                    <p className="ob-step-subtitle">
                        {t('onboarding.roleSubtitle')}>
                    </p>
                    {renderError()}
                    <div className="ob-role-grid">
                        {ROLES.map((r) => (
                            <button>
                                key={r.value}
                                className={`ob-role-card ${authority === r.value ? 'selected' : ''}`}
                                onClick={() => { setAuthority(r.value as AuthorityTier); hapticLight(); }}
                            
                                <span className="ob-role-emoji">{r.emoji}</span
                                ><span className="ob-role-name">{t(`authority.${r.value}`)}</span
                                ><span className="ob-role-desc">{t(r.descKey)}</span
                            ></button
                        ))}
                    </div>
                    <div className="ob-actions">
                        <button className="ob-btn-secondary" onClick={handleBack}
                            \u00E2\u2020\u0090 {t('onboarding.back')}>
                        </button>
                        <button>
                            className="ob-btn-primary"
                            onClick={async () => {
                                if (!isAnonymous && authority) {
                                    // If already signed in (Google), jump straight to finish after picking role
                                    handleCompleteOnboarding();
                                } else {
                                    handleNext();
                                }
                            }}
                            disabled={isCompleting}
                        
                            {(isCompleting) ? t('onboarding.saving') : (!isAnonymous && authority) ? t('onboarding.complete') : t('onboarding.continue')} \u00E2\u2020\u2019
                        </button>
                    </div>
                </div>
            );
        }


        // Steps 2\u20136: Tour slides
        if (currentStep >= 2 && currentStep <= 6) {
            const screen = tourScreens[currentStep - 2];
            if (!screen) return null;
            return (
                <div className="ob-step">
                    <div className="ob-step-shell">
                        <div className="ob-step-meta">Sanctuary Tour</div
                        ><div className="ob-step-icon">{screen.emoji}</div
                    ></div
                    ><h2 className="ob-step-title">{screen.title}</h2
                    ><p className="ob-step-subtitle">{screen.subtitle}</p
                    >{renderError()}
                    <div className="ob-tour-content">{screen.content}</div
                    ><div className="ob-actions"
                        <button className="ob-btn-secondary" onClick={handleBack}
                            \u00E2\u2020\u0090 {t('onboarding.back')}>
                        </button>
                        <button >
                            className="ob-btn-primary" 
                            onClick={handleNext}
                            disabled={isCompleting}>
                        
                            {isCompleting ? t('onboarding.saving') : currentStep === 6 ? t('onboarding.complete') : t('onboarding.next')} \u00E2\u2020\u2019
                        </button>
                    </div>
                    <button className="ob-btn-link" onClick={handleSkipTour}>
                        {t('onboarding.skip')}>
                    </button>
                </div>
            );
        }

        return null;
    };

    // \u00E2\u201D\u20AC\u00E2\u201D\u20AC Layout \u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC
    return (
        <div className="ob-root">
            <div className="ob-atmosphere ob-atmosphere-one" /
            ><div className="ob-atmosphere ob-atmosphere-two" /
            >{isNarrow ? (
                /* \u00E2\u201D\u20AC\u00E2\u201D\u20AC Narrow: single-column scroll \u00E2\u201D\u20AC\u00E2\u201D\u20AC */
                <div className="ob-narrow">
                    <div className="ob-narrow-header">
                        <span className="ob-brand-name">\uD83E\uDEB7 Gurudevi</span
                        ><div className="ob-lang-row"
                            {LANGUAGES.map((lang) => (
                                <button>
                                    key={lang.code}
                                    className={`ob-lang-pill ${i18n.language?.startsWith(lang.code) ? 'active' : ''}`}
                                    onClick={() => changeLanguage(lang.code)}
                                
                                    {lang.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="ob-progress-track" role="progressbar" aria-valuenow={currentStep} aria-valuemax={TOTAL_STEPS - 1}>
                        <div className="ob-progress-fill" style={{ width: `${(currentStep / (TOTAL_STEPS - 1)) * 100}%` }} /
                    ></div

                    <div className="ob-narrow-content">
                        {renderStep()}>
                    </div>
                </div>
            ) : (
                /* \u00E2\u201D\u20AC\u00E2\u201D\u20AC Wide: two-column split \u00E2\u201D\u20AC\u00E2\u201D\u20AC */
                <div className="ob-split">
                    {/* Left: Branding + progress tracker */}
                    <div className="ob-left">
                        <div className="ob-left-inner">
                            <div className="ob-brand">
                                <span className="ob-brand-icon">\uD83E\uDEB7</span
                                ><span className="ob-brand-name">Gurudevi</span
                            ></div

                            ><div
                                <h1 >className="ob-left-headline">Your Sacred<br />Sanctuary</h1
                                ><p className="ob-left-tagline"
                                    A healing ecosystem for educators \u2014 built in Sri Lanka, breathing worldwide.>
                                </p>
                            </div>

                            {/* Five Pillars */}
                            <div className="ob-pillars">
                                {PILLARS.map((p) => (
                                    <div key={p.name} className="ob-pillar">
                                        <span>{p.emoji}</span
                                        ><span>{p.name}</span
                                    ></div
                                ))}
                            </div>

                            {/* Step progress tracker */}
                            <div className="ob-tracker">
                                {TRACKED_STEPS.map((s) => (
                                    <div>
                                        key={s.idx}
                                        className={`ob-tracker-row ${currentStep > s.idx ? 'done' : ''} ${currentStep === s.idx ? 'current' : ''}`}
                                    
                                        <div className="ob-tracker-dot" /
                                        ><span className="ob-tracker-label">{s.label}</span
                                    ></div
                                ))}
                            </div>

                            {/* Language picker */}
                            <div className="ob-lang-row ob-lang-bottom">
                                {LANGUAGES.map((lang) => (
                                    <button>
                                        key={lang.code}
                                        className={`ob-lang-pill ${i18n.language?.startsWith(lang.code) ? 'active' : ''}`}
                                        onClick={() => changeLanguage(lang.code)}
                                    
                                        {lang.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Step content */}
                    <div className="ob-right">
                        <div className="ob-right-inner">
                            {/* Step progress dots */}
                            <div className="ob-dots" role="progressbar" aria-valuenow={currentStep} aria-valuemax={TOTAL_STEPS - 1}>
                                {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                                    <div>
                                        key={i}
                                        className={`ob-dot ${i === currentStep ? 'active' : i < currentStep ? 'done' : ''}`}
                                    /
                                >))}
                            </div>

                            {renderStep()}
                        </div>
                    </div>
                </div>
            )}

            {/* \u00E2\u201D\u20AC\u00E2\u201D\u20AC Scoped CSS \u00E2\u201D\u20AC\u00E2\u201D\u20AC */}
            <style>{`
                .ob-root {
                    position: fixed;
                    inset: 0;
                    background:
                        radial-gradient(circle at 18% 14%, rgba(125, 212, 192, 0.14), transparent 24%),
                        radial-gradient(circle at 88% 22%, rgba(184, 169, 224, 0.14), transparent 22%),
                        linear-gradient(160deg, var(--background, #F5EDD6) 0%, var(--background-alt, #FAF7ED) 60%, rgba(252, 249, 242, 0.96) 100%);
                    font-family: var(--font-body, 'DM Sans', sans-serif);
                    overflow: hidden;
                }
                .ob-atmosphere {
                    position: absolute;
                    border-radius: 999px;
                    pointer-events: none;
                    filter: blur(14px);
                    opacity: 0.55;
                }
                .ob-atmosphere-one {
                    top: -80px;
                    right: 18%;
                    width: 220px;
                    height: 220px;
                    background: radial-gradient(circle, rgba(212,132,58,0.18), transparent 70%);
                }
                .ob-atmosphere-two {
                    bottom: -70px;
                    left: 8%;
                    width: 260px;
                    height: 260px;
                    background: radial-gradient(circle, rgba(125,212,192,0.2), transparent 70%);
                }

                /* \u00E2\u201D\u20AC\u00E2\u201D\u20AC NARROW (single-column) \u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC */
                .ob-narrow {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    position: relative;
                    z-index: 1;
                }
                .ob-narrow-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 14px 20px;
                    border-bottom: 1px solid var(--border, rgba(42,35,24,0.1));
                    flex-shrink: 0;
                }
                .ob-progress-track {
                    height: 3px;
                    background: var(--border, rgba(42,35,24,0.1));
                    flex-shrink: 0;
                }
                .ob-progress-fill {
                    height: 100%;
                    background: var(--action, #D4843A);
                    transition: width 0.4s ease;
                    border-radius: 0 2px 2px 0;
                }
                .ob-narrow-content {
                    flex: 1;
                    padding: 28px 20px;
                    overflow-y: auto;
                }

                /* \u00E2\u201D\u20AC\u00E2\u201D\u20AC SPLIT (two-column) \u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC\u00E2\u201D\u20AC */
                .ob-split {
                    display: flex;
                    height: 100%;
                    position: relative;
                    z-index: 1;
                }

                /* Left Panel */
                .ob-left {
                    width: 340px;
                    flex-shrink: 0;
                    background: linear-gradient(160deg, rgba(252,249,242,0.72) 0%, rgba(252,249,242,0.5) 100%);
                    border-right: 1px solid var(--border, rgba(42,35,24,0.08));
                    overflow-y: auto;
                    padding: 44px 36px;
                    backdrop-filter: blur(18px);
                }
                .ob-left-inner {
                    display: flex;
                    flex-direction: column;
                    gap: 32px;
                    min-height: 100%;
                }
                .ob-brand {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .ob-brand-icon { font-size: 22px; }
                .ob-brand-name {
                    font-size: 18px;
                    font-weight: 800;
                    color: var(--ink, #2A2318);
                    letter-spacing: -0.3px;
                }
                .ob-left-headline {
                    font-size: 40px;
                    font-weight: 800;
                    color: var(--ink, #2A2318);
                    line-height: 1.1;
                    letter-spacing: -1.5px;
                    margin: 0 0 12px;
                }
                .ob-left-tagline {
                    font-size: 14px;
                    line-height: 1.6;
                    color: var(--ink-ghost, #7A6E5F);
                    margin: 0;
                    max-width: 240px;
                }

                /* Pillars */
                .ob-pillars {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                .ob-pillar {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 5px 11px;
                    border-radius: 50px;
                    background: rgba(212,132,58,0.08);
                    border: 1px solid rgba(212,132,58,0.2);
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--action, #D4843A);
                }

                /* Step tracker */
                .ob-tracker {
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }
                .ob-tracker-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    opacity: 0.35;
                    transition: opacity 0.3s;
                }
                .ob-tracker-row.done { opacity: 0.55; }
                .ob-tracker-row.current { opacity: 1; }
                .ob-tracker-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: var(--border, rgba(42,35,24,0.2));
                    flex-shrink: 0;
                    transition: background 0.3s, transform 0.3s;
                }
                .ob-tracker-row.done .ob-tracker-dot,
                .ob-tracker-row.current .ob-tracker-dot {
                    background: var(--action, #D4843A);
                }
                .ob-tracker-row.current .ob-tracker-dot {
                    transform: scale(1.6);
                }
                .ob-tracker-label {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--ink, #2A2318);
                }
                .ob-lang-bottom { margin-top: auto; }

                /* Right Panel */
                .ob-right {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow-y: auto;
                    padding: 40px;
                }
                .ob-right-inner {
                    width: 100%;
                    max-width: 560px;
                    display: flex;
                    flex-direction: column;
                    gap: 28px;
                    padding: 34px;
                    border-radius: 32px;
                    background: linear-gradient(180deg, rgba(252,249,242,0.8), rgba(252,249,242,0.6));
                    border: 1px solid rgba(42,35,24,0.08);
                    box-shadow: 0 28px 72px rgba(121, 93, 48, 0.12);
                    backdrop-filter: blur(18px);
                }

                /* Progress dots */
                .ob-dots {
                    display: flex;
                    gap: 6px;
                    align-items: center;
                }
                .ob-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: var(--border, rgba(42,35,24,0.2));
                    transition: all 0.3s ease;
                    flex-shrink: 0;
                }
                .ob-dot.active { background: var(--action, #D4843A); transform: scale(1.3); }
                .ob-dot.done { background: var(--success, #7DD4C0); }

                .ob-error-banner {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 14px;
                    background: rgba(212, 110, 58, 0.1);
                    border-left: 3px solid #D46E3A;
                    border-radius: 4px;
                    margin-bottom: 20px;
                    animation: slideDown 0.3s ease;
                }
                .ob-error-icon { font-size: 16px; }
                .ob-error-text { font-size: 13px; color: #D46E3A; font-weight: 600; }

                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* \u2500\u2500 RESPONSIVE BITS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
                .ob-step {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .ob-step-shell {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                }
                .ob-step-meta {
                    width: fit-content;
                    padding: 8px 12px;
                    border-radius: 999px;
                    background: rgba(212,132,58,0.08);
                    border: 1px solid rgba(212,132,58,0.18);
                    color: var(--action, #D4843A);
                    font-size: 11px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.12em;
                }
                .ob-step-icon {
                    font-size: 40px;
                    line-height: 1;
                }
                .ob-step-title {
                    font-size: 27px;
                    font-weight: 800;
                    color: var(--ink, #2A2318);
                    margin: 0;
                    letter-spacing: -0.5px;
                    line-height: 1.2;
                }
                .ob-step-subtitle {
                    font-size: 15px;
                    color: var(--ink-ghost, #7A6E5F);
                    margin: 0;
                    line-height: 1.5;
                }
                .ob-tour-content {
                    font-size: 15px;
                    color: var(--ink, #2A2318);
                    line-height: 1.7;
                    padding: 22px;
                    background: linear-gradient(180deg, rgba(252,249,242,0.62), rgba(252,249,242,0.42));
                    border-radius: 22px;
                    border: 1px solid var(--border, rgba(42,35,24,0.08));
                }

                /* Name input */
                .ob-input {
                    width: 100%;
                    padding: 17px 18px;
                    border-radius: 18px;
                    border: 1px solid var(--border, rgba(42,35,24,0.15));
                    background: rgba(255,255,255,0.58);
                    font-size: 16px;
                    color: var(--ink, #2A2318);
                    font-family: var(--font-body, 'DM Sans', sans-serif);
                    outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s;
                    box-sizing: border-box;
                }
                .ob-input:focus {
                    border-color: var(--action, #D4843A);
                    box-shadow: 0 0 0 3px rgba(212,132,58,0.12);
                }
                .ob-input::placeholder { color: var(--ink-ghost, #7A6E5F); }

                /* Role grid */
                .ob-role-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                }
                @media (max-width: 420px) {
                    .ob-role-grid { grid-template-columns: 1fr; }
                }
                .ob-role-card {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    padding: 22px 14px;
                    border-radius: 22px;
                    border: 1px solid var(--border, rgba(42,35,24,0.1));
                    background: linear-gradient(180deg, rgba(252,249,242,0.66), rgba(252,249,242,0.5));
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-family: var(--font-body, 'DM Sans', sans-serif);
                    text-align: center;
                }
                .ob-role-card:hover {
                    border-color: rgba(212,132,58,0.5);
                    background: rgba(212,132,58,0.04);
                    transform: translateY(-2px);
                }
                .ob-role-card.selected {
                    border-color: var(--action, #D4843A);
                    background: rgba(212,132,58,0.08);
                    box-shadow: 0 14px 28px rgba(212,132,58,0.14);
                }
                .ob-role-emoji { font-size: 26px; line-height: 1; }
                .ob-role-name {
                    font-size: 13px;
                    font-weight: 700;
                    color: var(--ink, #2A2318);
                }
                .ob-role-desc {
                    font-size: 10px;
                    color: var(--ink-ghost, #7A6E5F);
                    line-height: 1.4;
                }

                /* Actions row */
                .ob-actions {
                    display: flex;
                    gap: 12px;
                    margin-top: 4px;
                    flex-wrap: wrap;
                }

                /* Buttons */
                .ob-btn-primary {
                    flex: 1;
                    padding: 15px 24px;
                    min-height: 50px;
                    border-radius: 16px;
                    background: linear-gradient(180deg, var(--action, #D4843A), var(--action-2, #C7742B));
                    color: var(--text-on-action, #FCF9F2);
                    font-size: 15px;
                    font-weight: 700;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-family: var(--font-body, 'DM Sans', sans-serif);
                    letter-spacing: 0.2px;
                }
                .ob-btn-primary:hover:not(:disabled) {
                    filter: brightness(1.06);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 14px rgba(212,132,58,0.28);
                }
                .ob-btn-primary:disabled {
                    opacity: 0.45;
                    cursor: not-allowed;
                }
                .ob-btn-secondary {
                    padding: 15px 22px;
                    min-height: 50px;
                    border-radius: 16px;
                    background: rgba(255,255,255,0.55);
                    color: var(--ink, #2A2318);
                    font-size: 15px;
                    font-weight: 600;
                    border: 1.5px solid var(--border, rgba(42,35,24,0.2));
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-family: var(--font-body, 'DM Sans', sans-serif);
                    white-space: nowrap;
                }
                .ob-btn-secondary:hover {
                    background: var(--glass-surface, rgba(255,255,255,0.6));
                    border-color: var(--ink-ghost, #7A6E5F);
                }
                .ob-btn-link {
                    background: none;
                    border: none;
                    color: var(--ink-ghost, #7A6E5F);
                    font-size: 13px;
                    cursor: pointer;
                    text-align: center;
                    font-family: var(--font-body, 'DM Sans', sans-serif);
                    padding: 4px 0;
                    text-decoration: none;
                    transition: color 0.2s;
                }
                .ob-btn-link:hover {
                    color: var(--ink, #2A2318);
                    text-decoration: underline;
                }

                /* Language pills */
                .ob-lang-row {
                    display: flex;
                    gap: 4px;
                }
                .ob-lang-pill {
                    padding: 6px 12px;
                    border-radius: 50px;
                    background: transparent;
                    border: 1px solid transparent;
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--ink-ghost, #7A6E5F);
                    cursor: pointer;
                    font-family: var(--font-body, 'DM Sans', sans-serif);
                    transition: all 0.2s;
                }
                .ob-lang-pill.active {
                    background: var(--action, #D4843A);
                    color: #F5EDD6;
                }
                .ob-lang-pill:hover:not(.active) {
                    background: var(--glass-surface, rgba(255,255,255,0.6));
                    border-color: var(--border, rgba(42,35,24,0.15));
                }

                /* Orientation step wrapper */
                .ob-step-orientation {
                    gap: 0;
                }
                @media (max-width: 900px) {
                    .ob-root {
                        overflow: auto;
                    }
                    .ob-right-inner {
                        padding: 24px;
                        border-radius: 24px;
                    }
                }
                @media (max-width: 640px) {
                    .ob-role-grid {
                        grid-template-columns: 1fr;
                    }
                    .ob-step-shell {
                        align-items: flex-start;
                        flex-direction: column;
                    }
                    .ob-narrow-header {
                        align-items: flex-start;
                        flex-direction: column;
                    }
                }
            `}</style
        ></div
    );
}
