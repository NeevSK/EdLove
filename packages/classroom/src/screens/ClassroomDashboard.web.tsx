import React, { useState, useEffect, useMemo } from 'react';
import {
    VStack,
    HStack,
    Box,
    Text,
    Spinner,
    Button,
    ButtonText,
    useThemedColors,
    GlobalHeader,
    ScreenWrapper,
    SkeletonCard,
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
    InputField,
    SanctuaryCard,
    Heading
} from '@repo/ui';
import {
    Users,
    BookOpen,
    FileText,
    ClipboardCheck,
    GraduationCap,
    LayoutGrid,
    NotebookPen,
    Plus,
    TrendingUp,
    MessageSquare,
    Search,
    ChevronRight
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { api, identityAPI } from '@repo/core';
import type { Classroom } from '@repo/core';
import { 
    StudentList, 
    AttendanceView, 
    InventoryView, 
    ResourcesView, 
    StudentPulseSection, 
    ClassroomHolisticInsights, 
    ClassroomEchoSection 
} from '../components';
import { StudentAnalysisModal } from '@repo/library';
import ClassroomNotes from '../components/ClassroomNotes';
import LessonFeed from './LessonFeed';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ClassroomStackParamList } from '@repo/core';

type Props = NativeStackScreenProps<ClassroomStackParamList, 'ClassroomDetails'>;

type FeatureId = 'insights' | 'notes' | 'students' | 'attendance' | 'gradebook' | 'lessons' | 'resources' | 'inventory' | 'echo';

const ALL_FEATURES: { id: FeatureId; label: string; icon: any }[] = [
    { id: 'insights', label: 'Insights', icon: TrendingUp },
    { id: 'notes', label: 'Notes', icon: NotebookPen },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
    { id: 'gradebook', label: 'Gradebook', icon: GraduationCap },
    { id: 'lessons', label: 'Lessons', icon: BookOpen },
    { id: 'resources', label: 'Library', icon: FileText },
    { id: 'inventory', label: 'Inventory', icon: LayoutGrid },
    { id: 'echo', label: 'Echo', icon: MessageSquare },
];

