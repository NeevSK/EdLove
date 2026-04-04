import React, { useState, useEffect } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    Theme,
    useThemedColors,
    Spinner,
    Pressable,
    Input,
    InputField,
    Button,
    ButtonText,
    hapticLight,
} from '@repo/ui';
import { 
    MessageSquare, 
    Heart, 
    AlertTriangle, 
    CheckCircle2, 
    ChevronRight, 
    Send,
    EyeOff,
    User,
    Inbox
} from 'lucide-react-native';
import { supabase, useStore, echoAPI } from '@repo/core';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';

interface Echo {
    id: string;
    student_id: string;
    classroom_id: string;
    content: string;
    is_anonymous: boolean;
    is_read: boolean;
    teacher_response?: string;
    responded_at?: string;
    created_at: string;
    student_name?: string;
}

interface Props {
    classroomId: string;
    isTeacher: boolean;
}

export default function ClassroomEchoSection({ classroomId, isTeacher }: Props) {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const { user } = useStore();
    const [echoes, setEchoes] = useState<Echo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Student side state
    const [newEcho, setNewEcho] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isSending, setIsSending] = useState(false);

    // Teacher side state
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [isReplying, setIsReplying] = useState(false);

    useEffect(() => {
        fetchEchoes();
        
        // Subscription for real-time updates
        const channel = supabase
            .channel(`classroom_echoes:${classroomId}`)
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'student_echoes',
                filter: `classroom_id=eq.${classroomId}`
            }, () => {
                fetchEchoes();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [classroomId]);

    const fetchEchoes = async () => {
        try {
            const data = await echoAPI.getEchoesByClassroom(classroomId);
            setEchoes(data || []);
        } catch (error) {
            console.error('Error fetching echoes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendEcho = async () => {
        if (!newEcho.trim() || isSending) return;
        setIsSending(true);
        hapticLight();
        try {
            await echoAPI.sendEcho({
                classroom_id: classroomId,
                content: newEcho.trim(),
                is_anonymous: isAnonymous
            });
            setNewEcho('');
            // Success haptic or toast could go here
        } catch (error) {
            console.error('Error sending echo:', error);
        } finally {
            setIsSending(false);
        }
    };

    const handleReply = async (echoId: string) => {
        if (!replyText.trim() || isReplying) return;
        setIsReplying(true);
        try {
            await echoAPI.respondToEcho(echoId, replyText.trim());
            setReplyingTo(null);
            setReplyText('');
            fetchEchoes();
        } catch (error) {
            console.error('Error replying to echo:', error);
        } finally {
            setIsReplying(false);
        }
    };

    const handleMarkRead = async (echoId: string) => {
        try {
            await echoAPI.markAsRead(echoId);
            setEchoes(prev => prev.map(e => e.id === echoId ? { ...e, is_read: true } : e));
        } catch (error) {
            console.error('Error marking echo as read:', error);
        }
    };

    const renderStudentView = () => (
        <VStack space="md" sx={{ padding: Theme.spacing.md }}>
            <Box sx={{ 
                padding: Theme.spacing.lg, 
                backgroundColor: colors.secondary, 
                borderRadius: Theme.corners.comfortable,
                borderWidth: 1,
                borderColor: colors.tertiary
            }}>
                <VStack space="md">
                    <Heading sx={{ fontSize: 18, color: Theme.colors.sanctuarySaffron }}>
                        Sharing Your Voice
                    </Heading>
                    <Text sx={{ fontSize: 14, color: colors.textSecondary }}>
                        Your feedback helps the teacher improve the classroom experience. You can choose to remain anonymous.
                    </Text>
                    
                    <Box sx={{ 
                        marginTop: Theme.spacing.sm,
                        borderRadius: Theme.corners.comfortable,
                        backgroundColor: colors.primary,
                        padding: Theme.spacing.sm
                    }}>
                        <Input variant="underlined" sx={{ borderBottomWidth: 0 }}>
                            <InputField 
                                placeholder="What's on your mind?"
                                value={newEcho}
                                onChangeText={setNewEcho}
                                multiline
                                numberOfLines={4}
                                sx={{ color: colors.text }}
                            />
                        </Input></Box>

                    <HStack justifyContent="space-between" alignItems="center">
                        <Pressable onPress={() => setIsAnonymous(!isAnonymous)}>
                            <HStack space="xs" alignItems="center">
                                {isAnonymous ? (
                                    <EyeOff size={16} color={Theme.colors.sanctuarySaffron} />
                                ) : (
                                    <User size={16} color={colors.textTertiary} />
                                )}
                                <Text sx={{ 
                                    fontSize: 12, 
                                    fontWeight: '600',
                                    color: isAnonymous ? Theme.colors.sanctuarySaffron : colors.textTertiary 
                                }}>
                                    {isAnonymous ? 'Anonymous Mode' : 'Share as yourself'}
                                </Text>
                            </HStack>
                        </Pressable>

                        <Button 
                            action="primary" 
                            size="sm" 
                            onPress={handleSendEcho}
                            isDisabled={!newEcho.trim() || isSending}
                            sx={{ borderRadius: Theme.corners.full }}
                        >
                            {isSending ? <Spinner color="#fff" size="small" /> : <ButtonText>Send Echo</ButtonText>}
                        </Button>
                    </HStack>
                </VStack>
            </Box>

            {/* Previous Echoes (Student) */}
            <VStack space="sm" sx={{ marginTop: Theme.spacing.md }}>
                <Heading sx={{ fontSize: 16, color: colors.text }}>Your Recent Echoes</Heading>
                {echoes.length === 0 ? (
                    <Box sx={{ padding: Theme.spacing.xl, alignItems: 'center' }}>
                        <Inbox size={48} color={colors.tertiary} />
                        <Text sx={{ marginTop: Theme.spacing.sm, color: colors.textTertiary }}>No echoes sent yet.</Text>
                    </Box>
                ) : (
                    echoes.map(echo => (
                        <Box key={echo.id} sx={{ 
                            padding: Theme.spacing.md, 
                            backgroundColor: colors.secondary, 
                            borderRadius: Theme.corners.comfortable 
                        }}>
                            <VStack space="xs">
                                <HStack justifyContent="space-between">
                                    <Text sx={{ fontSize: 12, fontWeight: '700', color: colors.textTertiary }}>
                                        {echo.is_anonymous ? 'ANONYMOUS' : 'YOU'}
                                    </Text>
                                    <Text sx={{ fontSize: 10, color: colors.textTertiary }}>
                                        {formatDistanceToNow(new Date(echo.created_at))} ago
                                    </Text>
                                </HStack>
                                <Text sx={{ fontSize: 14, color: colors.text }}>{echo.content}</Text>
                                {echo.teacher_response && (
                                    <Box sx={{ 
                                        marginTop: Theme.spacing.sm, 
                                        padding: Theme.spacing.sm, 
                                        backgroundColor: colors.primary, 
                                        borderRadius: Theme.corners.comfortable,
                                        borderLeftWidth: 3,
                                        borderLeftColor: Theme.colors.sanctuarySaffron
                                    }}>
                                        <Text sx={{ fontSize: 11, fontWeight: '800', color: Theme.colors.sanctuarySaffron }}>TEACHER RESPONSE</Text>
                                        <Text sx={{ fontSize: 13, color: colors.text, marginTop: 2 }}>{echo.teacher_response}</Text>
                                    </Box>
                                )}
                            </VStack>
                        </Box>
                    ))
                )}
            </VStack>
        </VStack>
    );

    const renderTeacherView = () => (
        <VStack space="md" sx={{ padding: Theme.spacing.md }}>
            <HStack justifyContent="space-between" alignItems="center">
                <VStack>
                    <Heading sx={{ fontSize: 18, color: colors.text }}>Student Echoes</Heading>
                    <Text sx={{ fontSize: 12, color: colors.textTertiary }}>Dignified feedback from your class</Text>
                </VStack>
                {echoes.filter(e => !e.is_read).length > 0 && (
                    <Box sx={{ 
                        backgroundColor: Theme.colors.emberRed, 
                        paddingHorizontal: 8, 
                        paddingVertical: 2, 
                        borderRadius: 10 
                    }}>
                        <Text sx={{ fontSize: 10, fontWeight: '800', color: '#fff' }}>
                            {echoes.filter(e => !e.is_read).length} NEW
                        </Text>
                    </Box>
                )}
            </HStack>

            {echoes.length === 0 ? (
                <Box sx={{ padding: Theme.spacing.xl, alignItems: 'center' }}>
                    <Inbox size={48} color={colors.tertiary} />
                    <Text sx={{ marginTop: Theme.spacing.sm, color: colors.textTertiary }}>No student echoes yet.</Text>
                </Box>
            ) : (
                echoes.map(echo => {
                    const isReplyingThis = replyingTo === echo.id;
                    return (
                        <Pressable 
                            key={echo.id} 
                            onPress={() => !echo.is_read && handleMarkRead(echo.id)}
                        >
                            <Box sx={{ 
                                padding: Theme.spacing.md, 
                                backgroundColor: echo.is_read ? colors.tertiary : colors.secondary, 
                                borderRadius: Theme.corners.comfortable,
                                borderLeftWidth: 4,
                                borderLeftColor: echo.is_read ? colors.textTertiary : Theme.colors.sanctuarySaffron
                            }}>
                                <VStack space="sm">
                                    <HStack justifyContent="space-between">
                                        <Text sx={{ fontSize: 11, fontWeight: '800', color: colors.textTertiary }}>
                                            {echo.is_anonymous ? '\uD83D\uDC64 ANONYMOUS STUDENT' : `\uD83C\uDF93 ${echo.student_name || 'STUDENT'}`}
                                            {!echo.is_read && <Text color={Theme.colors.emberRed}>  \u25CF</Text>}
                                        </Text>
                                        <Text sx={{ fontSize: 10, color: colors.textTertiary }}>
                                            {formatDistanceToNow(new Date(echo.created_at))} ago
                                        </Text>
                                    </HStack>
                                    
                                    <Text sx={{ fontSize: 14, color: colors.text }}>{echo.content}</Text>

                                    {echo.teacher_response && (
                                        <Box sx={{ 
                                            padding: Theme.spacing.sm, 
                                            backgroundColor: colors.primary, 
                                            borderRadius: Theme.corners.comfortable,
                                            marginTop: 4
                                        }}>
                                            <Text sx={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary }}>YOUR RESPONSE</Text>
                                            <Text sx={{ fontSize: 13, color: colors.text }}>{echo.teacher_response}</Text>
                                        </Box>
                                    )}

                                    {!isReplyingThis ? (
                                        <Pressable onPress={() => setReplyingTo(echo.id)}>
                                            <Text sx={{ fontSize: 12, fontWeight: '700', color: Theme.colors.sanctuarySaffron }}>
                                                {echo.teacher_response ? 'Edit Response' : 'Reply'}
                                            </Text>
                                        </Pressable>
                                    ) : (
                                        <VStack space="sm" sx={{ marginTop: 8 }}>
                                            <Box sx={{ backgroundColor: colors.primary, borderRadius: Theme.corners.comfortable, padding: 8 }}>
                                                <Input variant="underlined" sx={{ borderBottomWidth: 0 }}>
                                                    <InputField 
                                                        placeholder="Write your response..."
                                                        value={replyText}
                                                        onChangeText={setReplyText}
                                                        multiline
                                                        sx={{ color: colors.text }}
                                                        autoFocus
                                                    />
                                                </Input>
                                            </Box>
                                            <HStack space="sm" justifyContent="flex-end">
                                                <Button size="xs" variant="outline" action="secondary" onPress={() => setReplyingTo(null)}>
                                                    <ButtonText>Cancel</ButtonText>
                                                </Button>
                                                <Button size="xs" action="primary" onPress={() => handleReply(echo.id)} isDisabled={!replyText.trim() || isReplying}>
                                                    {isReplying ? <Spinner size="small" color="#fff" /> : <ButtonText>Send</ButtonText>}
                                                </Button>
                                            </HStack>
                                        </VStack>
                                    )}
                                </VStack>
                            </Box>
                        </Pressable>
                    );
                })
            )}
        </VStack>
    );

    if (isLoading) return (
        <Box sx={{ padding: Theme.spacing.xl, alignItems: 'center' }}>
            <Spinner color={Theme.colors.sanctuarySaffron} />
        </Box>
    );

    return isTeacher ? renderTeacherView() : renderStudentView();
}
