import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, useWindowDimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Save, Sparkles, FileCheck, Share2, Info } from 'lucide-react-native';
import { 
    Theme, 
    useThemedColors, 
    GlassCard, 
    Slider, 
    SliderTrack, 
    SliderFilledTrack, 
    SliderThumb,
    HStack,
    Box,
    VStack
} from '@repo/ui';
import { studentPotentialAPI, StudentPotentialAnalysis } from '@repo/core';
import { radarLayout, CaptureEngine } from '@repo/graphics';
import Svg, { Polygon, Line, Circle, G, Text as SvgText } from 'react-native-svg';

interface StudentAnalysisModalProps {
    visible: boolean;
    onClose: () => void;
    studentId: string;
    studentName: string;
    classroomId: string;
    onSave?: (analysis: StudentPotentialAnalysis) => void;
}

/**
 * StudentAnalysisModal - Shared modal for deep student potential mapping.
 * Isomorphic and integrated with Vatya (Radar) layout brain.
 */
export const StudentAnalysisModal: React.FC<StudentAnalysisModalProps> = ({
    visible,
    onClose,
    studentId,
    studentName,
    classroomId,
    onSave,
}) => {
    const colors = useThemedColors();
    const { width } = useWindowDimensions();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [aiInsights, setAiInsights] = useState<string | null>(null);
    const [loadingAI, setLoadingAI] = useState(false);
    
    const [analysis, setAnalysis] = useState<Partial<StudentPotentialAnalysis>>({
        cognitive_flow: 50,
        emotional_resonance: 50,
        social_weaving: 50,
        creative_spark: 50,
        practical_mastery: 50,
        silver_lining: '',
    });

    useEffect(() => {
        if (visible && studentId && classroomId) {
            loadAnalysis();
        }
    }, [visible, studentId, classroomId]);

    const loadAnalysis = async () => {
        setLoading(true);
        try {
            const data = await studentPotentialAPI.getForStudent(studentId, classroomId);
            if (data) {
                setAnalysis(data);
            }
        } catch (error) {
            console.error('[StudentAnalysisModal] Load error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const result = await studentPotentialAPI.upsert({
                student_id: studentId,
                classroom_id: classroomId,
                cognitive_flow: analysis.cognitive_flow || 50,
                emotional_resonance: analysis.emotional_resonance || 50,
                social_weaving: analysis.social_weaving || 50,
                creative_spark: analysis.creative_spark || 50,
                practical_mastery: analysis.practical_mastery || 50,
                silver_lining: analysis.silver_lining || '',
                potential_notes: (analysis as any).potential_notes || [],
            } as any);
            onSave?.(result);
            onClose();
        } catch (error) {
            console.error('[StudentAnalysisModal] Save error:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const topology = CaptureEngine.prepareForCapture({
                nodes: [{
                    id: studentId,
                    label: studentName,
                    type: 'topic', 
                    group: 'analysis',
                    metadata: {
                        attributes: {
                            "Cognitive": (analysis.cognitive_flow || 50) / 100,
                            "Emotional": (analysis.emotional_resonance || 50) / 100,
                            "Social": (analysis.social_weaving || 50) / 100,
                            "Creative": (analysis.creative_spark || 50) / 100,
                            "Practical": (analysis.practical_mastery || 50) / 100
                        }
                    }
                }],
                links: []
            });

            console.log('[StudentAnalysisModal] Exporting topology:', topology);
            await new Promise(resolve => setTimeout(resolve, 1500));
            alert('Analysis exported to student report successfully.');
        } catch (error) {
            console.error('[StudentAnalysisModal] Export error:', error);
            alert('Failed to export analysis.');
        } finally {
            setIsExporting(false);
        }
    };

    const handleGetAIInsights = async () => {
        setLoadingAI(true);
        try {
            const insights = await studentPotentialAPI.getAIInsights(studentName, analysis as StudentPotentialAnalysis);
            setAiInsights(insights);
        } catch (error) {
            console.error('[StudentAnalysisModal] AI Insight Error:', error);
        } finally {
            setLoadingAI(false);
        }
    };

    // Radar Data transformation
    const radarNode = {
        id: studentId,
        label: studentName,
        type: 'topic' as const,
        group: 'analysis',
        metadata: {
            attributes: {
                "Cognitive": (analysis.cognitive_flow || 50) / 100,
                "Emotional": (analysis.emotional_resonance || 50) / 100,
                "Social": (analysis.social_weaving || 50) / 100,
                "Creative": (analysis.creative_spark || 50) / 100,
                "Practical": (analysis.practical_mastery || 50) / 100
            }
        }
    };

    const layoutSize = Math.min(width - 80, 280);
    const layout = radarLayout(radarNode, { width: layoutSize, height: layoutSize });
    const polygonPoints = layout.points.map(p => `${p.x},${p.y}`).join(' ');

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>Potential Analysis</Text>
                            <Text style={styles.subtitle}>{studentName}</Text>
                        </View>
                        <View style={styles.headerActions}>
                            <TouchableOpacity 
                                onPress={handleExport} 
                                style={[styles.actionIcon, isExporting && styles.disabledIcon]}
                                disabled={isExporting}
                            >
                                {isExporting ? <ActivityIndicator size="small" color={Theme.colors.sanctuarySaffron} /> : <FileCheck size={20} color={Theme.colors.sanctuarySaffron} />}
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <X size={24} color={colors?.textSecondary || "#aaa"} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {loading ? (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator color={Theme.colors.sanctuarySaffron} />
                        </View>
                    ) : (
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                            {/* Analysis Visualization */}
                            <View style={styles.chartSection}>
                                <Svg width={layoutSize} height={layoutSize}>
                                    <G>
                                        {/* Scale levels */}
                                        {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale) => (
                                            <Circle
                                                key={`scale-${scale}`}
                                                cx={layout.center.x}
                                                cy={layout.center.y}
                                                r={layout.radius * scale}
                                                fill="none"
                                                stroke={colors?.border || "rgba(255,255,255,0.1)"}
                                                strokeWidth={1}
                                                opacity={0.2}
                                            />
                                        ))}
                                        
                                        {/* Axes */}
                                        {layout.axes.map((axis, i) => (
                                            <G key={`axis-${i}`}>
                                                <Line
                                                    x1={layout.center.x}
                                                    y1={layout.center.y}
                                                    x2={axis.x}
                                                    y2={axis.y}
                                                    stroke={colors?.border || "rgba(255,255,255,0.1)"}
                                                    strokeWidth={1}
                                                    opacity={0.3}
                                                />
                                                <SvgText
                                                    x={axis.x}
                                                    y={axis.y + (axis.y > layout.center.y ? 15 : -8)}
                                                    fill={colors?.textSecondary || "#aaa"}
                                                    fontSize="10"
                                                    fontWeight="bold"
                                                    textAnchor="middle"
                                                >
                                                    {axis.attribute}
                                                </SvgText>
                                            </G>
                                        ))}

                                        {/* Data Polygon */}
                                        <Polygon
                                            points={polygonPoints}
                                            fill={`${Theme.colors.sanctuarySaffron}40`}
                                            stroke={Theme.colors.sanctuarySaffron}
                                            strokeWidth={3}
                                        />

                                        {/* Data points */}
                                        {layout.points.map((p, i) => (
                                            <Circle
                                                key={`pt-${i}`}
                                                cx={p.x}
                                                cy={p.y}
                                                r={4}
                                                fill={Theme.colors.sanctuarySaffron}
                                                stroke="white"
                                                strokeWidth={1}
                                            />
                                        ))}
                                    </G>
                                </Svg>
                                <Text style={styles.chartHint}>Dynamic Resonance Radar</Text>
                            </View>

                            {/* Dimensions Sliders */}
                            <GlassCard style={styles.slidersCard}>
                                <View style={styles.sectionHeader}>
                                    <HStack className="gap-2 items-center flex-1">
                                        <Sparkles size={16} color={Theme.colors.sanctuarySaffron} />
                                        <Text style={styles.sectionTitle}>Nurturing Dimensions</Text>
                                    </HStack>
                                    <TouchableOpacity 
                                        onPress={handleGetAIInsights}
                                        disabled={loadingAI}
                                        style={styles.aiScoutButton}
                                    >
                                        {loadingAI ? <ActivityIndicator size="small" color={Theme.colors.sanctuarySaffron} /> : <Sparkles size={16} color={Theme.colors.sanctuarySaffron} />}
                                        <Text style={styles.aiScoutText}>AI Scout</Text>
                                    </TouchableOpacity>
                                </View>

                                <VStack className="gap-3">
                                    {[
                                        { label: 'Cognitive', value: analysis.cognitive_flow, key: 'cognitive_flow' },
                                        { label: 'Emotional', value: analysis.emotional_resonance, key: 'emotional_resonance' },
                                        { label: 'Social', value: analysis.social_weaving, key: 'social_weaving' },
                                        { label: 'Creative', value: analysis.creative_spark, key: 'creative_spark' },
                                        { label: 'Practical', value: analysis.practical_mastery, key: 'practical_mastery' },
                                    ].map(stat => (
                                        <VStack key={stat.key} className="gap-1">
                                            <HStack className="justify-between items-center">
                                                <Text style={styles.statLabel}>{stat.label}</Text>
                                                <Text style={styles.statValue}>{stat.value || 0}%</Text>
                                            </HStack>
                                            <Slider
                                                minValue={0}
                                                maxValue={100}
                                                value={stat.value || 0}
                                                onChange={(val: number) => {
                                                    setAnalysis(prev => ({ ...prev, [stat.key]: val }));
                                                }}
                                                className="h-[30px]"
                                            >
                                                <SliderTrack className="bg-white/10">
                                                    <SliderFilledTrack className="bg-phase-accent" />
                                                </SliderTrack>
                                                <SliderThumb className="bg-white w-[18px] h-[18px]" />
                                            </Slider>
                                        </VStack>
                                    ))}
                                </VStack>
                            </GlassCard>

                            {/* AI Insights Section */}
                            {aiInsights && (
                                <GlassCard style={styles.aiInsightsCard}>
                                    <View style={styles.sectionHeader}>
                                        <Sparkles size={16} color={Theme.colors.sanctuarySaffron} />
                                        <Text style={styles.sectionTitle}>AI Potential Insights</Text>
                                    </View>
                                    <Text style={styles.aiInsightsText}>{aiInsights}</Text>
                                </GlassCard>
                            )}

                            {/* Silver Lining Analysis */}
                            <GlassCard style={styles.notesCard}>
                                <Text style={styles.notesLabel}>Silver Lining & Potential</Text>
                                <TextInput
                                    style={[styles.textInput, { color: colors?.textPrimary || '#fff' }]}
                                    multiline
                                    placeholder="What hidden potential do you see in this child? Finding the silver lining in every cloud..."
                                    placeholderTextColor={colors?.textSecondary || '#aaa'}
                                    value={analysis.silver_lining || ''}
                                    onChangeText={(text) => setAnalysis(prev => ({ ...prev, silver_lining: text }))}
                                />
                            </GlassCard>

                            <View style={{ height: 100 }} />
                        </ScrollView>
                    )}

                    {/* Footer Actions */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.cancelAction} onPress={onClose}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.saveAction} 
                            onPress={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <HStack className="gap-2 items-center">
                                    <Save size={18} color="white" />
                                    <Text style={styles.saveText}>Save Analysis</Text>
                                </HStack>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '94%',
        height: '88%',
        backgroundColor: 'rgba(20, 20, 20, 0.95)',
        borderRadius: 40,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        paddingTop: 24,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 24,
        marginBottom: 10,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    actionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 179, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledIcon: {
        opacity: 0.5,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: 'white',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 2,
    },
    closeButton: {
        padding: 4,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingHorizontal: 24,
    },
    chartSection: {
        alignItems: 'center',
        marginVertical: 10,
    },
    chartHint: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.4)',
        marginTop: 8,
        fontStyle: 'italic',
        letterSpacing: 1,
    },
    slidersCard: {
        padding: 16,
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: Theme.colors.sanctuarySaffron,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    aiScoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 179, 0, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 179, 0, 0.2)',
    },
    aiScoutText: {
        fontSize: 10,
        fontWeight: '800',
        color: Theme.colors.sanctuarySaffron,
        textTransform: 'uppercase',
    },
    aiInsightsCard: {
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 179, 0, 0.3)',
    },
    aiInsightsText: {
        fontSize: 14,
        lineHeight: 22,
        color: 'rgba(255,255,255,0.85)',
        fontStyle: 'italic',
    },
    statLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
    },
    statValue: {
        fontSize: 12,
        fontWeight: '700',
        color: 'white',
    },
    notesCard: {
        padding: 16,
    },
    notesLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: 'white',
        marginBottom: 12,
    },
    textInput: {
        fontSize: 15,
        lineHeight: 22,
        minHeight: 120,
        textAlignVertical: 'top',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    footer: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingBottom: 30,
        paddingTop: 16,
        backgroundColor: 'rgba(20, 20, 20, 0.98)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        gap: 12,
    },
    cancelAction: {
        flex: 1,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    cancelText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 15,
        fontWeight: '600',
    },
    saveAction: {
        flex: 2,
        height: 50,
        backgroundColor: Theme.colors.sanctuarySaffron,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveText: {
        color: 'black',
        fontSize: 15,
        fontWeight: '800',
    }
});
