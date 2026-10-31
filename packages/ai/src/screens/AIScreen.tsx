import { type Message, type MessageArtifact, useAIAgent } from '@repo/ai/hooks/useAIAgent';
import {
  SANCTUARY_APP_INTENTS,
  SANCTUARY_EXTERNAL_AI_BRIDGES,
  SANCTUARY_SLASH_COMMANDS,
} from '@repo/core';
import { useDomainFeature } from '@repo/core/logic';
import { useAuthStore } from '@repo/core/store';
import { useScopeSessionStore } from '@repo/core/store/scopeSession';
import { ChatComposer } from '@repo/ui/components/ChatComposer';
import { MessageBubble } from '@repo/ui/components/MessageBubble';
import { SanctuaryLegendList } from '@repo/ui/components/SanctuaryLegendList';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { ChatProvider, useChatScrollToIndex } from '@repo/ui/context/ChatContext';
import {
  ChevronLeft,
  CircleCheck,
  EyeOff,
  History,
  Lock,
  MessageSquare,
  Pen,
  Sparkles,
  Trash2,
  Zap,
} from '@repo/ui/icons';
import { Box, HStack, Pressable, Text, useTheme, VStack } from '@repo/ui/primitives';
import { alpha } from '@repo/ui/theme';
import { useWorld } from '@repo/ui/theme/native';
import { tokens } from '@repo/ui/tokens';
import { hapticLight, hapticSuccess, hapticWarning } from '@repo/ui/utils/haptics';
import { safeBack } from '@repo/ui/utils/navigation';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Platform, ScrollView, StyleSheet } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export type AIScreenTab = 'chat' | 'agent';

export interface AIScreenProps {
  initialTab?: AIScreenTab;
  initialPrivacyMode?: 'saved' | 'temporary' | 'incognito';
  onClose?: () => void;
  classroomContext?: {
    id: string;
    name: string;
    term?: string;
  };
}

interface ProposalCard {
  id: string;
  title: string;
  description: string;
  targetDomain: string;
  draftSummary: string;
  status: 'pending' | 'accepted' | 'edited' | 'discarded';
}

/**
 * Unified AIScreen
 *
 * Invariants Enforced:
 * 1. Screen is canonical AIScreen (not Tutii). Tutii is solely an ambient companion visual.
 * 2. Header pill switches between [ Chat ] (Gen 2/3) and [ ⚡ Agent 🔒 ] (Gen 4 Pro / BYOK).
 * 3. Fast Ingress controls: [ ⏪ Rewind History ] drawer and [ 🕵️ Incognito ] zero-persistence mode.
 * 4. Human-in-the-loop Proposal Review Card for Agent missions before commit.
 */
