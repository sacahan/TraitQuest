import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { HomeQuestCard } from '../components/quest/HomeQuestCard';
import CustomGoogleAuthButton from '../components/auth/CustomGoogleAuthButton';

const QUESTS = [
  {
    id: 'mbti',
    title: 'MBTI 分析',
    type: '英雄職業',
    description: '探索 E/I、S/N、T/F、J/P 四大維度，尋找你的本命職業與思維模式。你是運籌帷幄的建築師，還是熱情洋溢的競選者？',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_H_FnQrEU4a1xs5rsL9kablIllbLgpEjhuS6bO9jTAP7ImrnFVqv8NtA1zzhDo4LK3SvUyAur5QGFnqesfreyeBACBaYbYbZuPjHZZpc23PDm-swnZzIhz6G-CN5QwiCbTYg3evbELEUZdwcbZRJb9EIOaDZr_9x5h8I1jUfBJXIYyfM1W_6K-9ozWQD-QYsyTanNfBDTrIB62q7_Ny-u7VaBqW0gGxjvMQAnWAVdl63XgUvVrmmHWwkjvTnXgtmw07vc__99Pn_-',
    icon: 'psychology',
    route: '/questionnaire'
  },
  {
    id: 'big_five',
    title: 'Big Five 分析',
    type: '性格特質',
    description: '穿越 OCEAN 五大洋流。分析你的開放性、責任心、外向性、親和力與神經質，繪製最精準的個性雷達圖。',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTDuzgwlyj-15QISA3f5qvVkYFqRbxtHS3Q2oC8EqnzLL4D7TLg0SRLyXBdsmvG2WpWwcevDYTtvmuatQwgjP5EtgLZCSynwVdxpPGFKHiUj9b7aO4h-yzvzMrOmCzYGhuVgJ4lsb4zYd_0tf2Qs-7jFdBiTuqDy5KHZXFHasvVyBbpguLu3By5W3GX6OclBriiwj5r5xjBfcThaPkZ5hpGOFP75HALhP5O3SBpu5HUG74l4YzFn7JSeRmAkq--NnXNHtvgPj0HZff',
    icon: 'water_drop',
    route: '/questionnaire'
  },
  {
    id: 'disc',
    title: 'DISC 分析',
    type: '對戰策略',
    description: '支配(D)、影響(I)、穩健(S)、分析(C)。在職場與人際的戰場上，你是衝鋒陷陣的將軍，還是運籌帷幄的軍師？',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGGrBLD3DE7c97ZGQ0cPPeL7daiJaXGqy6evNvRv-JUBHgx6qaCMT-se1lcr--hJEnINbp_LOG5BaAR7F0HsqHHkruPuto7ShshwLaPurcSmgAkI2yAfeIytD--wTRTOZ9w_7DUJg3sTVrJYlAVsfEdoGxRzYlR2OyywzX4QuSsATcl23bKuEy3kVwVWCqcvEGq29jTjs8bBNJ9sHcinzTsdOrx-MSQK_rBHjGqyHPRcd1xXRwpG8UGgUFivb5C3oNSVp9CAU97IE4',
    icon: 'swords',
    route: '/questionnaire'
  },
  {
    id: 'enneagram',
    title: 'Enneagram 分析',
    type: '靈魂種族',
    description: '深入靈魂深處，直面核心恐懼與慾望。從完美主義者到和平締造者，覺醒你的心靈原力，找到成長的蛻變之路。',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvDrGplJ_AYJAwPYdCWvaC6BCgCR7EYyisfQFNpbwjc6sdNsoekUjfOittUYvwaD7BgwnilDHtrmHXuMuKJydJEiKQunC9XjwuGgkHdBKJwx2NxMsN6KT8F3U3Lrpjp-8bTCRnPrtJio_U54JJDhCIVOw6qm1f-gGIr_46G23KuNUYY9or0DW82evmIJ9ol--_B-Phy50cLvvaU8AFXeDRlMPFPP6q09--J8cEWsXHcuxmFDh6fMdqGQOygoTtRnPtdj8fdnhI5ogC',
    icon: 'stars',
    route: '/questionnaire'
  },
  {
    id: 'gallup',
    title: 'Gallup 識別',
    type: '專屬技能',
    description: '與其彌補缺點，不如強化天賦！挖掘你最強大的五項天賦優勢，打造專屬於你的無敵技能樹。',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYvrLaw1ItcvLuNKFm5pEnXIAzwcBxaspLHb2D5rP90Pih7MMR_Wk5hw6A1-f9eLq_LRmGIhrqzujHdBo3nkXNJ_LjeXyAxYvn4WTIdto9bMjPtRkvj8KeqIhK-cPj6xw3jIYdzcM2jN1ql4juJl0ARxdd_-po5XFU5yFj9eVMWpFjTkQ6swrmHossK5gVv-bB8wsNQykcM2zYVHnlTzr98K8szl7fYTxfrpYGSekRWLNcqfvmua0yR2EGRsUv81uwXKqs-6GMSgBG',
    icon: 'trophy',
    route: '/questionnaire'
  }
];

