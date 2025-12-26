import { create } from 'zustand';
import { questService } from '../services/questService';

interface Question {
  id: string;
  type: 'QUANTITATIVE' | 'SOUL_NARRATIVE';
  text: string;
  options?: { id: string; text: string }[];
  visualFeedback?: string;
}

interface QuestState {
  sessionId: string | null;
  questId: string | null;
  currentQuestion: Question | null;
  narrative: string;
  isCompleted: boolean;
  isLoading: boolean;
  startQuest: (questId: string) => Promise<void>;
  submitAnswer: (answer: string) => Promise<void>;
}

export const useQuestStore = create<QuestState>((set, get) => ({
  sessionId: null,
  questId: null,
  currentQuestion: null,
  narrative: '',
  isCompleted: false,
  isLoading: false,

  startQuest: async (questId) => {
    set({ isLoading: true });
    try {
      const data = await questService.startQuest(questId);
      set({
        sessionId: data.sessionId,
        questId,
        currentQuestion: data.question,
        narrative: data.narrative,
        isCompleted: data.isCompleted,
        isLoading: false
      });
    } catch (error) {
       console.error("Failed to start quest:", error);
       set({ isLoading: false });
    }
  },

  submitAnswer: async (answer) => {
    const { sessionId, questId } = get();
    if (!sessionId || !questId) return;

    set({ isLoading: true });
    try {
      const data = await questService.submitAnswer(sessionId, questId, answer);
      set({
        currentQuestion: data.question,
        narrative: data.narrative,
        isCompleted: data.isCompleted,
        isLoading: false
      });
    } catch (error) {
      console.error("Failed to submit answer:", error);
      set({ isLoading: false });
    }
  },
}));
