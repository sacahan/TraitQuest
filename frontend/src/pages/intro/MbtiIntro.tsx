import React from 'react'
import AppLayout from '../../layout/AppLayout'

const MbtiIntro: React.FC = () => {
  return (
    <AppLayout>
      <div className="w-full max-w-[1200px] px-4 py-10 md:px-6 lg:py-20">
        <div className="flex flex-col-reverse lg:flex-row gap-10 items-center">
          <div className="flex flex-col gap-6 flex-1 text-center lg:text-left items-center lg:items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-guild-border text-primary text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(11,218,115,0.2)]">
              <span className="material-symbols-outlined text-sm">psychology</span>
              MBTI 聖殿
            </div>
            <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
              探索你的<span className="text-primary drop-shadow-[0_0_10px_rgba(11,218,115,0.5)]">英雄職業</span>
            </h1>
            <h2 className="text-[#90cbad] text-base md:text-lg max-w-[600px] leading-relaxed">
              TraitQuest 邀請你進入人格的冒險世界。透過 MBTI 理論了解你的潛在天賦，尋找你的最佳職業。
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
              <button
                className="flex cursor-pointer items-center justify-center rounded-full h-12 px-8 bg-primary text-[#10231a] text-base font-bold shadow-[0_0_20px_rgba(11,218,115,0.5)] hover:shadow-[0_0_30px_rgba(11,218,115,0.8)] transition-all w-full sm:w-auto group animate-breathing-glow"
                onClick={() => window.location.href = '/launch?type=mbti'}
              >
                <span className="truncate group-hover:scale-105 transition-transform">進入副本</span>
              </button>
              <a
                href="#lore"
                className="flex cursor-pointer items-center justify-center rounded-full h-12 px-8 bg-surface border border-guild-border text-white text-base font-bold hover:bg-[#1e4030] hover:border-primary/50 transition-colors w-full sm:w-auto"
              >
                <span className="truncate">了解更多</span>
              </a>
            </div>
          </div>
          <div className="flex-1 w-full max-w-[600px] aspect-square md:aspect-video lg:aspect-square relative rounded-2xl overflow-hidden shadow-2xl border-4 border-[#183426] group hover:border-primary/50 transition-colors duration-500">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: 'url("/assets/images/mbti_cover.webp")' }}
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
                  <p className="text-sm font-bold text-white">歡迎來到 TraitQuest 大陸，冒險者！</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lore Section */}
      <div id="lore" className="w-full bg-[#183426] border-y-1 border-[#23482f] py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#0bda73 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        <div className="w-full max-w-[1200px] px-6 mx-auto relative z-10 flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a3323] border border-[#23482f] text-primary font-bold text-sm">
              <span className="material-symbols-outlined text-lg">menu_book</span>
              Guild Manual
            </div>
            <h3 className="text-white text-3xl font-bold">榮格的心理功能理論</h3>
            <p className="text-[#e0eadd] text-lg leading-relaxed">
              MBTI 的基礎建立在心理學家卡爾·榮格 (Carl Jung) 的認知功能理論之上。
            </p>
            <div className="space-y-4">
              {[
                "每個人都有一套獨特的「技能組合」，決定了我們如何與世界互動。",
                "了解你的主導功能 (Dominant Function) 就像了解你的大招，能讓你發揮最大潛力。",
                "這不是將人分類的標籤，而是幫助你成長的地圖。"
              ].map((text, i) => (
                <div key={i} className="flex gap-4">
                  <div className="shrink-0 size-8 rounded-full bg-[#31684d] flex items-center justify-center text-primary font-bold">{i + 1}</div>
                  <p className="text-[#90cbad]">{text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 w-full">
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
                <p>&gt; Initializing Cognitive Functions...</p>
                <p>&gt; Loading <span className="text-white">Ni (Introverted Intuition)</span>... <span className="text-green-400">Done.</span></p>
                <p>&gt; Loading <span className="text-white">Fe (Extroverted Feeling)</span>... <span className="text-green-400">Done.</span></p>
                <p>&gt; Quote: <span className="text-white italic">「向外看的人在做夢；向內看的人才是清醒的。」</span></p>
                <p>&gt; Analyzing user compatibility...</p>
                <p className="animate-pulse">&gt; Ready to start adventure.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Archetypes Section */}
      <div className="w-full max-w-[1200px] px-4 md:px-6 py-16 lg:py-24" id="archetypes">
        <div className="text-center mb-12">
          <h2 className="text-primary text-sm font-bold tracking-widest uppercase mb-3">Class Selection</h2>
          <h3 className="text-white text-3xl md:text-4xl font-black mb-4">十六種冒險者職業 (Archetypes)</h3>
          <p className="text-[#90cbad] max-w-2xl mx-auto">
            四大陣營，十六種傳奇職業。在 TraitQuest 的世界中，你的性格代碼決定了你的戰鬥風格與天賦技能。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* 至高議會 */}
          <div className="flex flex-col gap-5">
            <div className="relative rounded-2xl overflow-hidden bg-[#2d1b3e] border border-purple-500/50 p-4 flex items-center gap-4 mb-2 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBkNo0-0lOo2kRHL5DKK8ePKXRdnIu8F98P37UCs-1TwU0V3SSqo6cPnCumGndb58a_ECeyxd9KKYQafj_SJKPpHViNiPmXZXFydV5gB1qsLMxxrrqAyRzs5IhjV2qv8SjwgqHKAtR1QsHlpd1FlO36-Ik4WVHCX8O6fYv_bFBQIw7tmjfl4Va_3TThXuzejdKoxmqnvmdIRGItxi5EI22cvzpNZSQLafSqENsmqu8FyWMHlNLSfYeC7CMDYNlHnOAoSL4bXX01oB9R")' }}></div>
              <div className="relative z-10 flex items-center gap-4 w-full">
                <div className="size-12 rounded-xl bg-purple-900/80 backdrop-blur-sm border border-purple-400/50 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-purple-300">psychology</span>
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg leading-none">至高議會</h4>
                  <p className="text-purple-400 text-[10px] font-bold tracking-widest uppercase mt-1">The Analysts</p>
                </div>
              </div>
            </div>
            {renderClassCard('INTJ', '建築師', '戰略法師', '富有想像力與戰略性的思想家，總是有計畫地對付 Boss。', 'purple', 'strategy')}
            {renderClassCard('INTP', '邏輯學家', '煉金術士', '對萬物充滿好奇的發明家，致力於研究世界運行的真理。', 'purple', 'science')}
            {renderClassCard('ENTJ', '指揮官', '領主騎士', '大膽、富有想像力且意志強大的領導者，總能找到開路的方法。', 'purple', 'military_tech')}
            {renderClassCard('ENTP', '辯論家', '混沌術士', '聰明好奇的思想者，無法抗拒智力挑戰與打破常規的誘惑。', 'purple', 'psychology')}
          </div>

          {/* 縱橫捭闔 */}
          <div className="flex flex-col gap-5">
            <div className="relative rounded-2xl overflow-hidden bg-[#1a382e] border border-primary/50 p-4 flex items-center gap-4 mb-2 shadow-[0_0_15px_rgba(11,218,115,0.2)]">
              <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBlDvE1vGhrQr6KuCHMCBCtphIEsq2VA_XaAvn6g32JqReEX5jBcqnH0Av6Lr2R5fMEqXW9nrNEtZOQp00BNmSNant6F4msjrGm4J5AKnLGMvCZpgT67UUR4wPXEFi2qNaO4jzre0jLUoDr8rHuyNa1DT8qQ_4V93W3fFT4sTFpen9sUuK-84pUBFh8pl7ENeO2NNdwOXL6fSylxtdfpkZz9PB_fslFRPuq2f2sYTyPu654NipNa-rvN6xDbbCUzMcb4OVbt7ntsaEv")' }}></div>
              <div className="relative z-10 flex items-center gap-4 w-full">
                <div className="size-12 rounded-xl bg-green-900/80 backdrop-blur-sm border border-primary/50 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary">spa</span>
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg leading-none">縱橫捭闔</h4>
                  <p className="text-primary text-[10px] font-bold tracking-widest uppercase mt-1">The Diplomats</p>
                </div>
              </div>
            </div>
            {renderClassCard('INFJ', '提倡者', '神聖牧師', '安靜而神秘，同時鼓舞人心且不知疲倦的理想主義者。', 'green', 'spa')}
            {renderClassCard('INFP', '調停者', '吟遊詩人', '詩意，善良的利他主義者，總是熱情地幫助隊友補血。', 'green', 'lyrics')}
            {renderClassCard('ENFJ', '主人公', '光明聖騎士', '富有魅力且鼓舞人心的領導者，有能力讓聽眾為之著迷。', 'green', 'shield')}
            {renderClassCard('ENFP', '競選者', '元素召喚師', '熱情，富有創造力愛社交的自由靈魂，總能找到微笑的理由。', 'green', 'auto_awesome')}
          </div>

          {/* 皇家守衛 */}
          <div className="flex flex-col gap-5">
            <div className="relative rounded-2xl overflow-hidden bg-[#152e3d] border border-blue-500/50 p-4 flex items-center gap-4 mb-2 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB0XHvlNp5wP-IqFa7urevzR2SmzpO5vVtwdmMaeC8sVtT23kizXut2fLKLin3hVJj841VbG_PJ7AoiS_DxYvcmNaero2Gh8J5KSBGJoW5Fo-KCk_80cbON34-rMBUKVCqMlzT7KH_qgnYf4gTwY8snUv4rETLlxBvzMf4bOLVKy-smDCggRTEyu5XfhsUqGDt7I0QS58CALRkMUkOLKca_LDCJxg_rqlu8hhNJbYbliq0CNNeeFQv7pfddYPDMt8YOBfg7fYJZdX6O")' }}></div>
              <div className="relative z-10 flex items-center gap-4 w-full">
                <div className="size-12 rounded-xl bg-blue-900/80 backdrop-blur-sm border border-blue-400/50 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-blue-300">shield</span>
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg leading-none">皇家守衛</h4>
                  <p className="text-blue-400 text-[10px] font-bold tracking-widest uppercase mt-1">The Sentinels</p>
                </div>
              </div>
            </div>
            {renderClassCard('ISTJ', '物流師', '重裝守衛', '事實求是，可靠的現實主義者，不願讓外物干擾自己的職責。', 'blue', 'inventory')}
            {renderClassCard('ISFJ', '守衛者', '守護治療師', '非常專注而溫暖的守護者，時刻準備著保護所愛之人。', 'blue', 'local_hospital')}
            {renderClassCard('ESTJ', '總經理', '秩序騎士', '出色的管理者，能夠在混亂的戰場上管理事情與人員。', 'blue', 'gavel')}
            {renderClassCard('ESFJ', '執政官', '輔助神官', '極有同情心，愛社交受歡迎的人，總是熱心提供幫助。', 'blue', 'diversity_3')}
          </div>

          {/* 探險聯盟 */}
          <div className="flex flex-col gap-5">
            <div className="relative rounded-2xl overflow-hidden bg-[#3d3115] border border-yellow-500/50 p-4 flex items-center gap-4 mb-2 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
              <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC0ZE0yM9MCA2gCB6rABbGTEITgSZn11-yck9Szsl_15zXUiNxPP9sQEvSqERR3me9x2sH6JKzHM22naZrkCqcvm9_DAhD0RjS43hPc82ssgR1Fe_6l31V3qw-qK9NebLMNxQcOFFXCzIEWMxZLuF5GFISlYWSEtmXF5l2mR_4jzeosK1BDIuyhZ6oz7QPL7c1gRmi4CBYt3U8F1NGFmHC--1oEbZp6zcFHDtDDU8e45Mzifg0PFd1ZR3-9KqsK2hwlmnauoEspNJ2C")' }}></div>
              <div className="relative z-10 flex items-center gap-4 w-full">
                <div className="size-12 rounded-xl bg-yellow-900/80 backdrop-blur-sm border border-yellow-400/50 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-yellow-300">construction</span>
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg leading-none">探險聯盟</h4>
                  <p className="text-yellow-400 text-[10px] font-bold tracking-widest uppercase mt-1">The Explorers</p>
                </div>
              </div>
            </div>
            {renderClassCard('ISTP', '鑑賞家', '武器工匠', '大膽而實際的實驗家，擅長使用所有形式的工具。', 'yellow', 'construction')}
            {renderClassCard('ISFP', '探險家', '森林遊俠', '靈活有魅力的藝術家，時刻準備著探索和體驗新鮮事物。', 'yellow', 'palette')}
            {renderClassCard('ESTP', '企業家', '暗影刺客', '聰明，精力充沛善於感知的人，真心享受冒險邊緣的生活。', 'yellow', 'bolt')}
            {renderClassCard('ESFP', '表演者', '幻術舞者', '自發性強，精力充沛且熱情的表演者，隊伍裡的氣氛擔當。', 'yellow', 'theater_comedy')}
          </div>
        </div>
      </div>

      {/* Attributes Section */}
      <section className="w-full bg-[#102216] py-16 border-y-1 border-[#23482f]">
        <div className="w-full max-w-[1200px] px-4 mx-auto">
          <div className="flex flex-col gap-2 mb-10 text-center">
            <h2 className="text-primary text-sm font-bold tracking-widest uppercase">Attributes</h2>
            <h3 className="text-white text-3xl font-bold">掌握你的心理維度屬性</h3>
            <p className="text-[#90cbad] max-w-[600px] mx-auto mt-2">如同 RPG 遊戲中的力量與敏捷，理解這四個維度能幫助你更有效地配置靈魂天賦。</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
            {renderAttrCard('E / I 能量來源', 'MANA RECOVERY', '外向', '內向', '透過社交獲取魔力，而', '則需要獨處來回復能量。', 'bolt', 'text-purple-400')}
            {renderAttrCard('S / N 感知模式', 'WORLD MAP', '實感', '直覺', '注重具體細節，而', '擅長預測隱藏路徑。', 'map', 'text-blue-400')}
            {renderAttrCard('T / F 決策依據', 'COMBAT STYLE', '思考', '情感', '依靠邏輯進行打擊，而', '則依賴價值觀守護隊友。', 'swords', 'text-red-400')}
            {renderAttrCard('J / P 行動風格', 'QUEST LOG', '判斷', '感知', '傾向有組織的計畫，而', '則更喜歡靈活應變。', 'event_note', 'text-yellow-400')}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full py-20 px-4">
        <div className="max-w-4xl mx-auto px-6 text-center bg-[#1a3323] p-10 rounded-3xl border-2 border-primary shadow-[0_0_30px_rgba(17,212,82,0.2)]">
          <h3 className="text-white text-4xl font-black mb-4">你的英雄職業是什麼？</h3>
          <p className="text-[#90cbad] text-lg mb-8">透過 TraitQuest 獨家的心理地圖，找出你的 16 型人格職業定位。</p>
          <button
            className="flex cursor-pointer items-center justify-center rounded-full h-14 px-12 bg-primary text-[#10231a] text-lg font-black shadow-[0_0_20px_rgba(11,218,115,0.5)] hover:shadow-[0_0_40px_rgba(11,218,115,0.8)] transition-all mx-auto"
            onClick={() => window.location.href = '/launch?type=mbti'}
          >
            解鎖職業天賦
          </button>
        </div>
      </section>
    </AppLayout>
  )
}

