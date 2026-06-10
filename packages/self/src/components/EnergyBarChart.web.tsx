/**
 * EnergyBarChart.web.tsx
 *
 * Web override of the RN EnergyBarChart. The RN version uses hardcoded white
 * text (designed for dark-themed screens). On web, BaseSelfView renders on a
 * light sanctuary surface so we use CSS variables and dark text instead.
 *
 * Also replaces the RN Animated bar layout with a pure HTML/CSS implementation
 * that uses percentage heights natively without requiring react-native-reanimated.
 *
 * Metro automatically resolves .web.tsx over .tsx on the web platform.
 */
import { ENERGY_COLORS } from '../constants/wellbeing';

interface EnergyBarChartProps {
  bars: Array<{
    id?: string;
    energy_level: number;
    forecast_date?: string;
    created_at?: string;
  }>;
  colors?: readonly string[];
  height?: number;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function EnergyBarChart({
  bars,
  colors = ENERGY_COLORS,
  height = 100,
}: EnergyBarChartProps) {
  if (!bars.length) {
    return (
      <p style={{ color: 'var(--ink-ghost)', fontSize: '14px', margin: 0 }}>
        No energy logs yet. Log your first energy reading to see your pulse.
      </p>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <p
        style={{
          color: 'var(--ink-ghost)',
          fontSize: '13px',
          marginBottom: '20px',
          marginTop: 0,
        }}
      >
        Your energy over the last {bars.length} recorded day
        {bars.length !== 1 ? 's' : ''}.
      </p>

      {/* Bar chart */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '6px',
          height: `${height}px`,
        }}
      >
        {bars.map((f, i) => {
          const level = Math.max(0, Math.min(5, f.energy_level ?? 3));
          const barColor = colors[level] ?? colors[3] ?? '#8B5CF6';
          const barHeight = level === 0 ? '2px' : `${(level / 5) * 100}%`;
          const opacity = 0.7 + (level / 5) * 0.3;

          // Label: weekday from date if available, else sequential index
          const dateStr = f.forecast_date ?? f.created_at;
          const label = dateStr ? DAY_LABELS[new Date(dateStr).getDay()] : String(i + 1);

          return (
            <div
              key={f.id ?? i}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                height: '100%',
                justifyContent: 'flex-end',
              }}
            >
              <div
                title={`${level}/5`}
                style={{
                  width: '100%',
                  height: barHeight,
                  backgroundColor: barColor,
                  borderRadius: '4px',
                  opacity,
                  transition: 'height 0.4s ease',
                  minHeight: '4px',
                }}
              />
              <span
                style={{
                  fontSize: '9px',
                  color: 'var(--ink-ghost)',
                  fontWeight: '600',
                  letterSpacing: '0.5px',
                }}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '6px',
        }}
      >
        <span style={{ fontSize: '10px', color: 'var(--ink-ghost)' }}>Oldest</span>
        <span style={{ fontSize: '10px', color: 'var(--ink-ghost)' }}>Today</span>
      </div>
    </div>
  );
}
