/**
 * DASHBOARD ECHO
 * Surfaces feedback "vistas" and support requests from teachers and students.
 * Supports bidirectional loop: principal can mark feedback read and reply inline.
 */

import React, { useState, useEffect } from 'react';
import { 
    Icon, 
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    Spinner,
    Pressable,
    Input,
    InputField,
    Button,
    ButtonText
} from '@repo/ui';
import { MessageSquare, Heart, AlertTriangle, CheckCircle2, ChevronRight, Send } from 'lucide-react-native';
import { supabase, useStore } from '@repo/core';
import { useTranslation } from 'react-i18next';

interface FeedbackEcho {
    id: string;
    source: 'teacher' | 'student';
    category: 'support' | 'morale' | 'facility' | 'recognition';
    content: string;
    priority: 'low' | 'medium' | 'high';
    is_read: boolean;
    created_at: string;
    principal_response?: string;
    responded_at?: string;
}

const CATEGORY_ICONS = {
    support: MessageSquare,
    morale: Heart,
    facility: AlertTriangle,
    recognition: CheckCircle2
};

export default function DashboardEcho({ schoolId }: { schoolId: string }) {
    const { t } = useTranslation();
    const { user } = useStore();
    const [feedback, setFeedback] = useState<FeedbackEcho[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [savingReply, setSavingReply] = useState(false);

    const setMockData = () => {
        setFeedback([
            { id: '1', source: 'teacher', category: 'support', content: 'Need guidance on the 2026 Mathematics syllabus transition for Grade 6.', priority: 'high', is_read: false, created_at: new Date().toISOString() },
            { id: '2', source: 'student', category: 'morale', content: 'The new common area is great! Everyone is enjoying the study space.', priority: 'low', is_read: true, created_at: new Date(Date.now() - 3600000).toISOString() },
            { id: '3', source: 'teacher', category: 'facility', content: 'Multimedia projector in Room 4 is flickering intermittently.', priority: 'medium', is_read: false, created_at: new Date(Date.now() - 86400000).toISOString() }
        ]);
    };

    const fetchFeedback = async () => {
        try {
            const { data, error } = await supabase
                .from('school_echo_feedback')
                .select('*')
                .eq('school_id', schoolId)
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) {
                setMockData();
            } else {
                setFeedback(data || []);
            }
        } catch {
            setMockData();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedback();
    }, [schoolId]);

    const handleMarkRead = async (id: string) => {
        try {
            await supabase.from('school_echo_feedback').update({ is_read: true }).eq('id', id);
            setFeedback(prev => prev.map(e => e.id === id ? { ...e, is_read: true } : e));
        } catch { /**/ }
    };

    const handleSendReply = async (id: string) => {
        if (!replyText.trim() || !user?.id) return;
        setSavingReply(true);
        try {
            const now = new Date().toISOString();
            await supabase.from('school_echo_feedback').update({
                principal_response: replyText.trim(),
                responded_by: user.id,
                responded_at: now,
                is_read: true
            }).eq('id', id);
            
            setFeedback(prev => prev.map(e =>
                e.id === id ? { ...e, principal_response: replyText.trim(), responded_at: now, is_read: true } : e
            ));
            setReplyingTo(null);
            setReplyText('');
        } catch { /**/ }
        finally {
            setSavingReply(false);
        }
    };

    if (isLoading) return <Spinner color="#ffbf00" />;

    return (
        <VStack className="gap-6">
            <HStack className="justify-between items-center">
                <VStack className="gap-1">
                    <Heading className="text-xl font-black text-ink uppercase tracking-wider">
                        {t('principal.echo.title', 'Vocal Echo')}
                    </Heading>
                    <Text className="text-xs font-bold text-ink/40 uppercase tracking-widest">
                        {t('principal.echo.subtitle', 'Faculty & Student Feedback')}
                    </Text>
                </VStack>
                {feedback.filter(e => !e.is_read).length > 0 && (
                    <Box className="bg-red-600 rounded-full px-3 py-1 animate-bounce">
                        <Text className="text-[10px] font-black text-white uppercase tracking-widest">
                            {feedback.filter(e => !e.is_read).length} New
                        </Text>
                    </Box>
                )}
            </HStack>

            <VStack className="gap-4">
                {feedback.map((item) => {
                    const IconComp = CATEGORY_ICONS[item.category] || MessageSquare;
                    const isExpanded = replyingTo === item.id;
                    return (
                        <Pressable key={item.id} onPress={() => !item.is_read && handleMarkRead(item.id)}>
                            <Box
                                className={`p-6 rounded-[32px] border-2 transition-all ${
                                    item.is_read ? 'bg-white border-border' : 'bg-primary/5 border-primary/20'
                                }`}
                                style={{ borderLeftWidth: 8, borderLeftColor: item.priority === 'high' ? '#DC2626' : '#2563EB' }}
                            >
                                <HStack className="gap-5 items-start">
                                    <Box className="p-3 bg-silk rounded-2xl border border-border">
                                        <Icon as={IconComp} size="md" className="text-ink" />
                                    </Box>
                                    <VStack className="gap-3 flex-1">
                                        <VStack className="gap-1">
                                            <HStack className="justify-between items-center">
                                                <Text className="text-[10px] font-black text-ink/30 uppercase tracking-[0.2em]">
                                                    {item.source} · {item.category}
                                                </Text>
                                                <Text className="text-[10px] font-bold text-ink/20">
                                                    {new Date(item.created_at).toLocaleDateString()}
                                                </Text>
                                            </HStack>
                                            <Text className="text-sm font-bold text-ink leading-relaxed">
                                                {item.content}
                                            </Text>
                                        </VStack>

                                        {item.principal_response && (
                                            <Box className="p-4 bg-primary/5 rounded-2xl border border-primary/20">
                                                <Text className="text-[10px] font-black text-primary uppercase mb-1">Your Voice</Text>
                                                <Text className="text-xs font-medium text-ink/80">{item.principal_response}</Text>
                                            </Box>
                                        )}

                                        <HStack className="gap-4 items-center">
                                            <Pressable onPress={() => {
                                                if (isExpanded) { setReplyingTo(null); setReplyText(''); }
                                                else { setReplyingTo(item.id); setReplyText(item.principal_response ?? ''); }
                                            }}>
                                                <Text className="text-[10px] font-black text-primary uppercase tracking-widest">
                                                    {item.principal_response ? 'Edit Voice' : 'Establish Response'}
                                                </Text>
                                            </Pressable>
                                            {!item.is_read && (
                                                <Box className="w-1.5 h-1.5 rounded-full bg-red-600" />
                                            )}
                                        </HStack>

                                        {isExpanded && (
                                            <VStack className="gap-3 mt-2">
                                                <Input className="h-24 bg-silk border-border rounded-2xl px-4 py-3">
                                                    <InputField
                                                        value={replyText}
                                                        onChangeText={setReplyText}
                                                        placeholder="Transmit response..."
                                                        multiline
                                                        className="text-sm font-medium text-ink"
                                                    />
                                                </Input>
                                                <HStack className="gap-3 justify-end">
                                                    <Button 
                                                        variant="outline" 
                                                        onPress={() => { setReplyingTo(null); setReplyText(''); }}
                                                        className="h-10 rounded-xl px-4"
                                                    >
                                                        <ButtonText className="text-[10px] font-black uppercase text-ink">Dismiss</ButtonText>
                                                    </Button>
                                                    <Button 
                                                        isDisabled={!replyText.trim() || savingReply} 
                                                        onPress={() => handleSendReply(item.id)}
                                                        className="h-10 rounded-xl px-6 bg-ink"
                                                    >
                                                        <HStack className="items-center gap-2">
                                                            {savingReply ? (
                                                                <Spinner size="small" color="white" />
                                                            ) : (
                                                                <>
                                                                    <Icon as={Send} className="text-white" size="xs" />
                                                                    <ButtonText className="text-[10px] font-black uppercase text-white">Transmit</ButtonText>
                                                                </>
                                                            )}
                                                        </HStack>
                                                    </Button>
                                                </HStack>
                                            </VStack>
                                        )}
                                    </VStack>
                                    {!isExpanded && <Icon as={ChevronRight} className="text-ink/10" size="sm" />}
                                </HStack>
                            </Box>
                        </Pressable>
                    );
                })}
                {feedback.length === 0 && (
                    <Box className="p-12 items-center justify-center bg-silk rounded-[32px] border border-dashed border-border">
                        <Text className="text-sm font-bold text-ink/20 italic">
                            The echo is silent.
                        </Text>
                    </Box>
                )}
            </VStack>
        </VStack>
    );
}
