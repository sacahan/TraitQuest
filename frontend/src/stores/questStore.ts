import { create } from "zustand";
import { questWsClient } from "../services/questWebSocket";
import { v4 as uuidv4 } from "uuid";
import type { Question, FinalResult, QuestUpdateData } from "../types/quest";

type LevelUpCallback = (levelInfo: {
  level: number;
  exp: number;
  expToNextLevel?: number;
  classId?: string;
}) => void;

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
  error: string | null;

  // Callback for auth sync
  onLevelUp: LevelUpCallback | null;

  // Actions
  initQuest: (questId: string, token: string) => Promise<void>;
  submitAnswer: (answer: string, questionIndex: number) => void;
  requestResult: () => void;
  resetQuest: () => void;
  setOnLevelUp: (callback: LevelUpCallback | null) => void;
}

export const useQuestStore = create<QuestState>((set, get) => {
  // 設置事件監聽器
  questWsClient.on("first_question", (data: QuestUpdateData) => {
    const newState: Partial<QuestState> = {
      narrative: data.narrative || "",
      questionIndex: data.questionIndex ?? 0,
      totalSteps: data.totalSteps ?? 10,
      isLoading: false,
    };

    if (data.guideMessage) {
      newState.guideMessage = data.guideMessage;
    }

    if (data.question) {
      newState.currentQuestion = {
        ...data.question,
        id: data.question.id || `q_first_${Date.now()}`,
      };
    } else {
      newState.currentQuestion = null;
      newState.currentQuestion = null;
    }
    set(newState as QuestState);
  });

  questWsClient.on("next_question", (data: QuestUpdateData) => {
    const newState: Partial<QuestState> = {
      currentQuestion: data.question
        ? {
            ...data.question,
            id: data.question.id || `q_${data.questionIndex || Date.now()}`,
          }
        : null,
      narrative: data.narrative || "",
      questionIndex: data.questionIndex ?? get().questionIndex + 1,
      totalSteps: data.totalSteps ?? get().totalSteps,
      isLoading: false,
    };

    if (data.guideMessage) {
      newState.guideMessage = data.guideMessage;
    }
    set(newState as QuestState);
  });

  questWsClient.on("quest_complete", (data: QuestUpdateData) => {
    set({
      isCompleted: true,
      narrative: data.message || "",
      isLoading: false,
    });
  });

  questWsClient.on("final_result", (data: FinalResult) => {
    set({ finalResult: data, isLoading: false });

    if (data.level_info) {
      const onLevelUp = get().onLevelUp;
      if (onLevelUp) {
        const levelInfo = {
          level: data.level_info.level,
          exp: data.level_info.exp,
          expToNextLevel: data.level_info.next_level_exp,
          classId: data.class_id,
        };
        onLevelUp(levelInfo);
      }
    }
  });

  questWsClient.on("error", (data: { message: string }) => {
    console.error("Quest Error:", data.message);
    set({ isLoading: false });
  });

  return {
    sessionId: null,
    questId: null,
    currentQuestion: null,
    narrative: "",
    guideMessage: "",
    isCompleted: false,
    finalResult: null,
    isLoading: false,
    questionIndex: 0,
    totalSteps: 10,
    expGained: 0,
    error: null,
    onLevelUp: null,

    initQuest: async (questId, token) => {
      const sessionId = uuidv4();
      set({ sessionId, questId, isLoading: true, error: null });
      try {
        await questWsClient.connect(sessionId, token);
        questWsClient.send("start_quest", { questId });
      } catch (error) {
        console.error("Failed to connect to quest server:", error);
        set({
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "無法連接至心靈伺服器 (WebSocket Connection Failed)",
        });
      }
    },

    submitAnswer: (answer, questionIndex) => {
      set({ isLoading: true });
      const index = questionIndex ?? get().questionIndex;
      questWsClient.send("submit_answer", { answer, questionIndex: index });
    },

    requestResult: () => {
      set({ isLoading: true });
      questWsClient.send("request_result", {});
    },

    resetQuest: () => {
      questWsClient.disconnect();
      set({
        sessionId: null,
        questId: null,
        currentQuestion: null,
        narrative: "",
        guideMessage: "",
        isCompleted: false,
        finalResult: null,
        isLoading: false,
        error: null,
        questionIndex: 0,
        totalSteps: 10,
        onLevelUp: null,
      });
    },

    setOnLevelUp: (callback) => {
      set({ onLevelUp: callback });
    },
  };
});
