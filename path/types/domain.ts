export type TeamRole = 'allenatore' | 'vice' | 'collaboratore';

export interface TeamSummary {
  id: string;
  name: string;
  category: string | null;
  logoUrl: string | null;
  seasonId: string;
  seasonName: string;
  role: TeamRole;
}