function renderClassCard(code: string, title: string, className: string, desc: string, color: string, _icon: string) {
  const colorMap: any = {
    purple: 'hover:border-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] text-purple-400',
    green: 'hover:border-primary hover:shadow-[0_0_20px_rgba(11,218,115,0.3)] text-primary',
    blue: 'hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] text-blue-400',
    yellow: 'hover:border-yellow-500 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] text-yellow-400'
  }

  const imageSrc = `/assets/images/classes/cls_${code.toLowerCase()}.webp`

  return (
    <div className={`group relative bg-[#183426] rounded-xl border-2 border-[#31684d] p-5 transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden ${colorMap[color]}`}>
      <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none select-none">
        <img src={imageSrc} alt="" className="w-32 h-32 object-cover transform -rotate-12 filter grayscale contrast-125" />
      </div>
      <div className="flex items-center gap-4 mb-3 relative z-10">
        <div className={`size-14 rounded-xl bg-[#0d1c14] border border-[#31684d] group-hover:border-current flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform duration-300 shadow-inner`}>
          <img src={imageSrc} alt={code} className="w-full h-full object-cover" />
        </div>
        <div>
          <h5 className="text-2xl font-black text-white leading-none mb-1">{code}</h5>
          <span className="text-[10px] uppercase font-bold tracking-widest bg-black/20 px-2 py-0.5 rounded">{title}</span>
        </div>
      </div>
      <div className="relative z-10 pl-1">
        <h6 className="text-white font-bold text-lg mb-1 group-hover:text-current transition-colors">{className}</h6>
        <p className="text-xs text-[#90cbad] leading-relaxed group-hover:text-white/80 transition-colors">{desc}</p>
      </div>
    </div>
  )
}

function renderAttrCard(title: string, sub: string, v1: string, v2: string, d1: string, d2: string, icon: string, iconColor: string) {
  return (
    <div className="bg-surface p-6 rounded-2xl border border-guild-border hover:border-primary transition-colors flex flex-col gap-4 group">
      <span className={`material-symbols-outlined ${iconColor} text-4xl group-hover:scale-110 transition-transform`}>{icon}</span>
      <div>
        <h4 className="text-white text-xl font-bold mb-1">{title}</h4>
        <div className={`text-[10px] font-bold ${iconColor} tracking-widest uppercase mb-2`}>{sub}</div>
        <p className="text-[#90cbad] text-sm leading-relaxed">
          <span className="text-white font-medium">{v1}</span> {d1} <span className="text-white font-medium">{v2}</span> {d2}
        </p>
      </div>
    </div>
  )
}

export default MbtiIntro
