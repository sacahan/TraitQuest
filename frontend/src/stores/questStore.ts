import { create } from 'zustand';
import { questWsClient } from '../services/questWebSocket';
import { v4 as uuidv4 } from 'uuid';

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
  expGained: number;

  // Actions
  initQuest: (questId: string, token: string) => Promise<void>;
  submitAnswer: (answer: string, questionIndex: number) => void;
  resetQuest: () => void;
}

export const useQuestStore = create<QuestState>((set) => {
  // 設置事件監聽器
  questWsClient.on('first_question', (data) => {
    set({
      currentQuestion: data.question,
      narrative: data.narrative,
      isLoading: false
    });
  });

  questWsClient.on('next_question', (data) => {
    set({
      currentQuestion: data.question,
      narrative: data.narrative,
      isLoading: false
    });
  });

  questWsClient.on('quest_complete', (data) => {
    set({
      isCompleted: true,
      narrative: data.message,
      isLoading: false
    });
  });

  questWsClient.on('error', (data) => {
    console.error('Quest Error:', data.message);
    set({ isLoading: false });
  });

  return {
    sessionId: null,
    questId: null,
    currentQuestion: null,
    narrative: '',
    isCompleted: false,
    isLoading: false,
    expGained: 0,

    initQuest: async (questId, token) => {
      const sessionId = uuidv4();
      set({ sessionId, questId, isLoading: true });

      try {
        await questWsClient.connect(sessionId, token);
        questWsClient.send('start_quest', { questId });
      } catch (error) {
        console.error("Failed to connect to quest server:", error);
        set({ isLoading: false });
      }
    },

    submitAnswer: (answer, questionIndex) => {
      set({ isLoading: true });
      questWsClient.send('submit_answer', { answer, questionIndex });
    },

    resetQuest: () => {
      questWsClient.disconnect();
      set({
        sessionId: null,
        questId: null,
        currentQuestion: null,
        narrative: '',
        isCompleted: false,
        isLoading: false
      });
    }
  };
});
