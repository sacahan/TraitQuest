import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import CustomGoogleAuthButton from '../components/auth/CustomGoogleAuthButton';
import { useGoogleAuth } from '../hooks/useGoogleAuth';

// 五大分析介紹頁面配置（與 Home.tsx QUESTS 保持一致）
const introPages = [
  { path: '/intro/mbti', name: 'MBTI 聖殿', icon: 'psychology', description: '英雄職業' },
  { path: '/intro/bigfive', name: 'Big Five 能量場', icon: 'water_drop', description: '角色屬性' },
  { path: '/intro/enneagram', name: 'Enneagram 冥想塔', icon: 'stars', description: '靈魂種族' },
  { path: '/intro/disc', name: 'DISC 戰鬥叢林', icon: 'swords', description: '戰鬥流派' },
  { path: '/intro/gallup', name: 'Gallup 祭壇', icon: 'trophy', description: '天賦技能' },
];

export const Header = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { login } = useGoogleAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 點擊外部關閉下拉選單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLinkClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate(path);
    } else {
      login(path);
    }
  };

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
              <a
                href="/map"
                onClick={(e) => handleLinkClick(e, '/map')}
                className="text-sm font-bold hover:text-primary transition-colors relative group cursor-pointer"
              >
                心靈大陸
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </a>

              {/* 探索指南下拉選單 */}
              <div className="relative" ref={dropdownRef}>
                <button
                  className="text-sm font-bold hover:text-primary transition-colors relative group flex items-center gap-1"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  副本試煉
                  <span
                    className={`material-symbols-outlined text-sm transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  >
                    expand_more
                  </span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                </button>

                {/* 下拉選單 */}
                <div
                  className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 py-2 rounded-lg 
                    bg-[#0d1a12]/95 backdrop-blur-lg border border-primary/30 shadow-lg shadow-primary/10
                    transition-all duration-300 origin-top
                    ${isDropdownOpen
                      ? 'opacity-100 scale-100 pointer-events-auto'
                      : 'opacity-0 scale-95 pointer-events-none'
                    }`}
                >
                  {introPages.map((page) => (
                    <Link
                      key={page.path}
                      to={page.path}
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary/10 transition-colors group"
                    >
                      <span className="material-symbols-outlined text-primary text-lg">{page.icon}</span>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                          {page.name}
                        </span>
                        <span className="text-xs text-gray-400">{page.description}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <a
                href="/dashboard"
                onClick={(e) => handleLinkClick(e, '/dashboard')}
                className="text-sm font-bold hover:text-primary transition-colors relative group cursor-pointer"
              >
                公會大廳
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
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
