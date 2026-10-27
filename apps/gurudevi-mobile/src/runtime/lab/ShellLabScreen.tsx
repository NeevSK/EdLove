import { tokens } from '@repo/ui/tokens';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { readStats, resetStats, type ShellSummary, summarize } from '@/lib/navigation/shellMetrics';
import {
  type ShellVariant,
  setShellVariantOverride,
  useShellVariant,
} from '@/lib/navigation/shellVariant';

const percent = (share: number) => `${Math.round(share * 100)}%`;
const ms = (value: number | null) => (value === null ? '–' : `${value} ms`);

/** The rows the lab shows, custom (A) beside native (B); pure so it can be tested. */
export function compareShells(
  a: ShellSummary,
  b: ShellSummary,
): readonly (readonly [string, string, string])[] {
  return [
    ['Minutes on screen', String(a.minutes), String(b.minutes)],
    ['Frames stressed', percent(a.stressedShare), percent(b.stressedShare)],
    ['Memory trimmed or low', percent(a.memoryPressureShare), percent(b.memoryPressureShare)],
    ['Tab switches timed', String(a.switches), String(b.switches)],
    ['Switch, mean', ms(a.meanSwitchMs), ms(b.meanSwitchMs)],
    ['Switch, slowest', ms(a.maxSwitchMs), ms(b.maxSwitchMs)],
  ];
}

/**
 * The tab shell's A/B lab on the phone: which shell this launch draws and why, a switch between
 * the custom tabs (A) and the system tabs (B), and what each has cost on this phone so far, side
 * by side. Use each for a while on the same phone, then compare. Development only: its route
 * renders nothing in a release.
 */
export function ShellLabScreen() {
  const choice = useShellVariant();
  const [stats, setStats] = useState(() => ({
    custom: readStats('custom'),
    native: readStats('native'),
  }));
  const refresh = () => setStats({ custom: readStats('custom'), native: readStats('native') });

  const choose = (variant: ShellVariant | null) => {
    setShellVariantOverride(variant);
    // The tabs remount under the new shell; open them to start using it.
    router.replace('/(tabs)/self');
  };
  const reset = () => {
    resetStats();
    refresh();
  };
  const share = () => {
    Share.share({ message: JSON.stringify({ choice, stats }) }).catch(() => undefined);
  };

  const rows = compareShells(summarize(stats.custom), summarize(stats.native));
  const launches = [stats.custom.launches, stats.native.launches] as const;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Tab shell lab</Text>

      <View style={styles.section}>
        <Text style={styles.heading}>This launch</Text>
        <Row
          label="Shell"
          value={choice.variant === 'native' ? 'Native tabs (B)' : 'Custom tabs (A)'}
        />
        <Row label="Chosen by" value={choice.reason} />
        {choice.bucket !== null ? <Row label="Bucket" value={String(choice.bucket)} /> : null}
        <Button label="Use custom tabs (A)" onPress={() => choose('custom')} />
        <Button label="Use native tabs (B)" onPress={() => choose('native')} />
        <Button label="Back to the assignment" onPress={() => choose(null)} />
      </View>

      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={[styles.heading, styles.label]}>On this phone</Text>
          <Text style={[styles.heading, styles.cell]}>A</Text>
          <Text style={[styles.heading, styles.cell]}>B</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Launches</Text>
          <Text style={styles.cell}>{launches[0]}</Text>
          <Text style={styles.cell}>{launches[1]}</Text>
        </View>
        {rows.map(([label, a, b]) => (
          <View key={label} style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.cell}>{a}</Text>
            <Text style={styles.cell}>{b}</Text>
          </View>
        ))}
        <Text style={styles.note}>
          Numbers are saved every 15 seconds while a shell is on screen. Lower is better on every
          row but minutes; compare once each has 10 minutes or more.
        </Text>
        <Button label="Refresh" onPress={refresh} />
        <Button label="Share as JSON" onPress={share} />
        <Button label="Reset both" onPress={reset} />
      </View>
    </ScrollView>
  );
}

function Row({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
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
  label: { color: tokens.colors.inkSubtle, flex: 1 },
  value: { color: tokens.colors.ink, flexShrink: 1, textAlign: 'right' },
  cell: { color: tokens.colors.ink, width: 64, textAlign: 'right' },
  note: { color: tokens.colors.inkSubtle, fontSize: 12, marginTop: 8 },
  button: {
    backgroundColor: tokens.colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: { color: tokens.colors.textInverse, fontWeight: '600' },
});
