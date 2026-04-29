import type {
  TrubeExperienceMode,
  TrubeLightingMode,
  TrubeMotifName,
  TrubeOrnamentName,
  TrubeScoreName,
  TrubeStageSpec,
  TrubeSurfaceName,
} from '@repo/trube-art';
import {
  getCanonicalScores,
  getCollectionScores,
  getExperienceGuidance,
  getProductionReadyScores,
  getScoreCollections,
  getScoreExtras,
  getScorePreset,
  getScoresByReviewState,
  getScoresForExperience,
  motif,
  ornament,
  stage,
  surface,
} from '@repo/trube-art';
import { TrubeMotif, TrubeOrnament, TrubeStage } from '@repo/trube-art/native';
import type { TemporalPhase } from '@repo/ui';
import { Box, HStack, ScreenWrapper, Text, VStack } from '@repo/ui';
import { Pressable, useTheme } from '@repo/ui/primitives';

import React from 'react';
import type { ScrollView } from 'react-native';

const _SURFACES: TrubeSurfaceName[] = ['aurora', 'mist', 'young-leaf'];
const _LIGHTS: TrubeLightingMode[] = [
  'predawn',
  'morning',
  'midday',
  'golden-hour',
  'dusk',
  'night',
];
const ARRANGEMENTS = ['solo', 'duet', 'orchestra'] as const;
const _ORNAMENTS: Array<TrubeOrnamentName | 'none'> = ['none', 'filigree', 'constellation', 'vein'];
const _MOTIFS: Array<TrubeMotifName | 'none'> = [
  'none',
  'lotus-sketch',
  'branch-flow',
  'tide-lines',
];
const _EXPERIENCE_MODES: TrubeExperienceMode[] = ['quiet', 'ambient', 'ceremonial'];
const LAB_MODES = ['masterpiece', 'study'] as const;

type Arrangement = (typeof ARRANGEMENTS)[number];
type LabMode = (typeof LAB_MODES)[number];

function mapPhaseToLight(phase: TemporalPhase): TrubeLightingMode {
  switch (phase) {
    case 'predawn':
      return 'predawn';
    case 'dawn':
      return 'morning';
    case 'morning':
      return 'morning';
    case 'afternoon':
      return 'golden-hour';
    case 'dusk':
      return 'dusk';
    default:
      return 'night';
  }
}

function buildStage(
  surfaceName: TrubeSurfaceName,
  light: TrubeLightingMode,
  arrangement: Arrangement,
  animationsEnabled: boolean,
  isDark: boolean,
  background: string,
): TrubeStageSpec {
  if (arrangement === 'solo') {
    return stage(
      [
        {
          id: 'body',
          role: 'body',
          opacity: 1,
          quality: animationsEnabled ? 'balanced' : 'static',
          surface: surface(surfaceName, {
            light,
            motion: animationsEnabled ? 'gentle' : 'still',
            intensity: 'balanced',
            grain: isDark ? 'rich' : 'standard',
            alpha: 0.82,
          }),
        },
      ],
      background,
    );
  }

  if (arrangement === 'duet') {
    const partner =
      surfaceName === 'aurora' ? 'mist' : surfaceName === 'mist' ? 'young-leaf' : 'aurora';

    return stage(
      [
        {
          id: 'body',
          role: 'body',
          opacity: 0.92,
          quality: animationsEnabled ? 'balanced' : 'static',
          surface: surface(surfaceName, {
            light,
            motion: animationsEnabled ? 'gentle' : 'still',
            intensity: 'balanced',
            grain: 'standard',
            alpha: 0.8,
          }),
        },
        {
          id: 'air',
          role: 'air',
          opacity: 0.36,
          quality: animationsEnabled ? 'efficient' : 'static',
          surface: surface(partner, {
            light,
            motion: animationsEnabled ? 'alive' : 'still',
            intensity: 'subtle',
            grain: 'soft',
            alpha: 0.52,
          }),
        },
      ],
      background,
    );
  }

  return stage(
    [
      {
        id: 'body',
        role: 'body',
        opacity: 0.94,
        quality: animationsEnabled ? 'balanced' : 'static',
        surface: surface(surfaceName, {
          light,
          motion: animationsEnabled ? 'gentle' : 'still',
          intensity: 'balanced',
          grain: 'standard',
          alpha: 0.84,
        }),
      },
      {
        id: 'air',
        role: 'air',
        opacity: 0.28,
        quality: animationsEnabled ? 'efficient' : 'static',
        surface: surface('mist', {
          light,
          motion: animationsEnabled ? 'gentle' : 'still',
          intensity: 'subtle',
          grain: 'soft',
          alpha: 0.44,
        }),
      },
      {
        id: 'shimmer',
        role: 'shimmer',
        opacity: 0.22,
        quality: animationsEnabled ? 'efficient' : 'static',
        surface: surface(surfaceName === 'young-leaf' ? 'aurora' : 'young-leaf', {
          light,
          motion: animationsEnabled ? 'alive' : 'still',
          intensity: 'subtle',
          grain: 'rich',
          alpha: 0.34,
        }),
      },
    ],
    background,
  );
}

