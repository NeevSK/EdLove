import React from 'react';
import { VStack, SanctuaryInput } from '@repo/ui';
import { School, Mail, Phone, Globe } from 'lucide-react-native';

interface StepBasicInfoProps {
    data: {
        name: string;
        contactEmail: string;
        contactPhone: string;
        website?: string;
    };
    onUpdate: (info: Partial<StepBasicInfoProps['data']>) => void;
}

export default function StepBasicInfo({ data, onUpdate }: StepBasicInfoProps) {
    return (
        <VStack sx={{ gap: '$lg' as any }}>
            <SanctuaryInput
                label="School Name"
                placeholder="e.g. Royal College, Colombo"
                value={data.name}
                onChangeText={(text) => onUpdate({ name: text })}
                leftIcon={School}
            />
            <SanctuaryInput
                label="Contact Email"
                placeholder="school@email.com"
                value={data.contactEmail}
                onChangeText={(text) => onUpdate({ contactEmail: text })}
                leftIcon={Mail}
            />
            <SanctuaryInput
                label="Contact Phone"
                placeholder="+94 7x xxx xxxx"
                value={data.contactPhone}
                onChangeText={(text) => onUpdate({ contactPhone: text })}
                leftIcon={Phone}
            />
            <SanctuaryInput
                label="Website (Optional)"
                placeholder="www.school.lk"
                value={data.website || ''}
                onChangeText={(text) => onUpdate({ website: text })}
                leftIcon={Globe}
            />
        </VStack>
    );
}