export default function ClassroomDashboardWeb({ route, navigation }: Props) {
    const { classroomId, classroomName } = route.params;
    const { t } = useTranslation();
    const [classroom, setClassroom] = useState<Classroom | null>(null);
    const [activeFeature, setActiveFeature] = useState<FeatureId>('insights');
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [students, setStudents] = useState<any[]>([]);
    const colors = useThemedColors();

    const [showAddMonthModal, setShowAddMonthModal] = useState(false);
    const [newMonthTitle, setNewMonthTitle] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);
    const [analysisStudent, setAnalysisStudent] = useState<any | null>(null);

    useEffect(() => {
        fetchInitialData();
    }, [classroomId]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [classData, internalId] = await Promise.all([
                api.classrooms.getById(classroomId),
                identityAPI.getMyInternalId()
            ]);
            setClassroom(classData);
            setCurrentUserId(internalId);
        } catch (error) {
            console.error('Error fetching classroom details:', error);
        } finally {
            setLoading(false);
        }
    };

    const isClassTeacher = useMemo(() => {
        if (!classroom || !currentUserId) return false;
        if (classroom.id.startsWith('sample-') || (classroom as any).is_sample) return true;
        return classroom.teacher_id === currentUserId;
    }, [classroom, currentUserId]);

    const filteredFeatures = useMemo(() => {
        return ALL_FEATURES.filter(f => {
            if (f.id === 'inventory') return isClassTeacher;
            return true;
        });
    }, [isClassTeacher]);

    useEffect(() => {
        if (activeFeature === 'students' && students.length === 0 && classroomId) {
            api.classroomStudents.getAll(classroomId).then(setStudents).catch(console.error);
        }
    }, [activeFeature, classroomId]);

    const renderFeatureContent = () => {
        switch (activeFeature) {
            case 'insights': return <ClassroomHolisticInsights classroomId={classroomId} />;
            case 'notes': return <ClassroomNotes classroomId={classroomId} isTeacher={isClassTeacher} />;
            case 'students':
                return (
                    <StudentList
                        classroomId={classroomId}
                        students={students}
                        onRefresh={() => api.classroomStudents.getAll(classroomId).then(setStudents)}
                        onAnalyzePotential={(student) => {
                            setAnalysisStudent(student);
                            setShowAnalysisModal(true);
                        }}
                    />
                );
            case 'attendance': return <AttendanceView classroomId={classroomId} />;
            case 'gradebook': return <Box sx={{ p: '$4' }}><Text sx={{ color: '$textTertiary' }}>Gradebook Extended View (Web Optimization)</Text></Box>;
            case 'lessons':
                return (
                    <LessonFeed
                        classroomId={classroomId}
                        isTeacher={isClassTeacher}
                        onOpenLesson={(id) => console.log('Open', id)}
                        onOpenAssignment={(id) => console.log('Open', id)}
                        onAddMaterial={() => {}}
                        onAddAssignment={() => {}}
                    />
                );
            case 'inventory': return <InventoryView classroomId={classroomId} />;
            case 'resources': return <ResourcesView classroomId={classroomId} isTeacher={isClassTeacher} />;
            case 'echo': return <ClassroomEchoSection classroomId={classroomId} isTeacher={isClassTeacher} />;
            default: return null;
        }
    };

    if (loading) {
        return (
            <ScreenWrapper>
                <div className="sub-view-container" style={{ padding: '40px' }}>
                    <SkeletonCard height={800} />
                    <SkeletonCard height={800} />
                </div>
            </ScreenWrapper>
        );
    }

    const schoolId = classroom?.school_id || '';

    return (
        <ScreenWrapper scroll={false}>
            <div className="vellum-app-shell">
                <GlobalHeader
                    title={classroomName}
                    subtitle={classroom?.subject || 'Classroom Sanctuary'}
                    showBack
                    onBack={() => navigation.goBack()}
                />

                <div className="shell-body-core">
                    {/* WEB-OPTIMIZED CSS GRID LAYOUT */}
                    <main className="sub-view-container" style={{ 
                        flex: 1, 
                        padding: '32px 48px', 
                        overflowY: 'auto',
                        gridTemplateColumns: '260px 1fr 340px' // Divergent Layout: Navigation | Content | Sidebar
                    }}>
                        
                        {/* LEFT: FEATURE NAVIGATION */}
                        <aside className="community-sidebar" style={{ position: 'sticky', top: 0 }}>
                            <div style={{ marginBottom: '24px' }}>
                                <Text sx={{ 
                                    fontSize: 10, 
                                    fontWeight: '800', 
                                    color: '$textTertiary', 
                                    textTransform: 'uppercase',
                                    letterSpacing: 1,
                                    mb: '$2'
                                }}>
                                    Classroom Command
                                </Text>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {filteredFeatures.map(f => {
                                    const Icon = f.icon;
                                    const isActive = activeFeature === f.id;
                                    return (
                                        <button 
                                            key={f.id}
                                            onClick={() => setActiveFeature(f.id)}
                                            className={`sidebar-item ${isActive ? 'active' : ''}`}
                                            style={{ 
                                                textAlign: 'left',
                                                background: isActive ? 'var(--action-soft)' : 'transparent',
                                                border: 'none',
                                                padding: '12px 16px',
                                                borderRadius: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                color: isActive ? 'var(--action)' : 'var(--ink-soft)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <Icon size={18} color={isActive ? 'var(--action)' : 'var(--ink-soft)'} />
                                            <span style={{ fontWeight: isActive ? '700' : '500', fontSize: '14px' }}>{f.label}</span>
                                            {isActive && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
                                        </button>
                                    );
                                })}
                            </div>

                            {isClassTeacher && (
                                <div style={{ marginTop: '32px' }}>
                                    <button 
                                        className="premium-button" 
                                        onClick={() => setShowAddMonthModal(true)}
                                        style={{ width: '100%' }}
                                    >
                                        <Plus size={18} />
                                        <span>New Module</span>
                                    </button>
                                </div>
                            )}
                        </aside>

                        {/* MIDDLE: MAIN CONTENT AREA */}
                        <section className="community-feed">
                            <div style={{ marginBottom: '32px' }}>
                                <Heading sx={{ fontSize: 28, color: '$text' }}>{ALL_FEATURES.find(f => f.id === activeFeature)?.label}</Heading>
                                <Text sx={{ color: '$textSecondary', mt: '$1' }}>Managing the {activeFeature} for {classroomName}</Text>
                            </div>
                            
                            <SanctuaryCard style={{ p: 0, borderRadius: 24, overflow: 'hidden' }}>
                                {renderFeatureContent()}
                            </SanctuaryCard>
                        </section>

                        {/* RIGHT: CONTEXTUAL SIDEBAR (PULSE & INSIGHTS) */}
                        <aside className="community-panel">
                            <StudentPulseSection
                                schoolId={schoolId}
                                classroomId={classroomId}
                                onViewAtRisk={() => setActiveFeature('students')}
                                onViewFullReport={() => {}}
                            />

                            <SanctuaryCard style={{ marginTop: 24, padding: 24 }}>
                                <HStack justifyContent="space-between" alignItems="center" sx={{ mb: '$4' }}>
                                    <Text sx={{ fontWeight: '800', fontSize: 12, textTransform: 'uppercase', color: '$textTertiary' }}>Quick Notes</Text>
                                    <NotebookPen size={14} color="var(--ink-soft)" />
                                </HStack>
                                <Text sx={{ fontSize: 13, color: '$textSecondary', fontStyle: 'italic' }}>
                                    "Remember to review the social weaving patterns for the morning session. Cognitive readiness is high overall."
                                </Text>
                            </SanctuaryCard>
                            
                            <div style={{ marginTop: 'auto', padding: '24px' }}>
                                <div className="glass-chip neutral" style={{ width: '100%', justifyContent: 'center' }}>
                                    <TrendingUp size={12} />
                                    <span>Syncing Live with Sanctuary</span>
                                </div>
                            </div>
                        </aside>
                    </main>
                </div>
            </div>

            {/* Modals from common logic */}
            <Modal isOpen={showAddMonthModal} onClose={() => setShowAddMonthModal(false)}>
                <ModalBackdrop />
                <ModalContent sx={{ backgroundColor: colors.secondary }}>
                    <ModalHeader>
                        <Heading color={colors.text} sx={{ fontSize: 18 }}>Add Monthly Module</Heading>
                    </ModalHeader>
                    <ModalBody sx={{ paddingBottom: '$6' }}>
                        <VStack sx={{ gap: 16 }}>
                            <Text color={colors.textSecondary} sx={{ fontSize: 14 }}>Create a new organizational module for your lessons and materials.</Text>
                            <Input sx={{ backgroundColor: colors.tertiary, borderColor: 'transparent' }}>
                                <InputField
                                    placeholder="e.g. September Foundations"
                                    value={newMonthTitle}
                                    onChangeText={setNewMonthTitle}
                                    color={colors.text}
                                />
                            </Input>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <HStack sx={{ gap: 8 }}>
                            <Button variant="outline" action="secondary" onPress={() => setShowAddMonthModal(false)}>
                                <ButtonText color={colors.textTertiary}>Cancel</ButtonText>
                            </Button>
                            <Button action="primary" onPress={() => setShowAddMonthModal(false)} isDisabled={!newMonthTitle.trim()}>
                                <ButtonText color="#FFF">Create Module</ButtonText>
                            </Button>
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {showAnalysisModal && analysisStudent && (
                <StudentAnalysisModal
                    visible={showAnalysisModal}
                    onClose={() => {
                        setShowAnalysisModal(false);
                        setAnalysisStudent(null);
                    }}
                    studentId={analysisStudent.id}
                    studentName={analysisStudent.full_name}
                    classroomId={classroomId}
                />
            )}
        </ScreenWrapper>
    );
}