function SegmentedOption({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  const { scene, text, accent } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      sx={{
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 999,
        backgroundColor: active ? accent.action : scene.interactive.bg,
        borderWidth: 1,
        borderColor: active ? accent.action : scene.interactive.border,
      }}
          <Text color={active ? text.onAccent : text.onInteractive} sx={{ fontSize: '$sm' as any, fontWeight: '600' }}        {label}
      </Text    </Pressable  );
}

export default function TrubeLabScreen() {
  const { scene, text, accent, phase, animationsEnabled, isDark } = useTheme();
  const [labMode, _setLabMode] = React.useState<LabMode>('masterpiece');
  const [experienceMode, _setExperienceMode] = React.useState<TrubeExperienceMode>('ambient');
  const [scoreName, setScoreName] = React.useState<TrubeScoreName>('goethe-night-study');
  const [surfaceName, _setSurfaceName] = React.useState<TrubeSurfaceName>('aurora');
  const [light, _setLight] = React.useState<TrubeLightingMode>(mapPhaseToLight(phase));
  const [arrangement, _setArrangement] = React.useState<Arrangement>('solo');
  const [ornamentName, _setOrnamentName] = React.useState<TrubeOrnamentName | 'none'>('none');
  const [motifName, _setMotifName] = React.useState<TrubeMotifName | 'none'>('none');

  const availableScores = React.useMemo(
    () => getScoresForExperience(experienceMode),
    [experienceMode],
  );
  const _scoreCollections = React.useMemo(() => getScoreCollections(), []);
  const _approvedScores = React.useMemo(() => getProductionReadyScores(), []);
  const _reviewScores = React.useMemo(() => getScoresByReviewState('in-review'), []);
  const _experimentalScores = React.useMemo(() => getScoresByReviewState('experimental'), []);
  const _canonicalScores = React.useMemo(
    () =>
      getCanonicalScores().map((item) => ({
        ...item,
        preset: getScorePreset(item.name),
        extras: getScoreExtras(item.name),
      })),
    [],
  );
  const _guidance = React.useMemo(() => getExperienceGuidance(experienceMode), [experienceMode]);

  React.useEffect(() => {
    if (!availableScores.some((score) => score.name === scoreName)) {
      setScoreName(availableScores[0]?.name ?? 'goethe-night-study');
    }
  }, [availableScores, scoreName]);

  const studyStage = React.useMemo(
    () => buildStage(surfaceName, light, arrangement, animationsEnabled, isDark, scene.canvas.bg),
    [arrangement, animationsEnabled, isDark, light, scene.canvas.bg, surfaceName],
  );
  const score = React.useMemo(() => getScorePreset(scoreName), [scoreName]);
  const scoreExtras = React.useMemo(() => getScoreExtras(scoreName), [scoreName]);

  const _composition = labMode === 'masterpiece' ? score.stage : studyStage;
  const _resolvedOrnament =
    labMode === 'masterpiece'
      ? scoreExtras.ornament
      : ornamentName !== 'none'
        ? ornament(ornamentName, {
            density: arrangement === 'orchestra' ? 0.82 : arrangement === 'duet' ? 0.62 : 0.44,
            opacity: isDark ? 0.72 : 0.48,
            seed: surfaceName === 'aurora' ? 11 : surfaceName === 'mist' ? 17 : 23,
          })
        : null;
  const _resolvedMotif =
    labMode === 'masterpiece'
      ? scoreExtras.motif
      : motifName !== 'none'
        ? motif(motifName, {
            density: arrangement === 'orchestra' ? 0.86 : arrangement === 'duet' ? 0.62 : 0.46,
            opacity: isDark ? 0.58 : 0.36,
            style: arrangement === 'solo' ? 'draft' : arrangement === 'duet' ? 'ink' : 'luminous',
            seed: light === 'night' ? 31 : light === 'golden-hour' ? 37 : 29,
          })
        : null;
  const _previewTitle = labMode === 'masterpiece' ? score.label : `${surfaceName} / ${arrangement}`;
  const _previewMeta =
    labMode === 'masterpiece'
      ? `${score.experience} / ${score.emphasis}`
      : `Light: ${light} / Motion: ${animationsEnabled ? 'living' : 'still'}`;

  return (
    <ScreenWrapper      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }} showsVerticalScrollIndicator={false}        <VStack space="lg"          <VStack space="xs"            <Text color={text.primary} sx={{ fontSize: '$2xl' as any, fontWeight: '700' }}              Trube Lab
            </_Text            <_Text color={text.secondary} sx={{ fontSize: '$sm' as any, _lineHeight: 20 }}              _Compose _like _a _visual _instrument: _first _as _authored _masterpieces, _then _as _studies _of _body, _air,
              _shimmer, _and _line.
            </_Text          </VStack
          <VStack _space="sm"            <_Text color={text.primary} sx={{ fontSize: '$md' as any, fontWeight: '600' }}              _Mode
            </Text            <_HStack space="sm" _flexWrap="wrap"              {_LAB_MODES._map((_item) => (
                <_SegmentedOption
                  _key={item}
                  _active={labMode === item}
                  _label={item}
                  _onPress={() => setLabMode(item)}
                /              )
  )
}
</HStack          </VStack
{
  labMode === 'masterpiece' ? (
            <React.Fragment              <VStack space="sm"                <Text color={text.primary} sx={{ fontSize: '$md' as any, fontWeight: '600' }}                  Experience
                </Text                <_HStack space="sm" _flexWrap="wrap"                  {_EXPERIENCE_MODES._map((_item) => (
                    <_SegmentedOption
                      _key={item}
                      _active={experienceMode === item}
                      _label={item}
                      _onPress={() => setExperienceMode(item)}
                    /                  )
  )
}
</HStack              </VStack
              <Box
                sx=
{
  padding: 16, borderRadius;
  : 20,
                  backgroundColor: scene.surface.bg,
                  borderWidth: 1,
                  borderColor: scene.surface.border,
}
<VStack space="xs"                  <Text color={text.onSurface} sx={{ fontSize: '$md' as any, fontWeight: '700' }}                    {guidance.label} guidance
                  </Text                  <Text color={text.secondary} sx={{ fontSize: '$sm' as any, lineHeight: 20 }}                    {guidance.description}
                  </Text                  <Text color={text.secondary} sx={{ fontSize: '$sm' as any, lineHeight: 20 }}                    {guidance.usage}
                  </Text                </VStack
</Box
<VStack space="sm"                <Text color=
{
  text.primary;
}
sx={{ fontSize: '$md' as any, fontWeight: '600' }
}                  Score
                </Text                <HStack space="sm" flexWrap="wrap"
{
  availableScores.map((item) => (
                    <SegmentedOption
                      key={item.name}
                      active={scoreName === item.name}
                      label={item.label}
                      onPress={() => setScoreName(item.name)}
                    /                  ))
}
</HStack              </VStack
              <VStack
space = 'sm' < Text
color=
{
  text.primary;
}
sx={{ fontSize: '$md' as any, fontWeight: '600' }
}                  Canonical Gurudevi Standard
                </Text                <Text color=
{
  text.secondary;
}
sx={{ fontSize: '$sm' as any, lineHeight: 20 }
}                  Live thumbnails
let _us;
compare;
the;
first;
three;
approved;
scenes;
side;
by;
side;
and;
keep;
art;
direction;
consistent.
</Text                <ScrollView horizontal showsHorizontalScrollIndicator=
{
  false;
}
<HStack space="md"                    {canonicalScores.map((item) => (
                      <Pressable
                        key={item.name}
                        onPress={() => {
                          setExperienceMode(item.preset.experience);
                          setScoreName(item.name);
                        }}
                        sx={{
                          width: 216,
                          padding: 10,
                          borderRadius: 24,
                          backgroundColor: scoreName === item.name ? scene.elevated.bg : scene.surface.bg,
                          borderWidth: 1,
                          borderColor: scoreName === item.name ? accent.action : scene.surface.border,
                        }}
                                              <VStack space="sm"                          <Box
                            sx={{
                              height: 136,
                              borderRadius: 18,
                              overflow: 'hidden',
                              borderWidth: 1,
                              borderColor: scene.elevated.border,
                              backgroundColor: item.preset.stage.background ?? scene.canvas.bg,
                            }}
                                                      <TrubeStage cornerRadius={18} stage={item.preset.stage} style={{ flex: 1 }} /                            <TrubeOrnament
                              color={accent.action}
                              cornerRadius={18}
                              ornament={item.extras.ornament}
                              style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                bottom: 0,
                                left: 0,
                              }}
                            /                            <TrubeMotif
                              color={text.onCanvas}
                              cornerRadius={18}
                              motif={item.extras.motif}
                              style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                bottom: 0,
                                left: 0,
                              }}
                            /                          </Box                          <VStack space="xs"                            <Text color={text.primary} sx={{ fontSize: '$sm' as any, fontWeight: '700' }}                              {item.preset.label}
                            </Text                            <Text color={text.secondary} sx={{ fontSize: '$xs' as any, lineHeight: 18 }}                              {item.role}
                            </Text                            <Text color={text.secondary} sx={{ fontSize: '$xs' as any, lineHeight: 18 }}                              {item.rationale}
                            </Text                          </VStack                        </VStack                      </Pressable                    ))}
                  </HStack
