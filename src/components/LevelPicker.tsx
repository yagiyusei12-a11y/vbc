import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../constants/theme';

type Props = {
  value: number;
  onChange: (level: number) => void;
};

export function LevelPicker({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
        <Pressable
          key={n}
          onPress={() => onChange(n)}
          style={[styles.chip, value === n && styles.chipActive]}
        >
          <Text style={[styles.chipText, value === n && styles.chipTextActive]}>{n}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 14, fontWeight: '600', color: colors.text },
  chipTextActive: { color: '#fff' },
});
