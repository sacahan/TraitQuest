export interface Question {
  id: string;
  type: 'QUANTITATIVE' | 'SOUL_NARRATIVE';
  text: string;
  options?: { id: string; text: string }[];
  visualFeedback?: string;
}

export interface LevelInfo {
  level: number;
  exp: number;
  next_level_exp: number;
  prev_level_exp: number;
}

export interface FinalResult {
  quest_id: string;
  result_type: string;
  scores: Record<string, number>;
  dimension_scores: Record<string, number>;
  analysis: string;
  level_info: LevelInfo;
  class_id?: string;
  new_talents?: string[];
}

export interface QuestUpdateData {
  narrative?: string;
  questionIndex?: number;
  totalSteps?: number;
  guideMessage?: string;
  question?: Question;
  message?: string;
}

export interface QuestResponse {
  sessionId: string;
  narrative: string;
  question: Question;
  isCompleted: boolean;
}
