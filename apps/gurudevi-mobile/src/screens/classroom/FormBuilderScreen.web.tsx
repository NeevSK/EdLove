import React from 'react';
import { ScreenWrapper } from '@repo/ui';
import { FormBuilder } from '@repo/form-builder';

import { useTranslation } from 'react-i18next';

export default function FormBuilderScreen() {
    const { t } = useTranslation();

    return (
        <ScreenWrapper sx={{ flex: 1 }}>
            <FormBuilder 
                title={t('forms.institutionalBuilder') || 'Institutional Form Builder'}
                description={t('forms.builderDescription') || 'Design dignified, premium data collection experiences for your sanctuary.'}
            />
        </ScreenWrapper>
    );
}
