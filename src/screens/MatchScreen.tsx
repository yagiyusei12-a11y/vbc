import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { ScreenLayout } from '../components/ScreenLayout';
import { colors, spacing } from '../constants/theme';
import { useApp } from '../context/AppContext';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Match'>;

export function MatchScreen({ navigation }: Props) {
  const {
    activeMatch,
    benchMembers,
    isCourtFlipped,
    updateScore,
    toggleCourtSide,
    saveMatchAndRotate,
    cancelActiveMatch,
    getMember,
  } = useApp();

  if (!activeMatch) {
    return (
      <ScreenLayout title="スコア">
        <Text style={styles.empty}>進行中の試合がありません</Text>
        <Button label="チーム編成へ" onPress={() => navigation.navigate('TeamDivision')} />
      </ScreenLayout>
    );
  }

  const teamCount = activeMatch.teams.length;
  const displayOrder = isCourtFlipped
    ? [...Array(teamCount).keys()].reverse()
    : [...Array(teamCount).keys()];

  const maxScore = Math.max(...activeMatch.scores, 0);
  const leaders = activeMatch.scores
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => s === maxScore && maxScore > 0);

  const handleSaveAndRotate = () => {
    const benchNote =
      benchMembers.length > 0
        ? `\nお休み ${benchMembers.length}人がコートへ、代わりに${benchMembers.length}人がお休みになります。`
        : '';
    Alert.alert(
      '次のゲームへ',
      `試合結果を保存し、スコアをリセットしてローテーションします。${benchNote}`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '保存して次へ',
          onPress: () => {
            saveMatchAndRotate();
            navigation.navigate('MatchResult');
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert('試合を破棄', 'スコアを保存せず終了しますか？', [
      { text: 'いいえ', style: 'cancel' },
      {
        text: '破棄',
        style: 'destructive',
        onPress: () => {
          cancelActiveMatch();
          navigation.navigate('Home');
        },
      },
    ]);
  };

  const isTwoTeamSideBySide = teamCount === 2;

  const renderScoreCard = (idx: number) => {
    const team = activeMatch.teams[idx];
    const teamColor = colors.teamColors[idx % colors.teamColors.length];
    const score = activeMatch.scores[idx] ?? 0;
    const memberNames = team.memberIds
      .map((id) => getMember(id)?.name)
      .filter(Boolean)
      .join(' · ');

    return (
      <View
        key={idx}
        style={[
          styles.scoreCard,
          isTwoTeamSideBySide && styles.scoreCardHalf,
          { borderColor: teamColor },
        ]}
      >
        <Text style={[styles.teamLabel, { color: teamColor }]} numberOfLines={1}>
          {team.name}
        </Text>
        {memberNames ? (
          <Text style={styles.memberHint} numberOfLines={2}>
            {memberNames}
          </Text>
        ) : null}
        <Text style={styles.score}>{score}</Text>
        <View style={styles.scoreActions}>
          <Pressable
            style={[styles.scoreBtn, styles.minusBtn]}
            onPress={() => updateScore(idx, -1)}
          >
            <Text style={[styles.scoreBtnText, styles.minusText]}>−1</Text>
          </Pressable>
          <Pressable
            style={[styles.scoreBtn, styles.plusBtn]}
            onPress={() => updateScore(idx, 1)}
          >
            <Text style={[styles.scoreBtnText, styles.plusText]}>+1</Text>
          </Pressable>
          <Pressable
            style={[styles.scoreBtn, styles.plusBigBtn]}
            onPress={() => updateScore(idx, 3)}
          >
            <Text style={styles.scoreBtnTextDark}>+3</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <ScreenLayout
      title="スコア入力"
      subtitle={isCourtFlipped ? 'コート反転中' : 'タップで加点・減点'}
      scroll={false}
      footer={
        <View style={styles.footer}>
          <Button
            label="試合結果を保存して次へ"
            onPress={handleSaveAndRotate}
            variant="accent"
          />
          <Button
            label="編成結果を見る"
            onPress={() => navigation.navigate('MatchResult')}
            variant="outline"
          />
          <Button label="試合を破棄" onPress={handleCancel} variant="danger" />
        </View>
      }
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable style={styles.courtFlipBtn} onPress={toggleCourtSide}>
          <Text style={styles.courtFlipText}>🔄 コートチェンジ</Text>
        </Pressable>

        {leaders.length > 0 ? (
          <View style={styles.leaderBanner}>
            <Text style={styles.leaderText}>
              🏆{' '}
              {leaders
                .map((l) => activeMatch.teams[l.i]?.name)
                .join(' / ')}{' '}
              リード中
            </Text>
          </View>
        ) : null}

        {benchMembers.length > 0 ? (
          <View style={styles.benchBanner}>
            <Text style={styles.benchBannerText}>
              ☕ お休み: {benchMembers.map((m) => m.name).join('、')}
            </Text>
          </View>
        ) : null}

        <View
          style={[
            isTwoTeamSideBySide ? styles.courtRow : styles.courtColumn,
            isTwoTeamSideBySide && isCourtFlipped && styles.courtRowFlipped,
          ]}
        >
          {displayOrder.map((idx) => renderScoreCard(idx))}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  empty: { textAlign: 'center', color: colors.textSecondary, marginBottom: spacing.lg },
  scroll: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  courtFlipBtn: {
    alignSelf: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 999,
    minHeight: 52,
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  courtFlipText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  leaderBanner: {
    backgroundColor: colors.accent,
    padding: spacing.md,
    borderRadius: 12,
  },
  leaderText: { fontSize: 16, fontWeight: '700', color: colors.text, textAlign: 'center' },
  benchBanner: {
    backgroundColor: '#FFF8E1',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.accentDark,
  },
  benchBannerText: { fontSize: 14, color: colors.text, fontWeight: '600' },
  courtRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  courtRowFlipped: {
    flexDirection: 'row-reverse',
  },
  courtColumn: {
    gap: spacing.md,
  },
  scoreCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 3,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  scoreCardHalf: {
    flex: 1,
    marginBottom: 0,
  },
  teamLabel: { fontSize: 16, fontWeight: '800', textAlign: 'center' },
  memberHint: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 4,
  },
  score: { fontSize: 56, fontWeight: '900', color: colors.text, lineHeight: 64 },
  scoreActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, flexWrap: 'wrap', justifyContent: 'center' },
  scoreBtn: {
    minWidth: 64,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  minusBtn: { backgroundColor: '#FFEBEE' },
  plusBtn: { backgroundColor: colors.primary },
  plusBigBtn: { backgroundColor: colors.accent },
  scoreBtnText: { fontSize: 18, fontWeight: '800', color: colors.text },
  scoreBtnTextDark: { fontSize: 18, fontWeight: '800', color: colors.text },
  minusText: { color: colors.danger },
  plusText: { color: '#fff' },
  footer: { gap: spacing.sm },
});
