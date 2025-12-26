import { useAuthStore } from './stores/authStore'
import GoogleAuthButton from './components/auth/GoogleAuthButton'
import QuestionnairePage from './components/quest/QuestionnairePage'

function App() {
  const { isAuthenticated, user, logout } = useAuthStore()

  return (
    <div className="bg-background-dark min-h-screen relative overflow-hidden flex flex-col">
      {/* 背景發光層 (Nebula Layers) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-magic-cyan/10 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-[#1a4031] rounded-full blur-[100px] opacity-60 animate-pulse" style={{ animationDuration: '6s' }}></div>
      </div>

      <header className="relative z-50 w-full backdrop-blur-md bg-background-dark/80 border-b border-[#23482f] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl animate-pulse">swords</span>
          <h1 className="text-2xl font-display font-black tracking-widest text-white uppercase">
            TraitQuest
          </h1>
        </div>

        {isAuthenticated && (
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-primary tracking-widest uppercase">冒險者</span>
              <span className="text-sm font-medium text-white">{user?.displayName}</span>
            </div>
            <div className="size-10 rounded-full bg-cover bg-center border-2 border-primary/30" style={{ backgroundImage: `url(${user?.avatarUrl})` }}></div>
            <button
              onClick={logout}
              className="ml-2 text-[10px] font-bold text-secondary border border-secondary/30 px-3 py-1 rounded-full hover:bg-secondary/10 transition-all uppercase tracking-widest"
            >
              登出 (Leave)
            </button>
          </div>
        )}
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center p-4">
        {!isAuthenticated ? (
          <div className="mt-24 w-full max-w-lg bg-obsidian-glass p-12 rounded-[2.5rem] box-glow flex flex-col items-center">
            <div className="absolute inset-x-0 -top-12 flex justify-center">
              <div className="size-24 rounded-full bg-[#11251c] border border-primary/30 flex items-center justify-center shadow-2xl animate-float">
                <span className="material-symbols-outlined text-primary text-5xl">auto_awesome</span>
              </div>
            </div>
            <p className="text-xl text-center mb-10 font-serif italic text-white/90 leading-relaxed mt-4">
              「徘徊於試煉門外的靈魂...<br />揭露你的真名，踏入這場命運之戰。」
            </p>
            <GoogleAuthButton />
            <div className="mt-12 w-full flex items-center gap-4 opacity-20">
              <div className="h-px bg-white flex-1"></div>
              <div className="size-2 bg-primary rotate-45"></div>
              <div className="h-px bg-white flex-1"></div>
            </div>
            <p className="mt-6 text-[10px] text-primary/40 font-mono tracking-[0.3em] uppercase">Auth Required · Entry Allowed</p>
          </div>
        ) : (
          <QuestionnairePage />
        )}
      </main>
    </div>
  )
}

export default App
