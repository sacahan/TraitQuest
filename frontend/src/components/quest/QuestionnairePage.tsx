import { useState, useEffect } from 'react';
import { useQuestStore } from '../../stores/questStore';
import NarrativeDisplay from './NarrativeDisplay';
import QuestionCard from './QuestionCard';
import MagicHourglass from '../ui/MagicHourglass';
import GlowEffect from '../effects/GlowEffect';
import { motion, AnimatePresence } from 'framer-motion';

const QuestionnairePage = () => {
  const { 
    submitAnswer, 
    currentQuestion, 
    narrative,
    guideMessage,
    isCompleted, 
    isLoading,
    questionIndex,
    totalSteps
  } = useQuestStore();

  // 控制 QuestionCard 是否可以顯示（等待 NarrativeDisplay 完成）
  const [narrativeComplete, setNarrativeComplete] = useState(false);

  // 當 narrative 改變時重置完成狀態
  useEffect(() => {
    if (narrative) {
      setNarrativeComplete(false);
    } else {
      // 如果沒有 narrative，直接設為完成
      setNarrativeComplete(true);
    }
  }, [narrative]);

  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-12 relative">
        <motion.h2
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-5xl font-display font-bold text-white mb-6 uppercase tracking-tighter"
        >
          靈魂試煉完成
        </motion.h2>
        <p className="text-white/60 text-lg mb-12 italic font-serif">通往英雄殿堂的道路已開啟，轉生儀式即將開始...</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.href = '/analysis'}
          className="bg-primary text-black font-black uppercase tracking-widest py-4 px-12 rounded-0 shadow-[0_0_30px_rgba(17,212,82,0.3)] hover:bg-white transition-all duration-500"
        >
          啟動轉生儀式
        </motion.button>
       </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col pt-8 relative">
      <GlowEffect trigger={questionIndex} />
      {/* 頂部進度條區域 */}
      <div className="w-full max-w-3xl mx-auto px-6 mt-2 mb-0">
        <div className="flex justify-between text-sm font-bold tracking-wide text-primary/80 mb-2 px-1">
          <span className="uppercase text-xs tracking-widest text-white/50">Soul Resonance</span>
          <span>{currentQuestion ? `${Math.min(100, Math.round((questionIndex / totalSteps) * 100))}%` : '0%'}</span>
        </div>
        <div className="h-6 w-full bg-[#08120d] rounded-full p-1 border border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] relative overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-900 via-primary to-[#4fffb0] rounded-full transition-all duration-1000 relative overflow-hidden shadow-[0_0_15px_#0bda73]"
            style={{ width: currentQuestion ? `${Math.min(100, Math.round((questionIndex / totalSteps) * 100))}%` : '0%' }}
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMiIvPjwvc3ZnPg==')] opacity-30"></div>
          </div>
        </div>
        <div className="text-center text-xs text-primary/40 font-mono mt-2 tracking-[0.2em] uppercase">
          Trial Sequence · Progressing
        </div>
      </div>

      <main className="flex-1 flex items-start justify-center px-4 pt-4 pb-12 w-full max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 w-full items-start">
          {/* 左側 Abby 組件 */}
          <div className="hidden lg:flex lg:col-span-3 flex-col items-center justify-center relative animate-float z-20 sticky top-24">
            <div className="relative bg-[#11251c] border border-primary/30 p-5 rounded-2xl rounded-bl-sm mb-6 shadow-2xl max-w-[260px] backdrop-blur-sm min-h-[100px]">
              <span className="text-primary text-xs font-bold uppercase block mb-2 tracking-wider not-italic">心靈嚮導 · Abby</span>
              <AnimatePresence mode="wait">
                <motion.p
                  key={guideMessage || 'default'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-white text-base font-medium leading-relaxed italic text-white/90"
                >
                  {guideMessage || "凝視這面心靈之鏡... 剥去表象的偽裝，那個在寂靜中凝視著你的，是怎樣的存在？"}
                </motion.p>
              </AnimatePresence>
              <div className="absolute -bottom-2 left-6 w-4 h-4 bg-[#11251c] border-b border-l border-primary/30 transform -rotate-45"></div>
            </div>
            <div className="size-56 rounded-full border-4 border-[#162e24] shadow-[0_0_50px_rgba(11,218,115,0.2)] overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-magic-purple/40 to-transparent opacity-70 z-10 mix-blend-overlay"></div>
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                style={{
                  backgroundImage: "url('/assets/images/quest_bg.png')"
                }}
              ></div>
            </div>
          </div>

          {/* 右側問卷主體 */}
          <div className="lg:col-span-9 relative flex flex-col w-full min-h-[500px]">
            {/* 敘事顯示區 - 優先顯示 */}
            <div className="mb-6 px-4 shrink-0">
              <AnimatePresence mode="popLayout" initial={false}>
                {narrative && (
                  <motion.div
                    key={narrative}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                  >
                    <NarrativeDisplay
                      text={narrative}
                      onComplete={() => setNarrativeComplete(true)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 問題卡片 - 等待敘事完成後顯示 */}
            <div className="px-4">
              <AnimatePresence mode="wait">
                {currentQuestion && narrativeComplete && (
                  <motion.div
                    key={currentQuestion.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 20
                    }}
                    className="w-full"
                  >
                    <QuestionCard
                      question={currentQuestion}
                      onSubmit={(answer) => submitAnswer(answer, questionIndex)}
                      disabled={isLoading}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0a0f0d]/90 backdrop-blur-xl z-[100] flex flex-col items-center justify-center overflow-hidden"
          >
            {/* 背景氛圍光 */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#11D45222_0%,_transparent_70%)] animate-pulse"></div>

            <div className="relative flex items-center justify-center scale-125 lg:scale-150 mb-12">
              <MagicHourglass />
            </div>

            <div className="mt-8 flex flex-col items-center z-10">
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-primary text-sm font-black tracking-[0.4em] uppercase mb-2"
              >
                Time Weaving
              </motion.p>
              <motion.p 
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-white/60 text-xs font-serif italic tracking-wider"
              >
                時間之沙流動... 命運正在顯現
              </motion.p>

              <div className="mt-6 w-32 h-[1px] bg-white/10 relative overflow-hidden rounded-full">
                <motion.div 
                  animate={{ left: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-primary/40 to-transparent"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuestionnairePage;
