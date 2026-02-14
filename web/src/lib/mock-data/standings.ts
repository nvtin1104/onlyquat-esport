import { Standing } from "@/types";
import { teams } from "./teams";

const tb = (id: string) => {
  const t = teams.find((team) => team.id === id)!;
  return { id: t.id, name: t.name, tag: t.tag, logo: t.logo, country: t.country };
};

export const standings: Standing[] = [
  { rank: 1, team: tb("t1"), wins: 5, losses: 0, draws: 0, roundDiff: 32, points: 15, form: ["W", "W", "W", "W", "W"] },
  { rank: 2, team: tb("fnc"), wins: 4, losses: 1, draws: 0, roundDiff: 18, points: 12, form: ["W", "W", "L", "W", "W"] },
  { rank: 3, team: tb("prx"), wins: 3, losses: 2, draws: 0, roundDiff: 5, points: 9, form: ["W", "L", "W", "L", "W"] },
  { rank: 4, team: tb("sen"), wins: 2, losses: 3, draws: 0, roundDiff: -4, points: 6, form: ["L", "W", "L", "W", "L"] },
  { rank: 5, team: tb("tl"), wins: 1, losses: 3, draws: 1, roundDiff: -15, points: 4, form: ["D", "L", "L", "W", "L"] },
  { rank: 6, team: tb("nrg"), wins: 0, losses: 4, draws: 1, roundDiff: -36, points: 1, form: ["L", "L", "D", "L", "L"] },
];
