import type { Player, Team, Game, Rating } from '@/types';
import playersData from '@/data/players.json';
import teamsData from '@/data/teams.json';
import gamesData from '@/data/games.json';
import ratingsData from '@/data/ratings.json';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function getPlayers(): Promise<Player[]> {
  await delay(100);
  return playersData as Player[];
}

export async function getPlayerBySlug(slug: string): Promise<Player | undefined> {
  await delay(100);
  return (playersData as Player[]).find((p) => p.slug === slug);
}

export async function getTeams(): Promise<Team[]> {
  await delay(100);
  return teamsData as Team[];
}

export async function getTeamBySlug(slug: string): Promise<Team | undefined> {
  await delay(100);
  return (teamsData as Team[]).find((t) => t.slug === slug);
}

export async function getGames(): Promise<Game[]> {
  await delay(100);
  return gamesData as Game[];
}

export async function getGameById(id: string): Promise<Game | undefined> {
  await delay(100);
  return (gamesData as Game[]).find((g) => g.id === id);
}

export async function getRatings(playerId?: string): Promise<Rating[]> {
  await delay(100);
  const ratings = ratingsData as Rating[];
  if (playerId) return ratings.filter((r) => r.playerId === playerId);
  return ratings;
}

export async function getTeamPlayers(teamId: string): Promise<Player[]> {
  await delay(100);
  return (playersData as Player[]).filter((p) => p.teamId === teamId);
}
