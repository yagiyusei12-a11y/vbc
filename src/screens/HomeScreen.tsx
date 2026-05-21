import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ScreenLayout } from '../components/ScreenLayout';
import { colors, spacing } from '../constants/theme';
import { useApp } from '../context/AppContext';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { members, activeMatch, savedMatches } = useApp();

  return (
    <ScreenLayout title="🏐 バレーボールのチーム分け" subtitle="チーム分け＆スコア記録">
      <Card>
        <Text style={styles.statLabel}>登録メンバー</Text>
        <Text style={styles.statValue}>{members.length} 人</Text>
      </Card>
      <Card>
        <Text style={styles.statLabel}>試合履歴</Text>
        <Text style={styles.statValue}>{savedMatches.length} 件</Text>
      </Card>
      {activeMatch ? (
        <Card style={styles.activeCard}>
          <Text style={styles.activeTitle}>進行中の試合があります</Text>
          <Button
            label="スコア画面へ"
            onPress={() => navigation.navigate('Match')}
            variant="accent"
          />
        </Card>
      ) : null}

      <View style={styles.menu}>
        <Button label="メンバー管理" onPress={() => navigation.navigate('Members')} />
        <Button
          label="チーム編成"
          onPress={() => navigation.navigate('TeamDivision')}
          variant="accent"
          disabled={members.length < 2}
        />
        <Button label="試合履歴" onPress={() => navigation.navigate('History')} variant="outline" />
        <Button label="バックアップ" onPress={() => navigation.navigate('Backup')} variant="outline" />
      </View>
      {members.length < 2 ? (
        <Text style={styles.hint}>チーム編成にはメンバーを2人以上登録してください</Text>
      ) : null}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  statLabel: { fontSize: 14, color: colors.textSecondary },
  statValue: { fontSize: 32, fontWeight: '800', color: colors.primary, marginTop: 4 },
  activeCard: { borderColor: colors.accentDark, borderWidth: 2 },
  activeTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  menu: { gap: spacing.md, marginTop: spacing.sm },
  hint: { textAlign: 'center', color: colors.textSecondary, marginTop: spacing.md, fontSize: 13 },
});
