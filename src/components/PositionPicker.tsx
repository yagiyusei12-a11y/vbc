import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../constants/theme';
import { POSITIONS, type PositionId } from '../types';

type Props = {
  selected: PositionId[];
  onChange: (positions: PositionId[]) => void;
};

export function PositionPicker({ selected, onChange }: Props) {
  const toggle = (id: PositionId) => {
    if (selected.includes(id)) {
      onChange(selected.filter((p) => p !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <View style={styles.wrap}>
      {POSITIONS.map((p) => {
        const active = selected.includes(p.id);
        return (
          <Pressable
            key={p.id}
            onPress={() => toggle(p.id)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.text, active && styles.textActive]}>{p.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accentDark },
  text: { fontSize: 14, fontWeight: '600', color: colors.text },
  textActive: { color: colors.text },
});
