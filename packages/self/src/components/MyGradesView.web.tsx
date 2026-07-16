import { SkeletonCard } from '@repo/ui/components/SkeletonLoader';
import { Award, BookOpen, Clock } from '@repo/ui/icons';
import { Box, Heading, HStack, Icon, Text, VStack } from '@repo/ui/primitives';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useStudentGrades } from '../hooks/useStudentGrades';

interface MyGradesViewProps {
  userId?: string;
}

const GRADE_THRESHOLD_EXCELLENT = 75;
const GRADE_THRESHOLD_PASSING = 50;

function getGradeStyles(grade: number): {
  color: string;
  border: string;
  bg: string;
  label: string;
} {
  if (grade >= GRADE_THRESHOLD_EXCELLENT) {
    return {
      color: 'text-emeraldGreen',
      border: 'border-emeraldGreen/20',
      bg: 'bg-emeraldGreen/10',
      label: 'Excellent',
    };
  }
  if (grade >= GRADE_THRESHOLD_PASSING) {
    return {
      color: 'text-sanctuarySaffron',
      border: 'border-sanctuarySaffron/20',
      bg: 'bg-sanctuarySaffron/10',
      label: 'Passing',
    };
  }
  return {
    color: 'text-emberRed',
    border: 'border-emberRed/20',
    bg: 'bg-emberRed/10',
    label: 'Needs work',
  };
}

export default function MyGradesView({ userId }: MyGradesViewProps) {
  const { t } = useTranslation();
  const { grades, isLoading } = useStudentGrades(userId);

  if (isLoading) {
    return (
      <VStack className="gap-4">
        <SkeletonCard height={80} />
        <SkeletonCard height={80} />
        <SkeletonCard height={80} />
      </VStack>
    );
  }

  if (!grades.length) {
    return (
      <Box className="p-12 bg-obsidian rounded-comfortable items-center border border-white/5">
        <Text className="text-sm text-mistGray text-center italic">
          {t('grades.empty') ||
            'No graded assignments yet. Your growth will be reflected here soon.'}
        </Text>
      </Box>
    );
  }

  const avgGrade = grades.reduce((sum, g) => sum + g.grade, 0) / grades.length;
  const avgStats = getGradeStyles(avgGrade);

  return (
    <VStack className="gap-6 mt-4">
      {/* Summary banner */}
      <HStack className="gap-4">
        <Box className="flex-1 p-5 bg-obsidian rounded-comfortable border border-white/5">
          <Text className="text-[10px] font-bold text-mistGray uppercase tracking-widest mb-1.5">
            Completed
          </Text>
          <HStack className="items-center gap-2">
            <Icon as={BookOpen} size={16} className="text-sanctuarySaffron" />
            <Text className="text-2xl font-extrabold text-sacredWhite">{grades.length}</Text>
          </HStack>
        </Box>
        <Box className="flex-1 p-5 bg-obsidian rounded-comfortable border border-white/5">
          <Text className="text-[10px] font-bold text-mistGray uppercase tracking-widest mb-1.5">
            Average Grade
          </Text>
          <HStack className="items-center gap-2">
            <Icon as={Award} size={16} className={avgStats.color} />
            <Text className={`text-2xl font-extrabold ${avgStats.color}`}>
              {Math.round(avgGrade)}%
            </Text>
          </HStack>
        </Box>
      </HStack>

      {/* Title */}
      <Heading size="md" className="text-sacredWhite px-1">
        Recent Grades
      </Heading>

      {/* Grade rows */}
      <VStack className="gap-3">
        {grades.map((item) => {
          const stats = getGradeStyles(item.grade);
          return (
            <HStack
              key={item.id}
              className="p-4 bg-obsidian rounded-comfortable items-center gap-4 border border-white/5 hover:border-white/10 transition-colors"
            >
              {/* Grade circle */}
              <Box
                className={`w-14 h-14 rounded-full border-2 items-center justify-center flex-shrink-0 ${stats.bg} ${stats.border}`}
              >
                <Text className={`text-sm font-black ${stats.color}`}>{item.grade}%</Text>
              </Box>

              {/* Assignment info */}
              <VStack className="flex-1 min-w-0 gap-0.5">
                <Text className="text-sm font-bold text-sacredWhite truncate">
                  {item.assignments?.title ?? 'Untitled Assignment'}
                </Text>
                <HStack className="items-center gap-2">
                  <Text className="text-xs text-mistGray truncate max-w-[120px]">
                    {item.classrooms?.name ?? 'Classroom'}
                  </Text>
                  <Box className="w-1 h-1 rounded-full bg-white/10" />
                  <HStack className="items-center gap-1">
                    <Icon as={Clock} size={10} className="text-dimGray" />
                    <Text className="text-[10px] text-dimGray">
                      {formatDistanceToNow(new Date(item.submitted_at), {
                        addSuffix: true,
                      })}
                    </Text>
                  </HStack>
                </HStack>
              </VStack>

              {/* Label badge */}
              <Box
                className={`px-3 py-1 rounded-full flex-shrink-0 ${stats.bg} border ${stats.border}`}
              >
                <Text className={`text-[10px] font-bold uppercase tracking-wider ${stats.color}`}>
                  {stats.label}
                </Text>
              </Box>
            </HStack>
          );
        })}
      </VStack>

      {/* Feedback section (last graded that has feedback) */}
      {(() => {
        const withFeedback = grades.find((g) => g.feedback);
        if (!withFeedback) return null;
        return (
          <Box className="p-5 bg-sanctuarySaffron/5 rounded-comfortable border border-sanctuarySaffron/10 mt-2">
            <HStack className="items-center gap-2 mb-3">
              <Box className="w-1.5 h-4 bg-sanctuarySaffron rounded-full" />
              <Text className="text-[11px] font-extrabold uppercase text-sanctuarySaffron tracking-widest">
                Latest Feedback
              </Text>
            </HStack>
            <Text className="text-sm text-sacredWhite leading-relaxed italic opacity-80">
              "{withFeedback.feedback}"
            </Text>
          </Box>
        );
      })()}
    </VStack>
  );
}
