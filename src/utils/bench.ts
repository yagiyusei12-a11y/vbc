import type { Member, TeamSlot } from '../types';

/** 各チームの定員を超えたメンバーをベンチへ送る */
export function capTeams(
  teams: TeamSlot[],
  playersPerTeam: number
): { teams: TeamSlot[]; benchMemberIds: string[] } {
  const benchMemberIds: string[] = [];
  const capped = teams.map((team) => {
    const memberIds = [...team.memberIds];
    while (memberIds.length > playersPerTeam) {
      const removed = memberIds.pop();
      if (removed) benchMemberIds.push(removed);
    }
    return { ...team, memberIds };
  });
  return { teams: capped, benchMemberIds };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function removeFromTeams(teams: TeamSlot[], memberId: string): TeamSlot[] {
  return teams.map((t) => ({
    ...t,
    memberIds: t.memberIds.filter((id) => id !== memberId),
  }));
}

function smallestTeamIndex(teams: TeamSlot[]): number {
  return teams.reduce(
    (min, t, i) => (t.memberIds.length < teams[min].memberIds.length ? i : min),
    0
  );
}

function fullestTeamIndex(teams: TeamSlot[], excludeIds: Set<string>): number {
  let best = 0;
  let bestCount = -1;
  teams.forEach((t, i) => {
    const count = t.memberIds.filter((id) => !excludeIds.has(id)).length;
    if (count > bestCount) {
      bestCount = count;
      best = i;
    }
  });
  return best;
}

/**
 * ベンチメンバーをチームへ復帰させ、今回出場していたメンバーから次のベンチを自動選出
 */
export function rotateBenchAndTeams(
  teams: TeamSlot[],
  benchMemberIds: string[]
): { teams: TeamSlot[]; benchMemberIds: string[] } {
  if (benchMemberIds.length === 0) {
    return { teams, benchMemberIds: [] };
  }

  let teamsCopy = teams.map((t) => ({ ...t, memberIds: [...t.memberIds] }));
  const returningBench = [...benchMemberIds];
  const playingBefore = new Set(teamsCopy.flatMap((t) => t.memberIds));

  for (const id of returningBench) {
    const idx = smallestTeamIndex(teamsCopy);
    teamsCopy[idx].memberIds.push(id);
  }

  const candidates = [...playingBefore].filter((id) => !returningBench.includes(id));
  const newBench: string[] = [];
  const shuffled = shuffle(candidates);

  for (const id of shuffled) {
    if (newBench.length >= returningBench.length) break;
    newBench.push(id);
    teamsCopy = removeFromTeams(teamsCopy, id);
  }

  while (newBench.length < returningBench.length) {
    const idx = fullestTeamIndex(teamsCopy, new Set(newBench));
    const team = teamsCopy[idx];
    const pick = team.memberIds.find((id) => !newBench.includes(id) && !returningBench.includes(id));
    if (!pick) break;
    newBench.push(pick);
    teamsCopy = removeFromTeams(teamsCopy, pick);
  }

  return { teams: teamsCopy, benchMemberIds: newBench };
}

export function getTeamStats(
  team: TeamSlot,
  getMember: (id: string) => Member | undefined
): { count: number; totalLevel: number } {
  const members = team.memberIds.map((id) => getMember(id)).filter(Boolean) as Member[];
  return {
    count: members.length,
    totalLevel: members.reduce((s, m) => s + m.level, 0),
  };
}
