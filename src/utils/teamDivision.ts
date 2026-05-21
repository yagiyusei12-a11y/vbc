import type { DivisionMode, Member, TeamSlot } from '../types';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createEmptyTeams(teamCount: number): TeamSlot[] {
  return Array.from({ length: teamCount }, (_, i) => ({
    name: `チーム ${i + 1}`,
    memberIds: [],
  }));
}

function distributeEvenly(members: Member[], teamCount: number): TeamSlot[] {
  const teams = createEmptyTeams(teamCount);
  members.forEach((m, i) => {
    teams[i % teamCount].memberIds.push(m.id);
  });
  return teams;
}

/** スネークドラフトで強い選手を各チームに分散 */
function snakeDraft(members: Member[], teamCount: number): TeamSlot[] {
  const sorted = [...members].sort((a, b) => b.level - a.level);
  const teams = createEmptyTeams(teamCount);
  let teamIndex = 0;
  let direction = 1;

  for (const m of sorted) {
    teams[teamIndex].memberIds.push(m.id);
    if (teamCount > 1) {
      teamIndex += direction;
      if (teamIndex >= teamCount) {
        teamIndex = teamCount - 1;
        direction = -1;
      } else if (teamIndex < 0) {
        teamIndex = 0;
        direction = 1;
      }
    }
  }
  return teams;
}

/** 各チームのレベル合計が均等になるよう貪欲法で割当 */
function levelBalanced(members: Member[], teamCount: number): TeamSlot[] {
  const teams = createEmptyTeams(teamCount);
  const levelSums = Array(teamCount).fill(0);
  const sorted = [...members].sort((a, b) => b.level - a.level);

  for (const m of sorted) {
    let minIdx = 0;
    for (let i = 1; i < teamCount; i++) {
      if (levelSums[i] < levelSums[minIdx]) minIdx = i;
    }
    teams[minIdx].memberIds.push(m.id);
    levelSums[minIdx] += m.level;
  }
  return teams;
}

function positionVector(member: Member): Record<string, number> {
  const v: Record<string, number> = {};
  for (const p of member.positions) v[p] = 1;
  return v;
}

function addVectors(a: Record<string, number>, b: Record<string, number>): Record<string, number> {
  const out = { ...a };
  for (const k of Object.keys(b)) out[k] = (out[k] ?? 0) + b[k];
  return out;
}

function vectorVariance(vectors: Record<string, number>[]): number {
  const allKeys = new Set<string>();
  vectors.forEach((v) => Object.keys(v).forEach((k) => allKeys.add(k)));
  let total = 0;
  for (const key of allKeys) {
    const vals = vectors.map((v) => v[key] ?? 0);
    const mean = vals.reduce((s, x) => s + x, 0) / vals.length;
    total += vals.reduce((s, x) => s + (x - mean) ** 2, 0);
  }
  return total;
}

/** ポジション分布のばらつきを最小化 */
function positionBalanced(members: Member[], teamCount: number): TeamSlot[] {
  const teams = createEmptyTeams(teamCount);
  const teamVectors: Record<string, number>[] = Array.from({ length: teamCount }, () => ({}));

  const sorted = [...members].sort((a, b) => {
    const diff = a.positions.length - b.positions.length;
    if (diff !== 0) return diff;
    return b.level - a.level;
  });

  for (const m of sorted) {
    const pv = positionVector(m);
    let bestIdx = 0;
    let bestScore = Infinity;

    for (let i = 0; i < teamCount; i++) {
      const trial = teamVectors.map((v, j) =>
        j === i ? addVectors(v, pv) : v
      );
      const score = vectorVariance(trial);
      if (score < bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }
    teams[bestIdx].memberIds.push(m.id);
    teamVectors[bestIdx] = addVectors(teamVectors[bestIdx], pv);
  }
  return teams;
}

export function divideTeams(
  members: Member[],
  teamCount: number,
  mode: DivisionMode
): TeamSlot[] {
  if (members.length === 0 || teamCount < 1) return createEmptyTeams(Math.max(teamCount, 1));

  switch (mode) {
    case 'random':
      return distributeEvenly(shuffle(members), teamCount);
    case 'levelStrong':
      return snakeDraft(members, teamCount);
    case 'levelBalanced':
      return levelBalanced(members, teamCount);
    case 'positionBalanced':
      return positionBalanced(members, teamCount);
    default:
      return distributeEvenly(members, teamCount);
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
