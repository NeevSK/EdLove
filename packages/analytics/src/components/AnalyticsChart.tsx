import {
  ProgressRing,
  SimpleBarChart,
  SimpleLineChart,
  SimplePieChart,
} from '@repo/graphics/charts';
import { Box, HStack, Text } from '@repo/ui/primitives';
import { colors } from '@repo/ui/theme';

interface AnalyticsChartProps {
  title: string;
  data: {
    label: string;
    value: number;
    color?: string;
  }[];
  type?: 'bar' | 'line' | 'pie' | 'progress';
  height?: number;
  showValues?: boolean;
  maxValue?: number;
}
export function AnalyticsChart({
  title,
  data,
  type = 'bar',
  height = 200,
  showValues = true,
  maxValue,
}: AnalyticsChartProps) {
  switch (type) {
    case 'bar':
      return <SimpleBarChart title={title} data={data} height={height} showValues={showValues} />;
    case 'line':
      return (
        <SimpleLineChart
          title={title}
          data={data.map((datum) => ({ x: datum.label, y: datum.value }))}
          height={height}
          color={data[0]?.color}
        />
      );
    case 'pie':
      return <SimplePieChart title={title} data={data} size={height} />;
    case 'progress': {
      const progressValue = data[0]?.value ?? 0;
      const progressMax = maxValue ?? 100;
      return (
        <Box
          className="items-center rounded-3xl border border-black/5 bg-white/70 px-4 py-4"
          style={{ height }}
        >
          {title ? (
            <Text className="mb-4 text-center text-base font-bold" style={{ color: colors.text }}>
              {title}
            </Text>
          ) : null}
          <ProgressRing
            value={progressValue}
            max={progressMax}
            size={Math.min(height, 150)}
            color={data[0]?.color}
            showLabel={true}
          />
          <Text className="mt-3 text-center text-sm" style={{ color: colors.text }}>
            {data[0]?.label}: {progressValue}/{progressMax}
          </Text>
        </Box>
      );
    }
    default:
      return null;
  }
}
interface MultiSeriesChartProps {
  title: string;
  series: {
    name: string;
    data: {
      x: string;
      y: number;
    }[];
    color?: string;
  }[];
  type?: 'line' | 'bar';
  height?: number;
}
export function MultiSeriesChart({
  title,
  series,
  type = 'line',
  height = 250,
}: MultiSeriesChartProps) {
  return (
    <Box className="rounded-3xl border border-black/5 bg-white/70 px-4 py-4" style={{ height }}>
      {title ? (
        <Text className="mb-4 text-center text-base font-bold" style={{ color: colors.text }}>
          {title}
        </Text>
      ) : null}
      <HStack className="justify-around gap-3">
        {series.map((entry) => (
          <Box key={entry.name} className="flex-1 items-center">
            <Text
              className="mb-2 text-center text-xs font-semibold"
              style={{ color: entry.color || colors.gurudeviBlue }}
            >
              {entry.name}
            </Text>
            {type === 'line' ? (
              <SimpleLineChart data={entry.data} height={height - 60} color={entry.color} />
            ) : (
              <SimpleBarChart
                data={entry.data.map((datum) => ({
                  label: datum.x,
                  value: datum.y,
                  color: entry.color,
                }))}
                height={height - 60}
                showValues={false}
              />
            )}
          </Box>
        ))}
      </HStack>
    </Box>
  );
}
