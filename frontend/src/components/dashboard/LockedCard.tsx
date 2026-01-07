import React from 'react';

interface LockedCardProps {
  label: string;
  unlockHint: string;
  themeColor?: string; // e.g., 'red', 'yellow'
  onClick?: () => void;
}

const LockedCard: React.FC<LockedCardProps> = ({ label, unlockHint, themeColor = "red", onClick }) => {
  // 根據 PRD 區域配置表的顏色規範,支援顏色代碼映射
  const getThemeClasses = () => {
    // 顏色代碼映射表 (根據 PRD L486-L492)
    const colorMap: Record<string, { hex: string; rgb: string }> = {
      '#11D452': { hex: '#11D452', rgb: '17,212,82' },    // MBTI 聖殿
      '#00f0ff': { hex: '#00f0ff', rgb: '0,240,255' },    // Big Five 能量場
      '#ff4f4f': { hex: '#ff4f4f', rgb: '255,79,79' },    // DISC 戰鬥叢林
      '#bd00ff': { hex: '#bd00ff', rgb: '189,0,255' },    // Enneagram 冥想塔
      '#ffd000': { hex: '#ffd000', rgb: '255,208,0' },    // Gallup 祭壇
    };

    // 嘗試從映射表中找到對應的顏色
    const color = colorMap[themeColor.toLowerCase()];

    if (color) {
      return {
        border: `group-hover:border-[${color.hex}]/30`,
        glow: `group-hover:shadow-[0_0_15px_rgba(${color.rgb},0.4)]`,
        text: `group-hover:text-[${color.hex}]`,
        icon: `group-hover:text-[${color.hex}]`,
        btn: `hover:bg-[${color.hex}]/10 hover:text-[${color.hex}] hover:border-[${color.hex}]/50`
      };
    }

    // 預設樣式 (如果顏色不在映射表中)
    return {
      border: 'group-hover:border-white/30',
      glow: 'group-hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]',
      text: 'group-hover:text-white',
      icon: 'group-hover:text-white',
      btn: 'hover:bg-white/10 hover:text-white hover:border-white/50'
    };
  };

  const themeClasses = getThemeClasses();

  return (
    <div className="bg-[#050d09] rounded-xl h-full p-6 border border-white/5 relative overflow-hidden group transition-all duration-300">
      <div className="absolute inset-0 bg-black/60 z-10"></div>
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-center">
        <div className={`w-12 h-12 rounded-full bg-[#13261a] border border-white/10 flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110 ${themeClasses.border} ${themeClasses.glow}`}>
          <span className={`material-symbols-outlined text-gray-500 transition-colors ${themeClasses.icon} group-hover:animate-pulse`}>
            lock
          </span>
        </div>
        <h3 className={`text-gray-400 font-bold text-lg transition-colors ${themeClasses.text}`}>
          {label}
        </h3>
        <p className="text-gray-600 text-sm mt-1 mb-4">
          {unlockHint}
        </p>
        <button
          onClick={onClick}
          className={`bg-[#13261a] text-gray-400 border border-white/10 px-4 py-1.5 rounded text-sm font-bold transition-all flex items-center gap-1 ${themeClasses.btn}`}
        >
          探尋源流
        </button>
      </div>
    </div>
  );
};

export default LockedCard;
