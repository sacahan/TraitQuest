import React from 'react'
import IntroLayout from '../../components/layout/IntroLayout'

const EnneagramIntro: React.FC = () => {
  return (
    <IntroLayout title="Enneagram 介紹">
      {/* Hero Section */}
      <div className="w-full max-w-[1200px] px-4 py-10 md:px-6 lg:py-20">
        <div className="flex flex-col-reverse lg:flex-row gap-10 items-center">
          <div className="flex flex-col gap-6 flex-1 text-center lg:text-left items-center lg:items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-guild-border text-primary text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(11,218,115,0.2)]">
              <span className="material-symbols-outlined text-sm">filter_9_plus</span>
              九型人格探索
            </div>
            <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
              揭開你的<span className="text-primary drop-shadow-[0_0_10px_rgba(11,218,115,0.5)]">靈魂種族 (Race)</span>
            </h1>
            <p className="text-[#90cbad] text-base md:text-lg max-w-[600px] leading-relaxed">
              Enneagram（九型人格）定義了你內心最深處的恐懼與欲望。在 TraitQuest 中，這決定了你所屬的古老種族與先天天賦。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
              <button
                className="flex cursor-pointer items-center justify-center rounded-full h-12 px-8 bg-primary text-[#10231a] text-base font-bold shadow-[0_0_20px_rgba(11,218,115,0.5)] hover:shadow-[0_0_30px_rgba(11,218,115,0.8)] transition-all w-full sm:w-auto group"
                onClick={() => window.location.href = '/questionnaire'}
              >
                <span className="truncate group-hover:scale-105 transition-transform">尋找你的種族</span>
              </button>
              <a
                href="#lore"
                className="flex cursor-pointer items-center justify-center rounded-full h-12 px-8 bg-surface-dark border border-surface-border text-white text-base font-bold hover:bg-[#1e4030] hover:border-primary/50 transition-colors w-full sm:w-auto"
              >
                <span className="truncate">解讀九型奧秘</span>
              </a>
            </div>
          </div>
          <div className="flex-1 w-full max-w-[600px] aspect-square md:aspect-video lg:aspect-square relative rounded-2xl overflow-hidden shadow-2xl border-4 border-[#183426] group hover:border-primary/50 transition-colors duration-500">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCHXidp-z_G1_P8S_Q_9W_9I_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P")' }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#102219] via-transparent to-transparent opacity-80"></div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 bg-[#102219]/90 border border-[#31684d] p-4 rounded-xl backdrop-blur-sm">
              <div className="flex gap-3 items-center">
                <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary text-primary animate-pulse">
                  <span className="material-symbols-outlined">auto_fix_high</span>
                </div>
                <div>
                  <p className="text-xs text-[#90cbad]">血脈感應</p>
                  <p className="text-sm font-bold text-white">正在引導遠古種族的共鳴...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lore Section */}
      <div id="lore" className="w-full bg-[#112217] py-20 px-4 md:px-10 border-y border-[#23482f]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a3323] border border-[#23482f] text-primary font-bold text-sm">
              <span className="material-symbols-outlined text-lg">public-off</span>
              Soul Genesis
            </div>
            <h3 className="text-white text-3xl font-bold">九型人格：動機的根源</h3>
            <p className="text-[#e0eadd] text-lg leading-relaxed">
              Enneagram 不僅僅是性格分類，它是一個關於核心動機、恐懼與潛能轉化的智慧系統。
            </p>
            <div className="space-y-4">
              {[
                "內在核心：探索是什麽在驅動你的行為——是追求安全、力量還是愛？",
                "成長路徑：當壓力或安定時，你的性格會如何位移至其他型號。",
                "靈魂整合：超越型號的束縛，找回靈魂的完整性。"
              ].map((text, i) => (
                <div key={i} className="flex gap-4">
                  <div className="shrink-0 size-8 rounded-full bg-[#31684d] flex items-center justify-center text-primary font-bold">{i + 1}</div>
                  <p className="text-[#90cbad]">{text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 w-full max-w-[500px]">
            <div className="relative aspect-square">
               <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_15px_rgba(17,212,82,0.3)] animate-spin-slow">
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#23482f" strokeWidth="1" />
                    <polygon points="100,20 169.3,140 30.7,140" fill="none" stroke="#11D452" strokeWidth="2" opacity="0.6" />
                    <path d="M100 20 L180 100 L140 170 L60 170 L20 100 Z" fill="none" stroke="#11D452" strokeWidth="1" opacity="0.4" strokeDasharray="4 2" />
                    <circle cx="100" cy="20" r="3" fill="#11D452" />
                    <circle cx="153" cy="40" r="3" fill="#11D452" />
                    <circle cx="180" cy="100" r="3" fill="#11D452" />
                    <circle cx="153" cy="160" r="3" fill="#11D452" />
                    <circle cx="100" cy="180" r="3" fill="#11D452" />
                    <circle cx="47" cy="160" r="3" fill="#11D452" />
                    <circle cx="20" cy="100" r="3" fill="#11D452" />
                    <circle cx="47" cy="40" r="3" fill="#11D452" />
               </svg>
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                      <div className="text-primary text-4xl font-black">9</div>
                      <div className="text-white text-[10px] uppercase tracking-widest font-bold">Types</div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Section */}
      <section className="py-20 px-4 md:px-10 bg-[#0d1a12] relative overflow-hidden w-full">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white">九大傳奇種族</h2>
            <p className="text-[#90cbad] mt-4 max-w-2xl mx-auto leading-relaxed">
              在 TraitQuest 中，這九個型號對應著九種具有獨特靈魂特質的種族。
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderRaceCard('1號：完美主義者', '大天使族', '追求秩序與正直。', 'primary')}
            {renderRaceCard('2號：給予者', '精靈精靈族', '渴望被愛與被需要。', 'primary')}
            {renderRaceCard('3號：成就者', '龍裔族', '追求成功與自我價值。', 'primary')}
            {renderRaceCard('4號：浪漫者', '影族', '追求獨特與真實感受。', 'primary')}
            {renderRaceCard('5號：觀察者', '機關族', '渴望知識與獨立。', 'primary')}
            {renderRaceCard('6號：懷疑論者', '矮人族', '追求安全與群體歸屬。', 'primary')}
            {renderRaceCard('7號：享樂主義者', '半獸人族', '追求快樂與避免痛苦。', 'primary')}
            {renderRaceCard('8號：挑戰者', '巨人族', '追求力量與正義。', 'primary')}
            {renderRaceCard('9號：和平締造者', '森之子族', '追求內心與外界的和諧。', 'primary')}
          </div>
        </div>
      </section>

      {/* Footer Info Section */}
      <section className="w-full bg-[#1a3323] py-12 border-t border-guild-border">
          <div className="max-w-4xl mx-auto px-6 text-center">
              <h4 className="text-white text-xl font-bold mb-4">你的靈魂正在呼喚...</h4>
              <p className="text-[#90cbad] mb-8">透過我們的性格測驗，你不僅能了解自己的型號，還能開啟在 TraitQuest 中的專屬種族技能。</p>
              <button
                className="inline-flex cursor-pointer items-center justify-center rounded-full h-12 px-10 bg-primary text-[#10231a] text-base font-bold shadow-[0_0_20px_rgba(11,218,115,0.5)] hover:shadow-[0_0_30px_rgba(11,218,115,0.8)] transition-all"
                onClick={() => window.location.href = '/questionnaire'}
              >
                立即覺醒
              </button>
          </div>
      </section>
    </IntroLayout>
  )
}

function renderRaceCard(type: string, race: string, desc: string, color: string) {
    return (
        <div className="bg-[#1a3323] p-6 rounded-2xl border border-guild-border hover:border-primary transition-all group overflow-hidden relative">
            <div className="absolute -right-4 -bottom-4 size-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
            <h4 className="text-[#90cbad] text-xs font-bold uppercase mb-1">{type}</h4>
            <h3 className="text-white text-xl font-black mb-2 group-hover:text-primary transition-colors">{race}</h3>
            <p className="text-gray-400 text-sm group-hover:text-gray-200 transition-colors">{desc}</p>
        </div>
    )
}

export default EnneagramIntro
