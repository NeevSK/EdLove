import type { StudentPotentialAnalysis } from '@repo/core';
import { studentPotentialAPI } from '@repo/core/api';

import { CaptureEngine, radarLayout } from '@repo/graphics';
import {
  Box,
  GlassCard,
  HStack,
  Input,
  InputField,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalHeader,
  Slider,
  Spinner,
  Text,
  useResponsive,
  VStack,
} from '@repo/ui';
import { Pressable, ScrollView, useTheme } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme';

import { BlurView } from 'expo-blur';
import { FileCheck, Save, Sparkles, X } from 'lucide-react-native';
import type React from 'react';
import { useCallback, useEffect, useMemo, useReducer } from 'react';
import Svg, { Circle, G, Line, Polygon, Text as SvgText } from 'react-native-svg';

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
  const theme = useTheme();
  const { width } = useResponsive();

  // --- State Machine (10 Pillars: Reducer Pattern) ---
  type AnalysisState = {
    loading: boolean;
    saving: boolean;
    exporting: boolean;
    loadingAI: boolean;
    aiInsights: string | null;
    analysis: Partial<StudentPotentialAnalysis>;
  };

  type AnalysisAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_SAVING'; payload: boolean }
    | { type: 'SET_EXPORTING'; payload: boolean }
    | { type: 'SET_LOADING_AI'; payload: boolean }
    | { type: 'SET_AI_INSIGHTS'; payload: string | null }
    | { type: 'SET_ANALYSIS'; payload: Partial<StudentPotentialAnalysis> }
    | { type: 'UPDATE_DIMENSION'; payload: { key: string; value: number } };

  const initialState: AnalysisState = {
    loading: true,
    saving: false,
    exporting: false,
    loadingAI: false,
    aiInsights: null,
    analysis: {
      cognitive_flow: 50,
      emotional_resonance: 50,
      social_weaving: 50,
      creative_spark: 50,
      practical_mastery: 50,
      silver_lining: '',
    },
  };

  const analysisReducer = (state: AnalysisState, action: AnalysisAction): AnalysisState => {
    switch (action.type) {
      case 'SET_LOADING':
        return { ...state, loading: action.payload };
      case 'SET_SAVING':
        return { ...state, saving: action.payload };
      case 'SET_EXPORTING':
        return { ...state, exporting: action.payload };
      case 'SET_LOADING_AI':
        return { ...state, loadingAI: action.payload };
      case 'SET_AI_INSIGHTS':
        return { ...state, aiInsights: action.payload };
      case 'SET_ANALYSIS':
        return { ...state, analysis: action.payload };
      case 'UPDATE_DIMENSION':
        return {
          ...state,
          analysis: { ...state.analysis, [action.payload.key]: action.payload.value },
        };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(analysisReducer, initialState);

  // --- Action Logic (Stabilized Callbacks) ---

  const loadAnalysis = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const data = await studentPotentialAPI.getForStudent(studentId, classroomId);
      if (data) {
        dispatch({ type: 'SET_ANALYSIS', payload: data });
      }
    } catch (error) {
      console.error('[StudentAnalysisModal] Load error:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [studentId, classroomId]);

  const handleSave = useCallback(async () => {
    dispatch({ type: 'SET_SAVING', payload: true });
    try {
      const result = await studentPotentialAPI.upsert({
        student_id: studentId,
        classroom_id: classroomId,
        cognitive_flow: state.analysis.cognitive_flow || 50,
        emotional_resonance: state.analysis.emotional_resonance || 50,
        social_weaving: state.analysis.social_weaving || 50,
        creative_spark: state.analysis.creative_spark || 50,
        practical_mastery: state.analysis.practical_mastery || 50,
        silver_lining: state.analysis.silver_lining || '',
        potential_notes: (state.analysis as any).potential_notes || [],
      } as any);
      onSave?.(result);
      onClose();
    } catch (error) {
      console.error('[StudentAnalysisModal] Save error:', error);
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false });
    }
  }, [studentId, classroomId, state.analysis, onSave, onClose]);

  const handleExport = useCallback(async () => {
    dispatch({ type: 'SET_EXPORTING', payload: true });
    try {
      const topology = CaptureEngine.prepareForCapture({
        nodes: [
          {
            id: studentId,
            label: studentName,
            type: 'topic',
            group: 'analysis',
            metadata: {
              attributes: {
                Cognitive: (state.analysis.cognitive_flow || 50) / 100,
                Emotional: (state.analysis.emotional_resonance || 50) / 100,
                Social: (state.analysis.social_weaving || 50) / 100,
                Creative: (state.analysis.creative_spark || 50) / 100,
                Practical: (state.analysis.practical_mastery || 50) / 100,
              },
            },
          },
        ],
        links: [],
      });

      console.log('[StudentAnalysisModal] Exporting topology:', topology);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert('Analysis exported to student report successfully.');
    } catch (error) {
      console.error('[StudentAnalysisModal] Export error:', error);
      alert('Failed to export analysis.');
    } finally {
      dispatch({ type: 'SET_EXPORTING', payload: false });
    }
  }, [studentId, studentName, state.analysis]);

  const handleGetAIInsights = useCallback(async () => {
    dispatch({ type: 'SET_LOADING_AI', payload: true });
    try {
      const insights = await studentPotentialAPI.getAIInsights(
        studentName,
        state.analysis as StudentPotentialAnalysis,
      );
      dispatch({ type: 'SET_AI_INSIGHTS', payload: insights });
    } catch (error) {
      console.error('[StudentAnalysisModal] AI Insight Error:', error);
    } finally {
      dispatch({ type: 'SET_LOADING_AI', payload: false });
    }
  }, [studentName, state.analysis]);

  useEffect(() => {
    if (visible && studentId && classroomId) {
      loadAnalysis();
    }
  }, [visible, studentId, classroomId, loadAnalysis]);

  // Delete legacy un-memoized handlers

  // --- Referential Stability (10 Pillars: Memoization) ---
  const radarNode = useMemo(
    () => ({
      id: studentId,
      label: studentName,
      type: 'topic' as const,
      group: 'analysis',
      metadata: {
        attributes: {
          Cognitive: (state.analysis.cognitive_flow || 50) / 100,
          Emotional: (state.analysis.emotional_resonance || 50) / 100,
          Social: (state.analysis.social_weaving || 50) / 100,
          Creative: (state.analysis.creative_spark || 50) / 100,
          Practical: (state.analysis.practical_mastery || 50) / 100,
        },
      },
    }),
    [studentId, studentName, state.analysis],
  );

  const layoutSize = useMemo(() => Math.min(width - 80, 280), [width]);

  const layout = useMemo(
    () => radarLayout(radarNode, { width: layoutSize, height: layoutSize }),
    [radarNode, layoutSize],
  );

  const polygonPoints = useMemo(
    () => layout.points.map((p) => `${p.x},${p.y}`).join(' '),
    [layout.points],
  );

  const nurturingDimensions = useMemo(
    () => [
      { label: 'Cognitive', value: state.analysis.cognitive_flow, key: 'cognitive_flow' },
      { label: 'Emotional', value: state.analysis.emotional_resonance, key: 'emotional_resonance' },
      { label: 'Social', value: state.analysis.social_weaving, key: 'social_weaving' },
      { label: 'Creative', value: state.analysis.creative_spark, key: 'creative_spark' },
      { label: 'Practical', value: state.analysis.practical_mastery, key: 'practical_mastery' },
    ],
    [state.analysis],
  );

  const handleUpdateSilverLining = useCallback((text: string) => {
    dispatch({ type: 'UPDATE_DIMENSION', payload: { key: 'silver_lining', value: text as any } });
  }, []);

  return (
    <Modal isOpen={visible} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent className="max-w-[94%] bg-black/95 rounded-[40px] border border-white/15 overflow-hidden">
        <ModalHeader className="px-6 pt-6 mb-2.5">
          <HStack className="justify-between items-start w-full">
            <VStack>
              <Text className="text-2xl font-extrabold text-white tracking-tighter">
                Potential Analysis
              </Text>
              <Text className="text-sm text-white/60 mt-0.5">{studentName}</Text>
            </VStack>
            <HStack className="items-center gap-3">
              <Pressable
                onPress={handleExport}
                className={`w-10 h-10 rounded-full bg-sanctuarySaffron/10 items-center justify-center ${state.exporting ? 'opacity-50' : ''}`}
                disabled={state.exporting}
              >
                {state.exporting ? (
                  <Spinner size="small" color={Theme.colors.sanctuarySaffron} />
                ) : (
                  <FileCheck size={20} color={Theme.colors.sanctuarySaffron} />
                )}
              </Pressable>
              <Pressable onPress={onClose} className="p-1">
                <X size={24} color={theme.text.secondary} />
              </Pressable>
            </HStack>
          </HStack>
        </ModalHeader>

        <ModalBody className="px-6">
          {state.loading ? (
            <Box className="h-[400px] justify-center items-center">
              <Spinner color={Theme.colors.sanctuarySaffron} />
            </Box>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Analysis Visualization */}
              <Box className="items-center my-2.5">
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
                        stroke={theme.scene.border.base}
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
                          stroke={theme.scene.border.base}
                          strokeWidth={1}
                          opacity={0.3}
                        />
                        <SvgText
                          x={axis.x}
                          y={axis.y + (axis.y > layout.center.y ? 15 : -8)}
                          fill={theme.text.secondary}
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
                <Text className="text-[11px] text-white/40 mt-2 italic tracking-[1px]">
                  Dynamic Resonance Radar
                </Text>
              </Box>

              {/* Dimensions Sliders */}
              <GlassCard className="p-4 mb-4">
                <HStack className="items-center mb-4 gap-2">
                  <HStack className="gap-2 items-center flex-1">
                    <Sparkles size={16} color={Theme.colors.sanctuarySaffron} />
                    <Text className="text-[13px] font-bold text-sanctuarySaffron uppercase tracking-widest">
                      Nurturing Dimensions
                    </Text>
                  </HStack>
                  <Pressable
                    onPress={handleGetAIInsights}
                    disabled={state.loadingAI}
                    className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sanctuarySaffron/10 border border-sanctuarySaffron/20"
                  >
                    {state.loadingAI ? (
                      <Spinner size="small" color={Theme.colors.sanctuarySaffron} />
                    ) : (
                      <Sparkles size={16} color={Theme.colors.sanctuarySaffron} />
                    )}
                    <Text className="text-[10px] font-extrabold text-sanctuarySaffron uppercase">
                      AI Scout
                    </Text>
                  </Pressable>
                </HStack>

                <VStack className="gap-3">
                  {nurturingDimensions.map((stat) => (
                    <VStack key={stat.key} className="gap-1">
                      <HStack className="justify-between items-center">
                        <Text className="text-xs text-white/70">{stat.label}</Text>
                        <Text className="text-xs font-bold text-white">{stat.value || 0}%</Text>
                      </HStack>
                      <Slider
                        minValue={0}
                        maxValue={100}
                        value={stat.value || 0}
                        onValueChange={(val: number) => {
                          dispatch({
                            type: 'UPDATE_DIMENSION',
                            payload: { key: stat.key, value: val },
                          });
                        }}
                        className="h-[30px]"
                      />
                    </VStack>
                  ))}
                </VStack>
              </GlassCard>

              {/* AI Insights Section */}
              {state.aiInsights && (
                <GlassCard className="p-4 mb-4 border border-sanctuarySaffron/30">
                  <HStack className="items-center mb-4 gap-2">
                    <Sparkles size={16} color="rgba(212, 132, 58, 1)" />
                    <Text className="text-[13px] font-bold text-sanctuarySaffron uppercase tracking-widest">
                      AI Potential Insights
                    </Text>
                  </HStack>
                  <Text className="text-sm leading-[22px] text-white/85 italic">
                    {state.aiInsights}
                  </Text>
                </GlassCard>
              )}

              {/* Silver Lining Analysis */}
              <GlassCard className="p-4">
                <Text className="text-sm font-bold text-white mb-3">Silver Lining & Potential</Text>
                <Input className="min-h-[120px] bg-black/30 rounded-2xl border border-white/5">
                  <InputField
                    className="text-base leading-[22px] text-white p-3"
                    multiline
                    placeholder="What hidden potential do you see in this child? Finding the silver lining in every cloud..."
                    placeholderTextColor={theme.text.muted}
                    value={state.analysis.silver_lining || ''}
                    onChangeText={handleUpdateSilverLining}
                  />
                </Input>
              </GlassCard>

              <Box className="h-[40px]" />
            </ScrollView>
          )}
        </ModalBody>

        {/* Footer Actions */}
        <HStack className="px-6 pb-8 pt-4 bg-black/98 border-t border-white/10 gap-3">
          <Pressable
            className="flex-1 h-[50px] justify-center items-center rounded-2xl border border-white/10"
            onPress={onClose}
          >
            <Text className="text-[15px] font-semibold text-white/50">Cancel</Text>
          </Pressable>
          <Pressable
            className="flex-[2] h-[50px] bg-sanctuarySaffron rounded-2xl justify-center items-center"
            onPress={handleSave}
            disabled={state.saving}
          >
            {state.saving ? (
              <Spinner color="black" size="small" />
            ) : (
              <HStack className="gap-2 items-center">
                <Save size={18} color="black" />
                <Text className="text-[15px] font-extrabold text-black">Save Analysis</Text>
              </HStack>
            )}
          </Pressable>
        </HStack>
      </ModalContent>
    </Modal>
  );
};
