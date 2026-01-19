import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import AppLayout from '../layout/AppLayout';
import { HomeQuestCard } from '../components/quest/HomeQuestCard';
import CustomGoogleAuthButton from '../components/auth/CustomGoogleAuthButton';

const QUESTS = [
  {
    id: 'mbti',
    title: '英雄職業',
    type: 'MBTI ',
    description: '源自榮格心理學的十六種心智原型。透過四大維度，判定你最自然的思考方式與行動風格。',
    imageUrl: '/assets/images/mbti_cover.webp',
    color: 'green',
    icon: 'psychology',
    route: '/intro/mbti'
  },
  {
    id: 'bigfive',
    title: '角色屬性',
    type: 'Big Five',
    description: '現代心理學中最具實證基礎的心性模型。以五條連續屬性，描繪你長期穩定的行為輪廓。',
    imageUrl: '/assets/images/big5_cover.webp',
    color: 'blue',
    icon: 'water_drop',
    route: '/intro/bigfive'
  },
  {
    id: 'disc',
    title: '戰鬥流派',
    type: 'DISC',
    description: '解析你在壓力與衝突中的即時反應。四象行動核心，決定你在人際戰場上的站位。',
    imageUrl: '/assets/images/disc_cover.webp',
    color: 'red',
    icon: 'swords',
    route: '/intro/disc'
  },
  {
    id: 'enneagram',
    title: '靈魂種族',
    type: 'Enneagram',
    description: '九種靈魂本源，萌芽於恐懼與渴望。揭示驅動你行為的核心執念與成長盲點。',
    imageUrl: '/assets/images/enneagram_cover.webp',
    color: 'purple',
    icon: 'stars',
    route: '/intro/enneagram'
  },
  {
    id: 'gallup',
    title: '天賦技能',
    type: 'CliftonStrengths®',
    description: 'Gallup 發展的天賦模型。辨識你最具力量的天賦主軸，專注強化，而非補齊短板。',
    imageUrl: '/assets/images/gallup_cover.webp',
    color: 'yellow',
    icon: 'trophy',
    route: '/intro/gallup'
  }
];

