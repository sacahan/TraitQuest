import React from 'react';

interface DestinyGuideProps {
  guide: {
    daily?: { title: string; content: string } | string;
    main?: { title: string; content: string } | string;
    oracle?: string;
  };
}

const DestinyGuide: React.FC<DestinyGuideProps> = ({ guide }) => {
  const getGuideData = (item: any, defaultTitle: string) => {
    if (typeof item === 'string') return { title: defaultTitle, content: item };
    return { title: item?.title || defaultTitle, content: item?.content || "尚未獲取指引..." };
  };

  const daily = getGuideData(guide.daily, "靈魂共鳴時刻");
  const main = getGuideData(guide.main, "探索內在邊境");
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
            <div className="bg-primary/10 text-primary text-sm font-bold px-2 py-0.5 rounded border border-primary/20 uppercase">每日啟示</div>
          </div>
          <h4 className="text-white font-bold mb-0.5 group-hover:text-primary transition-colors">{daily.title}</h4>
          <p className="text-gray-400 text-sm">{daily.content}</p>
        </div>
      </div>

      {/* Main Quest */}
      <div className="bg-[#0e1f15] p-4 rounded-xl border border-white/5 hover:border-amber-500/30 hover:bg-[#1f1a0e] transition-all group cursor-pointer flex items-center gap-4">
        <div className="hidden sm:flex size-10 rounded-full bg-amber-500/10 items-center justify-center shrink-0 border border-amber-500/20">
          <span className="material-symbols-outlined text-amber-500">flag</span>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <div className="bg-amber-500/10 text-amber-400 text-sm font-bold px-2 py-0.5 rounded border border-amber-500/20 uppercase">主線啟程</div>
          </div>
          <h4 className="text-white font-bold mb-0.5 group-hover:text-amber-400 transition-colors">{main.title}</h4>
          <p className="text-gray-400 text-sm">{main.content}</p>
        </div>
      </div>

      {/* Oracle */}
      <div className="bg-[#0e1f15] p-4 rounded-xl border border-white/5 hover:border-purple-500/30 hover:bg-[#161024] transition-all group cursor-pointer flex items-center gap-4">
        <div className="hidden sm:flex size-10 rounded-full bg-purple-500/10 items-center justify-center shrink-0 border border-purple-500/20">
          <span className="material-symbols-outlined text-purple-500">psychology</span>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <div className="bg-purple-500/10 text-purple-400 text-sm font-bold px-2 py-0.5 rounded border border-purple-500/20 uppercase flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">auto_awesome</span> 神諭
            </div>
          </div>
          <h4 className="text-white font-bold mb-0.5 group-hover:text-purple-400 transition-colors">虛空低語</h4>
          <p className="text-gray-400 text-sm italic">{oracle}</p>
        </div>
      </div>
    </div>
  );
};

export default DestinyGuide;
