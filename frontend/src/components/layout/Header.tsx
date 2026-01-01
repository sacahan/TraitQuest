import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import CustomGoogleAuthButton from '../auth/CustomGoogleAuthButton';

export const Header = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-background-light/80 dark:bg-[#102216]/80 border-b border-solid border-b-[#23482f]">
      <div className="w-full px-4 md:px-10 py-3">
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <div
            className="flex items-center gap-2 text-slate-900 dark:text-white cursor-pointer mr-auto hover:opacity-80 transition-opacity"
            onClick={() => navigate('/')}
          >
            <span className="material-symbols-outlined text-primary text-3xl animate-pulse">swords</span>
            <h2 className="text-xl font-display font-black text-white leading-tight tracking-tight">TraitQuest</h2>
          </div>

          <div className="flex items-center gap-4 md:gap-8 ml-auto">
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6 text-white">
              <Link className="text-sm font-bold hover:text-primary transition-colors relative group" to="/map">
                心靈大陸
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link className="text-sm font-bold hover:text-primary transition-colors relative group" to="/analysis">
                英雄面板
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </nav>

            {/* Auth Button */}
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-bold text-primary tracking-widest uppercase">冒險者</span>
                  <span className="text-sm font-medium text-white">{user?.displayName}</span>
                </div>
                <div
                  className="size-8 rounded-full bg-cover bg-center border border-primary/30"
                  style={{ backgroundImage: `url(${user?.avatarUrl})` }}
                  title={user?.displayName}
                ></div>
                <button
                  onClick={logout}
                  className="text-sm font-bold text-gray-400 border border-guild-border px-3 py-1 rounded-full hover:bg-white/5 transition-all text-white"
                >
                  登出
                </button>
              </div>
            ) : (
              <CustomGoogleAuthButton className="flex min-w-[100px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-primary hover:bg-primary-hover text-[#112217] text-sm font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 animate-breathing-glow shadow-[0_0_15px_rgba(17,212,82,0.3)]">
                <span>Google 登入</span>
              </CustomGoogleAuthButton>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
