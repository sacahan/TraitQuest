import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

const QUEST_DETAILS: Record<string, any> = {
  mbti: {
    title: 'MBTI 英雄職業分析',
    description: '探索 E/I、S/N、T/F、J/P 四大維度，尋找你的本命職業與思維模式。你是運籌帷幄的建築師，還是熱情洋溢的競選者？',
    requirements: ['等級 1', '靈魂共鳴值 0%'],
    rewards: ['解鎖職業屬性', '獲取初階冒險執照']
  },
  big_five: {
    title: 'Big Five 性格特質分析',
    description: '穿越 OCEAN 五大洋流。分析你的開放性、責任心、外向性、親和力與神經質。',
    requirements: ['等級 1', '心靈能量 50%'],
    rewards: ['獲取五維地圖', '解鎖潛能天賦']
  }
};

const QuestIntro = () => {
  const { questId } = useParams();
  const navigate = useNavigate();
  const quest = QUEST_DETAILS[questId || 'mbti'] || QUEST_DETAILS.mbti;

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
                onClick={() => navigate('/questionnaire')}
                className="flex-1 h-14 rounded-full bg-primary text-[#112217] text-lg font-bold hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(17,212,82,0.3)] flex items-center justify-center gap-2 group/btn"
              >
                <span>開始魂力挑戰</span>
                <span className="material-symbols-outlined transition-transform group-hover/btn:translate-x-1">bolt</span>
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-8 h-14 rounded-full border border-white/10 text-white font-bold hover:bg-white/5 transition-all"
              >
                返回城鎮
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
