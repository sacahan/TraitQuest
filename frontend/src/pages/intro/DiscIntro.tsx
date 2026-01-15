import React from 'react'
import AppLayout from '../../layout/AppLayout'

const DiscIntro: React.FC = () => {
  return (
    <AppLayout>
      {/* Hero Section */}
      <div className="w-full max-w-[1200px] px-4 py-10 md:px-6 lg:py-20">
        <div className="flex flex-col-reverse lg:flex-row gap-10 items-center">
          <div className="flex flex-col gap-6 flex-1 text-center lg:text-left items-center lg:items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-guild-border text-primary text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(11,218,115,0.2)]">
              <span className="material-symbols-outlined text-sm">swords</span>
              DISC 戰鬥叢林
            </div>
            <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
              修煉你的<span className="text-primary drop-shadow-[0_0_10px_rgba(11,218,115,0.5)]">戰鬥流派</span>
            </h1>
            <p className="text-[#90cbad] text-base md:text-lg max-w-[600px] leading-relaxed">
              DISC 模式定義了你在壓力下的行為反應。在 TraitQuest 中，這決定了你在戰鬥中的陣型位置與反應速度。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
              <button
                className="flex cursor-pointer items-center justify-center rounded-full h-12 px-8 bg-primary text-[#10231a] text-base font-bold shadow-[0_0_20px_rgba(11,218,115,0.5)] hover:shadow-[0_0_30px_rgba(11,218,115,0.8)] transition-all w-full sm:w-auto group animate-breathing-glow"
                onClick={() => window.location.href = '/launch?type=disc'}
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
              style={{ backgroundImage: 'url("/assets/images/disc_cover.webp")' }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#102219] via-transparent to-transparent opacity-80"></div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 bg-[#102219]/90 border border-[#31684d] p-4 rounded-xl backdrop-blur-sm">
              <div className="flex gap-3 items-center">
                <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary text-primary animate-pulse">
                  <span className="material-symbols-outlined">bolt</span>
                </div>
                <div>
                  <p className="text-xs text-[#90cbad]">架勢監控</p>
                  <p className="text-sm font-bold text-white">正在分析你的行為模式...</p>
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
            <h3 className="text-white text-3xl font-bold">DISC：行為的四重奏</h3>
            <p className="text-[#e0eadd] text-lg leading-relaxed">
              DISC 模式由心理學家威廉·馬斯頓 (William Marston) 所建立，旨在描述人類在不同環境下的行為反應。
            </p>
            <div className="space-y-4">
              {[
                "反應風格：面對挑戰、人際、節奏與規範時的自然傾向。",
                "戰略適應：了解自己的架勢，能在不同戰場切換最有效的戰術。",
                "能量管理：在適合自己風格的崗位上，魔力消耗最少。"
              ].map((text, i) => (
                <div key={i} className="flex gap-4">
                  <div className="shrink-0 size-8 rounded-full bg-[#31684d] flex items-center justify-center text-primary font-bold">{i + 1}</div>
                  <p className="text-[#90cbad]">{text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 w-full max-w-[500px]">
            <div className="bg-[#102219] border border-[#31684d] rounded-xl p-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/50"></div>
              <div className="flex items-center gap-4 mb-6">
                <div className="size-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-2xl">radar</span>
                </div>
                <div>
                  <h4 className="text-white font-bold">Stance Radar</h4>
                  <p className="text-[#90cbad] text-xs">即時行為捕捉中...</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-[#1a3323] border border-red-500/20">
                  <div className="text-red-400 text-[14px] font-bold uppercase mb-1">D - 掌控</div>
                  <div className="h-1 w-full bg-red-900/30 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 w-[70%]" style={{ animation: 'grow 2s ease-out' }}></div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#1a3323] border border-yellow-500/20">
                  <div className="text-yellow-400 text-[14px] font-bold uppercase mb-1">I - 影響</div>
                  <div className="h-1 w-full bg-yellow-900/30 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 w-[85%]" style={{ animation: 'grow 2s ease-out 0.2s' }}></div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#1a3323] border border-green-500/20">
                  <div className="text-green-400 text-[14px] font-bold uppercase mb-1">S - 穩定</div>
                  <div className="h-1 w-full bg-green-900/30 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[45%]" style={{ animation: 'grow 2s ease-out 0.4s' }}></div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#1a3323] border border-blue-500/20">
                  <div className="text-blue-400 text-[14px] font-bold uppercase mb-1">C - 遵從</div>
                  <div className="h-1 w-full bg-blue-900/30 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[60%]" style={{ animation: 'grow 2s ease-out 0.6s' }}></div>
                  </div>
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
            <h2 className="text-3xl md:text-5xl font-black text-white">四大優勢戰架</h2>
            <p className="text-[#90cbad] mt-4 max-w-2xl mx-auto leading-relaxed text-lg">
              每種架勢都有其獨特的作戰優勢與潛在弱點。在 TraitQuest 的世界中，協同不同戰架的朋友能產生強大的戰場羈絆。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {renderStanceCard('掌控 - Dominance', '烈焰戰姿', '快速進攻,以力量壓制對手。在戰場上是衝鋒陷陣的先鋒,擅長短時間內解決威脅。', 'red')}
            {renderStanceCard('影響 - Influence', '潮汐之歌', '激勵隊友,以魅力掌控全場。你是戰場上的靈魂人物,擅長透過影響他人來掌控全局節奏。', 'yellow')}
            {renderStanceCard('穩守 - Steadiness', '大地磐石', '穩守陣地,以韌性保護夥伴。你是最可靠的後盾,能在持久戰中提供最穩定的支持與耐力。', 'green')}
            {renderStanceCard('分析 - Conscientiousness', '星辰軌跡', '佈下陷阱,以邏輯解構威脅。擅長分析戰況細節,對你來說,每一個精確的數據都是獲勝的關鍵。', 'blue')}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="w-full bg-[#102216] py-16 border-y-1 border-[#23482f] border-guild-border/50">
        <div className="w-full max-w-[1200px] px-4 mx-auto text-center">
          <h3 className="text-white text-3xl font-bold mb-6">為什麼需要 DISC？</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {renderFeatureItem('衝突排除', '了解對方的戰鬥節奏，減少組隊時的人員摩合。')}
            {renderFeatureItem('有效溝通', '學習用對方聽得懂的頻道發送指令，提升戰鬥效率。')}
            {renderFeatureItem('職務匹配', '將最適合的人放在最適合的位置，不論是坦、補還是打。')}
            {renderFeatureItem('自我成長', '察覺自己的行為盲點，解鎖進階的人格形態。')}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full bg-[#102216] py-20 px-4">
        <div className="max-w-4xl mx-auto px-6 text-center bg-[#1a3323] p-10 rounded-3xl border-2 border-primary shadow-[0_0_30px_rgba(17,212,82,0.2)]">
          <h3 className="text-white text-4xl font-black mb-4">你的戰鬥架勢是什麼？</h3>
          <p className="text-[#90cbad] text-lg mb-8">透過 TraitQuest 獨家的心理地圖，找出你在壓力下的最佳戰鬥姿態。</p>
          <button
            className="flex cursor-pointer items-center justify-center rounded-full h-14 px-12 bg-primary text-[#10231a] text-lg font-black shadow-[0_0_20px_rgba(11,218,115,0.5)] hover:shadow-[0_0_40px_rgba(11,218,115,0.8)] transition-all mx-auto"
            onClick={() => window.location.href = '/launch?type=disc'}
          >
            解鎖戰鬥架勢
          </button>
        </div>
      </section>
    </AppLayout>
  )
}

function renderStanceCard(type: string, title: string, desc: string, color: string) {
  const colorMap: any = {
    red: 'border-red-500/30 hover:border-red-500 shadow-red-500/5 hover:shadow-red-500/20 bg-red-950/20 text-red-400',
    yellow: 'border-yellow-500/30 hover:border-yellow-500 shadow-yellow-500/5 hover:shadow-yellow-500/20 bg-yellow-950/20 text-yellow-400',
    green: 'border-primary/30 hover:border-primary shadow-primary/5 hover:shadow-primary/20 bg-green-950/20 text-primary',
    blue: 'border-blue-500/30 hover:border-blue-500 shadow-blue-500/5 hover:shadow-blue-500/20 bg-blue-950/20 text-blue-400',
  }

  const imageKeyMap: any = {
    red: 'd',
    yellow: 'i',
    green: 's',
    blue: 'c'
  }

  const imageSrc = `/assets/images/stances/stn_${imageKeyMap[color]}.webp`;

  return (
    <div className={`relative p-8 rounded-3xl border-2 transition-all duration-500 group overflow-hidden ${colorMap[color]}`}>
      {/* Background Watermark */}
      <div className="absolute -right-12 -bottom-12 w-64 h-64 opacity-[0.05] group-hover:opacity-[0.15] transition-all duration-500 pointer-events-none grayscale group-hover:grayscale-0 mix-blend-overlay group-hover:mix-blend-normal">
        <img src={imageSrc} alt="" className="w-full h-full object-contain transform rotate-12 scale-125 transition-transform" />
      </div>

      <div className="relative z-10 flex items-start gap-6">
        <div className="size-20 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform overflow-hidden shadow-inner">
          <img src={imageSrc} alt={title} className="w-full h-full object-cover" />
        </div>
        <div>
          <div className="text-xs font-bold tracking-[0.2em] uppercase mb-1 opacity-70">{type}</div>
          <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
          <p className="text-gray-400 group-hover:text-gray-200 transition-colors leading-relaxed text-sm">
            {desc}
          </p>
        </div>
      </div>
    </div>
  )
}

function renderFeatureItem(title: string, desc: string) {
  return (
    <div className="p-6 rounded-xl bg-surface border border-guild-border hover:border-primary transition-colors">
      <h4 className="text-white font-bold mb-2">{title}</h4>
      <p className="text-[#90cbad] text-sm">{desc}</p>
    </div>
  )
}

export default DiscIntro