const Home = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  return (
    <AppLayout backgroundVariant="subtle">
      <div className="flex-grow">
        {/* Hero Section */}
        <section className="w-full px-4 md:px-10 py-8 flex justify-center">
          <div className="w-full max-w-[1200px]">
            <div
              className="flex min-h-[560px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-2xl items-center justify-center p-8 relative overflow-hidden group shadow-2xl shadow-primary/10 transition-all duration-500 hover:shadow-primary/30 hero-bg-responsive"
            >
              <div className="absolute top-4 left-4 text-white/20 transition-transform duration-700 group-hover:rotate-45">
                <span className="material-symbols-outlined text-6xl rotate-12 font-variation-FILL-1">swords</span>
              </div>
              <div className="absolute bottom-4 right-4 text-white/20 transition-transform duration-700 group-hover:-rotate-45">
                <span className="material-symbols-outlined text-6xl -rotate-12 font-variation-FILL-1">explore</span>
              </div>
              
              <div className="flex flex-col gap-4 text-center z-10 max-w-[800px]">
                <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary w-fit mx-auto mb-2 backdrop-blur-sm animate-pulse">
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  <span className="text-xs font-bold uppercase tracking-wider">New Adventure Available</span>
                </div>
                <h1 className="text-white text-4xl font-black leading-tight tracking-tight font-display md:text-6xl md:leading-tight drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                  開啟你的心靈冒險
                </h1>
                <h2 className="text-gray-200 text-base font-medium leading-relaxed md:text-lg max-w-2xl mx-auto drop-shadow-md font-body">
                  從 MBTI 的核心職業到九型人格的靈魂神殿。選擇你的試煉，解鎖隱藏在內心深處的英雄屬性與專屬天賦！
                </h2>
              </div>
              {isAuthenticated ? (
                <button
                  onClick={() => navigate('/map')}
                  className="group flex min-w-[180px] max-w-[480px] cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-full h-12 px-8 bg-primary text-[#112217] hover:scale-105 active:scale-95 transition-all duration-300 text-base font-bold shadow-lg z-10 mt-4 animate-breathing-glow"
                >
                  <span className="material-symbols-outlined text-xl transition-transform group-hover:rotate-12">map</span>
                  <span className="truncate font-body">進入心靈大陸</span>
                </button>
              ) : (
                <CustomGoogleAuthButton className="group flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-full h-12 px-8 bg-white text-[#112217] hover:bg-gray-100 transition-all duration-300 text-base font-bold shadow-lg z-10 mt-4 animate-breathing-white hover:scale-105 active:scale-95 active:ring-4 active:ring-white/50">
                  <span className="material-symbols-outlined text-xl transition-transform group-hover:rotate-12">login</span>
                  <span className="truncate font-body">使用 Google 帳號開始</span>
                </CustomGoogleAuthButton>
              )}
              
              <div className="flex gap-4 mt-4 text-sm text-gray-400 font-body">
                <span className="flex items-center gap-1 group/item">
                  <span className="material-symbols-outlined text-primary text-sm transition-all group-hover/item:scale-125 group-hover/item:text-white">check_circle</span>
                  免費測試
                </span>
                <span className="flex items-center gap-1 group/item">
                  <span className="material-symbols-outlined text-primary text-sm transition-all group-hover/item:scale-125 group-hover/item:text-white">check_circle</span>
                  沉浸式冒險 RPG 體驗
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Quest Selection Section */}
        <section className="w-full px-4 md:px-10 py-12">
          <div className="w-full max-w-[1200px] mx-auto text-center mb-10">
            <h2 className="text-white text-3xl font-black leading-tight tracking-tight font-display mb-2 drop-shadow-[0_0_10px_rgba(17,212,82,0.2)]">
              選擇你的試煉副本
            </h2>
            <p className="text-[#92c9a4] text-lg font-body">五大傳說級人格分析系統，等你來挑戰</p>
          </div>
          
          <div className="w-full max-w-[1200px] mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
              {QUESTS.map(quest => (
                <HomeQuestCard key={quest.id} {...quest} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="w-full flex justify-center pb-20 px-4">
          <div className="w-full max-w-[960px] bg-gradient-to-r from-[#1a3323] to-[#112217] rounded-3xl p-10 text-center border border-[#23482f] shadow-2xl relative overflow-hidden group hover:border-primary/50 transition-all duration-500">
            <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12">
              <span className="material-symbols-outlined text-9xl">stadia_controller</span>
            </div>
            <div className="relative z-10 flex flex-col items-center gap-6">
              <h2 className="text-white text-3xl font-black font-display drop-shadow-md">準備好開始你的傳奇了嗎？</h2>
              <p className="text-gray-300 max-w-lg font-body">利用自我認知來成長，克服障礙，擊敗生活中的『怪物』</p>
              {isAuthenticated ? (
                <button
                  onClick={() => navigate('/map')}
                  className="flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full h-14 px-10 bg-primary text-[#112217] hover:scale-105 active:scale-95 active:brightness-125 transition-all duration-300 text-lg font-bold shadow-[0_0_20px_rgba(17,212,82,0.4)] hover:shadow-[0_0_30px_rgba(17,212,82,0.8)] animate-breathing-glow group/btn font-body"
                >
                  <span className="material-symbols-outlined transition-transform group-hover/btn:translate-x-1">map</span>
                  <span>開啟冒險地圖</span>
                </button>
              ) : (
                  <CustomGoogleAuthButton className="flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full h-14 px-10 bg-primary text-[#112217] hover:scale-105 active:scale-95 active:brightness-125 transition-all duration-300 text-lg font-bold shadow-[0_0_20px_rgba(17,212,82,0.4)] hover:shadow-[0_0_30px_rgba(17,212,82,0.8)] animate-breathing-glow group/btn font-body">
                    <span className="material-symbols-outlined transition-transform group-hover/btn:translate-x-1">play_arrow</span>
                    <span>立即登入</span>
                  </CustomGoogleAuthButton>
              )}
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default Home;
