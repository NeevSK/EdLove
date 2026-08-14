import { Progress, ProgressFilledTrack } from '@repo/ui/components/ui/progress';
import type { SafeActionProgress } from '@repo/ui/hooks/useSafeAction';
import type React from 'react';
import { Text, View } from 'react-native';
import { BrandPulse } from './BrandPulse';

interface LifecycleMonitorProps {
  progress: SafeActionProgress | null;
  className?: string;
}

/**
 * LifecycleMonitor (2026 SAL Standard)
 *
 * A high-fidelity progress tracker that provides visibility into
 * the internal steps of an agentic or complex async action.
 */
export const LifecycleMonitor: React.FC<LifecycleMonitorProps> = ({ progress, className }) => {
  if (!progress) return null;

  const isError = progress.status === 'error';
  const isPending = progress.status === 'pending';

  return (
    <View
      className={`p-4 bg-phase-surface/60 backdrop-blur-2xl rounded-2xl border border-phase-interactive/10 shadow-xl ${className || ''}`}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-3">
          {isPending ? (
            <BrandPulse size={20} tintColor="#D4843A" />
          ) : (
            <View
              className={`w-2 h-2 rounded-full ${isError ? 'bg-phase-danger' : 'bg-phase-success'}`}
            />
          )}
          <Text
            className={`font-semibold text-sm tracking-tight ${isError ? 'text-phase-danger' : 'text-phase-text-primary'}`}
          >
            {progress.message}
          </Text>
        </View>

        {progress.percentage !== undefined && (
          <Text className="text-[10px] text-phase-text-secondary font-mono opacity-60">
            {Math.round(progress.percentage)}%
          </Text>
        )}
      </View>

      {progress.percentage !== undefined && (
        <Progress value={progress.percentage} size="xs" className="bg-phase-interactive/5">
          <ProgressFilledTrack className={isError ? 'bg-phase-danger' : 'bg-phase-accent'} />
        </Progress>
      )}
    </View>
  );
};
