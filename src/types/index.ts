export const POSITIONS = [
  { id: 'setter', label: 'セッター' },
  { id: 'outside', label: 'アウトサイド' },
  { id: 'middle', label: 'ミドル' },
  { id: 'opposite', label: 'オポジット' },
  { id: 'libero', label: 'リベロ' },
] as const;

export type PositionId = (typeof POSITIONS)[number]['id'];

export type Member = {
  id: string;
  name: string;
  level: number;
  positions: PositionId[];
};

export type DivisionMode =
  | 'random'
  | 'levelStrong'
  | 'levelBalanced'
  | 'positionBalanced';

export const DIVISION_MODES: { id: DivisionMode; label: string }[] = [
  { id: 'random', label: 'ランダム' },
  { id: 'levelStrong', label: 'レベル強い順' },
  { id: 'levelBalanced', label: 'レベル均等' },
  { id: 'positionBalanced', label: 'ポジション均等' },
];

export type TeamSlot = {
  name: string;
  memberIds: string[];
};

export type ActiveMatch = {
  id: string;
  createdAt: string;
  divisionMode: DivisionMode;
  teamCount: number;
  playersPerTeam: number;
  teams: TeamSlot[];
  scores: number[];
  benchMemberIds: string[];
  isCourtFlipped: boolean;
};

export type SavedMatch = ActiveMatch & {
  finishedAt: string;
};

export type AppData = {
  members: Member[];
  savedMatches: SavedMatch[];
  activeMatch: ActiveMatch | null;
};

export const STORAGE_KEY = '@vbc_app_data';
export const BACKUP_VERSION = 1;
