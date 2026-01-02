import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { useMapStore } from '../stores/mapStore';

const QUEST_DETAILS: Record<string, any> = {
  mbti: {
    title: 'MBTI 英雄職業分析',
    description: '探索 E/I、S/N、T/F、J/P 四大維度，尋找你的本命職業與思維模式。十六種傳奇職業，等待與你的靈魂共鳴。',
    requirements: ['需達到等級 Lv.1'],
    rewards: ['解鎖核心職業 (Class)', '獲得職業專屬稱號']
  },
  big_five: {
    title: 'Big Five 五大屬性分析',
    description: '穿越 OCEAN 五大洋流。測量開放性 (O)、盡責性 (C)、外向性 (E)、親和性 (A)、神經質 (N)，轉化為你的五維基礎屬性。',
    requirements: ['需達到等級 Lv.2', '完成 MBTI 聖殿'],
    rewards: ['解鎖角色屬性 (Stats)', '獲得五維雷達圖']
  },
  disc: {
    title: 'DISC 戰鬥架勢分析',
    description: '解析你在壓力與衝突中的即時反應。掌控 (D)、影響 (I)、穩定 (S)、遵從 (C)，四象行動核心決定你的戰鬥姿態。',
    requirements: ['需達到等級 Lv.4', '完成 Enneagram 冥想塔'],
    rewards: ['解鎖對戰方式 (Stance)', '獲得戰術指引']
  },
  enneagram: {
    title: 'Enneagram 靈魂種族探索',
    description: '九種靈魂本源，萌芽於恐懼與渴望。找到你所屬的古老種族，揭示驅動你行為的核心執念與成長盲點。',
    requirements: ['需達到等級 Lv.3', '完成 Big Five 能量場'],
    rewards: ['覺醒靈魂種族 (Race)', '解鎖種族天賦']
  },
  gallup: {
    title: 'Gallup 傳奇技能解鎖',
    description: 'CliftonStrengths® 34 項天賦模型。辨識你最具力量的天賦主軸，轉化為 2-3 個專屬主動與被動技能。',
    requirements: ['需達到等級 Lv.5', '完成 DISC 戰鬥叢林'],
    rewards: ['解鎖傳奇技能 (Talent)', '獲得天賦發展藍圖']
  }
};

const QuestIntro = () => {
  const { questId } = useParams();
  const navigate = useNavigate();
  const quest = QUEST_DETAILS[questId || 'mbti'] || QUEST_DETAILS.mbti;
  const { regions, fetchRegions } = useMapStore();

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  // 獲取當前區域狀態
  const currentRegion = regions.find(r => r.id === (questId || 'mbti'));
  const isLocked = currentRegion?.status === 'LOCKED';
  const isConquered = currentRegion?.status === 'CONQUERED';

  const handleEnterQuest = () => {
    if (!isLocked) {
      navigate(`/questionnaire?type=${questId || 'mbti'}`);
    }
  };

  return (
    <div className="bg-background-dark min-h-screen font-body flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-[#1a3323] rounded-3xl p-10 border border-[#23482f] shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700"></div>
          
          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex items-center gap-3 text-primary">
              <span className="material-symbols-outlined font-variation-FILL-1">explore</span>
              <span className="text-sm font-bold uppercase tracking-widest">副本情報</span>
            </div>
            
            <h1 className="text-white text-4xl font-black font-display">{quest.title}</h1>
            
            <p className="text-gray-300 text-lg leading-relaxed">
              {quest.description}
            </p>
            
            {/* 鎖定狀態提示 */}
            {isLocked && currentRegion?.unlock_hint && (
              <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-red-400">lock</span>
                <p className="text-red-300 text-sm font-bold">{currentRegion.unlock_hint}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
              <div className="bg-[#112217]/50 rounded-2xl p-4 border border-white/5">
                <h3 className="text-primary text-sm font-bold mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">lock_open</span>
                  解鎖條件
                </h3>
                <ul className="text-gray-400 text-sm space-y-2">
                  {quest.requirements.map((req: string) => (
                    <li key={req} className="flex items-center gap-2">
                      <div className="size-1 bg-primary rounded-full"></div>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-[#112217]/50 rounded-2xl p-4 border border-white/5">
                <h3 className="text-primary text-sm font-bold mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">redeem</span>
                  副本獎勵
                </h3>
                <ul className="text-gray-400 text-sm space-y-2">
                  {quest.rewards.map((reward: string) => (
                    <li key={reward} className="flex items-center gap-2">
                      <div className="size-1 bg-primary rounded-full"></div>
                      {reward}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <button
                onClick={handleEnterQuest}
                disabled={isLocked}
                className={`flex-1 h-14 rounded-full text-lg font-bold flex items-center justify-center gap-2 group/btn transition-all ${isLocked
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                    : 'bg-primary text-[#112217] hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(17,212,82,0.3)]'
                  }`}
              >
                <span>{isLocked ? '區域鎖定中' : isConquered ? '重新挑戰' : '進入副本'}</span>
                {!isLocked && <span className="material-symbols-outlined transition-transform group-hover/btn:translate-x-1">bolt</span>}
              </button>
              <button
                onClick={() => navigate('/map')}
                className="px-8 h-14 rounded-full border border-white/10 text-white font-bold hover:bg-white/5 transition-all"
              >
                返回地圖
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default QuestIntro;
