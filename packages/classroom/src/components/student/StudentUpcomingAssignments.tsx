import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { CircleCheck, Clock } from '@repo/ui/icons';

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
    <View className="mt-10 gap-5">
      <View className="flex-row items-center justify-between px-1">
        <View className="flex-row items-center gap-2.5">
          <View className="w-8 h-8 bg-sanctuarySaffron/10 rounded-xl items-center justify-center border border-sanctuarySaffron/20">
            <Clock size={16} className="text-sanctuarySaffron" />
          </View>
          <Text className="text-sm font-black text-sanctuary-text uppercase tracking-widest">
            {isPastView ? 'Completed Work' : 'Upcoming Work'}
          </Text>
        </View>
        {pendingAssignments.length > 0 && (
          <View className="px-3 py-1.5 bg-sanctuary-error/10 border border-sanctuary-error/20 rounded-full">
            <Text className="text-[10px] text-sanctuary-error font-black uppercase tracking-widest">
              {pendingAssignments.length} pending
            </Text>
          </View>
        )}
      </View>

      <View className="gap-3">
        {assignments.map((a) => (
          <View
            key={a.id}
            className={`flex-row items-center gap-4 p-5 rounded-[24px] border ${
              a.submitted
                ? 'bg-sanctuary-surface-secondary border-sanctuary-success/20'
                : 'bg-sanctuary-surface border-sanctuary-border'
            }`}
          >
            <View
              className={`w-3 h-3 rounded-full border-2 ${
                a.submitted
                  ? 'bg-sanctuary-success border-sanctuary-success/30'
                  : 'bg-sanctuary-error border-sanctuary-error/30'
              }`}
            />

            <View className="flex-1 gap-1">
              <Text className="text-sm font-black text-sanctuary-text tracking-tight">
                {a.title}
              </Text>
              <View className="flex-row items-center gap-2">
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
              </View>
            </View>

            {!a.submitted && !isPastView && (
              <Pressable
                onPress={() => onOpenSubmission(a)}
                accessibilityRole="button"
                accessibilityLabel="Submit assignment"
                className="h-10 px-4 rounded-xl border border-sanctuarySaffron/40 bg-sanctuarySaffron/5 items-center justify-center"
              >
                <Text className="text-xs font-bold text-sanctuarySaffron">
                  Submit
                </Text>
              </Pressable>
            )}

            {a.submitted && (
              <View className="flex-row items-center gap-2 bg-sanctuary-success/10 px-3 py-1.5 rounded-full">
                <CircleCheck size={14} className="text-sanctuary-success" />
                <Text className="text-[10px] font-black text-sanctuary-success uppercase tracking-widest">
                  Done
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};
