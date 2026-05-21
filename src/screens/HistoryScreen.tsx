import React from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ScreenLayout } from '../components/ScreenLayout';
import { colors, spacing } from '../constants/theme';
import { useApp } from '../context/AppContext';
import type { RootStackParamList } from '../navigation/types';
import { DIVISION_MODES } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function HistoryScreen({ navigation }: Props) {
  const { savedMatches, deleteSavedMatch } = useApp();

  const handleDelete = (id: string) => {
    Alert.alert('削除確認', 'この試合履歴を削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: () => deleteSavedMatch(id) },
    ]);
  };

  return (
    <ScreenLayout
      title="試合履歴"
      subtitle={`${savedMatches.length} 件`}
      footer={
        <Button label="ホームに戻る" onPress={() => navigation.navigate('Home')} variant="outline" />
      }
    >
      <FlatList
        data={savedMatches}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ListEmptyComponent={<Text style={styles.empty}>保存された試合はありません</Text>}
        renderItem={({ item }) => {
          const modeLabel =
            DIVISION_MODES.find((m) => m.id === item.divisionMode)?.label ?? '';
          const maxScore = Math.max(...item.scores, 0);
          const winnerIdx = item.scores.findIndex((s) => s === maxScore);

          return (
            <Pressable onLongPress={() => handleDelete(item.id)}>
              <Card>
                <View style={styles.header}>
                  <Text style={styles.date}>{formatDate(item.finishedAt)}</Text>
                  <Pressable onPress={() => handleDelete(item.id)}>
                    <Text style={styles.delete}>削除</Text>
                  </Pressable>
                </View>
                <Text style={styles.mode}>{modeLabel} / {item.teamCount}チーム</Text>
                {item.teams.map((team, idx) => (
                  <View key={idx} style={styles.row}>
                    <Text
                      style={[
                        styles.teamName,
                        idx === winnerIdx && maxScore > 0 && styles.winner,
                      ]}
                    >
                      {team.name}
                      {idx === winnerIdx && maxScore > 0 ? ' 🏆' : ''}
                    </Text>
                    <Text style={styles.score}>{item.scores[idx] ?? 0}</Text>
                  </View>
                ))}
              </Card>
            </Pressable>
          );
        }}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  empty: { textAlign: 'center', color: colors.textSecondary, padding: spacing.xl },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  date: { fontSize: 14, color: colors.textSecondary },
  delete: { color: colors.danger, fontSize: 13 },
  mode: { fontSize: 13, color: colors.primary, marginBottom: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  teamName: { fontSize: 16, color: colors.text },
  winner: { fontWeight: '800', color: colors.primary },
  score: { fontSize: 18, fontWeight: '800', color: colors.text },
});
