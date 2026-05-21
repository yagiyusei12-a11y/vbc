import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ScreenLayout } from '../components/ScreenLayout';
import { colors, spacing } from '../constants/theme';
import { useApp } from '../context/AppContext';
import type { RootStackParamList } from '../navigation/types';
import { exportBackup, importBackup } from '../services/backup';

type Props = NativeStackScreenProps<RootStackParamList, 'Backup'>;

export function BackupScreen({ navigation }: Props) {
  const { members, savedMatches, activeMatch, replaceAllData } = useApp();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      await exportBackup({ members, savedMatches, activeMatch });
    } catch (e) {
      const msg = e instanceof Error ? e.message : '書き出しに失敗しました';
      if (msg !== 'キャンセルされました') Alert.alert('エラー', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    Alert.alert(
      'データ読み込み',
      '現在のデータは上書きされます。続行しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '続行',
          onPress: async () => {
            setLoading(true);
            try {
              const data = await importBackup();
              replaceAllData(data);
              Alert.alert('完了', 'データを復元しました');
            } catch (e) {
              const msg = e instanceof Error ? e.message : '読み込みに失敗しました';
              if (msg !== 'キャンセルされました') Alert.alert('エラー', msg);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenLayout
      title="バックアップ"
      subtitle="JSONで書き出し・読み込み"
      footer={
        <Button label="ホームに戻る" onPress={() => navigation.navigate('Home')} variant="outline" />
      }
    >
      <Card>
        <Text style={styles.desc}>
          全メンバー・試合履歴・進行中の試合をJSONファイルとして書き出し、LINEやファイルアプリで共有できます。
        </Text>
        <Text style={styles.stats}>
          メンバー {members.length}人 / 履歴 {savedMatches.length}件
          {activeMatch ? ' / 進行中試合あり' : ''}
        </Text>
      </Card>

      <View style={styles.actions}>
        <Button
          label="データを書き出す"
          onPress={handleExport}
          loading={loading}
          variant="accent"
        />
        <Button
          label="データを読み込む"
          onPress={handleImport}
          loading={loading}
          variant="outline"
        />
      </View>

      <Text style={styles.note}>
        ※ 読み込み時は既存データがすべて置き換わります。定期的なバックアップをおすすめします。
      </Text>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  desc: { fontSize: 15, color: colors.text, lineHeight: 22 },
  stats: { marginTop: spacing.md, fontSize: 14, color: colors.primary, fontWeight: '600' },
  actions: { gap: spacing.md, marginTop: spacing.sm },
  note: { fontSize: 12, color: colors.textSecondary, marginTop: spacing.lg, lineHeight: 18 },
});
