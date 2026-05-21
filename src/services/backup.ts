import { Platform } from 'react-native';
import {
  errorCodes,
  isErrorWithCode,
  keepLocalCopy,
  pick,
  types,
} from '@react-native-documents/picker';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import type { AppData } from '../types';
import { BACKUP_VERSION } from '../types';

export type BackupPayload = {
  version: number;
  exportedAt: string;
  data: AppData;
};

export function serializeBackup(data: AppData): string {
  const payload: BackupPayload = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };
  return JSON.stringify(payload, null, 2);
}

export function parseBackup(json: string): AppData {
  const parsed = JSON.parse(json);
  if (parsed?.data?.members !== undefined) {
    return {
      members: parsed.data.members ?? [],
      savedMatches: parsed.data.savedMatches ?? [],
      activeMatch: parsed.data.activeMatch ?? null,
    };
  }
  if (parsed?.members !== undefined) {
    return parsed as AppData;
  }
  throw new Error('無効なバックアップファイルです');
}

function fileUri(path: string): string {
  return Platform.OS === 'android' ? `file://${path}` : path;
}

export async function exportBackup(data: AppData): Promise<void> {
  const json = serializeBackup(data);
  const fileName = `vbc-backup-${new Date().toISOString().slice(0, 10)}.json`;
  const path = `${RNFS.CachesDirectoryPath}/${fileName}`;
  await RNFS.writeFile(path, json, 'utf8');

  await Share.open({
    url: fileUri(path),
    type: 'application/json',
    title: 'バレーボールデータを共有',
    failOnCancel: false,
  });
}

export async function importBackup(): Promise<AppData> {
  try {
    const [file] = await pick({
      type: [types.json, types.plainText, types.allFiles],
    });

    const fileName = file.name ?? 'vbc-backup.json';
    const [copy] = await keepLocalCopy({
      files: [{ uri: file.uri, fileName }],
      destination: 'cachesDirectory',
    });

    if (copy.status !== 'success') {
      throw new Error('ファイルの読み込みに失敗しました');
    }

    const json = await RNFS.readFile(copy.localUri, 'utf8');
    return parseBackup(json);
  } catch (e) {
    if (isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED) {
      throw new Error('キャンセルされました');
    }
    throw e;
  }
}
