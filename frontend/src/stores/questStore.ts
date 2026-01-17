import { create } from 'zustand';
import { questWsClient } from '../services/questWebSocket';
import { useAuthStore } from './authStore';
import { v4 as uuidv4 } from 'uuid';
import type { Question, FinalResult, QuestUpdateData } from '../types/quest';

interface QuestState {
  sessionId: string | null;
  questId: string | null;
  currentQuestion: Question | null;
  narrative: string;
  guideMessage: string;
  isCompleted: boolean;
  finalResult: FinalResult | null;
  isLoading: boolean;
  questionIndex: number;
  totalSteps: number;
  expGained: number;

  // Actions
  initQuest: (questId: string, token: string) => Promise<void>;
  submitAnswer: (answer: string, questionIndex: number) => void;
  requestResult: () => void;
  resetQuest: () => void;
}


export const useQuestStore = create<QuestState>((set, get) => {
  // 設置事件監聽器
  questWsClient.on('first_question', (data: QuestUpdateData) => {
    const newState: Partial<QuestState> = {
      narrative: data.narrative || '',
      questionIndex: data.questionIndex ?? 0,
      totalSteps: data.totalSteps ?? 10,
      isLoading: false
    };

    if (data.guideMessage) {
      newState.guideMessage = data.guideMessage;
    }

    if (data.question) {
      newState.currentQuestion = {
        ...data.question,
        id: data.question.id || `q_first_${Date.now()}`
      };
    } else {
      newState.currentQuestion = null;
      newState.currentQuestion = null;
    }
    set(newState as QuestState);
  });

  questWsClient.on('next_question', (data: QuestUpdateData) => {
    const newState: Partial<QuestState> = {
      currentQuestion: data.question ? {
        ...data.question,
        id: data.question.id || `q_${data.questionIndex || Date.now()}`
      } : null,
      narrative: data.narrative || '',
      questionIndex: data.questionIndex ?? (get().questionIndex + 1),
      totalSteps: data.totalSteps ?? get().totalSteps,
      isLoading: false
    };

    if (data.guideMessage) {
      newState.guideMessage = data.guideMessage;
    }
    set(newState as QuestState);
  });

  questWsClient.on('quest_complete', (data: QuestUpdateData) => {
    set({
      isCompleted: true,
      narrative: data.message || '',
      isLoading: false
    });
  });

  questWsClient.on('final_result', (data: FinalResult) => {
    console.log("🔮 Received final result:", data);
    set({ finalResult: data, isLoading: false });

    // Sync level and other info to authStore
    if (data.level_info) {
      const { level_info, class_id } = data;
      const updates: { level: number; exp: number; heroClassId?: string } = {
        level: level_info.level,
        exp: level_info.exp
      };

      // Also update class/avatar if present (e.g. from MBTI result)
      if (class_id) updates.heroClassId = class_id;

      useAuthStore.getState().updateUser(updates);
    }
  });

  questWsClient.on('error', (data: { message: string }) => {
    console.error('Quest Error:', data.message);
    set({ isLoading: false });
  });


  return {
    sessionId: null,
    questId: null,
    currentQuestion: null,
    narrative: '',
    guideMessage: '',
    isCompleted: false,
    finalResult: null,
    isLoading: false,
    questionIndex: 0,
    totalSteps: 10,
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
      const index = questionIndex ?? get().questionIndex;
      questWsClient.send('submit_answer', { answer, questionIndex: index });
    },


    requestResult: () => {
      set({ isLoading: true });
      questWsClient.send('request_result', {});
    },

    resetQuest: () => {
      questWsClient.disconnect();
      set({
        sessionId: null,
        questId: null,
        currentQuestion: null,
        narrative: '',
        guideMessage: '',
        isCompleted: false,
        finalResult: null,
        isLoading: false,
        questionIndex: 0,
        totalSteps: 10
      });
    }
  };
});

