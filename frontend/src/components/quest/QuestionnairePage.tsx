import { useQuestStore } from '../../stores/questStore';
import NarrativeDisplay from './NarrativeDisplay';
import QuestionCard from './QuestionCard';
import { motion, AnimatePresence } from 'framer-motion';

const QuestionnairePage = () => {
  const { 
    submitAnswer, 
    currentQuestion, 
    narrative, 
    isCompleted, 
    isLoading 
  } = useQuestStore();

  if (isCompleted) {
    return (
      <div className="text-center p-12 bg-black/40 rounded-lg border border-secondary text-white">
          <h2 className="text-3xl font-bold text-primary mb-6">靈魂試煉完成</h2>
          <p className="text-lg mb-8">通往英雄殿堂的道路已開啟...</p>
          <button className="bg-primary text-black font-bold py-3 px-8 rounded shadow-lg">
             查看我的英雄面板
          </button>
       </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col pt-8">
      {/* 頂部進度條區域 */}
      <div className="w-full max-w-3xl mx-auto px-6 mt-2 mb-0">
        <div className="flex justify-between text-sm font-bold tracking-wide text-primary/80 mb-2 px-1">
          <span className="uppercase text-xs tracking-widest text-white/50">Soul Resonance</span>
          <span>{currentQuestion ? '25%' : '0%'}</span>
        </div>
        <div className="h-6 w-full bg-[#08120d] rounded-full p-1 border border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] relative overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-900 via-primary to-[#4fffb0] rounded-full transition-all duration-1000 relative overflow-hidden shadow-[0_0_15px_#0bda73]"
            style={{ width: currentQuestion ? '25%' : '0%' }}
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMiIvPjwvc3ZnPg==')] opacity-30"></div>
          </div>
        </div>
        <div className="text-center text-xs text-primary/40 font-mono mt-2 tracking-[0.2em] uppercase">
          Trial Sequence · Progressing
        </div>
      </div>

      <main className="flex-1 flex items-start justify-center px-4 pt-4 pb-12 w-full max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 w-full items-center">
          {/* 左側 Abby 組件 */}
          <div className="hidden lg:flex lg:col-span-3 flex-col items-center justify-center relative animate-float z-20">
            <div className="relative bg-[#11251c] border border-primary/30 p-5 rounded-2xl rounded-bl-sm mb-6 shadow-2xl max-w-[260px] backdrop-blur-sm">
              <p className="text-white text-base font-medium leading-relaxed italic text-white/90">
                <span className="text-primary text-xs font-bold uppercase block mb-2 tracking-wider not-italic">Guide · Abby</span>
                "凝視這面心靈之鏡... 剝去表象的偽裝，那個在寂靜中凝視著你的，是怎樣的存在？"
              </p>
              <div className="absolute -bottom-2 left-6 w-4 h-4 bg-[#11251c] border-b border-l border-primary/30 transform -rotate-45"></div>
            </div>
            <div className="size-56 rounded-full border-4 border-[#162e24] shadow-[0_0_50px_rgba(11,218,115,0.2)] overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-magic-purple/40 to-transparent opacity-70 z-10 mix-blend-overlay"></div>
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                style={{
                  backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuALB3zMDLh0ZWJoBkhmPIXtt5FlCE0IJfPQWPFiTwnBygEK5ZbnMDcraqOgpzCQx898DaMVZvnfEo4BsFbAjhq3-bBjfa2dpSJIE4fjv5kCQBjsVFo7eDTOLybHxFedkiSlrwCsyZH9Gn5GBh3UjR7KJ6a_HkdF4X4glgpPEbhx0jtkiS8v_7K-Wd6zQ5J2NVxainpwlgyEONtkYS1Z4jAy4-KieGW0eZrVP6y9efxpO3C2BBxJ8Rk4zYElecBqJJ-IppfaaVku2Zgh')",
                  filter: "hue-rotate(240deg) brightness(0.7) saturate(0.5) contrast(1.3)"
                }}
              ></div>
            </div>
          </div>

          {/* 右側問卷主體 */}
          <div className="lg:col-span-9 relative flex flex-col w-full">
            <AnimatePresence mode="wait">
              {currentQuestion && (
                <motion.div
                  key={currentQuestion.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full"
                >
                  <QuestionCard
                    question={currentQuestion}
                    onSubmit={(answer) => submitAnswer(answer, 0)}
                    disabled={isLoading}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 px-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={narrative}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <NarrativeDisplay text={narrative} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {isLoading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(11,218,115,0.5)]"></div>
            <p className="text-primary font-bold tracking-widest animate-pulse">正在共鳴靈魂能量...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionnairePage;
