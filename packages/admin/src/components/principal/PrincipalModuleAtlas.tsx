import React from 'react';
import {
    Box,
    HStack,
    Text,
    VStack,
    useTheme,
    Icon,
    Theme
} from '@repo/ui';
import {
    BookCopy,
    BriefcaseBusiness,
    ClipboardCheck,
    FileSpreadsheet,
    Files,
    Landmark,
    Package
} from 'lucide-react-native';
import {
    PRINCIPAL_CAPABILITY_REGISTRY,
    type PrincipalCapabilityId,
    type PrincipalCapabilityMeta
} from '../../principal/workspace';

interface PrincipalModuleAtlasProps {
    capabilityIds?: PrincipalCapabilityId[];
    title?: string;
    subtitle?: string;
}

const DEFAULT_ATLAS_CAPABILITIES: PrincipalCapabilityId[] = [
    'inventory',
    'finance',
    'accounting',
    'reporting',
    'circulars',
    'documents',
    'compliance'
];

const CAPABILITY_ICONS: Record<string, any> = {
    morning_brief: Landmark,
    faculty_overview: BriefcaseBusiness,
    student_pulse: Landmark,
    pending_approvals: ClipboardCheck,
    institutional_calendar: ClipboardCheck,
    observations: ClipboardCheck,
    relief: ClipboardCheck,
    hierarchy: Landmark,
    invites: BriefcaseBusiness,
    log: Files,
    notes: Files,
    cycles: ClipboardCheck,
    school_profile: Landmark,
    resource_needs: Package,
    ecosystem_resonance: Landmark,
    open_commons: BriefcaseBusiness,
    inventory: Package,
    finance: Landmark,
    accounting: FileSpreadsheet,
    reporting: ClipboardCheck,
    circulars: BookCopy,
    documents: Files,
    compliance: ClipboardCheck,
    curriculum_pulse: BriefcaseBusiness,
    timetable: ClipboardCheck
};

function CapabilityCard({ capability }: { capability: PrincipalCapabilityMeta }) {
    const theme = useTheme();
    const LucideIcon = CAPABILITY_ICONS[capability.id] ?? Files;

    const getZoneColor = (zone: string) => {
        switch (zone) {
            case 'today': return theme.accent.action;
            case 'institution': return theme.accent.sageGreen;
            default: return theme.accent.templeGold;
        }
    };

    const zoneColor = getZoneColor(capability.zone || '');

    return (
        <Box className="w-full bg-phase-surface rounded-2xl border border-phase-border p-md">
            <HStack className="justify-between items-start gap-4">
                <HStack className="items-center gap-3 flex-1">
                    <Box
                        className="w-9 h-9 rounded-xl items-center justify-center"
                        style={{ backgroundColor: `${zoneColor}22` }}
                    >
                        <LucideIcon size={18} color={zoneColor} />
                    </Box>
                    <VStack className="gap-0.5 flex-1">
                        <Text className="text-sm font-bold text-phaseText-primary">
                            {capability.title}
                        </Text>
                        <Text className="text-[10px] text-phaseText-secondary uppercase tracking-wider">
                            {capability.atlasFamily ?? 'Principal ERP'}
                        </Text>
                    </VStack>
                </HStack>
                <Box className="px-2 py-0.5 rounded-full bg-phase-interactive border border-phase-border">
                    <Text className="text-[9px] font-extrabold text-phase-accent uppercase">
                        {capability.status}
                    </Text>
                </Box>
            </HStack>
            <Text className="text-[12px] leading-relaxed text-phaseText-secondary mt-3">
                {capability.description}
            </Text>
        </Box>
    );
}

export default function PrincipalModuleAtlas({
    capabilityIds = DEFAULT_ATLAS_CAPABILITIES,
    title = 'Module Atlas',
    subtitle = 'Planned ERP families that will slot into this principal workspace without reshaping the home cockpit.'
}: PrincipalModuleAtlasProps) {
    const capabilities = capabilityIds
        .map((id) => PRINCIPAL_CAPABILITY_REGISTRY[id])
        .filter(Boolean);

    return (
        <VStack className="gap-4">
            <VStack className="gap-1">
                <Text className="text-lg font-bold text-phaseText-primary">
                    {title}
                </Text>
                <Text className="text-sm leading-relaxed text-phaseText-secondary">
                    {subtitle}
                </Text>
            </VStack>
            <VStack className="gap-3">
                {capabilities.map((capability) => (
                    <CapabilityCard key={capability.id} capability={capability} />
                ))}
            </VStack>
        </VStack>
    );
}
