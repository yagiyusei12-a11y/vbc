import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { BackupScreen } from '../screens/BackupScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MatchResultScreen } from '../screens/MatchResultScreen';
import { MatchScreen } from '../screens/MatchScreen';
import { MembersScreen } from '../screens/MembersScreen';
import { TeamDivisionScreen } from '../screens/TeamDivisionScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { loading } = useApp();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Members" component={MembersScreen} />
        <Stack.Screen name="TeamDivision" component={TeamDivisionScreen} />
        <Stack.Screen name="MatchResult" component={MatchResultScreen} />
        <Stack.Screen name="Match" component={MatchScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="Backup" component={BackupScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
