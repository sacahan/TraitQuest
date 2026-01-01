import React from 'react'
import IntroLayout from '../../components/layout/IntroLayout'

const GallupIntro: React.FC = () => {
  return (
    <IntroLayout title="Gallup 介紹">
      {/* Hero Section */}
      <div className="w-full max-w-[1200px] px-4 py-10 md:px-6 lg:py-20">
        <div className="flex flex-col-reverse lg:flex-row gap-10 items-center">
          <div className="flex flex-col gap-6 flex-1 text-center lg:text-left items-center lg:items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-guild-border text-primary text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(11,218,115,0.2)]">
              <span className="material-symbols-outlined text-sm">stars</span>
              蓋洛普天賦優勢
            </div>
            <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
              覺醒你的<span className="text-primary drop-shadow-[0_0_10px_rgba(11,218,115,0.5)]">傳奇技能 (Talent)</span>
            </h1>
            <p className="text-[#90cbad] text-base md:text-lg max-w-[600px] leading-relaxed">
              Gallup 克利夫頓優勢定義了你與生俱來的卓越天賦。在 TraitQuest 中，這些天賦將轉化為你的專屬主動與被動技能。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
              <button
                className="flex cursor-pointer items-center justify-center rounded-full h-12 px-8 bg-primary text-[#10231a] text-base font-bold shadow-[0_0_20px_rgba(11,218,115,0.5)] hover:shadow-[0_0_30px_rgba(11,218,115,0.8)] transition-all w-full sm:w-auto group"
                onClick={() => window.location.href = '/questionnaire'}
              >
                <span className="truncate group-hover:scale-105 transition-transform">覺醒天賦技能</span>
              </button>
              <a
                href="#lore"
                className="flex cursor-pointer items-center justify-center rounded-full h-12 px-8 bg-surface-dark border border-surface-border text-white text-base font-bold hover:bg-[#1e4030] hover:border-primary/50 transition-colors w-full sm:w-auto"
              >
                <span className="truncate">查看技能圖譜</span>
              </a>
            </div>
          </div>
          <div className="flex-1 w-full max-w-[600px] aspect-square md:aspect-video lg:aspect-square relative rounded-2xl overflow-hidden shadow-2xl border-4 border-[#183426] group hover:border-primary/50 transition-colors duration-500">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBeI175iPyP_t8S_Q_9W_9I_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P_6P")' }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#102219] via-transparent to-transparent opacity-80"></div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 bg-[#102219]/90 border border-[#31684d] p-4 rounded-xl backdrop-blur-sm">
              <div className="flex gap-3 items-center">
                <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary text-primary animate-pulse">
                  <span className="material-symbols-outlined">auto_awesome</span>
                </div>
                <div>
                  <p className="text-xs text-[#90cbad]">技能掃描</p>
                  <p className="text-sm font-bold text-white">正在識別你的核心優勢...</p>
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
              <span className="material-symbols-outlined text-lg">workspace_premium</span>
              Legacy Skills
            </div>
            <h3 className="text-white text-3xl font-bold">蓋洛普：專注於卓越</h3>
            <p className="text-[#e0eadd] text-lg leading-relaxed">
              蓋洛普天賦優勢 (CliftonStrengths) 告訴我們：修補弱點只能讓你平庸，發揮優勢才能讓你傑出。
            </p>
            <div className="space-y-4">
              {[
                "天賦才華：你與生俱來的思考、感覺或行為模式。",
                "技能轉化：將天賦投資於練習與知識，轉化為真正的核心實力。",
                "卓越巔峰：在你的優勢領域中，你就是戰場上的絕對 VIP。"
              ].map((text, i) => (
                <div key={i} className="flex gap-4">
                  <div className="shrink-0 size-8 rounded-full bg-[#31684d] flex items-center justify-center text-primary font-bold">{i + 1}</div>
                  <p className="text-[#90cbad]">{text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 w-full max-w-[500px]">
             <div className="grid grid-cols-2 gap-4">
                {renderTalentTypeCard('執行力', 'Executing', '完成任務', 'blue')}
                {renderTalentTypeCard('影響力', 'Influencing', '引導他人', 'red')}
                {renderTalentTypeCard('關係建立', 'Relating', '凝聚團隊', 'primary')}
                {renderTalentTypeCard('戰略思考', 'Thinking', '分析與計畫', 'yellow')}
             </div>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <section className="py-20 px-4 md:px-10 bg-[#0d1a12] relative overflow-hidden w-full">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white">四大優勢領域</h2>
            <p className="text-[#90cbad] mt-4 max-w-2xl mx-auto leading-relaxed">
              34 項天賦被歸類為四大領域。每個人都有其獨特的「前五大天賦」組合，這就是你的傳奇技能樹。
            </p>
          </div>
          
          <div className="space-y-6">
            {renderTalentRow('執行力 (Executing)', '讓事情發生。當你需要把想法轉化為行動時，執行力領域的天賦能確保任務準時在最終期限前達成。', 'blue', ['成就', '統籌', '信仰', '公平', '審慎', '紀律', '專注', '責任', '排難'])}
            {renderTalentRow('影響力 (Influencing)', '主導局面。這些天賦幫助你向外發聲，確保你的團隊被聽見，並推動他人跟隨你的視野。', 'red', ['行動', '自信', '掌控', '溝通', '競爭', '追求', '取悅'])}
            {renderTalentRow('關係建立 (Relationship)', '最強凝聚力。幫助團隊超越個體的總和，在充滿挑戰的冒險中保持團結一致。', 'primary', ['適應', '關聯', '信念', '伯樂', '體諒', '和諧', '包容', '個別', '積極', '交往'])}
            {renderTalentRow('戰略思考 (Strategic Thinking)', '洞察未來。幫助隊伍吸收與處理資訊，在複雜的局勢中做出最佳的決策與判斷。', 'yellow', ['分析', '脈絡', '遠見', '理念', '蒐集', '思維', '學習', '戰略'])}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full bg-[#102216] py-20">
          <div className="max-w-4xl mx-auto px-6 text-center bg-[#1a3323] p-10 rounded-3xl border-2 border-primary shadow-[0_0_30px_rgba(17,212,82,0.2)]">
              <h3 className="text-white text-4xl font-black mb-4">你的最強技能是什麽？</h3>
              <p className="text-[#90cbad] text-lg mb-8">透過 TraitQuest 獨家的心理地圖，找出你位於頂峰的 5 項傳奇技能。</p>
              <button
                className="flex cursor-pointer items-center justify-center rounded-full h-14 px-12 bg-primary text-[#10231a] text-lg font-black shadow-[0_0_20px_rgba(11,218,115,0.5)] hover:shadow-[0_0_40px_rgba(11,218,115,0.8)] transition-all mx-auto"
                onClick={() => window.location.href = '/questionnaire'}
              >
                解鎖技能樹
              </button>
          </div>
      </section>
    </IntroLayout>
  )
}

function renderTalentTypeCard(title: string, sub: string, desc: string, color: string) {
    const colorMap: any = {
        blue: 'border-blue-500/30 text-blue-400',
        red: 'border-red-500/30 text-red-400',
        primary: 'border-primary/30 text-primary',
        yellow: 'border-yellow-500/30 text-yellow-400'
    }

    return (
        <div className={`p-5 rounded-xl bg-[#1a3323] border ${colorMap[color]} text-center group hover:scale-105 transition-transform`}>
            <div className="text-xs font-bold uppercase opacity-70 mb-1">{sub}</div>
            <h4 className="text-white text-lg font-bold mb-2">{title}</h4>
            <p className="text-[#90cbad] text-[10px] leading-tight opacity-0 group-hover:opacity-100 transition-opacity">{desc}</p>
        </div>
    )
}

function renderTalentRow(title: string, desc: string, color: string, talents: string[]) {
    const colorMap: any = {
        blue: 'border-blue-500/30 bg-blue-950/10 text-blue-400',
        red: 'border-red-500/30 bg-red-950/10 text-red-400',
        primary: 'border-primary/30 bg-green-950/10 text-primary',
        yellow: 'border-yellow-500/30 bg-yellow-950/10 text-yellow-400'
    }

    return (
        <div className={`p-8 rounded-2xl border-2 ${colorMap[color]} group`}>
            <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/3">
                    <h3 className="text-2xl font-black text-white mb-3">{title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                </div>
                <div className="w-full md:w-2/3">
                    <div className="flex flex-wrap gap-2">
                        {talents.map(t => (
                            <span key={t} className={`px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs font-bold hover:border-current transition-colors cursor-default`}>
                                {t}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default GallupIntro