const Home = () => {
  return (
    <div className="bg-background-dark min-h-screen font-body flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="w-full px-4 md:px-10 py-8 flex justify-center">
          <div className="w-full max-w-[1200px]">
            <div
              className="flex min-h-[560px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-2xl items-center justify-center p-8 relative overflow-hidden group shadow-2xl shadow-primary/10 transition-all duration-500 hover:shadow-primary/30"
              style={{
                backgroundImage: 'linear-gradient(rgba(16, 34, 22, 0.7) 0%, rgba(16, 34, 22, 0.85) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuAskoVlrSvlm0UJiofdOGCILkqEkm9CRTcX1KJ3MQH4x5z75QN9otgjF8acHumAHFXIT0bdlGUSjZjhN4O77SPeme7q6laVzYpKCxFTyFOJErQ5zSnVCwEHaR9INHh1HxMm1NvXw86Xgm1GylVWi1p784WMspiIUPAJaCmtAOlMIvjXYQkvbg2Mdkmw9025LB_S5kaKK6_3DN04eqsKMV1GhH1pdogXtpL8idBzZcsN8TM8GDcq6WhQ5DVgILYSjEKoRT0s5Qqqjx5U")'
              }}
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
                  從 MBTI 的職業聖殿到九型人格的靈魂神殿。選擇你的試煉，解鎖隱藏在內心深處的英雄屬性與專屬技能！
                </h2>
              </div>
              
              <CustomGoogleAuthButton className="group flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-full h-12 px-8 bg-white text-[#112217] hover:bg-gray-100 transition-all duration-300 text-base font-bold shadow-lg z-10 mt-4 animate-breathing-white hover:scale-105 active:scale-95 active:ring-4 active:ring-white/50">
                <span className="material-symbols-outlined text-xl transition-transform group-hover:rotate-12">login</span>
                <span className="truncate font-body">使用 Google 帳號開始</span>
              </CustomGoogleAuthButton>
              
              <div className="flex gap-4 mt-4 text-sm text-gray-400 font-body">
                <span className="flex items-center gap-1 group/item">
                  <span className="material-symbols-outlined text-primary text-sm transition-all group-hover/item:scale-125 group-hover/item:text-white">check_circle</span>
                  免費測試
                </span>
                <span className="flex items-center gap-1 group/item">
                  <span className="material-symbols-outlined text-primary text-sm transition-all group-hover/item:scale-125 group-hover/item:text-white">check_circle</span>
                  專業分析報告
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
              <CustomGoogleAuthButton className="flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full h-14 px-10 bg-primary text-[#112217] hover:scale-105 active:scale-95 active:brightness-125 transition-all duration-300 text-lg font-bold shadow-[0_0_20px_rgba(17,212,82,0.4)] hover:shadow-[0_0_30px_rgba(17,212,82,0.8)] animate-breathing-glow group/btn font-body">
                <span className="material-symbols-outlined transition-transform group-hover/btn:translate-x-1">play_arrow</span>
                <span>立即登入</span>
              </CustomGoogleAuthButton>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
