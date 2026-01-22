import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuthStore } from "../stores/authStore";
import { authService } from "../services/authService";

/**
 * 自定義 Hook：處理 Google 登入、AuthStore 更新以及自動重導向
 */
export const useGoogleAuth = () => {
  const loginStore = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  // 使用 useRef 記住登入成功後需要跳轉的路徑
  const redirectPathRef = useRef<string | null>(null);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userData = await authService.login(tokenResponse.access_token);

        loginStore(userData.accessToken, {
          userId: userData.userId,
          displayName: userData.displayName,
          avatarUrl: userData.avatarUrl,
          level: userData.level,
          exp: userData.exp,
        });

        // 如果有設定重導向路徑，則執行跳轉
        if (redirectPathRef.current) {
          const path = redirectPathRef.current;
          redirectPathRef.current = null; // 清除暫存
          navigate(path);
        }
      } catch (error) {
        console.error("TraitQuest Login Failed:", error);
      }
    },
    onError: () => {},
  });

  /**
   * 觸發 Google 登入視窗
   * @param redirectPath 登入成功後要導向的路徑 (選填)
   */
  const login = (redirectPath?: string) => {
    if (redirectPath) {
      redirectPathRef.current = redirectPath;
    } else {
      redirectPathRef.current = null;
    }
    googleLogin();
  };

  return {
    login,
  };
};
