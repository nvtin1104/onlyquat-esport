import { Match } from "@/types";
import { teams } from "./teams";

const tb = (id: string) => {
  const t = teams.find((team) => team.id === id)!;
  return { id: t.id, name: t.name, tag: t.tag, logo: t.logo, country: t.country };
};

export const matches: Match[] = [
  // Live
  { id: "m1", tournamentId: "vct-2026", team1: tb("t1"), team2: tb("fnc"), score: { team1: 8, team2: 5 }, status: "live", scheduledTime: new Date(Date.now() - 3600000).toISOString(), streamUrl: "https://twitch.tv/valorant", map: "Ascent", round: 1 },
  // Completed
  { id: "m2", tournamentId: "vct-2026", team1: tb("prx"), team2: tb("sen"), score: { team1: 13, team2: 7 }, status: "completed", scheduledTime: new Date(Date.now() - 7200000).toISOString(), winnerId: "prx", duration: 42, map: "Haven", round: 1 },
  { id: "m3", tournamentId: "vct-2026", team1: tb("nrg"), team2: tb("tl"), score: { team1: 10, team2: 13 }, status: "completed", scheduledTime: new Date(Date.now() - 14400000).toISOString(), winnerId: "tl", duration: 55, map: "Bind", round: 1 },
  { id: "m4", tournamentId: "worlds-2025", team1: tb("t1"), team2: tb("fnc"), score: { team1: 3, team2: 1 }, status: "completed", scheduledTime: "2025-11-02T14:00:00Z", winnerId: "t1", duration: 90, round: 5 },
  { id: "m5", tournamentId: "worlds-2025", team1: tb("sen"), team2: tb("nrg"), score: { team1: 2, team2: 3 }, status: "completed", scheduledTime: "2025-10-28T10:00:00Z", winnerId: "nrg", duration: 68, round: 4 },
  { id: "m6", tournamentId: "vct-2025", team1: tb("prx"), team2: tb("tl"), score: { team1: 13, team2: 11 }, status: "completed", scheduledTime: "2025-08-24T16:00:00Z", winnerId: "prx", duration: 52, map: "Icebox", round: 3 },
  // Scheduled
  { id: "m7", tournamentId: "vct-2026", team1: tb("t1"), team2: tb("prx"), score: { team1: 0, team2: 0 }, status: "scheduled", scheduledTime: new Date(Date.now() + 3600000).toISOString(), map: "Lotus", round: 2 },
  { id: "m8", tournamentId: "vct-2026", team1: tb("fnc"), team2: tb("sen"), score: { team1: 0, team2: 0 }, status: "scheduled", scheduledTime: new Date(Date.now() + 7200000).toISOString(), map: "Pearl", round: 2 },
  { id: "m9", tournamentId: "vct-2026", team1: tb("nrg"), team2: tb("tl"), score: { team1: 0, team2: 0 }, status: "scheduled", scheduledTime: new Date(Date.now() + 86400000).toISOString(), round: 2 },
  { id: "m10", tournamentId: "esl-pro-2026", team1: tb("t1"), team2: tb("tl"), score: { team1: 0, team2: 0 }, status: "scheduled", scheduledTime: "2026-03-05T12:00:00Z", round: 1 },
  { id: "m11", tournamentId: "esl-pro-2026", team1: tb("fnc"), team2: tb("prx"), score: { team1: 0, team2: 0 }, status: "scheduled", scheduledTime: "2026-03-05T15:00:00Z", round: 1 },
  { id: "m12", tournamentId: "blast-spring-2026", team1: tb("fnc"), team2: tb("nrg"), score: { team1: 0, team2: 0 }, status: "scheduled", scheduledTime: "2026-04-06T18:00:00Z", round: 1 },
];
