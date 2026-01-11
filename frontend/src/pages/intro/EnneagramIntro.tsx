import React from 'react'
import AppLayout from '../../layout/AppLayout'

const EnneagramIntro: React.FC = () => {
  return (
    <AppLayout>
      {/* Hero Section */}
      <div className="w-full max-w-[1200px] px-4 py-10 md:px-6 lg:py-20">
        <div className="flex flex-col-reverse lg:flex-row gap-10 items-center">
          <div className="flex flex-col gap-6 flex-1 text-center lg:text-left items-center lg:items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-guild-border text-primary text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(11,218,115,0.2)]">
              <span className="material-symbols-outlined text-sm">stars</span>
              Enneagram 冥想塔
            </div>
            <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
              揭露你的<span className="text-primary drop-shadow-[0_0_10px_rgba(11,218,115,0.5)]">靈魂種族</span>
            </h1>
            <p className="text-[#90cbad] text-base md:text-lg max-w-[600px] leading-relaxed">
              Enneagram（九型人格）定義了你內心最深處的恐懼與欲望。在 TraitQuest 中，這決定了你所屬的種族源流。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
              <button
                className="flex cursor-pointer items-center justify-center rounded-full h-12 px-8 bg-primary text-[#10231a] text-base font-bold shadow-[0_0_20px_rgba(11,218,115,0.5)] hover:shadow-[0_0_30px_rgba(11,218,115,0.8)] transition-all w-full sm:w-auto group animate-breathing-glow"
                onClick={() => window.location.href = '/launch?type=enneagram'}
              >
                <span className="truncate group-hover:scale-105 transition-transform">進入副本</span>
              </button>
              <a
                href="#lore"
                className="flex cursor-pointer items-center justify-center rounded-full h-12 px-8 bg-surface-dark border border-surface-border text-white text-base font-bold hover:bg-[#1e4030] hover:border-primary/50 transition-colors w-full sm:w-auto"
              >
                <span className="truncate">了解更多</span>
              </a>
            </div>
          </div>
          <div className="flex-1 w-full max-w-[600px] aspect-square md:aspect-video lg:aspect-square relative rounded-2xl overflow-hidden shadow-2xl border-4 border-[#183426] group hover:border-primary/50 transition-colors duration-500">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: 'url("/assets/images/enneagram_cover.webp")' }}
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
      <div id="lore" className="w-full bg-[#112217] py-20 px-4 md:px-10 border-y-1 border-[#23482f]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a3323] border border-[#23482f] text-primary font-bold text-sm">
              <span className="material-symbols-outlined text-lg">menu_book</span>
              Guild Manual
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
            {renderRaceCard('1號：完美主義者', '鐵律之魂', '追求秩序與完美的靈魂，源自遠古法典之山。', 'primary')}
            {renderRaceCard('2號：給予者', '聖靈之魂', '渴望被愛與付出的靈魂，源自生命之泉。', 'primary')}
            {renderRaceCard('3號：成就者', '輝光之魂', '追求成就與注視的靈魂，源自永恆烈陽。', 'primary')}
            {renderRaceCard('4號：浪漫者', '幻影之魂', '沉浸於獨特與憂傷的靈魂，源自迷霧森林。', 'primary')}
            {renderRaceCard('5號：觀察者', '智者之魂', '渴求知識與觀察的靈魂，源自星辰圖書館。', 'primary')}
            {renderRaceCard('6號：懷疑論者', '堅盾之魂', '追求安全與忠誠的靈魂，源自地下堡壘。', 'primary')}
            {renderRaceCard('7號：享樂主義者', '秘風之魂', '追求自由與新奇的靈魂，源自流浪之雲。', 'primary')}
            {renderRaceCard('8號：挑戰者', '霸龍之魂', '追求力量與控制的靈魂，源自火山熔岩。', 'primary')}
            {renderRaceCard('9號：和平締造者', '蒼翠之魂', '追求和平與融合的靈魂，源自萬物母林。', 'primary')}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full bg-[#102216] py-20 border-t-1 border-[#23482f]">
        <div className="max-w-4xl mx-auto px-6 text-center bg-[#1a3323] p-10 rounded-3xl border-2 border-primary shadow-[0_0_30px_rgba(17,212,82,0.2)]">
          <h3 className="text-white text-4xl font-black mb-4">你的靈魂種族是什麼？</h3>
          <p className="text-[#90cbad] text-lg mb-8">透過 TraitQuest 獨家的心理地圖，找出你內心深處的核心動機與恐懼。</p>
              <button
            className="flex cursor-pointer items-center justify-center rounded-full h-14 px-12 bg-primary text-[#10231a] text-lg font-black shadow-[0_0_20px_rgba(11,218,115,0.5)] hover:shadow-[0_0_40px_rgba(11,218,115,0.8)] transition-all mx-auto"
            onClick={() => window.location.href = '/launch?type=enneagram'}
              >
            解鎖種族血脈
              </button>
          </div>
      </section>
    </AppLayout>
  )
}

function renderRaceCard(type: string, race: string, desc: string, _color: string) {
  const num = type.split('號')[0];
  const role = type.split('：')[1] || type;
  const imageSrc = `/assets/images/races/race_${num}.png`;

  return (
    <div className="relative group p-8 rounded-2xl bg-[#14261d] border border-white/5 hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(11,218,115,0.15)] overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 group-hover:to-primary/10 transition-all duration-500"></div>

      {/* Large Watermark Number */}
      <div className="absolute -right-6 -top-10 text-[140px] font-black text-white/[0.03] group-hover:text-primary/[0.08] transition-colors duration-500 select-none leading-none z-0 rotate-12">
        {num}
      </div>

      {/* Character Watermark */}
      <div className="absolute -right-8 -bottom-8 w-48 h-48 opacity-[0.1] group-hover:opacity-[0.25] transition-all duration-500 pointer-events-none grayscale group-hover:grayscale-0 mix-blend-overlay group-hover:mix-blend-normal">
        <img src={imageSrc} alt="" className="w-full h-full object-contain transform rotate-6 scale-110 group-hover:scale-125 transition-transform" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header: Avatar, Line & Number */}
        <div className="flex items-center gap-4 mb-6">
          <div className="size-16 rounded-xl bg-[#0d1c14] border border-white/10 p-1 group-hover:border-primary/50 transition-colors shadow-lg shrink-0 overflow-hidden">
            <img src={imageSrc} alt={race} className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-500" />
          </div>

          <div className="h-[1px] flex-1 bg-gradient-to-r from-primary/20 to-transparent"></div>

          <span className="inline-flex items-center justify-center size-8 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-black group-hover:bg-primary group-hover:text-[#10231a] transition-all duration-300 shadow-[0_0_10px_rgba(11,218,115,0.2)]">
            {num}
          </span>
        </div>

        {/* Race Name */}
        <h3 className="text-3xl font-black text-white mb-2 group-hover:text-primary transition-colors tracking-tight drop-shadow-sm">
          {race}
        </h3>

        {/* Role Name Subtitle */}
        <div className="text-[#90cbad] text-xs font-bold uppercase tracking-[0.2em] mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
          {role}
        </div>

        {/* Description */}
        <p className="text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4 mt-auto group-hover:text-gray-200 transition-colors">
          {desc}
        </p>
      </div>
    </div>
  )
}

export default EnneagramIntro
