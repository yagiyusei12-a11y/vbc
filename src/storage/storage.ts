import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppData } from '../types';
import { STORAGE_KEY } from '../types';

export const defaultAppData: AppData = {
  members: [],
  savedMatches: [],
  activeMatch: null,
};

export async function loadAppData(): Promise<AppData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultAppData };
    const parsed = JSON.parse(raw) as AppData;
    return {
      members: parsed.members ?? [],
      savedMatches: parsed.savedMatches ?? [],
      activeMatch: parsed.activeMatch ?? null,
    };
  } catch {
    return { ...defaultAppData };
  }
}

export async function saveAppData(data: AppData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