</ScrollView              </VStack
<VStack space="sm"                <Text color=
{
  text.primary;
}
sx={{ fontSize: '$md' as any, fontWeight: '600' }
}                  Curated Offerings
                </Text                <Text color=
{
  text.secondary;
}
sx={{ fontSize: '$sm' as any, lineHeight: 20 }
}                  Browse the library as families of scenes, not as a flat list. This keeps the offering broad without losing taste.
                </Text                <VStack space="sm"
{
  scoreCollections.map((collection) => {
    const collectionScores = getCollectionScores(collection.id);

    return (
                      <Box
                        key={collection.id}
                        sx={{
                          padding: 14,
                          borderRadius: 20,
                          backgroundColor: scene.surface.bg,
                          borderWidth: 1,
                          borderColor: scene.surface.border,
                        }}
                                              <VStack space="sm"                          <VStack space="xs"                            <Text color={text.onSurface} sx={{ fontSize: '$md' as any, fontWeight: '700' }}                              {collection.label}
                            </Text                            <Text color={text.secondary} sx={{ fontSize: '$sm' as any, lineHeight: 20 }}                              {collection.description}
                            </Text                          </VStack                          <HStack space="sm" flexWrap="wrap"                            {collectionScores.map((item) => (
                              <SegmentedOption
                                key={item.name}
                                active={scoreName === item.name}
                                label={item.label}
                                onPress={() => {
                                  setExperienceMode(item.experience);
                                  setScoreName(item.name);
                                }}
                              /                            ))}
                          </HStack                        </VStack                      </Box                    );
  });
}
</VStack              </VStack < Box
sx=
{
  padding: 16, borderRadius;
  : 20,
                  backgroundColor: scene.surface.bg,
                  borderWidth: 1,
                  borderColor: scene.surface.border,
}
<VStack space="sm"                  <Text color=
{
  text.onSurface;
}
sx={{ fontSize: '$md' as any, fontWeight: '700' }
}                    Production Board
                  </Text                  <Text color=
{
  text.secondary;
}
sx={{ fontSize: '$sm' as any, lineHeight: 20 }
}                    Lineage approval is now explicit. Approved scores are safe defaults. In-review scores are promising but still need context checks.
                  </Text                  <HStack space="sm" flexWrap="wrap"                    <SegmentedOption
                      active=
{
  score.review.state === 'approved';
}
label =
  { `approved ${approvedScores.length }`}
                      onPress={() => {
                        const next = approvedScores[0];
                        if (next) {
                          setExperienceMode(next.experience);
                          setScoreName(next.name);
                        }
                      }}
                    /                    <SegmentedOption
                      active={score.review.state === 'in-review'}
                      label={` in review;
$;
{
  reviewScores.length;
}
`}
                      onPress={() => {
                        const next = reviewScores[0];
                        if (next) {
                          setExperienceMode(next.experience);
                          setScoreName(next.name);
                        }
                      }}
                    /                    <SegmentedOption
                      active={score.review.state === 'experimental'}
                      label={`;
experimental;
$;
{
  experimentalScores.length;
}
`}
                      onPress={() => {
                        const next = experimentalScores[0];
                        if (next) {
                          setExperienceMode(next.experience);
                          setScoreName(next.name);
                        }
                      }}
                    /                  </HStack                </VStack
