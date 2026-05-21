import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type {
  ActiveMatch,
  AppData,
  DivisionMode,
  Member,
  SavedMatch,
  TeamSlot,
} from '../types';
import { loadAppData, saveAppData } from '../storage/storage';
import { capTeams, rotateBenchAndTeams } from '../utils/bench';
import { divideTeams, generateId } from '../utils/teamDivision';

function normalizeActiveMatch(match: ActiveMatch): ActiveMatch {
  return {
    ...match,
    playersPerTeam: match.playersPerTeam ?? 0,
    benchMemberIds: match.benchMemberIds ?? [],
    isCourtFlipped: match.isCourtFlipped ?? false,
  };
}

function normalizeSavedMatch(match: SavedMatch): SavedMatch {
  return {
    ...normalizeActiveMatch(match),
    finishedAt: match.finishedAt,
  };
}

type AppContextValue = {
  loading: boolean;
  members: Member[];
  savedMatches: SavedMatch[];
  activeMatch: ActiveMatch | null;
  benchMembers: Member[];
  isCourtFlipped: boolean;
  addMember: (member: Omit<Member, 'id'>) => void;
  updateMember: (id: string, patch: Partial<Omit<Member, 'id'>>) => void;
  deleteMember: (id: string) => void;
  startMatch: (
    teamCount: number,
    mode: DivisionMode,
    playersPerTeam: number,
    participantIds: string[]
  ) => void;
  reorganizeTeams: () => void;
  setTeams: (teams: TeamSlot[], benchMemberIds: string[]) => void;
  changeTeamName: (teamIndex: number, name: string) => void;
  moveMember: (memberId: string, targetTeamIndex: number) => void;
  toggleCourtSide: () => void;
  updateScore: (teamIndex: number, delta: number) => void;
  finishMatch: () => void;
  saveMatchAndRotate: () => void;
  cancelActiveMatch: () => void;
  deleteSavedMatch: (id: string) => void;
  replaceAllData: (data: AppData) => void;
  getMember: (id: string) => Member | undefined;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AppData>({
    members: [],
    savedMatches: [],
    activeMatch: null,
  });

  useEffect(() => {
    loadAppData().then((loaded) => {
      setData({
        ...loaded,
        activeMatch: loaded.activeMatch
          ? normalizeActiveMatch(loaded.activeMatch)
          : null,
        savedMatches: loaded.savedMatches.map((m) => normalizeSavedMatch(m)),
      });
      setLoading(false);
    });
  }, []);

  const persist = useCallback(async (next: AppData) => {
    setData(next);
    await saveAppData(next);
  }, []);

  const getMember = useCallback(
    (id: string) => data.members.find((m) => m.id === id),
    [data.members]
  );

  const benchMembers = useMemo(() => {
    if (!data.activeMatch) return [];
    return data.activeMatch.benchMemberIds
      .map((id) => getMember(id))
      .filter((m): m is Member => m !== undefined);
  }, [data.activeMatch, getMember]);

  const isCourtFlipped = data.activeMatch?.isCourtFlipped ?? false;

  const addMember = useCallback(
    (member: Omit<Member, 'id'>) => {
      const next: AppData = {
        ...data,
        members: [...data.members, { ...member, id: generateId() }],
      };
      persist(next);
    },
    [data, persist]
  );

  const updateMember = useCallback(
    (id: string, patch: Partial<Omit<Member, 'id'>>) => {
      const next: AppData = {
        ...data,
        members: data.members.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      };
      persist(next);
    },
    [data, persist]
  );

  const deleteMember = useCallback(
    (id: string) => {
      const next: AppData = {
        ...data,
        members: data.members.filter((m) => m.id !== id),
      };
      persist(next);
    },
    [data, persist]
  );

  /** SET_TEAMS: チーム編成結果とベンチを保存 */
  const setTeams = useCallback(
    (teams: TeamSlot[], benchMemberIds: string[]) => {
      if (!data.activeMatch) return;
      persist({
        ...data,
        activeMatch: {
          ...data.activeMatch,
          teams,
          benchMemberIds,
          teamCount: teams.length,
          scores: Array(teams.length).fill(0),
        },
      });
    },
    [data, persist]
  );

  const startMatch = useCallback(
    (
      teamCount: number,
      mode: DivisionMode,
      playersPerTeam: number,
      participantIds: string[]
    ) => {
      const idSet = new Set(participantIds);
      const participants = data.members.filter((m) => idSet.has(m.id));

      let teams = divideTeams(participants, teamCount, mode);
      let benchMemberIds: string[] = [];

      if (playersPerTeam > 0) {
        const capped = capTeams(teams, playersPerTeam);
        teams = capped.teams;
        benchMemberIds = capped.benchMemberIds;
      }

      const activeMatch: ActiveMatch = {
        id: generateId(),
        createdAt: new Date().toISOString(),
        divisionMode: mode,
        teamCount,
        playersPerTeam,
        teams,
        scores: Array(teamCount).fill(0),
        benchMemberIds,
        isCourtFlipped: false,
      };
      persist({ ...data, activeMatch });
    },
    [data, persist]
  );

  /** 同じ参加者・設定でチーム編成をやり直す（チーム名は維持） */
  const reorganizeTeams = useCallback(() => {
    if (!data.activeMatch) return;

    const match = data.activeMatch;
    const participantIds = [
      ...match.teams.flatMap((t) => t.memberIds),
      ...match.benchMemberIds,
    ];
    const idSet = new Set(participantIds);
    const participants = data.members.filter((m) => idSet.has(m.id));
    const oldNames = match.teams.map((t) => t.name);

    let teams = divideTeams(participants, match.teamCount, match.divisionMode);
    let benchMemberIds: string[] = [];

    if (match.playersPerTeam > 0) {
      const capped = capTeams(teams, match.playersPerTeam);
      teams = capped.teams;
      benchMemberIds = capped.benchMemberIds;
    }

    teams = teams.map((t, i) => ({
      ...t,
      name: oldNames[i] ?? t.name,
    }));

    persist({
      ...data,
      activeMatch: {
        ...match,
        teams,
        benchMemberIds,
        scores: Array(teams.length).fill(0),
      },
    });
  }, [data, persist]);

  /** CHANGE_TEAM_NAME */
  const changeTeamName = useCallback(
    (teamIndex: number, name: string) => {
      if (!data.activeMatch) return;
      const trimmed = name.trim();
      if (!trimmed) return;
      const teams = data.activeMatch.teams.map((t, i) =>
        i === teamIndex ? { ...t, name: trimmed } : t
      );
      persist({
        ...data,
        activeMatch: { ...data.activeMatch, teams },
      });
    },
    [data, persist]
  );

  /** MOVE_MEMBER: targetTeamIndex -1 = ベンチ */
  const moveMember = useCallback(
    (memberId: string, targetTeamIndex: number) => {
      if (!data.activeMatch) return;

      let teams = data.activeMatch.teams.map((t) => ({
        ...t,
        memberIds: t.memberIds.filter((id) => id !== memberId),
      }));
      let benchMemberIds = data.activeMatch.benchMemberIds.filter((id) => id !== memberId);

      if (targetTeamIndex === -1) {
        benchMemberIds = [...benchMemberIds, memberId];
      } else if (targetTeamIndex >= 0 && targetTeamIndex < teams.length) {
        teams = teams.map((t, i) =>
          i === targetTeamIndex
            ? { ...t, memberIds: [...t.memberIds, memberId] }
            : t
        );
      }

      persist({
        ...data,
        activeMatch: { ...data.activeMatch, teams, benchMemberIds },
      });
    },
    [data, persist]
  );

  /** TOGGLE_COURT_SIDE */
  const toggleCourtSide = useCallback(() => {
    if (!data.activeMatch) return;
    persist({
      ...data,
      activeMatch: {
        ...data.activeMatch,
        isCourtFlipped: !data.activeMatch.isCourtFlipped,
      },
    });
  }, [data, persist]);

  const updateScore = useCallback(
    (teamIndex: number, delta: number) => {
      if (!data.activeMatch) return;
      const scores = [...data.activeMatch.scores];
      scores[teamIndex] = Math.max(0, (scores[teamIndex] ?? 0) + delta);
      persist({
        ...data,
        activeMatch: { ...data.activeMatch, scores },
      });
    },
    [data, persist]
  );

  const finishMatch = useCallback(() => {
    if (!data.activeMatch) return;
    const saved: SavedMatch = {
      ...data.activeMatch,
      finishedAt: new Date().toISOString(),
    };
    persist({
      ...data,
      savedMatches: [saved, ...data.savedMatches],
      activeMatch: null,
    });
  }, [data, persist]);

  /** SAVE_MATCH_AND_ROTATE */
  const saveMatchAndRotate = useCallback(() => {
    if (!data.activeMatch) return;
    const saved: SavedMatch = {
      ...data.activeMatch,
      finishedAt: new Date().toISOString(),
    };
    const { teams, benchMemberIds } = rotateBenchAndTeams(
      data.activeMatch.teams,
      data.activeMatch.benchMemberIds
    );
    persist({
      ...data,
      savedMatches: [saved, ...data.savedMatches],
      activeMatch: {
        ...data.activeMatch,
        teams,
        benchMemberIds,
        scores: Array(teams.length).fill(0),
        teamCount: teams.length,
      },
    });
  }, [data, persist]);

  const cancelActiveMatch = useCallback(() => {
    persist({ ...data, activeMatch: null });
  }, [data, persist]);

  const deleteSavedMatch = useCallback(
    (id: string) => {
      persist({
        ...data,
        savedMatches: data.savedMatches.filter((m) => m.id !== id),
      });
    },
    [data, persist]
  );

  const replaceAllData = useCallback(
    (newData: AppData) => {
      persist({
        ...newData,
        activeMatch: newData.activeMatch
          ? normalizeActiveMatch(newData.activeMatch)
          : null,
        savedMatches: newData.savedMatches.map((m) => normalizeSavedMatch(m)),
      });
    },
    [persist]
  );

  const value = useMemo(
    () => ({
      loading,
      members: data.members,
      savedMatches: data.savedMatches,
      activeMatch: data.activeMatch,
      benchMembers,
      isCourtFlipped,
      addMember,
      updateMember,
      deleteMember,
      startMatch,
      reorganizeTeams,
      setTeams,
      changeTeamName,
      moveMember,
      toggleCourtSide,
      updateScore,
      finishMatch,
      saveMatchAndRotate,
      cancelActiveMatch,
      deleteSavedMatch,
      replaceAllData,
      getMember,
    }),
    [
      loading,
      data,
      benchMembers,
      isCourtFlipped,
      addMember,
      updateMember,
      deleteMember,
      startMatch,
      reorganizeTeams,
      setTeams,
      changeTeamName,
      moveMember,
      toggleCourtSide,
      updateScore,
      finishMatch,
      saveMatchAndRotate,
      cancelActiveMatch,
      deleteSavedMatch,
      replaceAllData,
      getMember,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
