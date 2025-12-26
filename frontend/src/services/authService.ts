import apiClient from './apiClient';

export interface LoginResponse {
  userId: string;
  displayName: string;
  avatarUrl: string;
  level: number;
  exp: number;
  accessToken: string;
}

export const authService = {
  login: async (googleToken: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      token: googleToken,
    });
    return response.data;
  },
};
