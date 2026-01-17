import apiClient from './apiClient';
import type { QuestResponse } from '../types/quest';


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
