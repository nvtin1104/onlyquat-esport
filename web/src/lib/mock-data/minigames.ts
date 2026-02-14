import { Minigame } from "@/types";

export const minigames: Minigame[] = [
  {
    id: "mg1",
    name: "Match Predictor",
    description: "Predict match outcomes and earn points. Top predictors win weekly rewards.",
    thumbnail: "/mock/minigames/predictor.svg",
    reward: "$100",
    rewardType: "cash",
    playerCount: 12483,
    type: "prediction",
  },
  {
    id: "mg2",
    name: "Bracket Challenge",
    description: "Fill out your perfect bracket before the tournament starts. Can you go flawless?",
    thumbnail: "/mock/minigames/bracket.svg",
    reward: "$500",
    rewardType: "cash",
    playerCount: 8271,
    type: "bracket",
  },
  {
    id: "mg3",
    name: "Daily eSport Trivia",
    description: "Test your eSport knowledge with daily questions. Streak bonuses for consecutive days.",
    thumbnail: "/mock/minigames/trivia.svg",
    reward: "10,000 pts",
    rewardType: "points",
    playerCount: 24156,
    type: "quiz",
  },
];
