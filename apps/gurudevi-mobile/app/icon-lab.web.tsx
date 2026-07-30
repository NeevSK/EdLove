import { BellIcon } from 'phosphor-react-native/src/icons/Bell';
import { BookOpenIcon } from 'phosphor-react-native/src/icons/BookOpen';
import { GraduationCapIcon } from 'phosphor-react-native/src/icons/GraduationCap';
import { HeartIcon } from 'phosphor-react-native/src/icons/Heart';
import { LeafIcon } from 'phosphor-react-native/src/icons/Leaf';
import { ShieldCheckIcon } from 'phosphor-react-native/src/icons/ShieldCheck';
import { SparkleIcon } from 'phosphor-react-native/src/icons/Sparkle';
import { WarningIcon } from 'phosphor-react-native/src/icons/Warning';
import { UsersIcon } from 'phosphor-react-native/src/icons/Users';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  BellRing,
  BookOpen,
  GraduationCap,
  Heart,
  Leaf,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Users,
} from '@repo/ui/icons';

const samples = [
  ['Navigation', BookOpen, BookOpenIcon],
  ['Notifications', BellRing, BellIcon],
  ['Learning', GraduationCap, GraduationCapIcon],
  ['Care', Heart, HeartIcon],
  ['Nature', Leaf, LeafIcon],
  ['Trust', ShieldCheck, ShieldCheckIcon],
  ['Expression', Sparkles, SparkleIcon],
  ['Community', Users, UsersIcon],
  ['Warning', TriangleAlert, WarningIcon],
] as const;

export default function IconLabWebRoute() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>INTERNAL DESIGN REVIEW · WEB</Text>
      <Text style={styles.title}>Iconography Lab</Text>
      <Text style={styles.description}>
        Compare the web-safe SVG systems side by side. The RNVI font column is intentionally
        Android-only because its native font/config-plugin path must not leak into the web bundle.
      </Text>
      <View style={styles.note}>
        <Text style={styles.noteText}>Review the RNVI Lucide column at /icon-lab on Android.</Text>
      </View>
      <View style={styles.table}>
        <View style={styles.headerRow}>
          <Text style={styles.headerCell}>Concept</Text>
          <Text style={styles.headerCell}>Lucide</Text>
          <Text style={styles.headerCell}>Phosphor</Text>
        </View>
        {samples.map(([label, LucideIcon, PhosphorIcon]) => (
          <View key={label} style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.iconGroup}>
              {[16, 20, 24, 32].map((size) => (
                <LucideIcon key={size} size={size} color="#2A2318" />
              ))}
            </View>
            <View style={styles.iconGroup}>
              {[16, 20, 24, 32].map((size) => (
                <PhosphorIcon key={size} size={size} color="#A8643A" weight="regular" />
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F0E6' },
  content: { padding: 32, gap: 16, maxWidth: 980, alignSelf: 'center', width: '100%' },
  eyebrow: { color: '#A8643A', fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  title: { color: '#2A2318', fontSize: 40, fontWeight: '800' },
  description: { color: '#665B4C', fontSize: 16, lineHeight: 24, maxWidth: 720 },
  note: { borderLeftWidth: 3, borderLeftColor: '#7D6B9D', padding: 12, backgroundColor: '#EEE8F2' },
  noteText: { color: '#5A496F', fontSize: 13, fontWeight: '700' },
  table: { borderTopWidth: 1, borderTopColor: '#D9CEBD' },
  headerRow: { flexDirection: 'row', minHeight: 56, alignItems: 'center' },
  headerCell: { flex: 1, color: '#2A2318', fontSize: 14, fontWeight: '800' },
  row: { flexDirection: 'row', minHeight: 76, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E2D8C8' },
  label: { flex: 1, color: '#A8643A', fontSize: 13, fontWeight: '800' },
  iconGroup: { flex: 1, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' },
});
