import React from 'react';

interface DestinyGuideProps {
  guide: {
    daily?: { title: string; content: string } | string;
    main?: { title: string; content: string } | string;
    side?: { title: string; content: string } | string;
    oracle?: string;
  };
}

const DestinyGuide: React.FC<DestinyGuideProps> = ({ guide }) => {
  const getGuideContent = (item: any, defaultContent: string) => {
    if (typeof item === 'string') return item;
    return item?.content || defaultContent;
  };

  const dailyContent = getGuideContent(guide.daily, "尚未獲取每日啟示...");
  const mainContent = getGuideContent(guide.main, "尚未獲取主線指引...");
  const sideContent = getGuideContent(guide.side, "尚未獲取支線指引...");
  const oracle = guide.oracle || "「真實，隱藏在光與影的交錯之間。」";

  return (
    <div className="flex flex-col gap-3">
      {/* Daily Oracle */}
      <div className="bg-[#0e1f15] p-4 rounded-xl border border-white/5 hover:border-primary/30 hover:bg-[#12241a] transition-all group cursor-pointer flex items-center gap-4">
        <div className="hidden sm:flex size-10 rounded-full bg-primary/10 items-center justify-center shrink-0 border border-primary/20">
          <span className="material-symbols-outlined text-primary">calendar_month</span>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <div className="bg-primary/10 text-primary text-[16px] font-bold px-2 py-0.5 rounded border border-primary/20 uppercase">每日實踐</div>
          </div>
          <p className="text-gray-300 text-[16px] leading-relaxed italic font-serif">{dailyContent}</p>
        </div>
      </div>

      {/* Main Quest */}
      <div className="bg-[#0e1f15] p-4 rounded-xl border border-white/5 hover:border-amber-500/30 hover:bg-[#1f1a0e] transition-all group cursor-pointer flex items-center gap-4">
        <div className="hidden sm:flex size-10 rounded-full bg-amber-500/10 items-center justify-center shrink-0 border border-amber-500/20">
          <span className="material-symbols-outlined text-amber-500">flag</span>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <div className="bg-amber-500/10 text-amber-400 text-[16px] font-bold px-2 py-0.5 rounded border border-amber-500/20 uppercase">主線任務</div>
          </div>
          <p className="text-gray-300 text-[16px] leading-relaxed italic font-serif">{mainContent}</p>
        </div>
      </div>

      {/* Side Quest */}
      <div className="bg-[#0e1f15] p-4 rounded-xl border border-white/5 hover:border-sky-500/30 hover:bg-[#0e1c24] transition-all group cursor-pointer flex items-center gap-4">
        <div className="hidden sm:flex size-10 rounded-full bg-sky-500/10 items-center justify-center shrink-0 border border-sky-500/20">
          <span className="material-symbols-outlined text-sky-500">explore</span>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <div className="bg-sky-500/10 text-sky-400 text-[16px] font-bold px-2 py-0.5 rounded border border-sky-500/20 uppercase">支線任務</div>
          </div>
          <p className="text-gray-300 text-[16px] leading-relaxed italic font-serif">{sideContent}</p>
        </div>
      </div>

      {/* Oracle */}
      <div className="bg-[#0e1f15] p-4 rounded-xl border border-white/5 hover:border-purple-500/30 hover:bg-[#161024] transition-all group cursor-pointer flex items-center gap-4">
        <div className="hidden sm:flex size-10 rounded-full bg-purple-500/10 items-center justify-center shrink-0 border border-purple-500/20">
          <span className="material-symbols-outlined text-purple-500">psychology</span>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <div className="bg-purple-500/10 text-purple-400 text-[16px] font-bold px-2 py-0.5 rounded border border-purple-500/20 uppercase flex items-center gap-1">神諭啟示</div>
          </div>
          <p className="text-gray-300 text-[16px] italic leading-relaxed italic font-serif">{oracle}</p>
        </div>
      </div>
    </div>
  );
};

export default DestinyGuide;
