import { useTemporalStore } from '@repo/core/logic';
import { Shield } from '@repo/ui/icons';
import type React from 'react';
import { StyleSheet } from 'react-native';
import { Text, View } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme/Theme';

interface TemporalShieldProps {
  children: React.ReactNode;
  style?: any;
  label?: string;
}

/**
 * TemporalShield
 *
 * A high-fidelity UI wrapper that overlays a "Sanctuary Glass" effect
 * when viewing data in the 'past' or 'future' phases.
 * It reinforces the "Read-Only" nature of historical data.
 */
export const TemporalShield: React.FC<TemporalShieldProps> = ({ children, style, label }) => {
  const { phase, intensity } = useTemporalStore();
  const isPast = phase === 'past';

  if (!isPast) return <View style={style}>{children}</View>;

  return (
    <View style={[styles.container, style]}>
      {children}

      {/* The Sanctuary Glass Overlay */}
      <View style={[styles.overlay, { opacity: 0.1 * intensity }]} />

      {/* Contextual Signal */}
      <View style={styles.badge}>
        <Shield size={12} color={Theme.colors.resonance.past} />
        <Text style={styles.badgeText}>{label || 'PAST VIEW'}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#D1AC8C', // Sepia/Glass tint
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(209, 172, 140, 0.3)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D1AC8C',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
});
