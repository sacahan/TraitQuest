import { GoogleLogin } from "@react-oauth/google";
import { useAuthStore } from "../../stores/authStore";
import { authService } from "../../services/authService";

const GoogleAuthButton = () => {
  const login = useAuthStore((state) => state.login);

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          if (credentialResponse.credential) {
            try {
              const userData = await authService.login(
                credentialResponse.credential,
              );
              login(userData.accessToken, {
                userId: userData.userId,
                displayName: userData.displayName,
                avatarUrl: userData.avatarUrl,
                level: userData.level,
                exp: userData.exp,
              });
            } catch (error) {
              console.error("Login Failed:", error);
            }
          }
        }}
        onError={() => {}}
        theme="filled_black"
        shape="pill"
      />
    </div>
  );
};

export default GoogleAuthButton;
