import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ScreenLayout } from '../components/ScreenLayout';
import { colors, spacing } from '../constants/theme';
import { useApp } from '../context/AppContext';
import type { RootStackParamList } from '../navigation/types';
import { DIVISION_MODES, type DivisionMode, type Member } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'TeamDivision'>;

export function TeamDivisionScreen({ navigation }: Props) {
  const { members, activeMatch, startMatch } = useApp();
  const [teamCount, setTeamCount] = useState(2);
  const [playersPerTeam, setPlayersPerTeam] = useState(6);
  const [mode, setMode] = useState<DivisionMode>('levelBalanced');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelectedIds(new Set(members.map((m) => m.id)));
  }, [members]);

  const selectedCount = selectedIds.size;
  const maxOnCourt = teamCount * playersPerTeam;
  const benchCount = Math.max(0, selectedCount - maxOnCourt);

  const toggleMember = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(members.map((m) => m.id)));
  const selectNone = () => setSelectedIds(new Set());

  const runStart = () => {
    startMatch(teamCount, mode, playersPerTeam, [...selectedIds]);
    navigation.navigate('MatchResult');
  };

  const handleStart = () => {
    if (members.length === 0) {
      Alert.alert('エラー', 'メンバーを登録してください');
      return;
    }
    if (selectedCount < teamCount) {
      Alert.alert(
        'エラー',
        `参加メンバーは${teamCount}人以上選んでください（現在${selectedCount}人）`
      );
      return;
    }
    if (activeMatch) {
      Alert.alert('確認', '進行中の試合があります。新しい試合を開始しますか？', [
        { text: 'キャンセル', style: 'cancel' },
        { text: '開始', onPress: runStart },
      ]);
      return;
    }
    runStart();
  };

  const renderMemberRow = (member: Member) => {
    const selected = selectedIds.has(member.id);
    return (
      <Pressable
        key={member.id}
        style={[styles.memberRow, selected && styles.memberRowSelected]}
        onPress={() => toggleMember(member.id)}
      >
        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
          {selected ? <Text style={styles.checkmark}>✓</Text> : null}
        </View>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{member.level}</Text>
        </View>
        <Text style={styles.memberName}>{member.name}</Text>
      </Pressable>
    );
  };

  return (
    <ScreenLayout
      title="チーム編成"
      subtitle={`${selectedCount} / ${members.length} 人が参加`}
      footer={
        <View style={styles.footer}>
          <Button
            label="編成して結果を見る"
            onPress={handleStart}
            variant="accent"
            disabled={selectedCount < teamCount}
          />
          <Button label="戻る" onPress={() => navigation.goBack()} variant="outline" />
        </View>
      }
    >
      <Card>
        <View style={styles.memberHeader}>
          <Text style={styles.sectionTitle}>参加メンバー</Text>
          <View style={styles.selectActions}>
            <Pressable onPress={selectAll} hitSlop={8}>
              <Text style={styles.selectActionText}>全員</Text>
            </Pressable>
            <Text style={styles.selectDivider}>|</Text>
            <Pressable onPress={selectNone} hitSlop={8}>
              <Text style={styles.selectActionText}>解除</Text>
            </Pressable>
          </View>
        </View>
        {members.length === 0 ? (
          <Text style={styles.emptyMembers}>
            メンバー管理から登録してください
          </Text>
        ) : (
          members.map(renderMemberRow)
        )}
        {selectedCount > 0 && selectedCount < teamCount ? (
          <Text style={styles.warn}>
            あと{teamCount - selectedCount}人以上選んでください
          </Text>
        ) : null}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>チーム数</Text>
        <View style={styles.countRow}>
          <Pressable
            style={styles.countBtn}
            onPress={() => setTeamCount((c) => Math.max(2, c - 1))}
          >
            <Text style={styles.countBtnText}>−</Text>
          </Pressable>
          <Text style={styles.countValue}>{teamCount}</Text>
          <Pressable
            style={styles.countBtn}
            onPress={() => setTeamCount((c) => Math.min(6, c + 1))}
          >
            <Text style={styles.countBtnText}>＋</Text>
          </Pressable>
        </View>
        <Text style={styles.hint}>2〜6チーム</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>1チームの人数（コート定員）</Text>
        <View style={styles.countRow}>
          <Pressable
            style={styles.countBtn}
            onPress={() => setPlayersPerTeam((c) => Math.max(3, c - 1))}
          >
            <Text style={styles.countBtnText}>−</Text>
          </Pressable>
          <Text style={styles.countValue}>{playersPerTeam}</Text>
          <Pressable
            style={styles.countBtn}
            onPress={() => setPlayersPerTeam((c) => Math.min(12, c + 1))}
          >
            <Text style={styles.countBtnText}>＋</Text>
          </Pressable>
        </View>
        <Text style={styles.hint}>
          選択 {selectedCount}人 → コート {Math.min(selectedCount, maxOnCourt)}人まで / お休み{' '}
          {benchCount}人
        </Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>編成方式</Text>
        {DIVISION_MODES.map((m) => (
          <Pressable
            key={m.id}
            style={[styles.modeItem, mode === m.id && styles.modeItemActive]}
            onPress={() => setMode(m.id)}
          >
            <View style={[styles.radio, mode === m.id && styles.radioActive]} />
            <Text style={[styles.modeLabel, mode === m.id && styles.modeLabelActive]}>
              {m.label}
            </Text>
          </Pressable>
        ))}
      </Card>

      <Text style={styles.desc}>
        {mode === 'random' && '選択したメンバーをランダムに均等分配します。'}
        {mode === 'levelStrong' &&
          '選択したメンバーをレベル順スネークドラフトで各チームに分散します。'}
        {mode === 'levelBalanced' &&
          '選択したメンバーのレベル合計が各チームで近くなるよう割り当てます。'}
        {mode === 'positionBalanced' &&
          '選択したメンバーのポジション偏りが少なくなるよう割り当てます。'}
        {benchCount > 0
          ? `\n定員を超えた${benchCount}人は自動的にお休み（ベンチ）になります。`
          : ''}
      </Text>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  selectActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  selectActionText: { fontSize: 15, fontWeight: '700', color: colors.primary },
  selectDivider: { color: colors.border },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    marginBottom: spacing.xs,
    minHeight: 48,
  },
  memberRowSelected: { backgroundColor: '#E3F0FF' },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  checkboxSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  checkmark: { color: '#fff', fontSize: 16, fontWeight: '800' },
  levelBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  memberName: { fontSize: 16, fontWeight: '600', color: colors.text, flex: 1 },
  emptyMembers: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', padding: spacing.md },
  warn: {
    marginTop: spacing.sm,
    fontSize: 13,
    color: colors.danger,
    fontWeight: '600',
    textAlign: 'center',
  },
  countRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  countBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBtnText: { fontSize: 28, color: '#fff', fontWeight: '700' },
  countValue: { fontSize: 48, fontWeight: '800', color: colors.primary, minWidth: 60, textAlign: 'center' },
  hint: { textAlign: 'center', color: colors.textSecondary, marginTop: spacing.sm, fontSize: 13 },
  modeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 10,
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  modeItemActive: { backgroundColor: '#E3F0FF', borderWidth: 2, borderColor: colors.primary },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.md,
  },
  radioActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  modeLabel: { fontSize: 16, color: colors.text },
  modeLabelActive: { fontWeight: '700', color: colors.primary },
  desc: { fontSize: 14, color: colors.textSecondary, lineHeight: 20, paddingHorizontal: spacing.xs },
  footer: { gap: spacing.sm },
});
