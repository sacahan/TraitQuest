import React from 'react';

interface LockedCardProps {
  label: string;
  unlockHint: string;
  iconName?: string;
  themeColor?: string; // e.g., 'red', 'yellow'
  onClick?: () => void;
}

const LockedCard: React.FC<LockedCardProps> = ({ label, unlockHint, iconName = "lock", themeColor = "red", onClick }) => {
  const themeClasses = themeColor === 'red'
    ? {
      border: 'group-hover:border-red-500/30',
      glow: 'group-hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]',
      text: 'group-hover:text-red-400',
      icon: 'group-hover:text-red-500',
      btn: 'hover:bg-red-900/30 hover:text-red-400 hover:border-red-500/50'
    }
    : {
      border: 'group-hover:border-yellow-600/30',
      glow: 'group-hover:shadow-[0_0_15px_rgba(202,138,4,0.4)]',
      text: 'group-hover:text-yellow-600',
      icon: 'group-hover:text-yellow-600',
      btn: 'hover:bg-yellow-900/30 hover:text-yellow-500 hover:border-yellow-600/50'
    };

  return (
    <div className="bg-[#050d09] rounded-xl h-full p-6 border border-white/5 relative overflow-hidden group transition-all duration-300">
      <div className="absolute inset-0 bg-black/60 z-10"></div>
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-center">
        <div className={`w-12 h-12 rounded-full bg-[#13261a] border border-white/10 flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110 ${themeClasses.border} ${themeClasses.glow}`}>
          <span className={`material-symbols-outlined text-gray-500 transition-colors ${themeClasses.icon} group-hover:animate-pulse`}>
            {iconName}
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
          <span className="material-symbols-outlined text-sm">
            {themeColor === 'red' ? 'swords' : 'search'}
          </span>
          {themeColor === 'red' ? '踏上試煉' : '探尋卷軸'}
        </button>
      </div>
    </div>
  );
};

export default LockedCard;
