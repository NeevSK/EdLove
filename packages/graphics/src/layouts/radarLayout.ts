export interface RadarPoint {
  attribute: string;
  value: number; // 0 to 1
  x: number;
  y: number;
}

export interface RadarLayoutResult {
  center: { x: number; y: number };
  points: RadarPoint[];
  axes: { attribute: string; x: number; y: number }[];
  radius: number;
}

/**
 * radarLayout - Calculates vertices for a radar (spider) chart.
 *
 * Used for multi-attribute analysis (e.g., Student Potential).
 */
export function radarLayout(
  node: any, // A single node with attributes
  size: { width: number; height: number },
): RadarLayoutResult {
  const centerX = size.width / 2;
  const centerY = size.height / 2;
  const radius = Math.min(centerX, centerY) * 0.8;

  // Attributes to plot (typically from node.metadata.attributes)
  const attributes = node.metadata?.attributes || {
    Logic: 0.8,
    Empathy: 0.6,
    Resonance: 0.9,
    Focus: 0.7,
    Creative: 0.85,
  };

  const keys = Object.keys(attributes);
  const angleStep = (Math.PI * 2) / keys.length;

  const points: RadarPoint[] = keys.map((key, i) => {
    const val = attributes[key];
    const angle = i * angleStep - Math.PI / 2;
    return {
      attribute: key,
      value: val,
      x: centerX + Math.cos(angle) * radius * val,
      y: centerY + Math.sin(angle) * radius * val,
    };
  });

  const axes = keys.map((key, i) => {
    const angle = i * angleStep - Math.PI / 2;
    return {
      attribute: key,
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    };
  });

  return {
    center: { x: centerX, y: centerY },
    points,
    axes,
    radius,
  };
}
