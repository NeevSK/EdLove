import React from 'react';
import { VStack, SanctuaryInput } from '@repo/ui';
import { School, Mail, Phone, Globe } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface StepBasicInfoProps {
    data: {
        name: string;
        handle: string;
        contactEmail: string;
        contactPhone: string;
        website?: string;
    };
    onUpdate: (info: Partial<StepBasicInfoProps['data']>) => void;
}

export default function StepBasicInfo({ data, onUpdate }: StepBasicInfoProps) {
    const { t } = useTranslation();
    return (
        <VStack sx={{ gap: '$lg' as any }}>
            <SanctuaryInput
                label={t('schoolSetup.schoolName')}
                placeholder={t('schoolSetup.schoolNamePlaceholder')}
                value={data.name}
                onChangeText={(text) => onUpdate({ name: text })}
                leftIcon={School}
            />
            <SanctuaryInput
                label="School Handle (@)"
                placeholder="Unique identifier (e.g. royal-college)"
                value={data.handle}
                onChangeText={(text) => onUpdate({ handle: text.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                helperText="This will be part of your school's unique QR link."
                leftIcon={Globe}
            />
            <SanctuaryInput
                label={t('schoolSetup.contactEmail')}
                placeholder={t('schoolSetup.contactEmailPlaceholder')}
                value={data.contactEmail}
                onChangeText={(text) => onUpdate({ contactEmail: text })}
                leftIcon={Mail}
            />
            <SanctuaryInput
                label={t('schoolSetup.contactPhone')}
                placeholder={t('schoolSetup.contactPhonePlaceholder')}
                value={data.contactPhone}
                onChangeText={(text) => onUpdate({ contactPhone: text })}
                leftIcon={Phone}
            />
            <SanctuaryInput
                label={t('schoolSetup.website')}
                placeholder={t('schoolSetup.websitePlaceholder')}
                value={data.website || ''}
                onChangeText={(text) => onUpdate({ website: text })}
                leftIcon={Globe}
            />
        </VStack>
    );
}
