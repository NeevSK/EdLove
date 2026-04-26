import { reportingAPI } from '@repo/admin';
import { type AcademicCycle, type AttendanceReport, api } from '@repo/core';
import {
  Box,
  GlobalHeader,
  Heading,
  HStack,
  hapticLight,
  Icon,
  Pressable,
  ScrollView,
  SkeletonCard,
  Text,
  VStack,
} from '@repo/ui';
import {
  Activity,
  AlertTriangle,
  Calendar,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface AttendanceReportScreenProps {
  schoolId: string;
  classroomId?: string;
  onBack: () => void;
}

export default function AttendanceReportScreen({
  schoolId,
  classroomId,
  onBack,
}: AttendanceReportScreenProps) {
  const { t } = useTranslation();
  const [report, setReport] = useState<AttendanceReport | null>(null);
  const [cycles, setCycles] = useState<AcademicCycle[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async (cycleId?: string) => {
    setLoading(true);
    try {
      const allCycles = await api.academicCycles.getAll(schoolId);
      setCycles(allCycles);

      const targetCycle = cycleId
        ? allCycles.find((c) => c.id === cycleId)
        : allCycles.find((c) => c.is_current) || allCycles[0];

      if (targetCycle) {
        setSelectedCycleId(targetCycle.id);
        const data = await reportingAPI.getAttendanceReport(
          schoolId,
          targetCycle.start_date,
          targetCycle.end_date,
          classroomId,
        );
        setReport(data);
      }
    } catch (error) {
      console.error('Failed to fetch attendance report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [schoolId]);

  const handleCycleSelect = (id: string) => {
    hapticLight();
    setSelectedCycleId(id);
    fetchData(id);
  };

  if (loading && !report) {
    return (
      <Box className="flex-1 bg-phase-canvas">
        <GlobalHeader title="Attendance Report" onBack={onBack} />
        <VStack className="gap-6 p-6">
          <SkeletonCard height={150} />
          <SkeletonCard height={300} />
        </VStack>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-phase-canvas">
      <GlobalHeader
        title={
          classroomId
            ? 'Class Attendance'
            : t('principal.attendance.reportTitle') || 'Institutional Attendance'
        }
        onBack={onBack}
      />

      <ScrollView contentContainerClassName="p-6">
        <VStack className="gap-8">
          {/* Cycle Selector */}
          <Box>
            <Text className="text-[10px] font-black text-phaseText-secondary mb-3 uppercase tracking-widest">
              Select Academic Cycle
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <HStack className="gap-3">
                {cycles.map((cycle) => (
                  <Pressable
                    key={cycle.id}
                    onPress={() => handleCycleSelect(cycle.id)}
                    className={`px-6 py-3 rounded-full border ${
                      selectedCycleId === cycle.id
                        ? 'bg-templeGold border-templeGold'
                        : 'bg-phase-surface border-phase-canvas'
                    }`}
                  >
                    <Text
                      className={`text-sm font-black ${
                        selectedCycleId === cycle.id ? 'text-white' : 'text-phaseText-primary'
                      }`}
                    >
                      {cycle.name}
                    </Text>
                  </Pressable>
                ))}
              </HStack>
            </ScrollView>
          </Box>

          {/* Key Metrics */}
          {report && (
            <HStack className="gap-4">
              <Box className="flex-1 bg-phase-surface p-5 rounded-generous border-0 shadow-sm">
                <VStack className="gap-2">
                  <Icon as={Activity} size="md" className="text-templeGold" />
                  <Heading className="text-3xl font-black text-phaseText-primary">
                    {report.overallRate}%
                  </Heading>
                  <Text className="text-[10px] text-phaseText-secondary font-bold uppercase tracking-wider">
                    Average Rate
                  </Text>
                </VStack>
              </Box>
              <Box className="flex-1 bg-phase-surface p-5 rounded-generous border-0 shadow-sm">
                <VStack className="gap-2">
                  <Icon as={AlertTriangle} size="md" className="text-emberRed" />
                  <Heading className="text-3xl font-black text-phaseText-primary">
                    {report.totalAbsences}
                  </Heading>
                  <Text className="text-[10px] text-phaseText-secondary font-bold uppercase tracking-wider">
                    Total Absences
                  </Text>
                </VStack>
              </Box>
            </HStack>
          )}

          <Box className="bg-phase-surface p-6 rounded-generous border-0 shadow-sm">
            <VStack className="gap-6">
              <HStack className="justify-between items-center">
                <Heading className="text-base font-black text-phaseText-primary">
                  Attendance Trend
                </Heading>
                <Icon as={TrendingUp} size="sm" className="text-templeGold" />
              </HStack>

              {report && report.trend.length > 0 ? (
                <VStack className="gap-4">
                  <HStack className="h-[150px] items-end gap-2">
                    {report.trend.slice(-10).map((point, i) => (
                      <VStack key={point.date} className="flex-1 items-center gap-1.5">
                        <Box
                          className={`w-full rounded-t-lg ${
                            point.rate > 90
                              ? 'bg-templeGold'
                              : point.rate > 75
                                ? 'bg-amberGlow'
                                : 'bg-emberRed'
                          }`}
                          style={{ height: `${point.rate}%` }}
                        />
                        <Text className="text-[8px] text-phaseText-tertiary font-black">
                          {point.date.split('-')[2]}
                        </Text>
                      </VStack>
                    ))}
                  </HStack>
                  <Text className="text-[10px] text-phaseText-tertiary text-center font-bold uppercase">
                    Showing last 10 session days
                  </Text>
                </VStack>
              ) : (
                <Box className="h-[100px] justify-center items-center">
                  <Text className="text-phaseText-tertiary font-medium">
                    No data for this period
                  </Text>
                </Box>
              )}
            </VStack>
          </Box>

          {/* Daily Table */}
          <VStack className="gap-3">
            <Heading className="text-sm font-black text-phaseText-primary ml-1 uppercase tracking-widest">
              Attendance Log
            </Heading>
            <VStack className="bg-phase-surface rounded-generous overflow-hidden border-0 shadow-sm">
              {report?.trend
                .slice()
                .reverse()
                .map((point, index, array) => (
                  <Box
                    key={point.date}
                    className={`p-5 ${index !== array.length - 1 ? 'border-b border-phase-canvas' : ''}`}
                  >
                    <HStack className="justify-between items-center">
                      <VStack className="gap-0.5">
                        <Text className="text-sm font-black text-phaseText-primary">
                          {point.date}
                        </Text>
                        <Text className="text-[11px] text-phaseText-secondary font-medium">
                          {point.presentCount} present &bull; {point.absentCount} absent
                        </Text>
                      </VStack>
                      <Box
                        className={`px-4 py-1.5 rounded-full ${
                          point.rate > 90 ? 'bg-templeGold/15' : 'bg-phase-canvas'
                        }`}
                      >
                        <Text
                          className={`text-xs font-black ${
                            point.rate > 90 ? 'text-templeGold' : 'text-phaseText-primary'
                          }`}
                        >
                          {point.rate}%
                        </Text>
                      </Box>
                    </HStack>
                  </Box>
                ))}
            </VStack>
          </VStack>
        </VStack>
      </ScrollView>
    </Box>
  );
}
