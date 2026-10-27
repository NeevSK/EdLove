import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GURUDEVI_MOBILE_HOST,
  type LabResult,
  labConfigure,
  labSections,
  labTune,
  VERGER_LAB_CONFIG_KEY,
  VERGER_LAB_PATCH_KEY,
  type Verger,
} from '@repo/core/verger';
import { tokens } from '@repo/ui/tokens';
import { useVergerLab } from '@repo/verger-react';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';

const LEVERS = GURUDEVI_MOBILE_HOST.levers;

/** Where the lab keeps its patch: AsyncStorage's shape, so a test can hand in its own. */
export interface LabPatchStore {
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

async function keep(store: LabPatchStore, key: string, text: string): Promise<LabResult> {
  try {
    if (text.trim() === '') await store.removeItem(key);
    else await store.setItem(key, text);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: `applied, not saved: ${String(error)}` };
  }
}

/**
 * Applies a typed activation patch live and, only if it applied, saves it for the next launch
 * (empty text clears it). A refusal, or a save that fails, comes back as its reason.
 */
export async function applyLabPatch(
  verger: Verger,
  text: string,
  store: LabPatchStore = AsyncStorage,
): Promise<LabResult> {
  const outcome = labConfigure(verger, LEVERS, text);
  return outcome.ok ? keep(store, VERGER_LAB_PATCH_KEY, text) : outcome;
}

/** The same for thresholds: tuned live through validation, kept only if they applied. */
export async function applyLabTune(
  verger: Verger,
  text: string,
  store: LabPatchStore = AsyncStorage,
): Promise<LabResult> {
  const outcome = labTune(verger, GURUDEVI_MOBILE_HOST.config, text);
  return outcome.ok ? keep(store, VERGER_LAB_CONFIG_KEY, text) : outcome;
}

/**
 * Verger's dev lab on the phone (D2): every layer live (launch, readings, quality given up,
 * accounts, each lever's envelope, outcomes, self-cost) and the controls to change activation
 * and thresholds while it runs. A patch that applies is saved for the next launch; a refused one
 * shows its reason. The session recording is shared as JSON for `pnpm compare`. Development only:
 * its route renders nothing in a release.
 */
export function VergerLabScreen() {
  const { verger, report } = useVergerLab(LEVERS);
  const [patchText, setPatchText] = useState('');
  const [tuneText, setTuneText] = useState('');
  const [result, setResult] = useState<{
    readonly what: string;
    readonly outcome: LabResult;
  } | null>(null);

  if (!verger || !report) return <Text style={styles.empty}>No verger is bound.</Text>;

  const applyPatch = () => {
    void applyLabPatch(verger, patchText).then((outcome) =>
      setResult({ what: 'activation', outcome }),
    );
  };
  const applyTune = () => {
    void applyLabTune(verger, tuneText).then((outcome) =>
      setResult({ what: 'thresholds', outcome }),
    );
  };
  const shareRecording = () => {
    const recording = verger.recording();
    if (!recording) {
      setResult({ what: 'recording', outcome: { ok: false, error: 'not recording' } });
      return;
    }
    Share.share({ message: JSON.stringify(recording) }).catch((error: unknown) =>
      setResult({ what: 'recording', outcome: { ok: false, error: String(error) } }),
    );
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Verger lab</Text>
      <Button label="Tab shell lab (A/B)" onPress={() => router.push('/shell-lab')} />
      {labSections(report).map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.heading}>{section.title}</Text>
          {section.rows.map(([label, value]) => (
            <View key={label} style={styles.row}>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.value}>{value}</Text>
            </View>
          ))}
        </View>
      ))}

      <View style={styles.section}>
        <Text style={styles.heading}>
          Levers (level / proposed · limit ≤ ceiling ≤ home ≤ floor)
        </Text>
        {report.levers.map((lever) => (
          <View key={lever.id} style={styles.row}>
            <Text style={styles.label}>{lever.id}</Text>
            <Text style={styles.value}>
              {lever.level} / {lever.proposed} · {lever.limit} ≤ {lever.ceiling} ≤ {lever.home} ≤{' '}
              {lever.floor}
              {lever.pressure > 0 ? ` · pressure ${lever.pressure}` : ''}
              {lever.ineffective.length > 0 ? ` · not for ${lever.ineffective.join(', ')}` : ''}
              {lever.gain
                ? ` · gain ${Math.round(lever.gain.gain * 100)}% (${lever.gain.samples})`
                : ''}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Activation patch (JSON; empty returns to the launch)</Text>
        <TextInput
          style={styles.input}
          value={patchText}
          onChangeText={setPatchText}
          placeholder='{"grow": false}'
          autoCapitalize="none"
          autoCorrect={false}
          multiline
        />
        <Button label="Apply and save" onPress={applyPatch} />
        <Text style={styles.heading}>Thresholds (JSON; empty returns to the host's)</Text>
        <TextInput
          style={styles.input}
          value={tuneText}
          onChangeText={setTuneText}
          placeholder='{"upgradeAfterMs": 2000}'
          autoCapitalize="none"
          autoCorrect={false}
          multiline
        />
        <Button label="Tune and save" onPress={applyTune} />
        <Button label="Share session recording" onPress={shareRecording} />
        {result ? (
          <Text style={result.outcome.ok ? styles.ok : styles.error}>
            {result.what}: {result.outcome.ok ? 'applied' : result.outcome.error}
          </Text>
        ) : null}
      </View>
    </ScrollView>
  );
}

function Button({ label, onPress }: { readonly label: string; readonly onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.button}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: tokens.colors.background },
  content: { padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '700', color: tokens.colors.ink },
  empty: { padding: 16, color: tokens.colors.inkSubtle },
  section: {
    backgroundColor: tokens.colors.surface,
    borderColor: tokens.colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  heading: { fontSize: 15, fontWeight: '600', color: tokens.colors.ink, marginTop: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  label: { color: tokens.colors.inkSubtle, flexShrink: 0 },
  value: { color: tokens.colors.ink, flexShrink: 1, textAlign: 'right' },
  input: {
    borderColor: tokens.colors.borderStrong,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    minHeight: 48,
    color: tokens.colors.ink,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: tokens.colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: { color: tokens.colors.textInverse, fontWeight: '600' },
  ok: { color: tokens.colors.success, marginTop: 4 },
  error: { color: tokens.colors.error, marginTop: 4 },
});
