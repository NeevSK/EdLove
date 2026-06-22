import { CircleCheck, Clock } from '@repo/ui/icons';
import { Box, Button, ButtonText, HStack, Icon, Text, VStack } from '@repo/ui/primitives';

interface Assignment {
  id: string;
  title: string;
  submitted: boolean;
  due_date: string | Date;
  classroom?: string;
  classrooms?: { name: string };
}

interface StudentUpcomingAssignmentsProps {
  assignments: Assignment[];
  onOpenSubmission: (assignment: Assignment) => void;
  isPastView: boolean;
}

export const StudentUpcomingAssignments = ({
  assignments,
  onOpenSubmission,
  isPastView,
}: StudentUpcomingAssignmentsProps) => {
  const pendingAssignments = assignments.filter((a) => !a.submitted);

  if (assignments.length === 0) return null;

  return (
    <VStack className="mt-10 gap-5">
      <HStack className="items-center justify-between px-1">
        <HStack className="items-center gap-2.5">
          <Box className="w-8 h-8 bg-sanctuarySaffron/10 rounded-xl items-center justify-center border border-sanctuarySaffron/20">
            <Icon as={Clock} size="xs" className="text-sanctuarySaffron" />
          </Box>
          <Text className="text-sm font-black text-sanctuary-text uppercase tracking-widest">
            {isPastView ? 'Completed Work' : 'Upcoming Work'}
          </Text>
        </HStack>
        {pendingAssignments.length > 0 && (
          <Box className="px-3 py-1.5 bg-sanctuary-error/10 border border-sanctuary-error/20 rounded-full">
            <Text className="text-[10px] text-sanctuary-error font-black uppercase tracking-widest">
              {pendingAssignments.length} pending
            </Text>
          </Box>
        )}
      </HStack>

      <VStack className="gap-3">
        {assignments.map((a) => (
          <HStack
            key={a.id}
            className={`items-center gap-4 p-5 rounded-[24px] border ${a.submitted ? 'bg-sanctuary-surface-secondary border-sanctuary-success/20' : 'bg-sanctuary-surface border-sanctuary-border'}`}
          >
            <Box
              className={`w-3 h-3 rounded-full border-2 ${a.submitted ? 'bg-sanctuary-success border-sanctuary-success/30' : 'bg-sanctuary-error border-sanctuary-error/30'}`}
            />

            <VStack className="flex-1 gap-1">
              <Text className="text-sm font-black text-sanctuary-text tracking-tight">
                {a.title}
              </Text>
              <HStack className="items-center gap-2">
                <Text className="text-[11px] font-bold text-sanctuary-text-tertiary">
                  {a.classroom ?? a.classrooms?.name ?? 'Classroom'}
                </Text>
                <Text className="text-[11px] text-sanctuary-text-tertiary/50">•</Text>
                <Text className="text-[11px] font-bold text-sanctuary-text-tertiary">
                  Due{' '}
                  {typeof a.due_date === 'string'
                    ? a.due_date
                    : new Date(a.due_date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                      })}
                </Text>
              </HStack>
            </VStack>

            {!a.submitted && !isPastView && (
              <Button
                size="sm"
                variant="outline"
                onPress={() => onOpenSubmission(a)}
                className="h-10 rounded-xl border-sanctuarySaffron/40 bg-sanctuarySaffron/5"
              >
                <ButtonText className="text-xs font-bold text-sanctuarySaffron px-2">
                  Submit
                </ButtonText>
              </Button>
            )}

            {a.submitted && (
              <HStack className="items-center gap-2 bg-sanctuary-success/10 px-3 py-1.5 rounded-full">
                <Icon as={CircleCheck} size="xs" className="text-sanctuary-success" />
                <Text className="text-[10px] font-black text-sanctuary-success uppercase tracking-widest">
                  Done
                </Text>
              </HStack>
            )}
          </HStack>
        ))}
      </VStack>
    </VStack>
  );
};
