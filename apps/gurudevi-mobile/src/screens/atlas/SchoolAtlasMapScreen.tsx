// apps/gurudevi-mobile/src/screens/atlas/SchoolAtlasMapScreen.tsx
// Multi-Scale Global & Local Spatial Cartography Screen for Native Mobile (Expo SDK 58 / React Native Fabric)
// Integrates Scale 0 (Global), Scale 1 (National 25 Districts), Scale 2 & 3 (Zonal & Physical School Gate Ground Truth)
// Fully database-backed via Supabase PostGIS spatial engine — NO HARDCODED SCHOOL DATA.

import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import {
  type DistrictSpatialSummary,
  fetchSpatialSchoolsFromSupabase,
  findNearestSchools,
  GLOBAL_COMPARATIVE_COUNTRIES,
  type GlobalCountrySpatialSummary,
  haversineDistanceKm,
  recordSchoolGatePingInSupabase,
  type SchoolMapPoint,
  SRI_LANKA_DISTRICTS,
} from '@repo/core/spatial';
import { UnifiedMapView } from '@repo/ui/components/maps/UnifiedMapView';
import { UnifiedMarker } from '@repo/ui/components/maps/UnifiedMarker';
import {
  CircleCheck,
  Compass,
  Globe,
  Layers,
  MapPin,
  School,
  Search,
  Sparkles,
  Target,
  X,
} from '@repo/ui/icons';
import {
  Badge,
  BadgeText,
  Box,
  Heading,
  HStack,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  VStack,
} from '@repo/ui/primitives';
import { tokens } from '@repo/ui/tokens';
import { hapticImpact, hapticSelection, hapticSuccess } from '@repo/ui/utils/haptics';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator } from 'react-native';

type SpatialScaleLens = 'global' | 'national' | 'local';
type SpatialMetricView = 'theaterDelta' | 'cariScore' | 'mealFloor' | 'shadowTuition';

interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

// Default Sri Lanka centroid fallback
const DEFAULT_CENTER: UserLocation = {
  latitude: 7.8731,
  longitude: 80.7718,
};

