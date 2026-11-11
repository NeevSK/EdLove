import { useDraft } from '@repo/ui/context/Drafts';
import { type Message, type MessageArtifact, useAIAgent } from '@repo/ai/hooks/useAIAgent';
import {
  ApprovalCard,
  Button,
  Composer,
  Dialog,
  Icon,
  IconButton,
  Inline,
  MessageBubble,
  MessageList,
  SegmentedControl,
  Stack,
  Surface,
  Text,
  ThinkingTrace,
  ToolCallCard,
} from '@repo/ui/components/native';
import {
  ArrowLeft,
  ChevronLeft,
  EyeOff,
  History,
  Lock,
  Sparkles,
} from '@repo/ui/icons';
import { useFeedback } from '@repo/ui/theme/native/feedback';
import { useWorldContext } from '@repo/ui/theme/native/WorldContext';
import { safeBack } from '@repo/ui/utils/navigation';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

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

interface ProposalCardData {
  id: string;
  title: string;
  description: string;
  targetDomain: string;
  draftSummary: string;
  status: 'pending' | 'accepted' | 'edited' | 'discarded';
}

/**
 * Modern AIScreen (2026 Sovereign Architecture)
 *
 * Core Invariants:
 * 1. Screen is canonical AIScreen (not Tutii). Tutii is solely an ambient companion visual.
 * 2. Header segmented control switches between [ Chat ] and [ ⚡ Agent 🔒 ].
 * 3. Fast Ingress: [ ⏪ Rewind History ] drawer and [ 🕵️ Incognito ] zero-persistence mode.
 * 4. Human-in-the-loop Proposal ApprovalCard for Agent missions before commit.
 * 5. 100% kit pieces: MessageList on Legend List, Composer, ThinkingTrace, ToolCallCard, ApprovalCard.
 */
