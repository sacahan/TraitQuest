import React from 'react';

interface BackgroundEffectsProps {
  /**
   * 背景效果變體
   * - 'default': 預設呼吸效果（頂部/底部發光層）
   * - 'subtle': 淡化版呼吸效果
   * - 'none': 無背景效果
   */
  variant?: 'default' | 'subtle' | 'none';
}

/**
 * 背景呼吸效果組件
 * 提供統一的視覺氛圍層，用於各頁面背景
 */
const BackgroundEffects: React.FC<BackgroundEffectsProps> = ({ variant = 'default' }) => {
  if (variant === 'none') {
    return null;
  }

  const isSubtle = variant === 'subtle';

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* 頂部發光層 */}
      <div
        className={`absolute -top-[20%] left-1/2 -translate-x-1/2 w-[80%] h-[60%] bg-[#059669] rounded-full blur-[150px] animate-pulse-slow ${
          isSubtle ? 'opacity-15' : 'opacity-30'
        }`}
      />
      {/* 底部發光層 */}
      <div
        className={`absolute bottom-0 right-0 w-[50%] h-[50%] bg-primary rounded-full blur-[180px] ${
          isSubtle ? 'opacity-5' : 'opacity-10'
        }`}
      />
    </div>
  );
};

export default BackgroundEffects;
