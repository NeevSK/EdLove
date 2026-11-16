import {
  Badge,
  Button,
  Chip,
  Pebble,
  SearchField,
  Section,
  Surface,
  Text,
} from '@repo/ui/components/native';
import { BookOpen, Sparkles } from '@repo/ui/icons/native';
import { useWorld } from '@repo/ui/theme/native';
import { tokens } from '@repo/ui/tokens';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export interface MobileLibraryResource {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly category: string;
  readonly format: 'pdf' | 'video' | 'interactive';
  readonly isOfficial: boolean;
}

const VERIFIED_MOBILE_RESOURCES: readonly MobileLibraryResource[] = [
  {
    id: 'res-curriculum-gr10-math',
    title: 'Grade 10 Mathematics — Algebraic Geometry Core',
    description: 'National Curriculum verified teaching guide, problem sets, and assessment milestones.',
    category: 'Mathematics',
    format: 'pdf',
    isOfficial: true,
  },
  {
    id: 'res-curriculum-gr11-science',
    title: 'Grade 11 Integrated Science — Ecological Systems',
    description: 'Bilingual Sinhala and Tamil fieldwork workbook and Sri Lankan biodiversity taxonomy.',
    category: 'Science',
    format: 'pdf',
    isOfficial: true,
  },
  {
    id: 'res-curriculum-sinhala-lit',
    title: 'Classical Sinhala & Tamil Epistemic Heritage Anthology',
    description: 'Annotated source manuscripts, vernacular prose analysis, and cross-cultural pedagogical notes.',
    category: 'Heritage',
    format: 'pdf',
    isOfficial: true,
  },
  {
    id: 'res-video-mindful-breathing',
    title: 'Sanctuary Somatic Presence & Classroom Focus',
    description: 'Calibrated 5-minute pre-lesson audio-visual mindfulness and breath practice.',
    category: 'Wellbeing',
    format: 'video',
    isOfficial: true,
  },
];

const CATEGORIES = ['All', 'Mathematics', 'Science', 'Heritage', 'Wellbeing'] as const;

export function LibraryFloor() {
  const world = useWorld();
  const wt = world.tokens;
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredResources = VERIFIED_MOBILE_RESOURCES.filter((res) => {
    const matchesCategory = selectedCategory === 'All' || res.category === selectedCategory;
    const matchesQuery =
      !searchQuery ||
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: wt.ground }]}
      contentContainerStyle={[styles.content, { paddingBottom: tokens.spacing.xl * 3 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Orientation Surface */}
      <Surface style={styles.heroSurface}>
        <View style={styles.eyebrowRow}>
          <Sparkles size={14} color={wt.lamp} />
          <Text kind="caption" tone="soft" style={styles.eyebrow}>
            CURRICULAR COMMONS · EPISTEMIC UNIVERSE
          </Text>
        </View>

        <Text kind="title" style={styles.title}>
          Curricular Library
        </Text>
        <Text kind="body" tone="soft" style={styles.subtitle}>
          Verified national curriculum, classical source manuscripts, and bilingual study materials.
        </Text>

        {/* Quick Desks Affordance Strip */}
        <View style={styles.deskPillRow}>
          <Pebble
            title="Collections"
            selected={true}
            onPress={() => setSelectedCategory('All')}
          />
          <Pebble
            title="Tools Hub"
            onPress={() => {}}
          />
          <Pebble
            title="Knowledge Map"
            onPress={() => {}}
          />
        </View>
      </Surface>

      {/* Search & Category Filter Section */}
      <View style={styles.searchSection}>
        <SearchField
          label="Search curricular resources"
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search verified textbooks, topics..."
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              selected={selectedCategory === cat}
              onPress={() => setSelectedCategory(cat)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Resource Cards Section */}
      <Section title={`Verified Resources (${filteredResources.length})`}>
        <View style={styles.cardList}>
          {filteredResources.map((res) => (
            <Surface key={res.id} style={styles.resourceCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIconBox}>
                  {res.format === 'video' ? (
                    <Sparkles size={18} color={wt.lampDeep} />
                  ) : (
                    <BookOpen size={18} color={wt.lampDeep} />
                  )}
                </View>
                <View style={styles.cardMetaBox}>
                  <Badge label={res.category} tone="neutral" />
                  {res.isOfficial && <Badge label="Official" tone="lamp" />}
                </View>
              </View>

              <Text kind="title" style={styles.resourceTitle}>
                {res.title}
              </Text>
              <Text kind="caption" tone="soft" numberOfLines={2} style={styles.resourceDesc}>
                {res.description}
              </Text>

              <View style={styles.cardFooter}>
                <Button
                  size="sm"
                  variant="secondary"
                  label={res.format === 'video' ? 'Play Video' : 'Open Reader'}
                  onPress={() => {}}
                />
              </View>
            </Surface>
          ))}
        </View>
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: tokens.spacing.md,
    gap: tokens.spacing.md,
  },
  heroSurface: {
    padding: tokens.spacing.lg,
    borderRadius: tokens.radii.lg,
    gap: tokens.spacing.xs,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.xs,
  },
  eyebrow: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    fontWeight: '700',
  },
  subtitle: {
    lineHeight: 20,
    marginTop: tokens.spacing.xs,
  },
  deskPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.xs,
    marginTop: tokens.spacing.sm,
  },
  searchSection: {
    gap: tokens.spacing.sm,
  },
  chipsContainer: {
    gap: tokens.spacing.xs,
    paddingVertical: tokens.spacing.xs,
  },
  cardList: {
    gap: tokens.spacing.sm,
  },
  resourceCard: {
    padding: tokens.spacing.md,
    borderRadius: tokens.radii.md,
    gap: tokens.spacing.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardIconBox: {
    width: 32,
    height: 32,
    borderRadius: tokens.radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardMetaBox: {
    flexDirection: 'row',
    gap: tokens.spacing.xs,
  },
  resourceTitle: {
    fontWeight: '600',
    marginTop: tokens.spacing.xs,
  },
  resourceDesc: {
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: tokens.spacing.xs,
  },
});
