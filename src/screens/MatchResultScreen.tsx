import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ScreenLayout } from '../components/ScreenLayout';
import { colors, spacing } from '../constants/theme';
import { useApp } from '../context/AppContext';
import type { RootStackParamList } from '../navigation/types';
import { DIVISION_MODES, type Member } from '../types';
import { getTeamStats } from '../utils/bench';

type Props = NativeStackScreenProps<RootStackParamList, 'MatchResult'>;

type MoveTarget = { index: number; label: string };

export function MatchResultScreen({ navigation }: Props) {
  const {
    activeMatch,
    benchMembers,
    getMember,
    changeTeamName,
    moveMember,
    reorganizeTeams,
  } = useApp();

  const [renameIndex, setRenameIndex] = useState<number | null>(null);
  const [renameText, setRenameText] = useState('');
  const [movingMember, setMovingMember] = useState<Member | null>(null);

  if (!activeMatch) {
    return (
      <ScreenLayout title="編成結果">
        <Text style={styles.empty}>試合データがありません</Text>
        <Button label="チーム編成へ" onPress={() => navigation.navigate('TeamDivision')} />
      </ScreenLayout>
    );
  }

  const modeLabel =
    DIVISION_MODES.find((m) => m.id === activeMatch.divisionMode)?.label ?? '';

  const handleReorganize = () => {
    Alert.alert(
      '組み直し',
      '同じメンバー・設定でチームを再編成します。手動の移動はリセットされ、スコアは0に戻ります。',
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: '組み直す', onPress: reorganizeTeams },
      ]
    );
  };

  const moveTargets: MoveTarget[] = [
    ...activeMatch.teams.map((t, i) => ({ index: i, label: t.name })),
    { index: -1, label: 'お休み（ベンチ）' },
  ];

  const openRename = (teamIndex: number, currentName: string) => {
    setRenameIndex(teamIndex);
    setRenameText(currentName);
  };

  const confirmRename = () => {
    if (renameIndex !== null) {
      changeTeamName(renameIndex, renameText);
    }
    setRenameIndex(null);
    setRenameText('');
  };

  const confirmMove = (targetIndex: number) => {
    if (movingMember) {
      moveMember(movingMember.id, targetIndex);
    }
    setMovingMember(null);
  };

  const renderMemberRow = (member: Member) => (
    <View key={member.id} style={styles.memberLine}>
      <View style={styles.miniBadge}>
        <Text style={styles.miniBadgeText}>{member.level}</Text>
      </View>
      <Text style={styles.memberName}>{member.name}</Text>
      <Pressable
        style={styles.moveBtn}
        onPress={() => setMovingMember(member)}
        hitSlop={8}
      >
        <Text style={styles.moveBtnText}>⇄ 移動</Text>
      </Pressable>
    </View>
  );

  return (
    <ScreenLayout
      title="編成結果"
      subtitle={`${modeLabel} · タップで調整`}
      scroll={false}
      footer={
        <View style={styles.footer}>
          <Button
            label="スコア入力へ"
            onPress={() => navigation.navigate('Match')}
            variant="accent"
          />
          <Button label="🔀 組み直し" onPress={handleReorganize} variant="outline" />
          <Button label="ホーム" onPress={() => navigation.navigate('Home')} variant="outline" />
        </View>
      }
    >
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {activeMatch.teams.map((team, idx) => {
          const teamMembers = team.memberIds
            .map((id) => getMember(id))
            .filter((m): m is Member => m !== undefined);
          const stats = getTeamStats(team, getMember);
          const teamColor = colors.teamColors[idx % colors.teamColors.length];

          return (
            <Card
              key={idx}
              style={{
                ...styles.teamCard,
                borderLeftColor: teamColor,
                borderLeftWidth: 5,
              }}
            >
              <View style={styles.teamHeader}>
                <Text style={[styles.teamName, { color: teamColor }]}>{team.name}</Text>
                <Pressable
                  style={styles.editBtn}
                  onPress={() => openRename(idx, team.name)}
                  hitSlop={12}
                >
                  <Text style={styles.editIcon}>✏️</Text>
                </Pressable>
              </View>
              <Text style={styles.teamMeta}>
                {stats.count}人 / 合計Lv {stats.totalLevel}
              </Text>
              {teamMembers.map((m) => renderMemberRow(m))}
            </Card>
          );
        })}

        <Card style={styles.benchCard}>
          <Text style={styles.benchTitle}>☕ お休み（ベンチ）</Text>
          <Text style={styles.benchMeta}>{benchMembers.length}人</Text>
          {benchMembers.length === 0 ? (
            <Text style={styles.benchEmpty}>お休みメンバーはいません</Text>
          ) : (
            benchMembers.map((m) => renderMemberRow(m))
          )}
        </Card>
      </ScrollView>

      {/* チーム名変更 */}
      <Modal visible={renameIndex !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>チーム名を変更</Text>
            <TextInput
              style={styles.modalInput}
              value={renameText}
              onChangeText={setRenameText}
              placeholder="チーム名"
              placeholderTextColor={colors.textSecondary}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancel} onPress={() => setRenameIndex(null)}>
                <Text style={styles.modalCancelText}>キャンセル</Text>
              </Pressable>
              <Pressable style={styles.modalOk} onPress={confirmRename}>
                <Text style={styles.modalOkText}>保存</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* メンバー移動先選択 */}
      <Modal visible={movingMember !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {movingMember?.name} を移動
            </Text>
            <Text style={styles.modalSub}>移動先を選んでください</Text>
            <ScrollView style={styles.targetList}>
              {moveTargets.map((target) => (
                <Pressable
                  key={target.index}
                  style={styles.targetItem}
                  onPress={() => confirmMove(target.index)}
                >
                  <Text style={styles.targetLabel}>{target.label}</Text>
                  <Text style={styles.targetArrow}>›</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable style={styles.modalCancelFull} onPress={() => setMovingMember(null)}>
              <Text style={styles.modalCancelText}>キャンセル</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  empty: { textAlign: 'center', color: colors.textSecondary, marginBottom: spacing.lg },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xl },
  teamCard: { marginBottom: spacing.md },
  teamHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  teamName: { fontSize: 20, fontWeight: '800', flex: 1 },
  editBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: { fontSize: 22 },
  teamMeta: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.sm },
  memberLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 6,
  },
  miniBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniBadgeText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  memberName: { fontSize: 16, color: colors.text, flex: 1 },
  moveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    minHeight: 44,
    justifyContent: 'center',
  },
  moveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  benchCard: { borderColor: colors.accentDark, borderWidth: 2 },
  benchTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  benchMeta: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.sm },
  benchEmpty: { color: colors.textSecondary, fontSize: 14 },
  footer: { gap: spacing.sm },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(26,43,74,0.5)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalBox: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  modalSub: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.md },
  modalInput: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 18,
    color: colors.text,
    marginBottom: spacing.md,
  },
  modalActions: { flexDirection: 'row', gap: spacing.md },
  modalCancel: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  modalCancelText: { fontSize: 16, fontWeight: '700', color: colors.textSecondary },
  modalOk: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  modalOkText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  modalCancelFull: {
    marginTop: spacing.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  targetList: { maxHeight: 280 },
  targetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: 52,
  },
  targetLabel: { fontSize: 17, fontWeight: '600', color: colors.text },
  targetArrow: { fontSize: 24, color: colors.primary, fontWeight: '700' },
});