export const SchoolAtlasMapScreen: React.FC = () => {
  const mapRef = useRef<any>(null);

  // Navigation State
  const [scaleLens, setScaleLens] = useState<SpatialScaleLens>('national');
  const [metricView, setMetricView] = useState<SpatialMetricView>('theaterDelta');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);

  // Active selections
  const [selectedSchool, setSelectedSchool] = useState<SchoolMapPoint | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictSpatialSummary | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<GlobalCountrySpatialSummary | null>(null);

  // Hardware GPS Location
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [, setLocationPermission] = useState<boolean | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Dynamic School Points state fetched live from Supabase
  const [schools, setSchools] = useState<SchoolMapPoint[]>([]);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);
  const [isPingingGate, setIsPingingGate] = useState(false);

  // Load dynamic schools from Supabase
  const loadSchools = useCallback(async (districtId?: string | null, query?: string | null) => {
    setIsLoadingSchools(true);
    try {
      const data = await fetchSpatialSchoolsFromSupabase(supabaseClient, {
        districtId: districtId || undefined,
        search: query || undefined,
        limit: 120,
      });
      setSchools(data);
    } catch (err) {
      console.warn('[SchoolAtlasMapScreen] Error fetching schools from Supabase:', err);
    } finally {
      setIsLoadingSchools(false);
    }
  }, []);

  // Fetch schools on initial mount or when district / search changes
  useEffect(() => {
    if (scaleLens === 'local') {
      void loadSchools(selectedDistrictId, searchQuery);
    }
  }, [scaleLens, selectedDistrictId, searchQuery, loadSchools]);

  // Request GPS permission and acquire device location
  const requestLocation = useCallback(async () => {
    try {
      setIsLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationPermission(false);
        setIsLocating(false);
        return;
      }
      setLocationPermission(true);
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coords: UserLocation = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy ?? undefined,
      };
      setUserLocation(coords);
      hapticSuccess();

      // Pan map to user location
      if (mapRef.current && scaleLens !== 'global') {
        mapRef.current.animateToRegion?.(
          {
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.15,
            longitudeDelta: 0.15,
          },
          1000,
        );
      }
    } catch (e) {
      console.warn('[SchoolAtlasMapScreen] Location acquisition failed:', e);
    } finally {
      setIsLocating(false);
    }
  }, [scaleLens]);

  useEffect(() => {
    void requestLocation();
  }, [requestLocation]);

  // Center on user location
  const handleCenterOnUser = () => {
    hapticImpact('medium');
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion?.(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        },
        800,
      );
    } else {
      void requestLocation();
    }
  };

  // Center on specific coordinate
  const panToCoordinate = (lat: number, lng: number, delta = 0.06) => {
    hapticSelection();
    if (mapRef.current) {
      mapRef.current.animateToRegion?.(
        {
          latitude: lat,
          longitude: lng,
          latitudeDelta: delta,
          longitudeDelta: delta,
        },
        700,
      );
    }
  };

  // Nearest schools dynamically computed relative to user location (or Colombo centroid fallback)
  const nearestSchools = useMemo(() => {
    if (schools.length === 0) return [];
    const originLat = userLocation?.latitude ?? DEFAULT_CENTER.latitude;
    const originLng = userLocation?.longitude ?? DEFAULT_CENTER.longitude;
    return findNearestSchools(originLat, originLng, schools, 6);
  }, [schools, userLocation]);

  // Ground-Truth Gate Ping Action (updates Supabase Postgres live)
  const handlePingSchoolGate = async (censusNo: string) => {
    if (!userLocation) {
      void requestLocation();
      return;
    }
    hapticSuccess();
    setIsPingingGate(true);

    try {
      // Optimistically update local view
      setSchools((prev) =>
        prev.map((s) => {
          if (s.censusNo !== censusNo) return s;
          return {
            ...s,
            lat: userLocation.latitude,
            lng: userLocation.longitude,
            precision: 'ground_truthed',
            groundTruthedAt: new Date().toISOString(),
            groundTruthedBy: `Verified On-Site (±${userLocation.accuracy?.toFixed(0) || 5}m)`,
          };
        }),
      );

      setSelectedSchool((prev) => {
        if (!prev || prev.censusNo !== censusNo) return prev;
        return {
          ...prev,
          lat: userLocation.latitude,
          lng: userLocation.longitude,
          precision: 'ground_truthed',
          groundTruthedAt: new Date().toISOString(),
          groundTruthedBy: `Verified On-Site (±${userLocation.accuracy?.toFixed(0) || 5}m)`,
        };
      });

      // Persist to Supabase Postgres
      const res = await recordSchoolGatePingInSupabase(supabaseClient, {
        censusNo,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        accuracyMeters: userLocation.accuracy,
        userRole: 'educator_field_survey',
      });

      if (res?.success) {
        hapticSuccess();
      }
    } finally {
      setIsPingingGate(false);
    }
  };

  // Color generator for metric gradients
  const getMetricBadge = (val: number, type: SpatialMetricView) => {
    switch (type) {
      case 'theaterDelta':
        return val >= 24 ? '#EF4444' : val >= 18 ? '#F59E0B' : '#10B981';
      case 'cariScore':
        return val >= 65 ? '#EF4444' : val >= 45 ? '#F59E0B' : '#10B981';
      case 'mealFloor':
        return val >= 80 ? '#10B981' : val >= 50 ? '#F59E0B' : '#EF4444';
      case 'shadowTuition':
        return val >= 20000 ? '#8B5CF6' : val >= 10000 ? '#3B82F6' : '#6B7280';
    }
  };

  return (
    <Box className="flex-1 bg-phase-canvas">
      {/* 1. TOP CONTROL BAR */}
      <VStack className="pt-3 px-4 pb-2 bg-phase-surface/95 border-b border-phase-border/40 gap-2.5 z-10">
        <HStack className="items-center justify-between">
          <HStack className="items-center gap-2">
            <Compass size={20} color={tokens.colors.primary} />
            <Heading size="md" className="text-phase-world font-bold">
              Spatial Cartography
            </Heading>
          </HStack>

          {/* GPS Status Indicator */}
          <Pressable
            onPress={handleCenterOnUser}
            className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20"
          >
            <Target size={12} color="#10B981" />
            <Text className="text-[11px] font-semibold text-emerald-600">
              {userLocation
                ? `GPS ±${userLocation.accuracy?.toFixed(0) || 8}m`
                : isLocating
                  ? 'Locating...'
                  : 'Enable GPS'}
            </Text>
          </Pressable>
        </HStack>

        {/* Scale Lens Switcher */}
        <HStack className="p-1 rounded-xl bg-phase-canvas/80 border border-phase-border/30">
          <Pressable
            onPress={() => {
              hapticSelection();
              setScaleLens('global');
              setSelectedSchool(null);
              setSelectedDistrict(null);
            }}
            className={`flex-1 py-1.5 rounded-lg items-center ${
              scaleLens === 'global' ? 'bg-phase-primary' : 'bg-transparent'
            }`}
          >
            <HStack className="items-center gap-1.5">
              <Globe size={13} color={scaleLens === 'global' ? '#0F172A' : '#94A3B8'} />
              <Text
                className={`text-xs font-semibold ${
                  scaleLens === 'global' ? 'text-phase-world font-bold' : 'text-phase-muted'
                }`}
              >
                Global (Scale 0)
              </Text>
            </HStack>
          </Pressable>

          <Pressable
            onPress={() => {
              hapticSelection();
              setScaleLens('national');
              setSelectedSchool(null);
              setSelectedCountry(null);
              panToCoordinate(7.8731, 80.7718, 2.5);
            }}
            className={`flex-1 py-1.5 rounded-lg items-center ${
              scaleLens === 'national' ? 'bg-phase-primary' : 'bg-transparent'
            }`}
          >
            <HStack className="items-center gap-1.5">
              <Layers size={13} color={scaleLens === 'national' ? '#0F172A' : '#94A3B8'} />
              <Text
                className={`text-xs font-semibold ${
                  scaleLens === 'national' ? 'text-phase-world font-bold' : 'text-phase-muted'
                }`}
              >
                25 Districts (Scale 1)
              </Text>
            </HStack>
          </Pressable>

          <Pressable
            onPress={() => {
              hapticSelection();
              setScaleLens('local');
              setSelectedDistrict(null);
              setSelectedCountry(null);
              if (schools.length === 0) {
                void loadSchools(selectedDistrictId, searchQuery);
              }
              if (userLocation) {
                panToCoordinate(userLocation.latitude, userLocation.longitude, 0.12);
              } else {
                panToCoordinate(6.9271, 79.8612, 0.12);
              }
            }}
            className={`flex-1 py-1.5 rounded-lg items-center ${
              scaleLens === 'local' ? 'bg-phase-primary' : 'bg-transparent'
            }`}
          >
            <HStack className="items-center gap-1.5">
              <MapPin size={13} color={scaleLens === 'local' ? '#0F172A' : '#94A3B8'} />
              <Text
                className={`text-xs font-semibold ${
                  scaleLens === 'local' ? 'text-phase-world font-bold' : 'text-phase-muted'
                }`}
              >
                Live Schools (Scale 2/3)
              </Text>
            </HStack>
          </Pressable>
        </HStack>

        {/* Metric Gradient Filter Switcher */}
        {scaleLens !== 'global' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-0.5">
            <HStack className="gap-2">
              <Pressable
                onPress={() => {
                  hapticSelection();
                  setMetricView('theaterDelta');
                }}
                className={`px-2.5 py-1 rounded-full border ${
                  metricView === 'theaterDelta'
                    ? 'bg-rose-500/10 border-rose-500/40'
                    : 'bg-phase-canvas border-phase-border/40'
                }`}
              >
                <Text
                  className={`text-[11px] font-semibold ${
                    metricView === 'theaterDelta' ? 'text-rose-600 font-bold' : 'text-phase-muted'
                  }`}
                >
                  🎭 Ratio Theater Delta (Δ)
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  hapticSelection();
                  setMetricView('cariScore');
                }}
                className={`px-2.5 py-1 rounded-full border ${
                  metricView === 'cariScore'
                    ? 'bg-amber-500/10 border-amber-500/40'
                    : 'bg-phase-canvas border-phase-border/40'
                }`}
              >
                <Text
                  className={`text-[11px] font-semibold ${
                    metricView === 'cariScore' ? 'text-amber-600 font-bold' : 'text-phase-muted'
                  }`}
                >
                  ⚡ C-ARI Score
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  hapticSelection();
                  setMetricView('mealFloor');
                }}
                className={`px-2.5 py-1 rounded-full border ${
                  metricView === 'mealFloor'
                    ? 'bg-emerald-500/10 border-emerald-500/40'
                    : 'bg-phase-canvas border-phase-border/40'
                }`}
              >
                <Text
                  className={`text-[11px] font-semibold ${
                    metricView === 'mealFloor' ? 'text-emerald-600 font-bold' : 'text-phase-muted'
                  }`}
                >
                  🍲 Midday Meal Floor
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  hapticSelection();
                  setMetricView('shadowTuition');
                }}
                className={`px-2.5 py-1 rounded-full border ${
                  metricView === 'shadowTuition'
                    ? 'bg-purple-500/10 border-purple-500/40'
                    : 'bg-phase-canvas border-phase-border/40'
                }`}
              >
                <Text
                  className={`text-[11px] font-semibold ${
                    metricView === 'shadowTuition'
                      ? 'text-purple-600 font-bold'
                      : 'text-phase-muted'
                  }`}
                >
                  💸 Shadow Tuition Burden
                </Text>
              </Pressable>
            </HStack>
          </ScrollView>
        )}

        {/* Live Search and District Filter for Schools (Scale 2/3) */}
        {scaleLens === 'local' && (
          <HStack className="items-center gap-2 pt-1">
            <Box className="flex-1 flex-row items-center bg-phase-canvas border border-phase-border/40 rounded-xl px-3 py-1.5 gap-2">
              <Search size={14} color="#94A3B8" />
              <TextInput
                placeholder="Search 9,960 schools in Supabase..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={(val: string) => setSearchQuery(val)}
                className="flex-1 text-xs text-phase-world p-0"
              />
              {isLoadingSchools && <ActivityIndicator size="small" color={tokens.colors.primary} />}
            </Box>

            {selectedDistrictId && (
              <Pressable
                onPress={() => setSelectedDistrictId(null)}
                className="flex-row items-center gap-1 bg-phase-primary/20 px-2.5 py-1.5 rounded-xl border border-phase-primary/30"
              >
                <Text className="text-[11px] font-bold text-phase-world">{selectedDistrictId}</Text>
                <X size={12} color="#0F172A" />
              </Pressable>
            )}
          </HStack>
        )}
      </VStack>

      {/* 2. MAIN MAP VIEW CONTAINER */}
      <Box className="flex-1 relative">
        {scaleLens === 'global' ? (
          // Scale 0: Global Comparative System Explorer
          <ScrollView className="flex-1 p-4 bg-phase-canvas">
            <VStack className="gap-3">
              <Box className="p-3.5 rounded-2xl bg-phase-surface border border-phase-border/40">
                <HStack className="items-center justify-between mb-1">
                  <Heading size="sm" className="text-phase-world font-bold">
                    Scale 0: Planetary Comparative Systems
                  </Heading>
                  <Badge className="bg-phase-primary/20 rounded-full px-2 py-0.5">
                    <BadgeText className="text-xs font-bold text-phase-world">
                      10 Paradigms
                    </BadgeText>
                  </Badge>
                </HStack>
                <Text className="text-xs text-phase-muted leading-relaxed">
                  Comparative planetary metrics showing how structural public investment relates to
                  shadow education prevalence and real classroom density.
                </Text>
              </Box>

              {GLOBAL_COMPARATIVE_COUNTRIES.map((c: GlobalCountrySpatialSummary) => {
                const isSelected = selectedCountry?.isoCode === c.isoCode;
                return (
                  <Pressable
                    key={c.isoCode}
                    onPress={() => {
                      hapticSelection();
                      setSelectedCountry(isSelected ? null : c);
                    }}
                    className={`p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-phase-surface border-phase-primary ring-2 ring-phase-primary/20'
                        : 'bg-phase-surface/80 border-phase-border/40'
                    }`}
                  >
                    <VStack className="gap-2">
                      <HStack className="items-center justify-between">
                        <HStack className="items-center gap-2">
                          <Text className="text-xl">{c.flagEmoji || '🌐'}</Text>
                          <VStack>
                            <Heading size="xs" className="text-phase-world font-bold">
                              {c.name}
                            </Heading>
                            <Text className="text-[11px] text-phase-muted">{c.region}</Text>
                          </VStack>
                        </HStack>
                        <Badge
                          style={{
                            backgroundColor:
                              c.shadowEducationPrevalencePct > 60
                                ? '#EF444415'
                                : c.shadowEducationPrevalencePct > 30
                                  ? '#F59E0B15'
                                  : '#10B98115',
                          }}
                          className="rounded-full px-2 py-0.5"
                        >
                          <BadgeText
                            style={{
                              color:
                                c.shadowEducationPrevalencePct > 60
                                  ? '#EF4444'
                                  : c.shadowEducationPrevalencePct > 30
                                    ? '#F59E0B'
                                    : '#10B981',
                            }}
                            className="text-[10px] font-bold"
                          >
                            Shadow: {c.shadowEducationPrevalencePct}%
                          </BadgeText>
                        </Badge>
                      </HStack>

                      {/* Metrics 4-Grid */}
                      <HStack className="justify-between pt-1 border-t border-phase-border/20">
                        <VStack>
                          <Text className="text-[10px] text-phase-muted uppercase">
                            Spend % GDP
                          </Text>
                          <Text className="text-xs font-bold text-phase-world">
                            {c.publicEducationSpendPctGdp}%
                          </Text>
                        </VStack>
                        <VStack>
                          <Text className="text-[10px] text-phase-muted uppercase">
                            Primary STR
                          </Text>
                          <Text className="text-xs font-bold text-phase-world">
                            {c.primarySchoolStr}:1
                          </Text>
                        </VStack>
                        <VStack>
                          <Text className="text-[10px] text-phase-muted uppercase">PISA Math</Text>
                          <Text className="text-xs font-bold text-phase-world">
                            {c.pisaMathScore ? c.pisaMathScore : 'N/A'}
                          </Text>
                        </VStack>
                        <VStack>
                          <Text className="text-[10px] text-phase-muted uppercase">PISA Read</Text>
                          <Text className="text-xs font-bold text-phase-world">
                            {c.pisaReadingScore ? c.pisaReadingScore : 'N/A'}
                          </Text>
                        </VStack>
                      </HStack>

                      {isSelected && (
                        <VStack className="pt-2 mt-1 border-t border-phase-border/20 gap-1.5">
                          <Text className="text-xs font-semibold text-phase-world">
                            Paradigm & Epistemic Frame:
                          </Text>
                          <Text className="text-xs text-phase-muted leading-relaxed">
                            {c.epistemicParadigm}
                          </Text>
                          <Text className="text-xs font-semibold text-phase-world mt-1">
                            Key EdTech Model & Platforms:
                          </Text>
                          <Text className="text-xs text-phase-muted leading-relaxed">
                            {c.keyEdTechModel} ({c.notablePlatforms.join(', ')})
                          </Text>
                        </VStack>
                      )}
                    </VStack>
                  </Pressable>
                );
              })}
            </VStack>
          </ScrollView>
        ) : (
          // Scale 1 & 2/3: Native Map View
          <>
            <UnifiedMapView
              ref={mapRef}
              style={{ flex: 1 }}
              region={{
                latitude: DEFAULT_CENTER.latitude,
                longitude: DEFAULT_CENTER.longitude,
                latitudeDelta: scaleLens === 'national' ? 2.5 : 0.25,
                longitudeDelta: scaleLens === 'national' ? 2.5 : 0.25,
              }}
              rotateEnabled={false}
            >
              {/* User Location Marker */}
              {userLocation && (
                <UnifiedMarker
                  id="user-device-location"
                  coordinate={{
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                  }}
                  title="My Location"
                  description="Hardware GPS Position"
                  pinColor="#3B82F6"
                />
              )}

              {/* National Scale: 25 District Centroids */}
              {scaleLens === 'national' &&
                SRI_LANKA_DISTRICTS.map((d) => {
                  const metricVal =
                    metricView === 'theaterDelta'
                      ? d.avgRatioTheaterDelta
                      : metricView === 'cariScore'
                        ? d.avgCariScore
                        : metricView === 'mealFloor'
                          ? d.middayMealCoveragePct
                          : d.shadowTuitionMonthlyPerChildLkr;

                  const pinColor = getMetricBadge(metricVal, metricView);

                  return (
                    <UnifiedMarker
                      key={d.id}
                      id={d.id}
                      coordinate={{ latitude: d.centroid.lat, longitude: d.centroid.lng }}
                      title={`${d.name} (${d.provinceName})`}
                      description={`Δ: +${d.avgRatioTheaterDelta.toFixed(1)} | C-ARI: ${d.avgCariScore}`}
                      onPress={() => {
                        hapticSelection();
                        setSelectedDistrict(d);
                        setSelectedSchool(null);
                      }}
                      pinColor={pinColor}
                    />
                  );
                })}

              {/* Local Scale: Live School Gate Ground Truth Points from Supabase */}
              {scaleLens === 'local' &&
                schools.map((s) => {
                  const isGroundTruthed = s.precision === 'ground_truthed';
                  const pinColor = isGroundTruthed ? '#10B981' : '#F59E0B';

                  return (
                    <UnifiedMarker
                      key={s.censusNo}
                      id={s.censusNo}
                      coordinate={{ latitude: s.lat, longitude: s.lng }}
                      title={s.name}
                      description={`${s.type || 'School'} | ${
                        isGroundTruthed ? '✅ Gate Surveyed' : '⚠️ Centroid Drift'
                      }`}
                      onPress={() => {
                        hapticSelection();
                        setSelectedSchool(s);
                        setSelectedDistrict(null);
                      }}
                      pinColor={pinColor}
                    />
                  );
                })}
            </UnifiedMapView>

            {/* Floating Re-center Action Button */}
            <Pressable
              onPress={handleCenterOnUser}
              className="absolute right-4 bottom-32 w-11 h-11 rounded-full bg-phase-surface/95 border border-phase-border shadow-lg items-center justify-center z-20"
            >
              <Target size={20} color={tokens.colors.primary} />
            </Pressable>

            {/* Floating Live Loading Indicator */}
            {isLoadingSchools && (
              <Box className="absolute top-4 left-1/2 -translate-x-1/2 flex-row items-center gap-2 bg-phase-surface/90 px-3 py-1.5 rounded-full border border-phase-border/60 shadow z-20">
                <ActivityIndicator size="small" color={tokens.colors.primary} />
                <Text className="text-xs font-semibold text-phase-world">
                  Querying Supabase PostGIS...
                </Text>
              </Box>
            )}
          </>
        )}

        {/* 3. BOTTOM INSPECTION CARD OR DRAWER */}
        {selectedDistrict && scaleLens === 'national' && (
          <Box className="absolute left-4 right-4 bottom-4 p-4 rounded-2xl bg-phase-surface/95 border border-phase-border/60 shadow-xl z-30">
            <VStack className="gap-2.5">
              <HStack className="items-center justify-between">
                <HStack className="items-center gap-2">
                  <MapPin size={18} color={tokens.colors.primary} />
                  <VStack>
                    <Heading size="sm" className="text-phase-world font-bold">
                      {selectedDistrict.name} District
                    </Heading>
                    <Text className="text-[11px] text-phase-muted">
                      {selectedDistrict.provinceName} Province • {selectedDistrict.totalSchools}{' '}
                      Schools
                    </Text>
                  </VStack>
                </HStack>
                <Pressable
                  onPress={() => setSelectedDistrict(null)}
                  className="p-1 rounded-full bg-phase-canvas"
                >
                  <X size={16} color="#94A3B8" />
                </Pressable>
              </HStack>

              {/* District Metrics Grid */}
              <HStack className="justify-between p-2.5 rounded-xl bg-phase-canvas border border-phase-border/30">
                <VStack>
                  <Text className="text-[10px] text-phase-muted uppercase">Theater Δ</Text>
                  <Text className="text-sm font-bold text-rose-500">
                    +{selectedDistrict.avgRatioTheaterDelta.toFixed(1)}
                  </Text>
                </VStack>
                <VStack>
                  <Text className="text-[10px] text-phase-muted uppercase">Class STR</Text>
                  <Text className="text-sm font-bold text-phase-world">
                    {selectedDistrict.avgRoomDensity}:1
                  </Text>
                </VStack>
                <VStack>
                  <Text className="text-[10px] text-phase-muted uppercase">C-ARI</Text>
                  <Text className="text-sm font-bold text-amber-500">
                    {selectedDistrict.avgCariScore}
                  </Text>
                </VStack>
                <VStack>
                  <Text className="text-[10px] text-phase-muted uppercase">Meal Floor</Text>
                  <Text className="text-sm font-bold text-emerald-500">
                    {selectedDistrict.middayMealCoveragePct}%
                  </Text>
                </VStack>
              </HStack>

              {/* Action: Query Live Schools from Supabase for this District */}
              <Pressable
                onPress={() => {
                  hapticSelection();
                  setSelectedDistrictId(selectedDistrict.id);
                  setScaleLens('local');
                  panToCoordinate(
                    selectedDistrict.centroid.lat,
                    selectedDistrict.centroid.lng,
                    0.15,
                  );
                  setSelectedDistrict(null);
                  void loadSchools(selectedDistrict.id, null);
                }}
                className="flex-row items-center justify-center gap-2 py-2.5 rounded-xl bg-phase-primary"
              >
                <School size={16} color="#0F172A" />
                <Text className="text-xs font-bold text-phase-world">
                  Explore Live Schools in {selectedDistrict.name} (Supabase)
                </Text>
              </Pressable>
            </VStack>
          </Box>
        )}

        {selectedSchool && scaleLens === 'local' && (
          <Box className="absolute left-4 right-4 bottom-4 p-4 rounded-2xl bg-phase-surface/95 border border-phase-border/60 shadow-xl z-30">
            <VStack className="gap-2.5">
              <HStack className="items-center justify-between">
                <HStack className="items-center gap-2">
                  <School size={18} color={tokens.colors.primary} />
                  <VStack>
                    <Heading size="xs" className="text-phase-world font-bold">
                      {selectedSchool.name}
                    </Heading>
                    <Text className="text-[11px] text-phase-muted">
                      Census: {selectedSchool.censusNo} • {selectedSchool.type || 'General'}
                    </Text>
                  </VStack>
                </HStack>
                <Pressable
                  onPress={() => setSelectedSchool(null)}
                  className="p-1 rounded-full bg-phase-canvas"
                >
                  <X size={16} color="#94A3B8" />
                </Pressable>
              </HStack>

              {/* Coordinate Precision Badge */}
              <HStack className="items-center justify-between">
                <HStack className="items-center gap-1.5">
                  {selectedSchool.precision === 'ground_truthed' ? (
                    <Badge className="bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
                      <BadgeText className="text-[10px] font-bold text-emerald-600">
                        ✅ Surveyed Physical Gate
                      </BadgeText>
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">
                      <BadgeText className="text-[10px] font-bold text-amber-600">
                        ⚠️ Tentative Centroid Drift
                      </BadgeText>
                    </Badge>
                  )}
                </HStack>

                {userLocation && (
                  <Text className="text-[11px] font-medium text-phase-muted">
                    {haversineDistanceKm(
                      selectedSchool.lat,
                      selectedSchool.lng,
                      userLocation.latitude,
                      userLocation.longitude,
                    ).toFixed(1)}{' '}
                    km away
                  </Text>
                )}
              </HStack>

              {/* Metrics Pill Grid */}
              <HStack className="justify-between p-2 rounded-xl bg-phase-canvas border border-phase-border/30">
                <VStack>
                  <Text className="text-[9px] text-phase-muted uppercase">Students</Text>
                  <Text className="text-xs font-bold text-phase-world">
                    {selectedSchool.totalStudents?.toLocaleString() || '-'}
                  </Text>
                </VStack>
                <VStack>
                  <Text className="text-[9px] text-phase-muted uppercase">Theater Δ</Text>
                  <Text className="text-xs font-bold text-phase-world">
                    +{selectedSchool.ratioTheaterDelta || '-'}
                  </Text>
                </VStack>
                <VStack>
                  <Text className="text-[9px] text-phase-muted uppercase">C-ARI</Text>
                  <Text className="text-xs font-bold text-amber-500">
                    {selectedSchool.cariScore || '-'}
                  </Text>
                </VStack>
                <VStack>
                  <Text className="text-[9px] text-phase-muted uppercase">Meal</Text>
                  <Text
                    className={`text-xs font-bold ${
                      selectedSchool.hasMiddayMeal ? 'text-emerald-500' : 'text-rose-500'
                    }`}
                  >
                    {selectedSchool.hasMiddayMeal ? 'Yes' : 'No'}
                  </Text>
                </VStack>
              </HStack>

              {/* Ground-Truth Gate Ping Button */}
              {selectedSchool.precision !== 'ground_truthed' ? (
                <Pressable
                  disabled={isPingingGate}
                  onPress={() => void handlePingSchoolGate(selectedSchool.censusNo)}
                  className="flex-row items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600"
                >
                  <CircleCheck size={16} color="#FFFFFF" />
                  <Text className="text-xs font-bold text-white">
                    {isPingingGate
                      ? 'Saving to Supabase...'
                      : 'Verify School Gate (Ping Device GPS)'}
                  </Text>
                </Pressable>
              ) : (
                <HStack className="items-center justify-center gap-1.5 py-1">
                  <CircleCheck size={13} color="#10B981" />
                  <Text className="text-[11px] text-emerald-600 font-semibold">
                    {selectedSchool.groundTruthedBy || 'Physical Gate Surveyed'}
                  </Text>
                </HStack>
              )}
            </VStack>
          </Box>
        )}

        {/* 4. NEAREST SCHOOLS BOTTOM HORIZONTAL CAROUSEL (Scale 2/3 when no card open) */}
        {!selectedSchool &&
          !selectedDistrict &&
          scaleLens === 'local' &&
          nearestSchools.length > 0 && (
            <Box className="absolute left-0 right-0 bottom-4 px-4 z-20">
              <VStack className="gap-1.5">
                <Text className="text-[11px] font-bold text-phase-world uppercase tracking-wider px-1">
                  📍 Nearest Schools ({nearestSchools.length})
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
                  <HStack className="gap-2">
                    {nearestSchools.map((s) => {
                      const distKm = userLocation
                        ? haversineDistanceKm(
                            s.lat,
                            s.lng,
                            userLocation.latitude,
                            userLocation.longitude,
                          )
                        : null;

                      return (
                        <Pressable
                          key={s.censusNo}
                          onPress={() => {
                            setSelectedSchool(s);
                            panToCoordinate(s.lat, s.lng, 0.04);
                          }}
                          className="p-3 w-56 rounded-2xl bg-phase-surface/95 border border-phase-border/60 shadow-md"
                        >
                          <VStack className="gap-1">
                            <HStack className="items-center justify-between">
                              <Badge
                                style={{
                                  backgroundColor:
                                    s.precision === 'ground_truthed' ? '#10B98115' : '#F59E0B15',
                                }}
                                className="rounded-full px-1.5 py-0.5"
                              >
                                <BadgeText
                                  style={{
                                    color: s.precision === 'ground_truthed' ? '#10B981' : '#F59E0B',
                                  }}
                                  className="text-[9px] font-bold"
                                >
                                  {s.precision === 'ground_truthed' ? 'Gate' : 'Centroid'}
                                </BadgeText>
                              </Badge>
                              {distKm !== null && (
                                <Text className="text-[10px] font-semibold text-phase-muted">
                                  {distKm.toFixed(1)} km
                                </Text>
                              )}
                            </HStack>
                            <Text numberOfLines={1} className="text-xs font-bold text-phase-world">
                              {s.name}
                            </Text>
                            <HStack className="items-center justify-between pt-1">
                              <Text className="text-[10px] text-phase-muted">
                                Δ +{s.ratioTheaterDelta || '-'}
                              </Text>
                              <Text className="text-[10px] text-amber-500 font-semibold">
                                C-ARI {s.cariScore || '-'}
                              </Text>
                            </HStack>
                          </VStack>
                        </Pressable>
                      );
                    })}
                  </HStack>
                </ScrollView>
              </VStack>
            </Box>
          )}
      </Box>
    </Box>
  );
};

export default SchoolAtlasMapScreen;