</Box            </React.Fragment          ) : null
}

          <Box
            sx=
{
  height: 320, borderRadius;
  : 28,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: scene.elevated.border,
              backgroundColor: scene.canvas.bg,
}
<TrubeStage cornerRadius={28} stage={composition} style={{ flex: 1 }} /
{
  resolvedOrnament ? (
              <TrubeOrnament
                color={accent.action}
                cornerRadius={28}
                ornament={resolvedOrnament}
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                }}
              /            ) : null
}
{
  resolvedMotif ? (
              <TrubeMotif
                color={text.onCanvas}
                cornerRadius={28}
                motif={resolvedMotif}
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                }}
              /            ) : null
}
<Box
              sx={{
                position: 'absolute',
                left: 20,
                right: 20,
                bottom: 20,
                padding: 14,
                borderRadius: 20,
                backgroundColor: scene.chrome.bg,
                borderWidth: 1,
                borderColor: scene.chrome.border,
              }}
                          <Text color={text.onChrome} sx={{ fontSize: '$md' as any, fontWeight: '700' }}                {previewTitle}
              </Text              <Text color={text.secondary} sx={{ fontSize: '$xs' as any, marginTop: 4 }}                {previewMeta}
              </Text            </Box
</Box
{
  labMode === 'study' ? (
            <React.Fragment              <VStack space="sm"                <Text color={text.primary} sx={{ fontSize: '$md' as any, fontWeight: '600' }}                  Instrument
                </Text                <HStack space="sm" flexWrap="wrap"                  {SURFACES.map((item) => (
                    <SegmentedOption
                      key={item}
                      active={surfaceName === item}
                      label={item}
                      onPress={() => setSurfaceName(item)}
                    /                  )
  )
}
</HStack              </VStack
              <VStack space="sm"                <Text color=
{
  text.primary;
}
sx={{ fontSize: '$md' as any, fontWeight: '600' }
}                  Arrangement
                </Text                <HStack space="sm" flexWrap="wrap"
{
  ARRANGEMENTS.map((item) => (
                    <SegmentedOption
                      key={item}
                      active={arrangement === item}
                      label={item}
                      onPress={() => setArrangement(item)}
                    /                  ))
}
</HStack              </VStack
              <VStack space="sm"                <Text color=
{
  text.primary;
}
sx={{ fontSize: '$md' as any, fontWeight: '600' }
}                  Lighting
                </Text                <HStack space="sm" flexWrap="wrap"
{
  LIGHTS.map((item) => (
                    <SegmentedOption
                      key={item}
                      active={light === item}
                      label={item}
                      onPress={() => setLight(item)}
                    /                  ))
}
</HStack              </VStack
              <VStack space="sm"                <Text color=
{
  text.primary;
}
sx={{ fontSize: '$md' as any, fontWeight: '600' }
}                  Ornament
                </Text                <HStack space="sm" flexWrap="wrap"
{
  ORNAMENTS.map((item) => (
                    <SegmentedOption
                      key={item}
                      active={ornamentName === item}
                      label={item}
                      onPress={() => setOrnamentName(item)}
                    /                  ))
}
</HStack              </VStack
              <VStack space="sm"                <Text color=
{
  text.primary;
}
sx={{ fontSize: '$md' as any, fontWeight: '600' }
}                  Motif
                </Text                <HStack space="sm" flexWrap="wrap"
{
  MOTIFS.map((item) => (
                    <SegmentedOption
                      key={item}
                      active={motifName === item}
                      label={item}
                      onPress={() => setMotifName(item)}
                    /                  ))
}
</HStack              </VStack            </React.Fragment          ) : null}

          <Box
            sx=
{
  padding: 16, borderRadius;
  : 20,
              backgroundColor: scene.surface.bg,
              borderWidth: 1,
              borderColor: scene.surface.border,
}
<VStack space="sm"              <Text color={text.onSurface} sx={{ fontSize: '$md' as any, fontWeight: '700' }}                Why this phase matters
              </Text              <Text color={text.secondary} sx={{ fontSize: '$sm' as any, lineHeight: 20 }}                Tiny detail matters when it stays surprising under attention. Great scores feel spatial and inevitable,
                while weak ones feel decorative and disposable.
              </Text              {labMode === 'masterpiece' ? (
                <Text color={text.secondary} sx={{ fontSize: '$sm' as any, lineHeight: 20 }}                  Restraint for this score: {score.restraint}
                </Text              ) : null}
              {labMode === 'masterpiece' ? (
                <Text color={text.secondary} sx={{ fontSize: '$sm' as any, lineHeight: 20 }}                  Review: {score.review.state} / {score.review.approvedFor}
                </Text
) : null}
{
  labMode === 'masterpiece' ? (
                <Text color={text.secondary} sx={{ fontSize: '$sm' as any, lineHeight: 20 }}                  Review note: {score.review.note}
                </Text              ) : null
}
{
  labMode === 'masterpiece'
    ? (
        <Text color={text.secondary} sx={{ fontSize: '$sm' as any, lineHeight: 20 }}                  Placement: focal {score.placement.focalZone}, overlay-safe {score.placement.safeOverlayZone}, text {score.placement.textDensity}
                </Text
      )
    : null;
}
{
  labMode === 'masterpiece' ? (
                <Text color={text.secondary} sx={{ fontSize: '$sm' as any, lineHeight: 20 }}                  Lineage doctrine: {score.lineage.doctrine}
                </Text              ) : null
}
{
  labMode === 'masterpiece' ? (
                <Text color={text.secondary} sx={{ fontSize: '$sm' as any, lineHeight: 20 }}                  Dialect: {score.lineage.dialect}
                </Text              ) : null
}
{
  labMode === 'masterpiece' ? (
                <Text color={text.secondary} sx={{ fontSize: '$sm' as any, lineHeight: 20 }}                  Temperament: {score.lineage.temperament}
                </Text              ) : null
}
{
  labMode === 'masterpiece' ? (
                <Text color={text.secondary} sx={{ fontSize: '$sm' as any, lineHeight: 20 }}                  Prefer: {score.placement.preferredUse}
                </Text              ) : null
}
{
  labMode === 'masterpiece' ? (
                <Text color={text.secondary} sx={{ fontSize: '$sm' as any, lineHeight: 20 }}                  Avoid: {score.placement.avoidUse}
                </Text              ) : null
}
</VStack          </Box
          <Button
            onPress=
{
  () => {
    if (labMode === 'masterpiece') {
      setExperienceMode('ceremonial');
      setScoreName('lotus-vigil');
      return;
    }

    setArrangement('orchestra');
    setSurfaceName('aurora');
    setLight('night');
    setOrnamentName('constellation');
    setMotifName('lotus-sketch');
  };
}
sx={{
              backgroundColor: accent.action,
              borderRadius: 999,
            }
}
                      <ButtonText sx=
{
  color: text.onAccent;
}
{
  labMode === 'masterpiece' ? 'Load Ceremonial Benchmark' : 'Reset To Night Orchestra';
}
</ButtonText          </Button        </VStack      </ScrollView    </ScreenWrapper  )
}
