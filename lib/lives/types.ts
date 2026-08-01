export type LifeStats = Record<string, number>;

export type RelationshipDimensions = Record<string, number>;

export interface LifeRelationship {
  id?: string;
  name: string;
  role: string | null;
  dimensions: RelationshipDimensions;
}

/** English phrase the character says + Amharic meaning for the learner. */
export interface LifeChoice {
  english: string;
  amharic: string;
}

export interface VocabPair {
  english: string;
  amharic: string;
}

export interface ProposedDeltas {
  stats: Record<string, number>;
  relationships: Array<{ name: string; changes: Record<string, number> }>;
}

export interface RenderSceneInput {
  narrative: string;
  choices: LifeChoice[];
  vocab: VocabPair[];
  proposed_deltas: ProposedDeltas;
  age_change: number;
  summary_update: string;
}

export interface RecentBeat {
  turn_number: number;
  scene_text: string;
  choice_made: string | null;
}

export interface SceneGenerationState {
  worldBible: string;
  playerName: string;
  stats: LifeStats;
  relationships: LifeRelationship[];
  age: number;
  turnCount: number;
  summary: string;
  recentBeats: RecentBeat[];
  /** Chosen English phrase, or "BEGIN" for the opening scene. */
  playerAction: string;
}

export interface AppliedDeltas {
  stats: Record<string, number>;
  relationships: Array<{ name: string; changes: Record<string, number> }>;
  age_change: number;
}

export interface AppliedSceneResult {
  narrative: string;
  choices: LifeChoice[];
  vocab: VocabPair[];
  summaryUpdate: string;
  stats: LifeStats;
  relationships: LifeRelationship[];
  age: number;
  deltasApplied: AppliedDeltas;
}
