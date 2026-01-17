import React from 'react'
import AppLayout from '../../layout/AppLayout'

const BigFiveIntro: React.FC = () => {
  return (
    <AppLayout>
      {/* Hero Section */}
      <div className="w-full max-w-[1200px] px-4 py-10 md:px-6 lg:py-20">
        <div className="flex flex-col-reverse lg:flex-row gap-10 items-center">
          <div className="flex flex-col gap-6 flex-1 text-center lg:text-left items-center lg:items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-guild-border text-primary text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(11,218,115,0.2)]">
              <span className="material-symbols-outlined text-sm">water_drop</span>
              Big Five 能量場
            </div>
            <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
              你的性格，決定你的
              <span className="text-primary drop-shadow-[0_0_10px_rgba(11,218,115,0.5)]">角色屬性</span>
            </h1>
            <p className="text-[#90cbad] text-base md:text-lg max-w-[600px] leading-relaxed">
              TraitQuest 將經典的 Big Five 人格理論轉化為五大冒險屬性。查看下方的屬性對照表，找出你潛在的戰鬥天賦！
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
              <button
                className="flex cursor-pointer items-center justify-center rounded-full h-12 px-8 bg-primary text-[#10231a] text-base font-bold shadow-[0_0_20px_rgba(11,218,115,0.5)] hover:shadow-[0_0_30px_rgba(11,218,115,0.8)] transition-all w-full sm:w-auto group animate-breathing-glow"
                onClick={() => window.location.href = '/launch?type=bigfive'}
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
              style={{ backgroundImage: 'url("/assets/images/big5_cover.webp")' }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#102219] via-transparent to-transparent opacity-80"></div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 bg-[#102219]/90 border border-[#31684d] p-4 rounded-xl backdrop-blur-sm">
              <div className="flex gap-3 items-center">
                <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary text-primary animate-pulse">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <div>
                  <p className="text-xs text-[#90cbad]">系統提示</p>
                  <p className="text-sm font-bold text-white">準備好領取你的初始屬性了嗎？</p>
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
            <h3 className="text-white text-3xl font-bold">科學實證的角色發展</h3>
            <p className="text-[#e0eadd] text-lg leading-relaxed">
              在心理學界，Big Five 是目前最具科學實證基礎的人格特質模型。它不是單純的標籤，而是五個光譜維度。在 TraitQuest 的世界裡，我們將這些維度具象化為你的角色屬性。
            </p>
            <div className="space-y-4">
              {[
                "個性即戰力：你的每個性格傾向都對應特定的戰鬥屬性。",
                "光譜平衡：沒有絕對的好壞，只有不同的職能定位。",
                "動態成長：透過對自我的認知，開啟潛在的技能分支。"
              ].map((text, i) => (
                <div key={i} className="flex gap-4">
                  <div className="shrink-0 size-8 rounded-full bg-[#31684d] flex items-center justify-center text-primary font-bold">{i + 1}</div>
                  <p className="text-[#90cbad]">{text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 w-full max-w-[500px]">
            <div className="bg-[#102219] border border-[#31684d] rounded-xl p-6 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="flex justify-between items-center mb-4 border-b border-[#31684d] pb-2">
                <span className="text-xs text-[#90cbad]">System.log</span>
                <div className="flex gap-1">
                  <div className="size-2 rounded-full bg-red-500"></div>
                  <div className="size-2 rounded-full bg-yellow-500"></div>
                  <div className="size-2 rounded-full bg-green-500"></div>
                </div>
              </div>
              <div className="space-y-2 font-mono text-xs md:text-sm text-primary/80">
                <p>&gt; Analyzing Big Five Dimensions...</p>
                <p>&gt; OCEAN Model detected.</p>
                <p>&gt; Tip: <span className="text-white italic">「大五人格常被比喻為海洋生物 (OCEAN) 來便於理解，例如將高親和性者比作暖心的『海豚』，將高盡責性者比作目標精準的『劍魚』。」</span></p>
                <p>&gt; Syncing stats with RPG database...</p>
                <p className="animate-pulse">&gt; Initialization complete.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <section className="py-20 px-4 md:px-10 bg-[#0d1a12] relative overflow-hidden w-full">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <span className="text-primary font-bold tracking-[0.2em] text-xs uppercase mb-2 block animate-pulse">System Sync</span>
            <h2 className="text-3xl md:text-4xl font-black text-white">屬性轉化對照表</h2>
            <p className="text-[#90cbad] mt-2">Personality to Stats Conversion</p>
          </div>
          <div className="flex flex-col gap-6">
            {renderTraitRow('開放性', 'Openness', '智力', 'INT', '魔法與知識的泉源。', '高開放性代表你對新觀念的接受度極高，如同擁有無限魔力的法師。你善於學習新技能，能迅速理解複雜的魔法理論。', 'auto_awesome', 'blue')}
            {renderTraitRow('盡責性', 'Conscientiousness', '防禦', 'DEF', '堅不可摧的自律之盾。', '高盡責性轉化為強大的物理防禦。透過周全的計畫與執行力，你能像重裝騎士般為隊伍抵擋混亂。', 'assignment_turned_in', 'yellow')}
            {renderTraitRow('外向性', 'Extraversion', '速度', 'SPD', '迅捷的社交反應力。', '高外向性賦予你極高的敏捷度。你總是充滿能量，能快速發起話題並帶動節奏。', 'local_fire_department', 'red')}
            {renderTraitRow('親和性', 'Agreeableness', '魅力', 'CHA', '治癒人心的光環。', '高親和性是對應魅力的關鍵屬性。你能團結隊伍，獲得 NPC 的好感，是公會中最受歡迎的力量。', 'volunteer_activism', 'pink')}
            {renderTraitRow('神經質', 'Neuroticism', '洞察', 'INS', '預知危險的第六感。', '雖然情緒波動如暗影，但這讓你比任何人更早察覺迷宮中的陷阱與危機。', 'thunderstorm', 'purple')}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="w-full bg-[#0d1c14] py-16 border-y-1 border-[#23482f]">
        <div className="w-full max-w-[1200px] px-4 md:px-6 mx-auto">
          <div className="flex flex-col gap-2 mb-10 text-center">
            <h2 className="text-primary text-sm font-bold tracking-widest uppercase">Benefits</h2>
            <h3 className="text-white text-3xl font-bold">解鎖你的冒險潛能</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {renderBenefitCard('analytics', '深度自我覺察', '透過科學模型，了解自己在壓力下的防禦機制與天賦優勢。')}
            {renderBenefitCard('groups', '團隊職能定位', '找出你在公會中最適合的角色，不論是開拓者還是守護者。')}
            {renderBenefitCard('trending_up', '屬性優化指南', '獲得具體的「技能點建議」，提升你的社交與執行效率。')}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full bg-[#102216] py-20 px-4">
        <div className="max-w-4xl mx-auto px-6 text-center bg-[#1a3323] p-10 rounded-3xl border-2 border-primary shadow-[0_0_30px_rgba(17,212,82,0.2)]">
          <h3 className="text-white text-4xl font-black mb-4">你的屬性是什麼？</h3>
          <p className="text-[#90cbad] text-lg mb-8">透過 TraitQuest 獨家的心理地圖，找出你的五大核心屬性配置。</p>
          <button
            className="flex cursor-pointer items-center justify-center rounded-full h-14 px-12 bg-primary text-[#10231a] text-lg font-black shadow-[0_0_20px_rgba(11,218,115,0.5)] hover:shadow-[0_0_40px_rgba(11,218,115,0.8)] transition-all mx-auto"
            onClick={() => window.location.href = '/launch?type=bigfive'}
          >
            解鎖屬性面板
          </button>
        </div>
      </section>
    </AppLayout>
  )
}

function renderTraitRow(trait: string, traitEn: string, stat: string, statAbbr: string, summary: string, detail: string, icon: string, color: string) {
  const colorMap: Record<string, string> = {
    blue: 'from-blue-900/20 group-hover:from-blue-900/40 border-blue-500/30 text-blue-400 group-hover:text-blue-300',
    yellow: 'from-yellow-900/20 group-hover:from-yellow-900/40 border-yellow-500/30 text-yellow-400 group-hover:text-yellow-300',
    red: 'from-red-900/20 group-hover:from-red-900/40 border-red-500/30 text-red-400 group-hover:text-red-300',
    pink: 'from-pink-900/20 group-hover:from-pink-900/40 border-pink-500/30 text-pink-400 group-hover:text-pink-300',
    purple: 'from-purple-900/20 group-hover:from-purple-900/40 border-purple-500/30 text-purple-400 group-hover:text-purple-300'
  }

  return (
    <div className={`group relative bg-[#193322] border-2 border-[#23482f] rounded-xl overflow-hidden transition-all duration-300`}>
      <div className={`absolute top-0 right-0 w-32 h-full bg-gradient-to-l ${colorMap[color].split(' ')[0]} to-transparent pointer-events-none transition-opacity duration-300 ${colorMap[color].split(' ')[1]}`}></div>
      <div className="flex flex-col md:flex-row h-full">
        <div className="w-full md:w-1/3 p-6 flex items-center border-b md:border-b-0 md:border-r border-[#23482f] bg-[#14261b]">
          <div className="flex items-center gap-4">
            <div className={`size-12 rounded-lg bg-opacity-10 border flex items-center justify-center ${colorMap[color].split(' ')[2]} ${colorMap[color].split(' ')[3]}`}>
              <span className="material-symbols-outlined text-2xl">{icon}</span>
            </div>
            <div>
              <div className={`text-xs font-bold tracking-wider mb-0.5 ${colorMap[color].split(' ')[3]}`}>{traitEn}</div>
              <h3 className={`text-xl font-bold text-white transition-colors ${colorMap[color].split(' ')[4]}`}>{trait}</h3>
            </div>
          </div>
        </div>
        <div className="w-full md:w-2/3 p-6 flex flex-col justify-center">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className={`text-3xl font-black font-display transition-all ${colorMap[color].split(' ')[3]}`}>{stat}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold bg-opacity-20 border ${colorMap[color].split(' ')[3]} bg-current`}>
                <p className="text-white">{statAbbr}</p>
              </span>
            </div>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            <strong className="text-white">{summary}</strong><br />
            {detail}
          </p>
        </div>
      </div>
    </div>
  )
}

function renderBenefitCard(icon: string, title: string, desc: string) {
  return (
    <div className="bg-[#1a3323] p-6 rounded-2xl border border-[#23482f] hover:border-primary transition-colors">
      <span className="material-symbols-outlined text-primary text-4xl mb-4">{icon}</span>
      <h4 className="text-white text-xl font-bold mb-2">{title}</h4>
      <p className="text-[#90cbad]">{desc}</p>
    </div>
  )
}

export default BigFiveIntro