export default function AIScreen({
  initialTab = 'chat',
  initialPrivacyMode,
  onClose,
  classroomContext,
}: AIScreenProps) {
  const params = useLocalSearchParams<{ tab?: string; mode?: string; threadId?: string }>();
  const { language } = useWorldContext();
  const feedback = useFeedback();
  const { t } = useTranslation();

  const {
    messages,
    sendMessage,
    isThinking,
    activeAgentRun,
    promoteAgentRun,
    privacyMode,
    setPrivacyMode,
    threads,
    selectThread,
  } = useAIAgent();

  // Tab: Chat vs Agent
  const [activeTab, setActiveTab] = useState<AIScreenTab>(
    params.tab === 'agent' || initialTab === 'agent' ? 'agent' : 'chat',
  );

  // Rewind history drawer state
  const [historyOpen, setHistoryOpen] = useState(false);

  // Active inspect artifact (Canvas modal)
  const [activeArtifact, setActiveArtifact] = useState<MessageArtifact | null>(null);

  // Input composer text & attachments
  // An unsent question is kept through a call or the app closing.
  const { value: inputText, setValue: setInputText } = useDraft('ai:compose');
  const [attachments, setAttachments] = useState<Array<{ uri: string; name: string; mimeType: string }>>([]);

  // Proposal state (Human-in-the-loop)
  const [activeProposal, setActiveProposal] = useState<ProposalCardData | null>(null);

  // Apply requested privacy mode on arrival (only allows making it more private)
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

  const handleBack = useCallback(() => {
    feedback('press');
    if (onClose) {
      onClose();
    } else {
      safeBack('/(tabs)/self');
    }
  }, [feedback, onClose]);

  const toggleIncognito = () => {
    feedback('select');
    const next = privacyMode === 'incognito' ? 'saved' : 'incognito';
    void setPrivacyMode(next);
  };

  const handleSend = () => {
    if (!inputText.trim() && attachments.length === 0) return;
    feedback('commit');
    void sendMessage(inputText);
    setInputText('');
    setAttachments([]);
  };

  // Human-in-the-loop: promote only with active proposal and service receipt
  const handleAcceptProposal = async (proposalId: string) => {
    if (!activeAgentRun?.runId) {
      feedback('error');
      return;
    }
    const promoted = await promoteAgentRun(activeAgentRun.runId);
    if (!promoted) {
      feedback('error');
      return;
    }
    feedback('success');
    if (activeProposal && activeProposal.id === proposalId) {
      setActiveProposal({ ...activeProposal, status: 'accepted' });
    }
  };

  const handleDiscardProposal = (proposalId: string) => {
    feedback('press');
    if (activeProposal && activeProposal.id === proposalId) {
      setActiveProposal({ ...activeProposal, status: 'discarded' });
    }
  };

  // Render one message in the Legend List virtualizer
  const renderMessageItem = useCallback(
    (msg: Message) => {
      const isSelf = msg.role === 'user';
      return (
        <Stack gap="between" style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
          {/* Thinking trace if available */}
          {msg.thinkingText ? (
            <ThinkingTrace
              content={msg.thinkingText}
              state={isThinking ? 'thinking' : 'done'}
            />
          ) : null}

          {/* Tool calls if any */}
          {msg.toolCalls?.map((tool) => (
            <ToolCallCard
              key={tool.id}
              title={tool.name}
              state={tool.state === 'running' ? 'running' : tool.state === 'failed' ? 'failed' : 'done'}
              detail={tool.arguments}
              result={tool.outputSummary}
            />
          ))}

          {/* Main message bubble */}
          <MessageBubble
            author={isSelf ? 'self' : 'assistant'}
            content={msg.content}
            state={isThinking && !isSelf ? 'streaming' : 'complete'}
            attachments={msg.artifacts?.map((art) => ({
              uri: `artifact://${art.artifactId}`,
              name: art.title,
              mimeType: 'text/markdown',
            }))}
            onOpenAttachment={(file) => {
              const matched = msg.artifacts?.find((a) => `artifact://${a.artifactId}` === file.uri);
              if (matched) setActiveArtifact(matched);
            }}
          />

          {/* Action proposals / Human-in-the-loop review cards */}
          {msg.proposals?.map((prop) => (
            <ApprovalCard
              key={prop.proposalId}
              title={prop.title}
              changes={prop.summaryDraft}
              target={prop.targetDomain}
              state={
                prop.status === 'approved'
                  ? 'accepted'
                  : prop.status === 'rejected'
                    ? 'discarded'
                    : 'pending'
              }
              onAccept={() => void handleAcceptProposal(prop.proposalId)}
              onDiscard={() => handleDiscardProposal(prop.proposalId)}
            />
          ))}
        </Stack>
      );
    },
    [isThinking, handleAcceptProposal],
  );

  return (
    <Surface
      role="region"
      aria-label="Sanctuary AI Workspace"
      tone="plain"
      style={styles.root}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.root}
      >
        {/* Top Header Surface */}
        <Surface tone="raised" style={styles.header}>
          <Inline justify="between" align="center">
            <Inline align="center" gap="inside">
              <IconButton
                icon={ArrowLeft}
                label="Back"
                variant="quiet"
                size="sm"
                onPress={handleBack}
              />
              <Text tone="ink" kind="title">
                AI Companion
              </Text>
            </Inline>

            {/* Privacy toggle & Rewind History actions */}
            <Inline align="center" gap="inside">
              <Button
                icon={privacyMode === 'incognito' ? EyeOff : Lock}
                label={privacyMode === 'incognito' ? 'Incognito' : 'Saved'}
                variant={privacyMode === 'incognito' ? 'secondary' : 'quiet'}
                size="sm"
                onPress={toggleIncognito}
              />
              <IconButton
                icon={History}
                label="Session History"
                variant="quiet"
                size="sm"
                onPress={() => {
                  feedback('select');
                  setHistoryOpen(true);
                }}
              />
            </Inline>
          </Inline>

          {/* Segmented Control: Chat vs Agent Mode */}
          <View style={styles.segmentContainer}>
            <SegmentedControl
              label="Interaction Mode"
              options={[
                { value: 'chat', label: 'Chat' },
                { value: 'agent', label: '⚡ Agent (Mission)' },
              ]}
              value={activeTab}
              onChange={(val) => {
                feedback('select');
                setActiveTab(val as AIScreenTab);
              }}
            />
          </View>
        </Surface>

        {/* Classroom Context Banner if launched with specific class */}
        {classroomContext ? (
          <Surface tone="inset" style={styles.contextBanner}>
            <Inline align="center" gap="inside">
              <Icon icon={Sparkles} size="sm" tone="lamp" />
              <Text tone="soft" kind="caption">
                Active Context: {classroomContext.name} {classroomContext.term ? `· ${classroomContext.term}` : ''}
              </Text>
            </Inline>
          </Surface>
        ) : null}

        {/* Legend List Virtualized Chat Stage */}
        <View style={styles.listContainer}>
          <MessageList
            items={messages}
            keyOf={(item) => item.id}
            renderItem={renderMessageItem}
            label="AI conversation stream"
            empty={{
              title: activeTab === 'chat' ? 'Ask anything' : 'Agent Ready',
              message:
                activeTab === 'chat'
                  ? 'Ask for help preparing lesson plans, analyzing reflections, or answering questions.'
                  : 'Commission a deep multi-step mission. All mutations remain subject to your approval.',
            }}
          />
        </View>

        {/* Input Composer Field with Stop/Send and Attachments */}
        <Surface tone="raised" style={styles.composerWrapper}>
          <Composer
            value={inputText}
            onChange={setInputText}
            onSend={handleSend}
            placeholder={
              activeTab === 'chat'
                ? 'Ask AI or type a question...'
                : 'Describe an agent mission to commission...'
            }
            label="Message input field"
            busy={isThinking}
            attachments={attachments}
            onRemoveAttachment={(file) => {
              feedback('press');
              setAttachments((prev) => prev.filter((a) => a.uri !== file.uri));
            }}
            maxLength={3000}
          />
        </Surface>

        {/* Rewind History Drawer (Sheet) */}
        {historyOpen ? (
          <Dialog
            open={historyOpen}
            onClose={() => setHistoryOpen(false)}
            title="Session History"
            description="Review past conversations or restore earlier session checkpoints."
          >
            <ScrollView style={styles.historyList}>
              <Stack gap="between">
                {threads.length === 0 ? (
                  <Text tone="soft" kind="caption" style={{ padding: 12 }}>
                    No saved sessions in this profile yet.
                  </Text>
                ) : (
                  threads.map((thr) => (
                    <Pressable
                      key={thr.threadId}
                      onPress={() => {
                        feedback('select');
                        selectThread(thr.threadId);
                        setHistoryOpen(false);
                      }}
                      style={styles.historyItem}
                    >
                      <Inline justify="between" align="center">
                        <Stack gap="inside">
                          <Text tone="ink" kind="body">{thr.title || 'Untitled Thread'}</Text>
                          <Text tone="soft" kind="caption">
                            {new Date(thr.lastMessageAt).toLocaleDateString(language)}
                          </Text>
                        </Stack>
                        <Icon icon={ChevronLeft} size="sm" tone="soft" />
                      </Inline>
                    </Pressable>
                  ))
                )}
              </Stack>
            </ScrollView>
          </Dialog>
        ) : null}

        {/* Canvas Artifact View Modal */}
        {activeArtifact ? (
          <Dialog
            open={Boolean(activeArtifact)}
            onClose={() => setActiveArtifact(null)}
            title={activeArtifact.title}
            description={`Kind: ${activeArtifact.kind}`}
          >
            <ScrollView style={styles.artifactScroll}>
              <Surface tone="inset" style={styles.artifactBox}>
                <Text tone="ink" kind="body" style={styles.codeText}>{activeArtifact.content}</Text>
              </Surface>
            </ScrollView>
          </Dialog>
        ) : null}
      </KeyboardAvoidingView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 44 : 12,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  segmentContainer: {
    marginTop: 8,
  },
  contextBanner: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  listContainer: {
    flex: 1,
  },
  composerWrapper: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
  },
  historyList: {
    maxHeight: 320,
    marginTop: 12,
  },
  historyItem: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  artifactScroll: {
    maxHeight: 400,
    marginTop: 12,
  },
  artifactBox: {
    padding: 14,
    borderRadius: 8,
  },
  codeText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
