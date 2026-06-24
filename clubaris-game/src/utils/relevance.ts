export type TeamRelevance = "Internacional" | "Continental" | "Nacional" | "Regional";

export function getTeamRelevance(rating: number): TeamRelevance {
  if (rating >= 82) return "Internacional";
  if (rating >= 75) return "Continental";
  if (rating >= 68) return "Nacional";
  return "Regional";
}

export function getRelevanceLevel(relevance: TeamRelevance): number {
  switch (relevance) {
    case "Internacional": return 4;
    case "Continental": return 3;
    case "Nacional": return 2;
    case "Regional": return 1;
    default: return 1;
  }
}
