import { Lucide } from '@react-native-vector-icons/lucide/static';
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
import { BellIcon } from 'phosphor-react-native/src/icons/Bell';
import { BookOpenIcon } from 'phosphor-react-native/src/icons/BookOpen';
import { GraduationCapIcon } from 'phosphor-react-native/src/icons/GraduationCap';
import { HeartIcon } from 'phosphor-react-native/src/icons/Heart';
import { LeafIcon } from 'phosphor-react-native/src/icons/Leaf';
import { ShieldCheckIcon } from 'phosphor-react-native/src/icons/ShieldCheck';
import { SparkleIcon } from 'phosphor-react-native/src/icons/Sparkle';
import { UsersIcon } from 'phosphor-react-native/src/icons/Users';
import { WarningIcon } from 'phosphor-react-native/src/icons/Warning';
import type React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

type IconComponent = (props: {
  size?: number;
  color?: string;
  strokeWidth?: number;
}) => React.ReactNode;

const samples = [
  {
    label: 'Navigation',
    name: 'Book',
    rnviName: 'book-open',
    lucide: BookOpen,
    phosphor: BookOpenIcon,
  },
  {
    label: 'Notifications',
    name: 'Bell',
    rnviName: 'bell-ring',
    lucide: BellRing,
    phosphor: BellIcon,
  },
  {
    label: 'Learning',
    name: 'Graduation',
    rnviName: 'graduation-cap',
    lucide: GraduationCap,
    phosphor: GraduationCapIcon,
  },
  { label: 'Care', name: 'Heart', rnviName: 'heart', lucide: Heart, phosphor: HeartIcon },
  { label: 'Nature', name: 'Leaf', rnviName: 'leaf', lucide: Leaf, phosphor: LeafIcon },
  {
    label: 'Trust',
    name: 'Shield',
    rnviName: 'shield-check',
    lucide: ShieldCheck,
    phosphor: ShieldCheckIcon,
  },
  {
    label: 'Expression',
    name: 'Sparkle',
    rnviName: 'sparkles',
    lucide: Sparkles,
    phosphor: SparkleIcon,
  },
  { label: 'Community', name: 'Users', rnviName: 'users', lucide: Users, phosphor: UsersIcon },
  {
    label: 'Warning',
    name: 'Alert',
    rnviName: 'triangle-alert',
    lucide: TriangleAlert,
    phosphor: WarningIcon,
  },
];

const sizes = [16, 20, 24, 32];
const ink = '#2A2318';
const accent = '#A8643A';

function IconCell({ children }: { children: React.ReactNode }) {
  return <View style={styles.iconCell}>{children}</View>;
}

export default function IconLabRoute() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>INTERNAL DESIGN REVIEW</Text>
        <Text style={styles.title}>Iconography Lab</Text>
        <Text style={styles.description}>
          Compare the same Gurudevi vocabulary across three implementation paths. Review rhythm,
          warmth, clarity, and cross-platform fidelity before choosing a long-term system.
        </Text>
        <Text style={styles.note}>Best viewed on Android and web at the same time.</Text>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#7A9B78' }]} />
          <Text style={styles.legendText}>SVG component</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#C79555' }]} />
          <Text style={styles.legendText}>Weight-aware SVG</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#7D6B9D' }]} />
          <Text style={styles.legendText}>Native font</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.matrix}
      >
        <View style={styles.matrixInner}>
          <View style={styles.columnHeader}>
            <Text style={styles.columnTitle}>Concept</Text>
            <Text style={styles.columnMeta}>Same scale · same ink</Text>
          </View>
          <View style={styles.columnHeader}>
            <Text style={styles.columnTitle}>Lucide</Text>
            <Text style={styles.columnMeta}>Current bridge</Text>
          </View>
          <View style={styles.columnHeader}>
            <Text style={styles.columnTitle}>Phosphor</Text>
            <Text style={styles.columnMeta}>Weight-aware</Text>
          </View>
          <View style={styles.columnHeader}>
            <Text style={styles.columnTitle}>RNVI Lucide</Text>
            <Text style={styles.columnMeta}>Native font</Text>
          </View>

          {samples.map((sample) => {
            const LucideIcon = sample.lucide as IconComponent;
            const PhosphorIcon = sample.phosphor as IconComponent;
            return (
              <View key={sample.label} style={styles.row}>
                <View style={styles.conceptCell}>
                  <Text style={styles.conceptLabel}>{sample.label}</Text>
                  <Text style={styles.conceptName}>{sample.name}</Text>
                </View>
                <IconCell>
                  {sizes.map((size) => (
                    <LucideIcon key={size} size={size} color={ink} strokeWidth={2} />
                  ))}
                </IconCell>
                <IconCell>
                  {sizes.map((size) => (
                    <PhosphorIcon key={size} size={size} color={accent} strokeWidth={2} />
                  ))}
                </IconCell>
                <IconCell>
                  {sizes.map((size) => (
                    <Lucide
                      key={size}
                      name={sample.rnviName as never}
                      size={size}
                      color="#6F5A88"
                    />
                  ))}
                </IconCell>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.reviewBlock}>
        <Text style={styles.reviewTitle}>Review prompts</Text>
        <Text style={styles.reviewText}>• Which set feels most like Gurudevi at 16–20px?</Text>
        <Text style={styles.reviewText}>• Which set stays legible in dense classroom screens?</Text>
        <Text style={styles.reviewText}>
          • Does the native font path feel materially different on Android?
        </Text>
        <Text style={styles.reviewText}>
          • Which weight language should belong to status, care, and celebration?
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F0E6' },
  content: { padding: 24, paddingBottom: 56, gap: 20 },
  header: { maxWidth: 720, gap: 8 },
  eyebrow: { color: accent, fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  title: { color: ink, fontSize: 36, fontWeight: '800', letterSpacing: -1 },
  description: { color: '#665B4C', fontSize: 16, lineHeight: 24, maxWidth: 640 },
  note: { color: '#8C806E', fontSize: 12, fontWeight: '700' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: '#665B4C', fontSize: 12, fontWeight: '600' },
  matrix: { paddingRight: 24 },
  matrixInner: { minWidth: 760, borderTopWidth: 1, borderTopColor: '#D9CEBD' },
  columnHeader: {
    width: 170,
    minHeight: 68,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#D9CEBD',
  },
  columnTitle: { color: ink, fontSize: 14, fontWeight: '800' },
  columnMeta: { color: '#8C806E', fontSize: 11, marginTop: 3 },
  row: { flexDirection: 'row', minHeight: 78, borderBottomWidth: 1, borderBottomColor: '#E2D8C8' },
  conceptCell: { width: 170, justifyContent: 'center', paddingHorizontal: 14 },
  conceptLabel: {
    color: accent,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  conceptName: { color: ink, fontSize: 15, fontWeight: '700', marginTop: 2 },
  iconCell: {
    width: 170,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 8,
  },
  reviewBlock: {
    borderLeftWidth: 3,
    borderLeftColor: accent,
    paddingLeft: 16,
    gap: 7,
    maxWidth: 720,
  },
  reviewTitle: { color: ink, fontSize: 16, fontWeight: '800' },
  reviewText: { color: '#665B4C', fontSize: 14, lineHeight: 20 },
});
