import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { LevelPicker } from '../components/LevelPicker';
import { PositionPicker } from '../components/PositionPicker';
import { ScreenLayout } from '../components/ScreenLayout';
import { colors, spacing } from '../constants/theme';
import { useApp } from '../context/AppContext';
import type { RootStackParamList } from '../navigation/types';
import { POSITIONS, type Member, type PositionId } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Members'>;

function positionLabels(positions: PositionId[]) {
  return positions
    .map((id) => POSITIONS.find((p) => p.id === id)?.label ?? id)
    .join(' / ');
}

export function MembersScreen({ navigation }: Props) {
  const { members, addMember, updateMember, deleteMember } = useApp();
  const [editing, setEditing] = useState<Member | null>(null);
  const [name, setName] = useState('');
  const [level, setLevel] = useState(5);
  const [positions, setPositions] = useState<PositionId[]>([]);

  const resetForm = () => {
    setEditing(null);
    setName('');
    setLevel(5);
    setPositions([]);
  };

  const startEdit = (m: Member) => {
    setEditing(m);
    setName(m.name);
    setLevel(m.level);
    setPositions(m.positions);
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('入力エラー', '名前を入力してください');
      return;
    }
    if (positions.length === 0) {
      Alert.alert('入力エラー', 'ポジションを1つ以上選択してください');
      return;
    }
    if (editing) {
      updateMember(editing.id, { name: trimmed, level, positions });
    } else {
      addMember({ name: trimmed, level, positions });
    }
    resetForm();
  };

  const handleDelete = (m: Member) => {
    Alert.alert('削除確認', `「${m.name}」を削除しますか？`, [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: () => {
          deleteMember(m.id);
          if (editing?.id === m.id) resetForm();
        },
      },
    ]);
  };

  return (
    <ScreenLayout
      title="メンバー登録"
      subtitle={`${members.length} 人登録済み`}
      footer={
        <Button label="ホームに戻る" onPress={() => navigation.goBack()} variant="outline" />
      }
    >
      <Card>
        <Text style={styles.formTitle}>{editing ? 'メンバー編集' : '新規メンバー'}</Text>
        <Text style={styles.label}>名前</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="例: 田中"
          placeholderTextColor={colors.textSecondary}
        />
        <Text style={styles.label}>レベル (1〜10)</Text>
        <LevelPicker value={level} onChange={setLevel} />
        <Text style={[styles.label, { marginTop: spacing.md }]}>ポジション（複数可）</Text>
        <PositionPicker selected={positions} onChange={setPositions} />
        <View style={styles.formActions}>
          <Button
            label={editing ? '更新する' : '登録する'}
            onPress={handleSave}
            style={{ flex: 1 }}
          />
          {editing ? (
            <Button label="キャンセル" onPress={resetForm} variant="outline" style={{ flex: 1 }} />
          ) : null}
        </View>
      </Card>

      <Text style={styles.listTitle}>メンバー一覧</Text>
      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ListEmptyComponent={
          <Text style={styles.empty}>まだメンバーがいません</Text>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => startEdit(item)} onLongPress={() => handleDelete(item)}>
            <Card style={styles.memberCard}>
              <View style={styles.memberRow}>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>{item.level}</Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{item.name}</Text>
                  <Text style={styles.memberPos}>{positionLabels(item.positions)}</Text>
                </View>
                <Pressable onPress={() => handleDelete(item)} hitSlop={12}>
                  <Text style={styles.deleteBtn}>削除</Text>
                </Pressable>
              </View>
            </Card>
          </Pressable>
        )}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  formTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  label: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: 18,
    color: colors.text,
    marginBottom: spacing.md,
  },
  formActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  listTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  empty: { color: colors.textSecondary, textAlign: 'center', padding: spacing.lg },
  memberCard: { paddingVertical: spacing.sm },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  levelBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 17, fontWeight: '700', color: colors.text },
  memberPos: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  deleteBtn: { color: colors.danger, fontSize: 13, fontWeight: '600' },
});
