import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Pressable,
  Alert,
} from 'react-native';
import * as nativeKit from '@repo/ui/components/native';
import { WorldScope, useWorld } from '@repo/ui/theme/native';
import { WORLD_IDS, WORLDS } from '@repo/ui/theme';
import type { WorldId, Phase, WorldMode } from '@repo/ui/theme';
import type { ChatPrivacy, CapturePorts } from '@repo/ui/theme/contracts';

const PHASES: Phase[] = ['predawn', 'dawn', 'morning', 'afternoon', 'dusk', 'night'];

// Simulated fake capture adapter as guided in ui-kit-gallery-guide.md
const FAKE_CAPTURE_ADAPTERS: CapturePorts = {
  pickImage: async (source) => {
    return {
      status: 'ok',
      value: {
        name: `simulated-${source}-photo.jpg`,
        uri: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=400',
        size: 1024 * 64,
        mime: 'image/jpeg',
      },
    };
  },
  pickFiles: async () => {
    return {
      status: 'ok',
      value: [
        {
          name: 'sanctuary-g5-evidence.json',
          uri: 'file:///simulated/g5-evidence.json',
          size: 1024 * 16,
          mime: 'application/json',
        },
      ],
    };
  },
};

export function KitGalleryNative() {
  const [world, setWorld] = useState<WorldId>('sanctuary');
  const [phase, setPhase] = useState<Phase>('morning');
  const [mode, setMode] = useState<WorldMode>('light');
  const [useFakeAdapters, setUseFakeAdapters] = useState(true);

  // Interactive component states
  const [btnLoading, setBtnLoading] = useState(false);
  const [checkVal, setCheckVal] = useState(true);
  const [switchVal, setSwitchVal] = useState(true);
  const [textInput, setTextInput] = useState('Typing in native mobile world');
  const [scaleVal, setScaleVal] = useState(4);
  const [choiceVal, setChoiceVal] = useState<string[]>(['g5']);
  const [privacyMode, setPrivacyMode] = useState<ChatPrivacy>('saved');

  // Agent interactive states
  const [approvalState, setApprovalState] = useState<'pending' | 'submitting' | 'accepted' | 'discarded' | 'expired'>('pending');
  const [composerText, setComposerText] = useState('');
  const [composerBusy, setComposerBusy] = useState(false);

  // Performance stress state
  const [stressCount, setStressCount] = useState(500);
  const [isStreaming, setIsStreaming] = useState(false);

  const mockMessages = useMemo(() => {
    return Array.from({ length: stressCount }, (_, i) => ({
      id: `msg-${i}`,
      author: i % 2 === 0 ? ('self' as const) : ('assistant' as const),
      content: `Native telemetry message ${i + 1}: G5 hardware verification check.`,
      time: '12:00 PM',
      state: (i === stressCount - 1 && isStreaming ? 'streaming' : 'complete') as 'streaming' | 'complete',
    }));
  }, [stressCount, isStreaming]);

  const showcaseItems = useMemo(
    () => [
      { id: '1', title: 'Pixel 4a (2GB)', subtitle: 'G5 Hardware Target' },
      { id: '2', title: '60 FPS Motion', subtitle: 'Living Edges Active' },
      { id: '3', title: 'High Contrast', subtitle: 'WCAG AAA Compliant' },
    ],
    [],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0b0f19' }}>
      <StatusBar barStyle="light-content" />

      {/* Dev Control Strip */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: '#111827',
          borderBottomWidth: 1,
          borderBottomColor: '#1f2937',
        }}
      >
        <nativeKit.Inline gap="between" style={{ alignItems: 'center' }}>
          <nativeKit.Text kind="label">
            UI Kit Gallery (G5 Mobile Dev)
          </nativeKit.Text>
          <nativeKit.Badge label="DEV ONLY" tone="lamp" />
        </nativeKit.Inline>

        {/* World Chips Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
          <nativeKit.Inline gap="inside">
            {WORLD_IDS.map((id) => (
              <nativeKit.Chip
                key={id}
                label={WORLDS[id].names.en || id}
                selected={world === id}
                onClick={() => setWorld(id)}
              />
            ))}
          </nativeKit.Inline>
        </ScrollView>

        {/* Phase & Mode Selector */}
        <nativeKit.Inline gap="between" style={{ marginTop: 8, alignItems: 'center' }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxWidth: '65%' }}>
            <nativeKit.Inline gap="inside">
              {PHASES.map((p) => (
                <nativeKit.Chip
                  key={p}
                  label={p}
                  selected={phase === p}
                  onClick={() => setPhase(p)}
                />
              ))}
            </nativeKit.Inline>
          </ScrollView>

          <nativeKit.Inline gap="inside">
            <nativeKit.Chip
              label="Light"
              selected={mode === 'light'}
              onClick={() => setMode('light')}
            />
            <nativeKit.Chip
              label="Dark"
              selected={mode === 'dark'}
              onClick={() => setMode('dark')}
            />
          </nativeKit.Inline>
        </nativeKit.Inline>
      </View>

      {/* World Scoped Showcase Container */}
      <WorldScope world={world} phase={phase} mode={mode}>
        <nativeKit.MediaAdapters adapters={useFakeAdapters ? { capture: FAKE_CAPTURE_ADAPTERS } : {}}>
          <ScrollView contentContainerStyle={{ padding: 16, gap: 28 }}>
            
            {/* Header & Shell */}
            <nativeKit.Surface tone="raised" style={{ padding: 16, borderRadius: 12 }}>
              <nativeKit.Stack gap="between">
                <nativeKit.Text kind="title">App Shell & Header</nativeKit.Text>
                <nativeKit.AppHeader
                  title="Mobile Native Kit"
                  eyebrow="Device Bench"
                  actions={[
                    {
                      key: 'settings',
                      label: 'Settings',
                      icon: () => <nativeKit.Text>⚙️</nativeKit.Text>,
                      onPress: () => Alert.alert('Action', 'Header settings pressed'),
                    },
                  ]}
                />
              </nativeKit.Stack>
            </nativeKit.Surface>

            {/* Buttons & Pressables */}
            <nativeKit.Surface tone="raised" style={{ padding: 16, borderRadius: 12 }}>
              <nativeKit.Stack gap="between">
                <nativeKit.Text kind="title">Buttons & Haptics</nativeKit.Text>
                <nativeKit.Inline gap="inside" style={{ flexWrap: 'wrap' }}>
                  <nativeKit.Button label="Primary" variant="primary" />
                  <nativeKit.Button label="Secondary" variant="secondary" />
                  <nativeKit.Button label="Quiet" variant="quiet" />
                  <nativeKit.Button label="Danger" variant="danger" />
                  <nativeKit.Button
                    label={btnLoading ? 'Loading...' : 'Toggle Load'}
                    loading={btnLoading}
                    onClick={() => setBtnLoading(!btnLoading)}
                  />
                  <nativeKit.Button label="Disabled" disabled />
                </nativeKit.Inline>
              </nativeKit.Stack>
            </nativeKit.Surface>

            {/* Inputs & Questions */}
            <nativeKit.Surface tone="raised" style={{ padding: 16, borderRadius: 12 }}>
              <nativeKit.Stack gap="between">
                <nativeKit.Text kind="title">Inputs & Questions</nativeKit.Text>
                <nativeKit.TextField
                  label="Search / Text Input"
                  value={textInput}
                  onChangeText={setTextInput}
                  hint="Live native touch keyboard feedback"
                />

                <nativeKit.SwitchRow
                  label="Simulate Mock Media Adapters"
                  hint="Toggle fake camera/file capture vs device native"
                  value={useFakeAdapters}
                  onChange={setUseFakeAdapters}
                />

                <nativeKit.Checkbox
                  label="Record benchmark evidence to status ledger"
                  checked={checkVal}
                  onChange={setCheckVal}
                />

                <nativeKit.Scale
                  label="Agreement Scale (G5 Responsiveness)"
                  value={scaleVal}
                  onChange={setScaleVal}
                  ends={{ low: 'Laggy', high: 'Silky 60fps' }}
                />

                <nativeKit.ChoiceQuestion
                  prompt="Target Test Surface"
                  value={choiceVal}
                  onChange={setChoiceVal}
                  options={[
                    { value: 'g1', label: 'G1 Vitest Suite' },
                    { value: 'g4', label: 'G4 Chromium Web' },
                    { value: 'g5', label: 'G5 Pixel 4a Device' },
                  ]}
                />

                <nativeKit.PrivacyState
                  mode={privacyMode}
                  onChange={(m) => setPrivacyMode(m)}
                />

                <nativeKit.PrivacyNote
                  identity="pseudonymous"
                  audience="Internal audit team"
                />
              </nativeKit.Stack>
            </nativeKit.Surface>

            {/* Agent Workflow Cards */}
            <nativeKit.Surface tone="raised" style={{ padding: 16, borderRadius: 12 }}>
              <nativeKit.Stack gap="between">
                <nativeKit.Text kind="title">Agent Cards & Workflows</nativeKit.Text>
                
                <nativeKit.ApprovalCard
                  title="Confirm Architecture Upgrade"
                  target="apps/gurudevi-mobile/app/(dev)/kit"
                  changes="+ Expo Router Kit Gallery"
                  state={approvalState}
                  onAccept={() => setApprovalState('accepted')}
                  onDiscard={() => setApprovalState('discarded')}
                />

                <nativeKit.ToolCallCard
                  title="Run Native Haptic Diagnostics"
                  state="done"
                  detail="Vibrator service initialized."
                  result="Impact and notification patterns confirmed."
                />

                <nativeKit.ThinkingTrace
                  state="done"
                  seconds={1.8}
                  content="Resolved native Skia theme curves and circadian colors."
                />

                <nativeKit.RunStatus
                  steps={[
                    { label: 'Register media adapters', state: 'done' },
                    { label: 'Mount LegendList virtualization', state: 'done' },
                    { label: 'Check 60 FPS frame timing', state: 'running' },
                  ]}
                  elapsed="2.3s"
                />
              </nativeKit.Stack>
            </nativeKit.Surface>

            {/* Rails & Virtualized Carousels */}
            <nativeKit.Surface tone="raised" style={{ padding: 16, borderRadius: 12 }}>
              <nativeKit.Stack gap="between">
                <nativeKit.Text kind="title">Collections & Rails</nativeKit.Text>
                
                <nativeKit.Rail
                  label="Hardware Profiles Rail"
                  items={showcaseItems}
                  keyOf={(i) => i.id}
                  renderItem={(item) => (
                    <nativeKit.Card
                      title={item.title}
                      meta={item.subtitle}
                      shape="tile"
                    />
                  )}
                />

                <nativeKit.Carousel
                  label="Device Test Progression"
                  items={showcaseItems}
                  keyOf={(i) => i.id}
                  renderItem={(item) => (
                    <View
                      style={{
                        height: 120,
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        borderRadius: 8,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <nativeKit.Text kind="label">{item.title}</nativeKit.Text>
                      <nativeKit.Text kind="caption">{item.subtitle}</nativeKit.Text>
                    </View>
                  )}
                />
              </nativeKit.Stack>
            </nativeKit.Surface>

            {/* Adversarial Virtualization Stress Benchmark */}
            <View
              style={{
                borderWidth: 2,
                borderColor: '#f59e0b',
                borderRadius: 12,
                padding: 16,
                backgroundColor: 'rgba(245, 158, 11, 0.05)',
              }}
            >
              <nativeKit.Inline gap="between" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
                <nativeKit.Stack gap="inside">
                  <nativeKit.Text kind="title">
                    G5 Stress: MessageList Virtualization
                  </nativeKit.Text>
                  <nativeKit.Text kind="caption">
                    Testing {stressCount} items on LegendList (Target: 0 dropped frames on 2GB RAM).
                  </nativeKit.Text>
                </nativeKit.Stack>

                <nativeKit.Inline gap="inside">
                  <nativeKit.Button
                    label={isStreaming ? 'Stop' : 'Stream'}
                    variant={isStreaming ? 'danger' : 'primary'}
                    onClick={() => setIsStreaming(!isStreaming)}
                  />
                  <nativeKit.Button
                    label="500"
                    variant="quiet"
                    onClick={() => setStressCount(500)}
                  />
                  <nativeKit.Button
                    label="1000"
                    variant="quiet"
                    onClick={() => setStressCount(1000)}
                  />
                </nativeKit.Inline>
              </nativeKit.Inline>

              <View
                style={{
                  height: 320,
                  marginTop: 16,
                  borderRadius: 8,
                  overflow: 'hidden',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                }}
              >
                <nativeKit.MessageList
                  items={mockMessages}
                  keyOf={(m) => m.id}
                  label="Adversarial Native Message List"
                  renderItem={(item) => (
                    <nativeKit.MessageBubble
                      author={item.author}
                      content={item.content}
                      time={item.time}
                      state={item.state}
                    />
                  )}
                />
              </View>

              <View style={{ marginTop: 12 }}>
                <nativeKit.Composer
                  value={composerText}
                  onChange={setComposerText}
                  onSend={() => {
                    Alert.alert('Sent', composerText);
                    setComposerText('');
                  }}
                  placeholder="Type message in native engine..."
                  busy={composerBusy}
                  onStop={() => setComposerBusy(false)}
                  label="Native Composer"
                />
              </View>
            </View>

          </ScrollView>
        </nativeKit.MediaAdapters>
      </WorldScope>
    </SafeAreaView>
  );
}
