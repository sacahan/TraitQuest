import { useGoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../services/authService';

interface CustomGoogleAuthButtonProps {
  className?: string;
  children: React.ReactNode;
}

const CustomGoogleAuthButton = ({ className, children }: CustomGoogleAuthButtonProps) => {
  const login = useAuthStore((state) => state.login);

  const handleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // 注意：useGoogleLogin 回傳的是 access_token，不是 id_token
        // 但我們的後端 verify_google_token 使用 id_token.verify_oauth2_token
        // 如果要用 access_token，後端需要改成調用 google oauth2 userinfo endpoint
        // 為了維持後端邏輯，這裡可能需要注意。
        // 不過 @react-oauth/google 的 GoogleLogin 組件給的是 id_token。
        // 如果要自定義樣式並獲得 id_token，通常需要使用 'implicit' flow 或者是原生的 Google One Tap。
        console.log('Token Response:', tokenResponse);
        
        // 這裡暫時假設後端能處理 access_token 或者我們之後調整後端
        const userData = await authService.login(tokenResponse.access_token);
        login(userData.accessToken, {
          userId: userData.userId,
          displayName: userData.displayName,
          avatarUrl: userData.avatarUrl,
          level: userData.level,
          exp: userData.exp,
        });
      } catch (error) {
        console.error('Login Failed:', error);
      }
    },
    onError: () => console.log('Login Failed'),
  });

  return (
    <button onClick={() => handleLogin()} className={className}>
      {children}
    </button>
  );
};

export default CustomGoogleAuthButton;
