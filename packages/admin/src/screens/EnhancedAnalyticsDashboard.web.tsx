import { useClassPerformance, usePredictions, useStudentPerformance } from '@repo/analytics/hooks';
import { GPAInsights, PerformanceDashboard } from '@repo/analytics/ui';
import { Card } from '@repo/ui/components/SanctuaryCard';
import { HStack, Text, VStack } from '@repo/ui/primitives';
import { ScrollView } from '@repo/ui/primitives';

interface EnhancedAnalyticsDashboardProps {
  schoolId?: string;
  classId?: string;
  studentId?: string;
}

export default function EnhancedAnalyticsDashboard({
  schoolId,
  classId,
  studentId,
}: EnhancedAnalyticsDashboardProps) {
  // Student-focused analytics
  const { data: studentPerformance } = useStudentPerformance(studentId || '', classId || '');

  // Class-focused analytics
  const { data: classPerformance } = useClassPerformance(classId || '');

  // Predictions
  const { data: predictions } = usePredictions({
    studentId: studentId || '',
    predictionType: 'gpa',
    timeHorizon: 'semester',
  });

  return (
    <ScrollView className="flex-1 bg-[#FCF9F2]">
      <VStack className="p-4" space="md">
        {/* Header */}
        <Card className="p-6 mb-4">
          <Text className="text-2xl font-bold text-[#2A2318] mb-1">
            {'\uD83D\uDCCA'} Analytics Dashboard
          </Text>
          <Text className="text-base text-[#6B6480] mb-4">
            {studentId ? 'Student Performance' : classId ? 'Class Analytics' : 'School Overview'}
          </Text>
        </Card>

        {/* Student Performance View */}
        {studentId && studentPerformance && (
          <Card>
            <PerformanceDashboard
              metrics={studentPerformance}
              insights={[]} // Will be populated by InsightGenerator
              recommendations={[]} // Will be populated by InsightGenerator
            />
          </Card>
        )}

        {/* Class Performance View */}
        {classId && classPerformance && (
          <Card className="p-4">
            <VStack space="md">
              <Text className="text-lg font-semibold text-[#2A2318] mb-2">
                {'\uD83D\uDCC8'} Class Performance
              </Text>

              <HStack className="justify-around mb-6">
                <VStack className="flex-1 items-center">
                  <Text className="text-xl font-bold text-[#2A2318]">
                    {classPerformance.averageGPA.toFixed(2)}
                  </Text>
                  <Text className="text-xs text-[#6B6480]">Average GPA</Text>
                </VStack>
                <VStack className="flex-1 items-center">
                  <Text className="text-xl font-bold text-[#2A2318]">
                    {classPerformance.totalStudents}
                  </Text>
                  <Text className="text-xs text-[#6B6480]">Total Students</Text>
                </VStack>
                <VStack className="flex-1 items-center">
                  <Text className="text-xl font-bold text-[#2A2318]">
                    {classPerformance.topPerformers.length}
                  </Text>
                  <Text className="text-xs text-[#6B6480]">Top Performers</Text>
                </VStack>
              </HStack>

              <Text className="text-lg font-semibold text-[#2A2318] mb-2">
                {'\u26A0\uFE0F'} At-Risk Students
              </Text>
              {classPerformance.atRiskStudents.length > 0 ? (
                <VStack space="xs">
                  {classPerformance.atRiskStudents.slice(0, 5).map((sId: string, index: number) => (
                    <Text key={index} className="text-sm text-phase-danger mb-1">
                      {'\u2022'} Student {sId}
                    </Text>
                  ))}
                  {classPerformance.atRiskStudents.length > 5 && (
                    <Text className="text-sm text-[#6B6480] italic">
                      ...and {classPerformance.atRiskStudents.length - 5} more
                    </Text>
                  )}
                </VStack>
              ) : (
                <Text className="text-sm text-phase-success font-semibold">
                  {'\u2705'} No at-risk students identified
                </Text>
              )}

              <Text className="text-lg font-semibold text-[#2A2318] mb-2">
                {'\uD83D\uDCA1'} Key Insights
              </Text>
              <VStack space="xs">
                {classPerformance.insights.map((insight: string, index: number) => (
                  <Text key={index} className="text-sm text-[#2A2318] leading-[20px]">
                    {'\u2022'} {insight}
                  </Text>
                ))}
              </VStack>
            </VStack>
          </Card>
        )}

        {/* GPA Insights */}
        {studentId && studentPerformance && (
          <GPAInsights
            studentId={studentId}
            currentGPA={studentPerformance.currentGPA}
            trendDirection={studentPerformance.trendDirection}
            predictedGPA={predictions?.prediction}
          />
        )}

        {/* Quick Stats */}
        <Card className="p-4">
          <Text className="text-lg font-semibold text-[#2A2318] mb-2">
            {'\uD83C\uDFAF'} Quick Actions
          </Text>
          <VStack space="sm">
            <Text className="text-base text-phase-interactive mb-1">
              {'\uD83D\uDCE4'} Generate detailed performance reports
            </Text>
            <Text className="text-base text-phase-interactive mb-1">
              {'\uD83D\uDC65'} Schedule parent-teacher conferences
            </Text>
            <Text className="text-base text-phase-interactive mb-1">
              {'\uD83D\uDCC8'} View benchmark comparisons
            </Text>
            <Text className="text-base text-phase-interactive mb-1">
              {'\uD83D\uDEA8'} Set up at-risk alerts
            </Text>
          </VStack>
        </Card>
      </VStack>
    </ScrollView>
  );
}
