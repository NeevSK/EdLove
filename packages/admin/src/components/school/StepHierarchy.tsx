import React from 'react';
import {
    VStack,
    Text,
    HStack,
    Pressable,
    useThemedColors,
    Theme,
    Box,
    Heading
} from '@repo/ui';
import { Plus, X, GraduationCap, School } from 'lucide-react-native';

interface StepHierarchyProps {
    data: {
        levels: string[];
        gradeRange: { start: number; end: number };
        sections: { name: string; headName?: string }[];
    };
    onUpdate: (data: Partial<StepHierarchyProps['data']>) => void;
}

const AVAILABLE_LEVELS = [
    { id: 'Primary', label: 'Primary (Grade 1-5)' },
    { id: 'Junior Secondary', label: 'Junior Secondary (Grade 6-9)' },
    { id: 'Senior Secondary', label: 'Senior Secondary (Grade 10-11)' },
    { id: 'Advanced Level', label: 'Advanced Level (Grade 12-13)' }
];

export default function StepHierarchy({ 
    data, 
    onUpdate 
}: StepHierarchyProps) {
    const colors = useThemedColors();

    const toggleLevel = (levelId: string) => {
        const currentLevels = data.levels || [];
        if (currentLevels.includes(levelId)) {
            onUpdate({ levels: currentLevels.filter(l => l !== levelId) });
        } else {
            onUpdate({ levels: [...currentLevels, levelId] });
        }
    };

    const addSection = () => {
        const currentSections = data.sections || [];
        onUpdate({ 
            sections: [...currentSections, { name: '' }] 
        });
    };

    const removeSection = (index: number) => {
        const currentSections = data.sections || [];
        onUpdate({ 
            sections: currentSections.filter((_, i) => i !== index) 
        });
    };



    return (
        <VStack space="xl">
            <VStack space="sm">
                <Heading size="sm">Academic Levels</Heading>
                <Text size="sm" color={colors.textSecondary}>
                    Select the levels offered at this school.
                </Text>
                <VStack space="xs" sx={{ mt: 2 }}>
                    {AVAILABLE_LEVELS.map(level => (
                        <Pressable 
                            key={level.id}
                            onPress={() => toggleLevel(level.id)}
                            accessibilityRole="button"
                            accessibilityLabel={`Toggle ${level.label}`}
                            accessibilityHint="Selects or deselects this academic level for the school"
                            sx={{
                                p: 12,
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: data.levels.includes(level.id) ? Theme.colors.sanctuarySaffron : colors.border,
                                bg: data.levels.includes(level.id) ? `${Theme.colors.sanctuarySaffron}10` : 'transparent'
                            }}
                        >
                            <HStack space="md" sx={{ alignItems: 'center' }}>
                                <GraduationCap 
                                    size={20} 
                                    color={data.levels.includes(level.id) ? Theme.colors.sanctuarySaffron : colors.textTertiary} 
                                />
                                <Text 
                                    fontWeight={data.levels.includes(level.id) ? "700" : "500"}
                                    color={data.levels.includes(level.id) ? colors.text : colors.textSecondary}
                                >
                                    {level.label}
                                </Text>
                            </HStack>
                        </Pressable>
                    ))}
                </VStack>
            </VStack>

            <VStack space="sm">
                <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Heading size="sm">Administrative Sections</Heading>
                    <Pressable 
                        onPress={addSection}
                        accessibilityRole="button"
                        accessibilityLabel="Add administrative section"
                        accessibilityHint="Adds a new section to the school's hierarchy"
                    >
                        <HStack space="xs" sx={{ alignItems: 'center' }}>
                            <Plus size={16} color={Theme.colors.skyBlue} />
                            <Text size="xs" fontWeight="700" color={Theme.colors.skyBlue}>ADD</Text>
                        </HStack>
                    </Pressable>
                </HStack>
                <Text size="sm" color={colors.textSecondary}>
                    E.g., &quot;Middle School&quot;, &quot;Prefects Guild&quot;, &quot;Sports Council&quot;.
                </Text>
                
                {data.sections.length === 0 ? (
                    <Box sx={{ p: 16, borderRadius: 12, borderStyle: 'dashed', borderWidth: 1, borderColor: colors.border, alignItems: 'center' }}>
                        <Text size="xs" color={colors.textTertiary}>No sections added yet.</Text>
                    </Box>
                ) : (
                    <VStack space="sm" sx={{ mt: 2 }}>
                        {data.sections.map((section, idx) => (
                            <HStack 
                                key={idx} 
                                space="sm" 
                                sx={{ 
                                    p: 12, 
                                    borderRadius: 12, 
                                    bg: Theme.colors.silk,
                                    alignItems: 'center' 
                                }}
                            >
                                <School size={16} color={colors.textTertiary} />
                                <VStack sx={{ flex: 1 }}>
                                    <Text size="sm" fontWeight="600">{section.name || 'Unnamed Section'}</Text>
                                </VStack>
                                <Pressable 
                                    onPress={() => removeSection(idx)}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Remove ${section.name || 'section'}`}
                                    accessibilityHint="Deletes this section from the school"
                                >
                                    <X size={16} color={Theme.colors.emberRed} />
                                </Pressable>
                            </HStack>
                        ))}
                    </VStack>
                )}
            </VStack>
        </VStack>
    );
}
