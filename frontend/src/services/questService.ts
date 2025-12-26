import apiClient from './apiClient';

export interface QuestResponse {
  sessionId: string;
  narrative: string;
  question: any;
  isCompleted: boolean;
}

export const questService = {
  startQuest: async (questId: string): Promise<QuestResponse> => {
    const response = await apiClient.post<QuestResponse>(`/quests/${questId}/start`);
    return response.data;
  },
  submitAnswer: async (sessionId: string, questId: string, answer: string): Promise<QuestResponse> => {
    const response = await apiClient.post<QuestResponse>('/quests/interact', {
      sessionId,
      questId,
      answer,
    });
    return response.data;
  },
};
