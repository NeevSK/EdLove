import React, { useState, useCallback, useEffect } from 'react';
import { 
    Box, 
    VStack, 
    HStack, 
    Text, 
    Heading, 
    Icon, 
    Button,
    ButtonText,
    ButtonIcon,
    Textarea,
    TextareaInput,
    ScrollView,
    SkeletonCard,
    hapticSuccess,
    LotusDropdown,
    Pressable
} from '@repo/ui';
import { ArrowLeft, Plus, StickyNote, AlertTriangle, Medal, Footprints } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { observationsAPI, type PrincipalObservation } from '../../observations';

interface LogbookDashboardProps {
    userId: string;
    schoolId: string;
    viewDate: string;
    isPastView: boolean;
    onBack: () => void;
}

export const LogbookDashboard: React.FC<LogbookDashboardProps> = ({ userId, schoolId, viewDate, isPastView, onBack }) => {
    const [content, setContent] = useState('');
    const [type, setType] = useState('note');
    const [observations, setObservations] = useState<PrincipalObservation[]>([]);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);

    const loadObservations = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const data = await observationsAPI.listByDate(userId, viewDate, 10);
            setObservations(data || []);
        } catch (err) {
            console.error('Failed to load observations:', err);
        } finally {
            setLoading(false);
        }
    }, [userId, viewDate]);

    useEffect(() => {
        loadObservations();
    }, [loadObservations]);

    const handleSaveObservation = async () => {
        if (!content.trim()) return;
        setSaving(true);
        try {
            const data = await observationsAPI.create({
                principalId: userId,
                schoolId,
                type,
                content: content.trim()
            });
            if (data) setObservations((prev) => [data, ...prev]);
            setContent('');
            hapticSuccess();
        } catch (err) {
            console.error('Failed to save observation:', err);
        } finally {
            setSaving(false);
        }
    };

    const typeOptions = [
        { label: 'General Note', value: 'note' },
        { label: 'Walkthrough', value: 'walkthrough' },
        { label: 'Concern', value: 'concern' },
        { label: 'Commendation', value: 'commendation' }
    ];

    const getTypeIcon = (t: string) => {
        switch (t) {
            case 'walkthrough': return <Icon as={Footprints} size="xs" />;
            case 'concern': return <Icon as={AlertTriangle} size="xs" />;
            case 'commendation': return <Icon as={Medal} size="xs" />;
            default: return <Icon as={StickyNote} size="xs" />;
        }
    };

    const getTypeColor = (t: string) => {
        switch (t) {
            case 'concern': return 'border-l-red-500 bg-red-500/10 text-red-600';
            case 'commendation': return 'border-l-green-500 bg-green-500/10 text-green-600';
            case 'walkthrough': return 'border-l-blue-500 bg-blue-500/10 text-blue-600';
            default: return 'border-l-primary bg-primary/10 text-primary';
        }
    };

    return (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <VStack className="gap-6 p-4">
                <Pressable onPress={onBack}>
                    <HStack className="items-center gap-2 bg-white/50 self-start px-4 py-2 rounded-xl border border-border active:scale-95">
                        <Icon as={ArrowLeft} size="sm" className="text-ink" />
                        <Text className="text-sm font-bold text-ink">Back to Dashboard</Text>
                    </HStack>
                </Pressable>

                <VStack className="gap-1">
                    <Heading className="text-2xl font-black text-ink">Institutional Log</Heading>
                    <Text className="text-sm text-ink/60">
                        Your daily operational notes and walkthroughs.
                    </Text>
                </VStack>

                <Box className={`bg-white p-5 rounded-3xl border border-border gap-4 ${isPastView ? 'opacity-60' : ''}`}>
                    <Heading className="text-xs font-black uppercase tracking-widest text-ink/40">New Entry</Heading>
                    
                    <LotusDropdown
                        label="Entry Type"
                        options={typeOptions}
                        value={type}
                        onValueChange={setType}
                        isDisabled={isPastView}
                    />

                    <Textarea className="h-32 rounded-2xl">
                        <TextareaInput 
                            value={content} 
                            onChangeText={setContent} 
                            isDisabled={isPastView} 
                            placeholder={isPastView ? "Log entry is disabled for past views." : "Write your observation or note..."} 
                        />
                    </Textarea>

                    <Button 
                        onPress={handleSaveObservation} 
                        isDisabled={!content.trim() || saving || isPastView} 
                        className="bg-primary rounded-2xl h-12 self-start px-6 shadow-sm active:scale-95"
                    >
                        {saving ? (
                            <ButtonText>Logging...</ButtonText>
                        ) : (
                            <>
                                <ButtonIcon as={Plus} className="mr-2" />
                                <ButtonText>Log Entry</ButtonText>
                            </>
                        )}
                    </Button>
                </Box>

                <VStack className="gap-3">
                    {loading ? (
                        <SkeletonCard height={100} />
                    ) : observations.length === 0 ? (
                        <Box className="p-10 items-center justify-center bg-ink/5 rounded-3xl border border-dashed border-border">
                            <Text className="text-ink/40 italic font-bold">No entries for this date.</Text>
                        </Box>
                    ) : (
                        observations.map(o => (
                            <Box 
                                key={o.id} 
                                className={`bg-white p-5 rounded-3xl border border-border border-l-4 ${getTypeColor(o.type).split(' ')[0]}`}
                            >
                                <HStack className="items-center gap-2 mb-2">
                                    <Box className={`px-2 py-0.5 rounded-md ${getTypeColor(o.type).split(' ').slice(1).join(' ')}`}>
                                        <HStack className="items-center gap-1.5">
                                            {getTypeIcon(o.type)}
                                            <Text className="text-[10px] font-black uppercase">
                                                {o.type}
                                            </Text>
                                        </HStack>
                                    </Box>
                                    <Text className="text-[10px] text-ink/40 font-bold uppercase tracking-widest">
                                        {formatDistanceToNow(new Date(o.created_at), { addSuffix: true })}
                                    </Text>
                                </HStack>
                                <Text className="text-sm leading-relaxed text-ink/80">
                                    {o.content}
                                </Text>
                            </Box>
                        ))
                    )}
                </VStack>
            </VStack>
        </ScrollView>
    );
};

export type { LogbookDashboardProps };

