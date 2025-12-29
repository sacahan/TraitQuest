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
  guideMessage: string;
  isCompleted: boolean;
  isLoading: boolean;
  questionIndex: number;
  totalSteps: number;
  expGained: number;

  // Actions
  initQuest: (questId: string, token: string) => Promise<void>;
  submitAnswer: (answer: string, questionIndex: number) => void;
  continueQuest: () => void;
  resetQuest: () => void;
}

export const useQuestStore = create<QuestState>((set, get) => {
  // 設置事件監聽器
  questWsClient.on('first_question', (data) => {
    const newState: any = {
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
      // 開場白情境：沒有問題，等待 narrative 完成後自動觸發 continue
      newState.currentQuestion = null;
      // 設置延遲自動觸發 continueQuest
      setTimeout(() => {
        const state = get();
        if (!state.currentQuestion && !state.isCompleted) {
          state.continueQuest();
        }
      }, 3000); // 等待 3 秒讓打字效果完成
    }

    set(newState);
  });

  questWsClient.on('next_question', (data) => {
    const newState: any = {
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

    set(newState);
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
    guideMessage: '',
    isCompleted: false,
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

    continueQuest: () => {
      set({ isLoading: true });
      questWsClient.send('continue_quest', {});
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
        isLoading: false,
        questionIndex: 0,
        totalSteps: 10
      });
    }
  };
});
