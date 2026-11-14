import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CANONICAL_CIVIC_ROLES, type CivicRoleOption, type CivicRoleId } from '@repo/core/types';
import { useWorld } from '@repo/ui/theme/native';

export interface RoleCardGridProps {
  selectedRoleId: string;
  onSelectRole: (roleId: CivicRoleId) => void;
  roles?: readonly CivicRoleOption[];
}

export function RoleCardGrid({
  selectedRoleId,
  onSelectRole,
  roles = CANONICAL_CIVIC_ROLES,
}: RoleCardGridProps) {
  const { tokens } = useWorld();

  return (
    <View style={styles.grid}>
      {roles.map((role) => {
        const isSelected = selectedRoleId === role.id;
        return (
          <Pressable
            key={role.id}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected }}
            accessibilityLabel={`${role.label}, ${role.verb}`}
            onPress={() => onSelectRole(role.id)}
            style={[
              styles.card,
              isSelected
                ? { borderColor: tokens.lamp, backgroundColor: 'rgba(255, 255, 255, 0.08)' }
                : styles.cardInactive,
            ]}
          >
            <Text style={styles.icon}>{role.emoji}</Text>
            <View style={styles.textContainer}>
              <Text style={[styles.label, { color: isSelected ? tokens.lamp : tokens.ink }]}>
                {role.label}
              </Text>
              <Text style={[styles.verb, { color: tokens.inkSoft }]}>{role.verb}</Text>
            </View>
            {isSelected ? (
              <View style={[styles.checkContainer, { backgroundColor: tokens.lamp }]}>
                <Text style={[styles.check, { color: tokens.onLamp }]}>✓</Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 12,
    width: '100%',
    marginVertical: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  cardInactive: {
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  icon: {
    fontSize: 26,
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  verb: {
    fontSize: 13,
    lineHeight: 18,
  },
  checkContainer: {
    marginLeft: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    fontSize: 14,
    fontWeight: '800',
  },
});