export default function AIScreen({
  initialTab = 'chat',
  initialPrivacyMode,
  onClose,
  classroomContext,
}: AIScreenProps) {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string; mode?: string; threadId?: string }>();
  const { gradientNodes, glass, text } = useTheme();
  // Accent, outcome and on-accent colours come from the active world.
  const w = useWorld().tokens;
  const overlay = useWorld().recipes.overlay;
  const { t } = useTranslation();
  const { result: aiFeature } = useDomainFeature('ai-assistant');

  // Active view tab: Chat vs Agent
  const [activeTab, setActiveTab] = useState<AIScreenTab>(
    params.tab === 'agent' || initialTab === 'agent' ? 'agent' : 'chat',
  );

  // History / Rewind drawer state
  const [historyOpen, setHistoryOpen] = useState(false);

  // 2026 Rich Message UI states: Collapsible Reasoning, Tool Inspector & Artifact Canvas Modal
  const [expandedThinkingIds, setExpandedThinkingIds] = useState<Record<string, boolean>>({});
  const [expandedToolIds, setExpandedToolIds] = useState<Record<string, boolean>>({});
  const [activeCanvasArtifact, setActiveCanvasArtifact] = useState<MessageArtifact | null>(null);
  const [isAttachmentTrayOpen, setIsAttachmentTrayOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyText = (id: string, value: string) => {
    hapticSuccess();
    if (
      typeof globalThis !== 'undefined' &&
      'navigator' in globalThis &&
      (
        globalThis as unknown as {
          navigator?: { clipboard?: { writeText?: (t: string) => Promise<void> } };
        }
      ).navigator?.clipboard?.writeText
    ) {
      void (
        globalThis as unknown as {
          navigator: { clipboard: { writeText: (t: string) => Promise<void> } };
        }
      ).navigator.clipboard.writeText(value);
    }
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId((prev) => (prev === id ? null : prev));
    }, 1800);
  };

  // Agent proposal state (Human-in-the-loop gate)
  const [activeProposal, setActiveProposal] = useState<ProposalCard | null>({
    id: 'prop-lesson-draft-42',
    title: 'Grade 8 Science · Ecology & Biomes Draft',
    description:
      'Autonomous preparation agent has drafted 3 lesson units, reading prompts, and attendance checkpoints.',
    targetDomain: 'classroom.curriculum',
    draftSummary:
      'Unit 1: Energy Transfer in Food Webs\nUnit 2: Ecosystem Resilience & Niches\nUnit 3: Biomass pyramids and trophic dynamics',
    status: 'pending',
  });

  const {
    messages,
    input,
    setInput,
    handleSubmit,
    isThinking,
    billingMode,
    setBillingMode,
    privacyMode,
    setPrivacyMode,
    threads,
    loadThreads,
    selectThread,
    deleteThread,
    startNewThread,
    quota,
    activeAgentRun,
    isDispatchingAgent,
    dispatchAgentMission,
    promoteAgentRun,
    domainEnvelope,
    isContextDetached,
    setContextDetached,
    ageBand,
    setAgeBand,
    activePedagogyProfile,
    enableWorldSearch,
    setEnableWorldSearch,
    stopGeneration,
    regenerateLastResponse,
    reasoningEffort,
    setReasoningEffort,
    setExecutionMode,
    pendingAttachments,
    attachContextSnippet,
    removeAttachment,
  } = useAIAgent();

  const cyclePedagogyLens = () => {
    const order: Array<typeof ageBand> = [
      undefined,
      'early_years_6_9',
      'middle_years_10_13',
      'adolescent_14_18',
      'adult_educator',
      'adult_guardian',
      'adult_leader',
    ];
    const currentIndex = order.indexOf(ageBand);
    const nextBand = order[(currentIndex + 1) % order.length];
    void setAgeBand(nextBand);
  };

  // Synchronize live durable agent run into the Proposal Review Card when available
  useEffect(() => {
    if (activeAgentRun?.summaryDraft) {
      setActiveProposal({
        id: activeAgentRun.runId,
        title:
          activeAgentRun.runType === 'student_support_snapshot'
            ? 'Student Support Snapshot Draft'
            : 'Teacher Classroom Summary & Lesson Draft',
        description:
          'Durable background agent completed multi-step synthesis. Review before promoting to teacher notes.',
        targetDomain: 'classroom.teacher_notes',
        draftSummary: activeAgentRun.summaryDraft,
        status: activeAgentRun.promotedTeacherNoteId ? 'accepted' : 'pending',
      });
    }
  }, [activeAgentRun]);

  const userRole = useScopeSessionStore((state) => state.snapshot?.activeBond?.capacity ?? null);

  // Apply the requested privacy mode once, on arrival. A link may make a chat more
  // private but never less: it cannot turn incognito back into a saved chat, and
  // the person's own toggle is never overridden afterwards.
  const appliedRouteMode = useRef(false);
  useEffect(() => {
    if (appliedRouteMode.current) return;
    appliedRouteMode.current = true;
    const requestedMode =
      params.mode === 'incognito' || params.mode === 'saved' || params.mode === 'temporary'
        ? params.mode
        : initialPrivacyMode;
    if (!requestedMode || requestedMode === privacyMode) return;
    if (privacyMode === 'incognito') return;
    if (privacyMode === 'temporary' && requestedMode === 'saved') return;
    void setPrivacyMode(requestedMode);
  }, [initialPrivacyMode, params.mode, privacyMode, setPrivacyMode]);

  useEffect(() => {
    if (params.threadId && typeof params.threadId === 'string') {
      void selectThread(params.threadId);
    }
  }, [params.threadId, selectThread]);

  const handleSend = () => {
    if (!input.trim()) return;
    hapticLight();
    handleSubmit();
  };

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      safeBack('/self');
    }
  };

  const toggleIncognito = () => {
    hapticLight();
    const next = privacyMode === 'incognito' ? 'saved' : 'incognito';
    void setPrivacyMode(next);
  };

  // Human-in-the-loop: only a proposal that is this agent run can be promoted, and it
  // shows as accepted only once the service confirms the promotion.
  const handleAcceptProposal = async () => {
    if (!activeProposal || !activeAgentRun?.runId || activeProposal.id !== activeAgentRun.runId) {
      hapticWarning();
      return;
    }
    const promoted = await promoteAgentRun(activeAgentRun.runId);
    if (!promoted) {
      hapticWarning();
      return;
    }
    hapticSuccess();
    setActiveProposal({ ...activeProposal, status: 'accepted' });
  };

  const handleCommissionAgent = () => {
    hapticLight();
    void dispatchAgentMission({
      classroomId: classroomContext?.id ?? '00000000-0000-0000-0000-000000000001',
      focusPrompt: input.trim() || 'Prepare weekly classroom synthesis and lesson units',
      capability: 'teacher-summary',
    });
  };

  const handleDiscardProposal = () => {
    hapticWarning();
    if (activeProposal) {
      setActiveProposal({ ...activeProposal, status: 'discarded' });
    }
  };

  const renderChatMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    const isThinkingExpanded = Boolean(expandedThinkingIds[item.id]);

    return (
      <Animated.View
        entering={FadeInUp.springify().damping(15)}
        layout={LinearTransition.springify()}
      >
        <VStack className={isUser ? 'items-end mb-2' : 'items-start mb-3'}>
          {/* 1. Collapsible Extended Reasoning / Thinking Trace (2026 Standard) */}
          {!isUser && item.thinkingText && (
            <Box
              style={{
                backgroundColor: glass.surface.bg,
                borderColor: glass.surface.border,
                borderWidth: 1,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 8,
                marginBottom: 6,
                maxWidth: '88%',
              }}
            >
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  hapticLight();
                  setExpandedThinkingIds((prev) => ({
                    ...prev,
                    [item.id]: !prev[item.id],
                  }));
                }}
              >
                <HStack className="items-center justify-between gap-2">
                  <Text style={{ fontSize: 11, fontWeight: '700', color: w.lampDeep }}>
                    🧠 Reasoning Process {isThinkingExpanded ? '▾' : '▸'}
                  </Text>
                  <Text style={{ fontSize: 10, color: text.secondary }}>
                    {isThinkingExpanded ? 'Hide thoughts' : 'Tap to inspect'}
                  </Text>
                </HStack>
              </Pressable>
              {isThinkingExpanded && (
                <Text
                  style={{
                    fontSize: 11,
                    color: text.secondary,
                    marginTop: 6,
                    fontStyle: 'italic',
                    lineHeight: 16,
                  }}
                >
                  {item.thinkingText}
                </Text>
              )}
            </Box>
          )}

          {/* 2. Live Inline Tool Execution Pills (Search, Sanctuary MCP, Artifacts, Proposals) */}
          {!isUser && item.toolCalls && item.toolCalls.length > 0 && (
            <VStack className="gap-1 mb-2" style={{ maxWidth: '88%' }}>
              {item.toolCalls.map((tc) => {
                const isExpanded = Boolean(expandedToolIds[tc.id]);
                const friendlyLabel =
                  tc.name === 'search_world_knowledge'
                    ? '🌍 Searched World Knowledge'
                    : tc.name === 'query_sanctuary_mcp'
                      ? '🏛️ Queried Sanctuary MCP'
                      : tc.name === 'create_artifact_canvas'
                        ? '📄 Created Artifact Canvas'
                        : tc.name === 'stage_action_proposal'
                          ? '🛡️ Staged Quarantined Proposal'
                          : `🔧 Tool: ${tc.name}`;

                return (
                  <Box
                    key={tc.id}
                    style={{
                      backgroundColor: alpha(w.lampDeep, 0.09),
                      borderColor: alpha(w.lampDeep, 0.33),
                      borderWidth: 1,
                      borderRadius: 10,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                    }}
                  >
                    <Pressable
                      accessibilityRole="button"
                      onPress={() =>
                        setExpandedToolIds((prev) => ({ ...prev, [tc.id]: !prev[tc.id] }))
                      }
                    >
                      <HStack className="items-center justify-between gap-2">
                        <Text style={{ fontSize: 11, fontWeight: '700', color: w.lampDeep }}>
                          {friendlyLabel}
                        </Text>
                        <Text style={{ fontSize: 10, color: text.secondary }}>
                          {tc.state === 'complete' ? '✓ Done' : 'Running…'} {isExpanded ? '▾' : '▸'}
                        </Text>
                      </HStack>
                    </Pressable>
                    {isExpanded && (
                      <Box style={{ marginTop: 4 }}>
                        {tc.arguments ? (
                          <Text style={{ fontSize: 10, color: text.secondary }}>
                            Input: {tc.arguments}
                          </Text>
                        ) : null}
                        {tc.outputSummary ? (
                          <Text style={{ fontSize: 10, color: text.primary, marginTop: 2 }}>
                            Output: {tc.outputSummary}
                          </Text>
                        ) : null}
                      </Box>
                    )}
                  </Box>
                );
              })}
            </VStack>
          )}

          {/* 3. Main Message Bubble */}
          <MessageBubble
            content={item.content}
            variant={isUser ? 'user' : 'assistant'}
            maxWidthClassName="max-w-[85%]"
            onCodeBlockPress={(code, language) => {
              hapticLight();
              setActiveCanvasArtifact({
                artifactId: `code-canvas-${item.id}`,
                title: `Code Snippet (${language ?? 'code'})`,
                kind: 'code',
                language: language ?? 'typescript',
                content: code,
              });
            }}
          />

          {/* 4. Interactive Artifact / Canvas Cards */}
          {!isUser && item.artifacts && item.artifacts.length > 0 && (
            <VStack className="gap-2 mt-2" style={{ width: '86%' }}>
              {item.artifacts.map((art) => (
                <Box
                  key={art.artifactId}
                  style={{
                    backgroundColor: glass.surface.bg,
                    borderColor: alpha(w.lamp, 0.53),
                    borderWidth: 1,
                    borderRadius: 12,
                    padding: 12,
                  }}
                >
                  <HStack className="items-center justify-between mb-1">
                    <Text style={{ fontSize: 10, fontWeight: '800', color: w.lampDeep }}>
                      📄 ARTIFACT · {art.kind.toUpperCase()}
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        hapticLight();
                        setActiveCanvasArtifact(art);
                      }}
                      style={{
                        backgroundColor: w.lamp,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{ fontSize: 10, fontWeight: '700', color: w.onLamp }}>
                        Open Canvas ↗
                      </Text>
                    </Pressable>
                  </HStack>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: text.primary }}>
                    {art.title}
                  </Text>
                  <Text
                    numberOfLines={3}
                    style={{ fontSize: 11, color: text.secondary, marginTop: 4 }}
                  >
                    {art.content}
                  </Text>
                </Box>
              ))}
            </VStack>
          )}

          {/* 5. Inline Quarantined Action Proposal Cards */}
          {!isUser && item.proposals && item.proposals.length > 0 && (
            <VStack className="gap-2 mt-2" style={{ width: '86%' }}>
              {item.proposals.map((prop) => (
                <Box
                  key={prop.proposalId}
                  style={{
                    backgroundColor: glass.surface.bg,
                    borderColor: alpha(w.success, 0.53),
                    borderWidth: 1,
                    borderRadius: 12,
                    padding: 12,
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: '800', color: w.success }}>
                    🛡️ QUARANTINED PROPOSAL · {prop.targetDomain}
                  </Text>
                  <Text
                    style={{ fontSize: 13, fontWeight: '700', color: text.primary, marginTop: 2 }}
                  >
                    {prop.title}
                  </Text>
                  <Text style={{ fontSize: 11, color: text.secondary, marginTop: 4 }}>
                    {prop.summaryDraft}
                  </Text>
                  <HStack className="justify-end gap-2 mt-2">
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        hapticSuccess();
                        setActiveProposal({
                          id: prop.proposalId,
                          title: prop.title,
                          description: 'Staged from conversational tool loop',
                          targetDomain: prop.targetDomain,
                          draftSummary: prop.summaryDraft,
                          status: 'accepted',
                        });
                      }}
                      style={[styles.proposalButton, { backgroundColor: w.success }]}
                    >
                      <CircleCheck size={12} color={w.onLamp} />
                      <Text style={{ fontSize: 11, fontWeight: '700', color: w.onLamp }}>
                        {prop.suggestedAction}
                      </Text>
                    </Pressable>
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}

          {/* 6. Interactive Citation Source Pills */}
          {!isUser && item.citations && item.citations.length > 0 && (
            <HStack className="flex-wrap gap-1 mt-2" style={{ maxWidth: '86%' }}>
              {item.citations.map((cite, idx) => (
                <Box
                  key={`${cite.url}-${idx}`}
                  style={{
                    backgroundColor: glass.surface.bg,
                    borderColor: glass.surface.border,
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{ fontSize: 10, fontWeight: '700', color: w.lampDeep }}
                  >
                    [{idx + 1}] {cite.title}
                  </Text>
                </Box>
              ))}
            </HStack>
          )}

          {/* 7. Assistant Message Action Bar (Copy / Regenerate / Open in Canvas) */}
          {!isUser && item.content.length > 0 && (
            <HStack className="items-center gap-3 mt-1 px-1">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Copy response"
                onPress={() => handleCopyText(item.id, item.content)}
              >
                <Text style={{ fontSize: 10, fontWeight: '600', color: text.secondary }}>
                  {copiedId === item.id ? '✓ Copied' : '📋 Copy'}
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Regenerate response"
                onPress={() => {
                  hapticLight();
                  void regenerateLastResponse();
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: '600', color: text.secondary }}>
                  🔄 Regenerate
                </Text>
              </Pressable>

              {item.content.length > 180 && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Open message in Artifact Canvas"
                  onPress={() => {
                    hapticLight();
                    setActiveCanvasArtifact({
                      artifactId: `msg-canvas-${item.id}`,
                      title: 'Companion Synthesis Canvas',
                      kind: 'document',
                      language: 'markdown',
                      content: item.content,
                    });
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: '600', color: w.lampDeep }}>
                    📄 Open in Canvas
                  </Text>
                </Pressable>
              )}
            </HStack>
          )}

          {/* User Message Quick Edit / Reuse Action */}
          {isUser && item.content.length > 0 && (
            <HStack className="items-center gap-2 mt-1 px-1">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Edit and branch message"
                onPress={() => {
                  hapticLight();
                  setInput(item.content);
                }}
              >
                <Text style={{ fontSize: 10, color: text.secondary }}>✏️ Edit</Text>
              </Pressable>
            </HStack>
          )}
        </VStack>
      </Animated.View>
    );
  };

  if (!aiFeature.permitted) return null;

  return (
    <ScreenWrapper backgroundColor={gradientNodes[0]}>
      <ChatProvider>
        <Box style={styles.container}>
          <AIThinkingAnchor isThinking={isThinking} messages={messages} />

          {/* Unified Header */}
          <HStack style={[styles.header, { borderBottomColor: glass.surface.border }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              onPress={handleBack}
              style={[styles.backButton, { backgroundColor: glass.surface.bg }]}
            >
              <ChevronLeft color={text.primary} size={22} />
            </Pressable>

            {/* Central Segmented Pill: [ Chat ] vs [ ⚡ Agent 🔒 ] */}
            <HStack
              style={{
                backgroundColor: glass.surface.bg,
                borderRadius: 20,
                padding: 3,
                borderWidth: 1,
                borderColor: glass.surface.border,
              }}
            >
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: activeTab === 'chat' }}
                onPress={() => {
                  hapticLight();
                  setActiveTab('chat');
                  setExecutionMode('chat');
                }}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 16,
                  backgroundColor: activeTab === 'chat' ? w.lampDeep : 'transparent',
                }}
              >
                <HStack className="items-center gap-1">
                  <MessageSquare
                    size={13}
                    color={activeTab === 'chat' ? w.onLamp : text.secondary}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '700',
                      color: activeTab === 'chat' ? w.onLamp : text.secondary,
                    }}
                  >
                    Chat
                  </Text>
                </HStack>
              </Pressable>

              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: activeTab === 'agent' }}
                onPress={() => {
                  hapticLight();
                  setActiveTab('agent');
                  setExecutionMode('agent');
                }}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 16,
                  backgroundColor: activeTab === 'agent' ? w.lampDeep : 'transparent',
                }}
              >
                <HStack className="items-center gap-1">
                  <Zap size={13} color={activeTab === 'agent' ? w.onLamp : text.secondary} />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '700',
                      color: activeTab === 'agent' ? w.onLamp : text.secondary,
                    }}
                  >
                    Agent
                  </Text>
                  <Lock size={10} color={activeTab === 'agent' ? w.onLamp : w.lampDeep} />
                </HStack>
              </Pressable>
            </HStack>

            {/* Right Controls: Quota Pill + [ ⏪ History ] & [ 🕵️ Incognito ] */}
            <HStack className="gap-2 items-center">
              {quota && (
                <Box
                  style={{
                    backgroundColor: glass.surface.bg,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: glass.surface.border,
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: '700', color: text.secondary }}>
                    {billingMode === 'byok'
                      ? 'BYOK 🔑'
                      : `${quota.remainingToday}/${quota.dailyLimit} ${quota.tier}`}
                  </Text>
                </Box>
              )}

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Rewind History"
                onPress={() => {
                  hapticLight();
                  void loadThreads();
                  setHistoryOpen(true);
                }}
                style={[styles.iconButton, { backgroundColor: glass.surface.bg }]}
              >
                <History color={text.primary} size={18} />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Toggle Incognito Mode"
                onPress={toggleIncognito}
                style={[
                  styles.iconButton,
                  {
                    backgroundColor:
                      privacyMode === 'incognito' ? alpha(w.danger, 0.13) : glass.surface.bg,
                    borderColor: privacyMode === 'incognito' ? w.danger : glass.surface.border,
                    borderWidth: 1,
                  },
                ]}
              >
                <EyeOff color={privacyMode === 'incognito' ? w.danger : text.primary} size={18} />
              </Pressable>
            </HStack>
          </HStack>

          {/* Privacy Incognito Banner if Active */}
          {privacyMode === 'incognito' && (
            <Animated.View
              entering={FadeInDown.duration(200)}
              style={{
                backgroundColor: alpha(w.danger, 0.08),
                paddingHorizontal: 16,
                paddingVertical: 6,
                borderBottomWidth: 1,
                borderBottomColor: alpha(w.danger, 0.2),
              }}
            >
              <HStack className="items-center justify-between">
                <HStack className="items-center gap-2">
                  <EyeOff size={14} color={w.danger} />
                  <Text style={{ fontSize: 11, color: w.danger, fontWeight: '600' }}>
                    Incognito Active: Session history will not be saved
                  </Text>
                </HStack>
              </HStack>
            </Animated.View>
          )}

          {/* Classroom or Policy-Governed Domain Context Strip */}
          {(classroomContext || domainEnvelope || isContextDetached) && (
            <Box
              style={{
                backgroundColor: glass.surface.bg,
                paddingHorizontal: 16,
                paddingVertical: 7,
                borderBottomWidth: 1,
                borderBottomColor: glass.surface.border,
              }}
            >
              <HStack className="items-center justify-between">
                <Text
                  numberOfLines={1}
                  style={{ fontSize: 11, color: text.secondary, flex: 1, marginRight: 8 }}
                >
                  {classroomContext ? (
                    <>
                      Bound Context:{' '}
                      <Text style={{ fontWeight: '700', color: text.primary }}>
                        {classroomContext.name}
                      </Text>
                      {classroomContext.term ? ` (${classroomContext.term})` : ''}
                    </>
                  ) : isContextDetached ? (
                    'Context detached for this conversation (Zero domain signals sent)'
                  ) : domainEnvelope ? (
                    <>
                      Active Context:{' '}
                      <Text style={{ fontWeight: '700', color: text.primary }}>
                        {domainEnvelope.summaryBadge}
                      </Text>{' '}
                      ({domainEnvelope.slices.length} signal
                      {domainEnvelope.slices.length === 1 ? '' : 's'})
                    </>
                  ) : null}
                </Text>

                {!classroomContext && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      isContextDetached ? 'Re-attach domain context' : 'Detach domain context'
                    }
                    onPress={() => {
                      hapticLight();
                      setContextDetached(!isContextDetached);
                    }}
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 8,
                      backgroundColor: isContextDetached
                        ? alpha(w.lamp, 0.13)
                        : alpha(w.onLamp, 0.08),
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: '700',
                        color: isContextDetached ? w.lampDeep : text.secondary,
                      }}
                    >
                      {isContextDetached ? '+ Attach Context' : '✕ Detach'}
                    </Text>
                  </Pressable>
                )}
              </HStack>
            </Box>
          )}

          {/* 4-Sphere Companion Lens (Age/Persona) & External World Grounding Strip */}
          <Box
            style={{
              backgroundColor: glass.surface.bg,
              paddingHorizontal: 16,
              paddingVertical: 6,
              borderBottomWidth: 1,
              borderBottomColor: glass.surface.border,
            }}
          >
            <HStack className="items-center justify-between gap-2">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Companion Persona Lens: ${activePedagogyProfile.label}. Tap to cycle lens.`}
                onPress={() => {
                  hapticLight();
                  cyclePedagogyLens();
                }}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 10,
                  backgroundColor: ageBand ? alpha(w.lamp, 0.13) : alpha(w.onLamp, 0.06),
                  borderWidth: 1,
                  borderColor: ageBand ? alpha(w.lamp, 0.4) : glass.surface.border,
                  flexShrink: 1,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{ fontSize: 10, fontWeight: '700', color: text.primary }}
                >
                  Lens: {activePedagogyProfile.label}
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="switch"
                accessibilityState={{ checked: enableWorldSearch }}
                accessibilityLabel="Toggle Safe External World Search and Grounding"
                onPress={() => {
                  hapticLight();
                  void setEnableWorldSearch(!enableWorldSearch);
                }}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 10,
                  backgroundColor: enableWorldSearch
                    ? alpha(w.lampDeep, 0.13)
                    : alpha(w.onLamp, 0.06),
                  borderWidth: 1,
                  borderColor: enableWorldSearch ? w.lampDeep : glass.surface.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '700',
                    color: enableWorldSearch ? w.lampDeep : text.secondary,
                  }}
                >
                  {enableWorldSearch ? '🌍 World Search: ON' : '🌍 World Search: Auto'}
                </Text>
              </Pressable>
            </HStack>
          </Box>

          {/* Tab Content: Chat vs Agent */}
          {activeTab === 'chat' ? (
            <>
              {/* Chat Area */}
              <SanctuaryLegendList
                keyboardLiftBehavior="whenAtEnd"
                initialScrollAtEnd
                maintainScrollAtEnd
                anchoredEndSpace={
                  isThinking && messages.length > 0
                    ? { anchorIndex: messages.length - 1, anchorOffset: 24 }
                    : undefined
                }
                data={messages}
                renderItem={renderChatMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListFooterComponent={isThinking ? <ThinkingShimmer /> : null}
              />

              {/* Chat Input Area */}
              <Box style={styles.inputContainer}>
                {!userRole ? (
                  <VStack className="gap-xs items-center p-md">
                    <Text className="text-phaseText-secondary text-sm text-center">
                      {t('aiAssistant.loginPrompt')}
                    </Text>
                    <Pressable accessibilityRole="button" onPress={() => router.push('/welcome')}>
                      <Text className="text-phase-accent font-bold text-sm">
                        {t('aiAssistant.continueLogin')}
                      </Text>
                    </Pressable>
                  </VStack>
                ) : (
                  <VStack className="gap-2">
                    {/* Pending Attachment Chips */}
                    {pendingAttachments.length > 0 && (
                      <HStack className="flex-wrap gap-1 px-2">
                        {pendingAttachments.map((att) => (
                          <HStack
                            key={att.id}
                            className="items-center gap-1"
                            style={{
                              backgroundColor: glass.surface.bg,
                              borderColor: glass.surface.border,
                              borderWidth: 1,
                              borderRadius: 10,
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                            }}
                          >
                            <Text style={{ fontSize: 10, fontWeight: '700', color: text.primary }}>
                              📎 {att.label}
                            </Text>
                            <Pressable
                              accessibilityRole="button"
                              onPress={() => removeAttachment(att.id)}
                            >
                              <Text style={{ fontSize: 10, color: w.danger, fontWeight: '700' }}>
                                ✕
                              </Text>
                            </Pressable>
                          </HStack>
                        ))}
                      </HStack>
                    )}

                    {/* 2026 Composer Action Strip: [+ Attach Context] · [🧠 Think: Auto/Deep] · [⏹ Stop] */}
                    <HStack className="items-center justify-between px-2">
                      <HStack className="items-center gap-2">
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="Attach active screen context card"
                          onPress={() => {
                            hapticLight();
                            const badge = domainEnvelope?.summaryBadge ?? 'Sanctuary Snapshot';
                            const details =
                              domainEnvelope?.slices?.map((s) => s.summary).join(' | ') ||
                              'Current screen focus attached for deep synthesis.';
                            attachContextSnippet(badge, details, 'context_card');
                          }}
                          style={{
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 8,
                            backgroundColor: glass.surface.bg,
                            borderWidth: 1,
                            borderColor: glass.surface.border,
                          }}
                        >
                          <Text style={{ fontSize: 10, fontWeight: '700', color: text.secondary }}>
                            + Attach Context
                          </Text>
                        </Pressable>

                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="Toggle reasoning effort"
                          onPress={() => {
                            hapticLight();
                            setReasoningEffort(reasoningEffort === 'deep' ? 'auto' : 'deep');
                          }}
                          style={{
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 8,
                            backgroundColor:
                              reasoningEffort === 'deep' ? alpha(w.lamp, 0.13) : glass.surface.bg,
                            borderWidth: 1,
                            borderColor:
                              reasoningEffort === 'deep' ? w.lampDeep : glass.surface.border,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 10,
                              fontWeight: '700',
                              color: reasoningEffort === 'deep' ? w.lampDeep : text.secondary,
                            }}
                          >
                            {reasoningEffort === 'deep' ? '🧠 Think: Deep' : '🧠 Think: Auto'}
                          </Text>
                        </Pressable>
                      </HStack>

                      {isThinking && (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="Stop generation"
                          onPress={() => {
                            hapticWarning();
                            stopGeneration();
                          }}
                          style={{
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 8,
                            backgroundColor: alpha(w.danger, 0.13),
                            borderWidth: 1,
                            borderColor: w.danger,
                          }}
                        >
                          <Text style={{ fontSize: 10, fontWeight: '800', color: w.danger }}>
                            ⏹ Stop
                          </Text>
                        </Pressable>
                      )}
                    </HStack>

                    {/* Multimodal (+) Attachment & Slash Command Tray */}
                    {isAttachmentTrayOpen && (
                      <Animated.View
                        entering={FadeInDown.duration(180)}
                        style={{
                          backgroundColor: glass.surface.bg,
                          borderColor: glass.surface.border,
                          borderWidth: 1,
                          borderRadius: 14,
                          padding: 10,
                          marginHorizontal: 6,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: '800',
                            color: text.secondary,
                            marginBottom: 6,
                          }}
                        >
                          MULTIMODAL INPUTS (VISION · FILES · VOICE · CONTEXT)
                        </Text>
                        <HStack className="flex-wrap gap-2 mb-3">
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Attach Photo or Vision Scan"
                            onPress={() => {
                              hapticLight();
                              attachContextSnippet(
                                '📷 Vision Scan Ready',
                                'Visual inspection mode attached (handwritten rubric, attendance sheet, or blackboard diagram via /api/ai/vision/extract).',
                                'image_ref',
                              );
                              setIsAttachmentTrayOpen(false);
                            }}
                            style={{
                              paddingHorizontal: 10,
                              paddingVertical: 6,
                              borderRadius: 10,
                              backgroundColor: alpha(w.lamp, 0.09),
                              borderWidth: 1,
                              borderColor: alpha(w.lamp, 0.4),
                            }}
                          >
                            <Text style={{ fontSize: 11, fontWeight: '700', color: w.lampDeep }}>
                              📷 Photo / Vision
                            </Text>
                          </Pressable>

                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Attach Document or Syllabus PDF"
                            onPress={() => {
                              hapticLight();
                              attachContextSnippet(
                                '📄 Syllabus / Document Note',
                                'Curriculum document / past paper reference attached for grounded synthesis.',
                                'context_card',
                              );
                              setIsAttachmentTrayOpen(false);
                            }}
                            style={{
                              paddingHorizontal: 10,
                              paddingVertical: 6,
                              borderRadius: 10,
                              backgroundColor: alpha(w.lampDeep, 0.09),
                              borderWidth: 1,
                              borderColor: alpha(w.lampDeep, 0.4),
                            }}
                          >
                            <Text style={{ fontSize: 11, fontWeight: '700', color: w.lampDeep }}>
                              📄 Document / PDF
                            </Text>
                          </Pressable>

                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Attach Voice Note Prompt"
                            onPress={() => {
                              hapticLight();
                              attachContextSnippet(
                                '🎙️ Voice Dictation Note',
                                'Spoken teacher/student audio prompt attached for bilingual EN/SI/TA transcription.',
                                'context_card',
                              );
                              setIsAttachmentTrayOpen(false);
                            }}
                            style={{
                              paddingHorizontal: 10,
                              paddingVertical: 6,
                              borderRadius: 10,
                              backgroundColor: alpha(w.success, 0.09),
                              borderWidth: 1,
                              borderColor: alpha(w.success, 0.4),
                            }}
                          >
                            <Text style={{ fontSize: 11, fontWeight: '700', color: w.success }}>
                              🎙️ Voice Note
                            </Text>
                          </Pressable>
                        </HStack>

                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: '800',
                            color: text.secondary,
                            marginBottom: 6,
                          }}
                        >
                          1-TAP SLASH COMMAND STARTERS
                        </Text>
                        <HStack className="flex-wrap gap-1.5">
                          {SANCTUARY_SLASH_COMMANDS.map((cmd) => (
                            <Pressable
                              key={cmd.command}
                              accessibilityRole="button"
                              accessibilityLabel={`${cmd.command} ${cmd.label}`}
                              onPress={() => {
                                hapticLight();
                                if (cmd.requiresWorldSearch && !enableWorldSearch) {
                                  void setEnableWorldSearch(true);
                                }
                                setExecutionMode(cmd.recommendedMode);
                                setInput(cmd.promptTemplate);
                                setIsAttachmentTrayOpen(false);
                              }}
                              style={{
                                paddingHorizontal: 8,
                                paddingVertical: 5,
                                borderRadius: 8,
                                backgroundColor: alpha(w.onLamp, 0.06),
                                borderWidth: 1,
                                borderColor: glass.surface.border,
                              }}
                            >
                              <Text
                                style={{ fontSize: 10, fontWeight: '700', color: text.primary }}
                              >
                                {cmd.icon} {cmd.command} · {cmd.label}
                              </Text>
                            </Pressable>
                          ))}
                        </HStack>
                      </Animated.View>
                    )}

                    <ChatComposer
                      value={input}
                      onChangeText={setInput}
                      onSend={handleSend}
                      isSending={isThinking}
                      maxLength={8000}
                      onPressAttachment={() => {
                        hapticLight();
                        setIsAttachmentTrayOpen((prev) => !prev);
                      }}
                      isAttachmentActive={isAttachmentTrayOpen || pendingAttachments.length > 0}
                      placeholder={
                        privacyMode === 'incognito'
                          ? 'Ask incognito (unsaved)...'
                          : t('aiAssistant.placeholder')
                      }
                    />
                  </VStack>
                )}
              </Box>
            </>
          ) : (
            /* Autonomous Agent (Gen 4 Pro) Lane */
            <ScrollView contentContainerStyle={styles.agentContainer}>
              <VStack className="gap-4">
                {/* Agent Status Card */}
                <Box
                  style={[
                    styles.agentCard,
                    {
                      backgroundColor: glass.surface.bg,
                      borderColor: glass.surface.border,
                    },
                  ]}
                >
                  <HStack className="justify-between items-center mb-2">
                    <HStack className="items-center gap-2">
                      <Zap size={18} color={w.lampDeep} />
                      <Text style={{ fontSize: 15, fontWeight: '800', color: text.primary }}>
                        Autonomous Deep Preparation
                      </Text>
                    </HStack>
                    <Box
                      style={{
                        backgroundColor: alpha(w.lamp, 0.13),
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 10,
                      }}
                    >
                      <Text style={{ fontSize: 10, color: w.lampDeep, fontWeight: '800' }}>
                        PRO RUNTIME
                      </Text>
                    </Box>
                  </HStack>
                  <Text style={{ fontSize: 12, color: text.secondary, lineHeight: 18 }}>
                    Background agents compose multi-step curriculum drafts, cross-reference
                    attendance records, and draft lesson plans. All output halts at the proposal
                    review gate for your sign-off.
                  </Text>
                  <HStack className="mt-3 justify-end">
                    <Pressable
                      accessibilityRole="button"
                      onPress={handleCommissionAgent}
                      disabled={isDispatchingAgent}
                      style={[
                        styles.proposalButton,
                        { backgroundColor: w.lamp, opacity: isDispatchingAgent ? 0.6 : 1 },
                      ]}
                    >
                      <Zap size={13} color={w.onLamp} />
                      <Text style={{ fontSize: 12, fontWeight: '700', color: w.onLamp }}>
                        {isDispatchingAgent ? 'Dispatching Agent...' : 'Commission Agent Mission'}
                      </Text>
                    </Pressable>
                  </HStack>
                </Box>

                {/* Proposal Review Card (Mandatory Convivial Limit Gate) */}
                {activeProposal && activeProposal.status === 'pending' && (
                  <Box
                    style={[
                      styles.proposalCard,
                      {
                        backgroundColor: glass.surface.bg,
                        borderColor: w.lamp,
                      },
                    ]}
                  >
                    <HStack className="items-center justify-between mb-2">
                      <HStack className="items-center gap-2">
                        <Sparkles size={16} color={w.lampDeep} />
                        <Text style={{ fontSize: 13, fontWeight: '800', color: w.lampDeep }}>
                          PROPOSAL READY FOR REVIEW
                        </Text>
                      </HStack>
                      <Text style={{ fontSize: 11, color: text.secondary }}>
                        {activeProposal.targetDomain}
                      </Text>
                    </HStack>

                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '700',
                        color: text.primary,
                        marginBottom: 4,
                      }}
                    >
                      {activeProposal.title}
                    </Text>
                    <Text style={{ fontSize: 12, color: text.secondary, marginBottom: 12 }}>
                      {activeProposal.description}
                    </Text>

                    {/* Proposal Draft Body */}
                    <Box
                      style={{
                        backgroundColor: alpha(w.ink, 0.2),
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 16,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                          color: text.primary,
                        }}
                      >
                        {activeProposal.draftSummary}
                      </Text>
                    </Box>

                    {/* Tri-Modal Decision Actions */}
                    <HStack className="gap-2 justify-end">
                      <Pressable
                        accessibilityRole="button"
                        onPress={handleDiscardProposal}
                        style={[styles.proposalButton, { backgroundColor: alpha(w.danger, 0.13) }]}
                      >
                        <Trash2 size={13} color={w.danger} />
                        <Text style={{ fontSize: 12, fontWeight: '700', color: w.danger }}>
                          Discard
                        </Text>
                      </Pressable>

                      <Pressable
                        accessibilityRole="button"
                        onPress={() => hapticLight()}
                        style={[styles.proposalButton, { backgroundColor: glass.surface.bg }]}
                      >
                        <Pen size={13} color={text.primary} />
                        <Text style={{ fontSize: 12, fontWeight: '700', color: text.primary }}>
                          Edit Draft
                        </Text>
                      </Pressable>

                      <Pressable
                        accessibilityRole="button"
                        onPress={() => void handleAcceptProposal()}
                        style={[styles.proposalButton, { backgroundColor: w.success }]}
                      >
                        <CircleCheck size={13} color={w.onLamp} />
                        <Text style={{ fontSize: 12, fontWeight: '700', color: w.onLamp }}>
                          Accept & Commit
                        </Text>
                      </Pressable>
                    </HStack>
                  </Box>
                )}

                {/* Accepted Proposal Success Banner */}
                {activeProposal && activeProposal.status === 'accepted' && (
                  <Box
                    style={{
                      backgroundColor: alpha(w.success, 0.13),
                      padding: 14,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: w.success,
                    }}
                  >
                    <HStack className="items-center gap-2">
                      <CircleCheck size={18} color={w.success} />
                      <Text style={{ fontSize: 13, fontWeight: '700', color: w.success }}>
                        Proposal accepted and committed to sovereign ledger.
                      </Text>
                    </HStack>
                  </Box>
                )}

                {/* OS App Intents (Expo 58 Siri / Android 16 AppFunctions) & External AI / Bot Bridges */}
                <Box
                  style={[
                    styles.agentCard,
                    {
                      backgroundColor: glass.surface.bg,
                      borderColor: glass.surface.border,
                    },
                  ]}
                >
                  <HStack className="items-center justify-between mb-2">
                    <Text style={{ fontSize: 12, fontWeight: '800', color: text.primary }}>
                      🌉 OS App Intents & External AI / Bot Bridges
                    </Text>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: w.success }}>
                      🛡️ Sacred Privacy Veto Active
                    </Text>
                  </HStack>
                  <Text style={{ fontSize: 11, color: text.secondary, marginBottom: 10 }}>
                    Connect Gurudevi Sanctuary to Siri / Apple Intelligence, Android 16 Gemini
                    AppFunctions, ChatGPT / Claude MCP, or verified WhatsApp & Telegram bots.
                  </Text>

                  <VStack className="gap-2 mb-3">
                    {SANCTUARY_EXTERNAL_AI_BRIDGES.map((bridge) => (
                      <HStack
                        key={bridge.bridgeId}
                        className="items-center justify-between"
                        style={{
                          backgroundColor: alpha(w.ink, 0.13),
                          borderRadius: 10,
                          paddingHorizontal: 10,
                          paddingVertical: 8,
                          borderWidth: 1,
                          borderColor: glass.surface.border,
                        }}
                      >
                        <VStack style={{ flex: 1, marginRight: 8 }}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: text.primary }}>
                            {bridge.name}
                          </Text>
                          <Text style={{ fontSize: 10, color: text.secondary }}>
                            {bridge.protocol} · {bridge.endpointPath}
                          </Text>
                        </VStack>
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => handleCopyText(bridge.bridgeId, bridge.endpointPath)}
                          style={{
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 6,
                            backgroundColor: alpha(w.onLamp, 0.07),
                          }}
                        >
                          <Text style={{ fontSize: 10, fontWeight: '700', color: w.lampDeep }}>
                            {copiedId === bridge.bridgeId ? '✓ Copied' : 'Copy Endpoint'}
                          </Text>
                        </Pressable>
                      </HStack>
                    ))}
                  </VStack>

                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '800',
                      color: text.secondary,
                      marginBottom: 6,
                    }}
                  >
                    VOICE / OS SHORTCUT INTENTS ({SANCTUARY_APP_INTENTS.length})
                  </Text>
                  <VStack className="gap-1.5">
                    {SANCTUARY_APP_INTENTS.map((intent) => (
                      <HStack
                        key={intent.intentId}
                        className="items-center justify-between"
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 5,
                          borderRadius: 8,
                          backgroundColor: alpha(w.onLamp, 0.03),
                        }}
                      >
                        <Text
                          numberOfLines={1}
                          style={{ fontSize: 10, color: text.primary, flex: 1 }}
                        >
                          🎙️ “{intent.spokenPhraseTemplate}”
                        </Text>
                        <Text
                          style={{
                            fontSize: 9,
                            fontWeight: '700',
                            color: intent.enforcesSacredPrivacyVeto ? w.lampDeep : w.lampDeep,
                            marginLeft: 6,
                          }}
                        >
                          {intent.enforcesSacredPrivacyVeto ? 'LOCAL ONLY' : 'MCP SAFE'}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              </VStack>
            </ScrollView>
          )}

          {/* Rewind / History Modal */}
          <Modal
            visible={historyOpen}
            animationType="slide"
            transparent
            onRequestClose={() => setHistoryOpen(false)}
          >
            <Box style={[styles.modalOverlay, { backgroundColor: overlay.scrim }]}>
              <Box
                style={[
                  styles.historySheet,
                  {
                    backgroundColor: gradientNodes[0],
                    borderColor: glass.surface.border,
                  },
                ]}
              >
                <HStack className="justify-between items-center pb-3 border-b border-white/10">
                  <HStack className="items-center gap-2">
                    <History size={18} color={text.primary} />
                    <Text style={{ fontSize: 16, fontWeight: '800', color: text.primary }}>
                      Rewind Conversation History
                    </Text>
                  </HStack>
                  <HStack className="items-center gap-3">
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        hapticLight();
                        startNewThread();
                        setHistoryOpen(false);
                      }}
                      style={[styles.proposalButton, { backgroundColor: alpha(w.lamp, 0.13) }]}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '700', color: w.lampDeep }}>
                        + New Thread
                      </Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => setHistoryOpen(false)}
                      style={styles.closeButton}
                    >
                      <Text style={{ fontSize: 13, color: text.secondary }}>Close</Text>
                    </Pressable>
                  </HStack>
                </HStack>

                <ScrollView style={{ marginTop: 12 }}>
                  <VStack className="gap-2">
                    {threads.length > 0 ? (
                      threads.map((item) => (
                        <HStack
                          key={item.threadId}
                          style={[
                            styles.historyItem,
                            {
                              backgroundColor: glass.surface.bg,
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            },
                          ]}
                        >
                          <Pressable
                            accessibilityRole="button"
                            style={{ flex: 1 }}
                            onPress={() => {
                              hapticLight();
                              void selectThread(item.threadId);
                              setHistoryOpen(false);
                            }}
                          >
                            <Text
                              numberOfLines={1}
                              style={{ fontSize: 13, fontWeight: '700', color: text.primary }}
                            >
                              {item.title}
                            </Text>
                            <Text style={{ fontSize: 11, color: text.secondary }}>
                              {new Date(item.lastMessageAt).toLocaleDateString()} ·{' '}
                              {item.messageCount} messages
                            </Text>
                          </Pressable>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Delete Thread"
                            onPress={() => {
                              hapticWarning();
                              void deleteThread(item.threadId);
                            }}
                            style={{ padding: 6 }}
                          >
                            <Trash2 size={15} color={w.danger} />
                          </Pressable>
                        </HStack>
                      ))
                    ) : (
                      <>
                        <Box style={[styles.historyItem, { backgroundColor: glass.surface.bg }]}>
                          <Text style={{ fontSize: 13, fontWeight: '700', color: text.primary }}>
                            Ecology & Biome Lesson Plan Prep
                          </Text>
                          <Text style={{ fontSize: 11, color: text.secondary }}>
                            Today at 10:14 AM · 8 messages
                          </Text>
                        </Box>
                        <Box style={[styles.historyItem, { backgroundColor: glass.surface.bg }]}>
                          <Text style={{ fontSize: 13, fontWeight: '700', color: text.primary }}>
                            Student Support & Attendance Audit
                          </Text>
                          <Text style={{ fontSize: 11, color: text.secondary }}>
                            Yesterday · 14 messages
                          </Text>
                        </Box>
                      </>
                    )}
                  </VStack>
                </ScrollView>
              </Box>
            </Box>
          </Modal>

          {/* Interactive Artifact / Canvas Modal (2026 Split-Canvas Experience) */}
          <Modal
            visible={Boolean(activeCanvasArtifact)}
            animationType="slide"
            transparent
            onRequestClose={() => setActiveCanvasArtifact(null)}
          >
            <Box style={[styles.modalOverlay, { backgroundColor: overlay.scrim }]}>
              <Box
                style={[
                  styles.historySheet,
                  {
                    backgroundColor: gradientNodes[0],
                    borderColor: w.lamp,
                    maxHeight: '85%',
                  },
                ]}
              >
                <HStack className="justify-between items-center pb-3 border-b border-white/10">
                  <VStack style={{ flex: 1, marginRight: 8 }}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: w.lampDeep }}>
                      📄 ARTIFACT CANVAS · {activeCanvasArtifact?.kind.toUpperCase()}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={{ fontSize: 16, fontWeight: '800', color: text.primary }}
                    >
                      {activeCanvasArtifact?.title}
                    </Text>
                  </VStack>
                  <HStack className="items-center gap-2">
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        if (activeCanvasArtifact) {
                          handleCopyText(
                            activeCanvasArtifact.artifactId,
                            activeCanvasArtifact.content,
                          );
                        }
                      }}
                      style={[styles.proposalButton, { backgroundColor: glass.surface.bg }]}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '700', color: text.primary }}>
                        {activeCanvasArtifact && copiedId === activeCanvasArtifact.artifactId
                          ? '✓ Copied'
                          : '📋 Copy'}
                      </Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        if (activeCanvasArtifact) {
                          hapticSuccess();
                          setActiveProposal({
                            id: activeCanvasArtifact.artifactId,
                            title: activeCanvasArtifact.title,
                            description: `Promoted from ${activeCanvasArtifact.kind} Artifact Canvas`,
                            targetDomain: 'classroom.curriculum',
                            draftSummary: activeCanvasArtifact.content,
                            status: 'pending',
                          });
                          setActiveCanvasArtifact(null);
                          setActiveTab('agent');
                          setExecutionMode('agent');
                        }
                      }}
                      style={[styles.proposalButton, { backgroundColor: w.lamp }]}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '700', color: w.onLamp }}>
                        Stage to Proposal ↗
                      </Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => setActiveCanvasArtifact(null)}
                      style={styles.closeButton}
                    >
                      <Text style={{ fontSize: 13, color: text.secondary }}>Close</Text>
                    </Pressable>
                  </HStack>
                </HStack>

                <ScrollView style={{ marginTop: 12 }}>
                  <Box
                    style={{
                      backgroundColor: alpha(w.ink, 0.2),
                      borderRadius: 12,
                      padding: 14,
                      borderWidth: 1,
                      borderColor: glass.surface.border,
                    }}
                  >
                    <Text
                      selectable
                      style={{
                        fontSize: 13,
                        lineHeight: 20,
                        color: text.primary,
                        fontFamily:
                          activeCanvasArtifact?.kind === 'code'
                            ? Platform.OS === 'ios'
                              ? 'Courier'
                              : 'monospace'
                            : undefined,
                      }}
                    >
                      {activeCanvasArtifact?.content}
                    </Text>
                  </Box>
                </ScrollView>
              </Box>
            </Box>
          </Modal>
        </Box>
      </ChatProvider>
    </ScreenWrapper>
  );
}

function ThinkingShimmer() {
  const { t } = useTranslation();
  const opacity = useSharedValue(0.3);
  const shimmerStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 700 }), -1, true);
    return () => {
      opacity.value = 0.3;
    };
  }, [opacity]);

  return (
    <HStack className="items-center gap-xs self-start px-5 py-2">
      <Animated.View style={shimmerStyle}>
        <HStack className="gap-1">
          {[0, 1, 2].map((i) => (
            <Box key={i} className="w-2 h-2 rounded-full bg-ink/30" />
          ))}
        </HStack>
      </Animated.View>
      <Text className="text-phaseText-secondary italic text-sm">{t('aiAssistant.thinking')}</Text>
    </HStack>
  );
}

function AIThinkingAnchor({ isThinking, messages }: { isThinking: boolean; messages: Message[] }) {
  const scrollToIndex = useChatScrollToIndex();
  const messageCount = messages.length;

  useEffect(() => {
    if (isThinking && messageCount > 0) {
      scrollToIndex(messageCount - 1);
    }
  }, [isThinking, messageCount, scrollToIndex]);
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: tokens.spacing.md,
  },
  inputContainer: {
    padding: tokens.spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 36 : tokens.spacing.sm,
    backgroundColor: 'transparent',
  },
  agentContainer: {
    padding: tokens.spacing.md,
  },
  agentCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  proposalCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
  },
  proposalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  historySheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    padding: 20,
    maxHeight: '75%',
    minHeight: '40%',
  },
  closeButton: {
    padding: 6,
  },
  historyItem: {
    borderRadius: 12,
    padding: 14,
  },
});
