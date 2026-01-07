import { useState, useEffect } from 'react';
import { useQuestStore } from '../../stores/questStore';
import NarrativeDisplay from './NarrativeDisplay';
import QuestionCard from './QuestionCard';
import MagicHourglass from '../ui/MagicHourglass';
import GlowEffect from '../effects/GlowEffect';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, MoveRight } from 'lucide-react';

const REGIONS_MAPPING: Record<string, string> = {
  mbti: "MBTI 聖殿",
  bigfive: "Big Five 能量場",
  enneagram: "Enneagram 冥想塔",
  disc: "DISC 戰鬥叢林",
  gallup: "Gallup 祭壇",
};

const Questionnaire = () => {
  const { 
    submitAnswer, 
    currentQuestion, 
    narrative,
    guideMessage,
    isCompleted, 
    isLoading,
    questionIndex,
    totalSteps,
    sessionId,
    questId,
    finalResult,
    requestResult
  } = useQuestStore();

  const regionName = questId ? REGIONS_MAPPING[questId as keyof typeof REGIONS_MAPPING] : "英雄殿堂";

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

  // 當收到最終結果時，跳轉到分析頁面
  useEffect(() => {
    if (finalResult) {
      window.location.href = '/analysis';
    }
  }, [finalResult]);

  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] bg-[radial-gradient(circle,rgba(17,212,82,0.15)_0%,rgba(16,34,22,0)_70%)] opacity-60"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-primary/20 rounded-full animate-spin-slow opacity-30 flex items-center justify-center">
            <div className="absolute w-[90%] h-[90%] border border-dashed border-primary/20 rounded-full animate-spin-reverse"></div>
            <span className="absolute top-2 text-primary/30 text-xs transform -translate-x-1/2 font-mono">Ω</span>
            <span className="absolute bottom-2 text-primary/30 text-xs transform -translate-x-1/2 font-mono">Σ</span>
          </div>
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/40 rounded-full animate-float" style={{ animationDelay: '0s' }}></div>
          <div className="absolute top-3/4 left-1/3 w-3 h-3 bg-primary/20 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center animate-float">
          {/* Icon Blob */}
          <div className="mb-8 relative group">
            <div className="absolute inset-0 bg-primary rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            <div className="relative bg-gradient-to-br from-green-900 via-[#0a1510] to-black border-2 border-primary/50 w-24 h-24 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(17,212,82,0.3)]">
              <Sparkles className="w-12 h-12 text-primary drop-shadow-[0_0_10px_rgba(17,212,82,0.5)]" />
            </div>
            <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 text-primary/20 pointer-events-none" fill="currentColor" viewBox="0 0 100 100">
              <path d="M10,50 Q30,20 50,40 Q70,20 90,50" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2"></path>
              <path d="M10,50 Q30,80 50,60 Q70,80 90,50" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2"></path>
            </svg>
          </div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }} 
            className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 mb-6 tracking-tight drop-shadow-lg font-display uppercase"
          >
            靈魂試煉完成
          </motion.h1>

          {/* Separator */}
          <div className="flex items-center gap-4 mb-8 opacity-70">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-primary"></div>
            <div className="text-primary transform rotate-45 border border-primary w-3 h-3 bg-black"></div>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-primary"></div>
          </div>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed mb-12 font-light tracking-wide font-sans">
            {narrative || `通往${regionName}的道路已開啟，轉生儀式即將開始...`}
          </p>

          {/* Button */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-green-600 rounded-lg blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => requestResult()}
              disabled={isLoading}
              className="relative px-12 py-5 bg-gradient-to-r from-green-900 via-[#11251c] to-green-900 border border-primary/30 text-white text-xl font-bold rounded-lg shadow-lg hover:shadow-[0_0_30px_rgba(17,212,82,0.4)] transform transition-all duration-300 flex items-center gap-3 overflow-hidden cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* Shine Effect */}
              <div className="absolute top-0 -left-full w-[200%] h-[100%] bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg] animate-[shine_3s_infinite]"></div>

              {isLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              ) : (
                  <Zap className="w-6 h-6 animate-pulse text-primary" />
              )}
              <span>{isLoading ? '儀式進行中...' : '啟動轉生儀式'}</span>
              {!isLoading && <MoveRight className="w-6 h-6 group-hover:translate-x-1 transition-transform bg-transparent" />}
            </motion.button>
          </div>
        </div>
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
          <span>{currentQuestion ? `${Math.min(100, Math.round(((questionIndex + 1) / totalSteps) * 100))}%` : '0%'}</span>
        </div>
        <div className="h-6 w-full bg-[#08120d] rounded-full p-1 border border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] relative overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-900 via-primary to-[#4fffb0] rounded-full transition-all duration-1000 relative overflow-hidden shadow-[0_0_15px_#0bda73]"
            style={{ width: currentQuestion ? `${Math.min(100, Math.round(((questionIndex + 1) / totalSteps) * 100))}%` : '0%' }}
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
        {(isLoading || !sessionId) && (
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

export default Questionnaire;
