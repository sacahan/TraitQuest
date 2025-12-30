import React from 'react';
import { motion } from 'framer-motion';
import LockedCard from './LockedCard';
import { Zap, Sparkles, Sword } from 'lucide-react';

interface HeroPanelProps {
  data?: {
    race_name?: string;
    class_name?: string;
    stance_name?: string;
    talents?: string[];
    levelInfo?: {
      level: number;
      exp: number;
    }
  };
}

const HeroPanel: React.FC<HeroPanelProps> = ({ data }) => {
// const isLocked = !data || !data.class_name;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative p-8 bg-zinc-900/60 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl"
    >
      {/* Decorative Overlays */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />

      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 relative z-10">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <h2 className="text-4xl font-display font-bold text-white tracking-tighter uppercase transition-all duration-700">
              {data?.class_name || "封印中的英雄"}
            </h2>
            {data?.levelInfo && (
              <span className="px-3 py-1 bg-primary text-black text-[10px] font-black rounded-full">
                LV.{data.levelInfo.level}
              </span>
            )}
          </div>
          <p className="text-primary font-display tracking-[0.3em] text-xs uppercase opacity-80">
            {data?.race_name || "此試煉尚未開啟"}
          </p>
        </div>

        {/* Placeholder Portrait/Totem */}
        <div className="relative group">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-24 h-24 rounded-full border-2 border-primary/30 flex items-center justify-center bg-black/40 relative z-10 transition-transform duration-500 group-hover:rotate-12">
            <Sparkles className="text-primary/40 group-hover:text-primary transition-colors" size={40} />
          </div>
        </div>
      </div>

      {/* Traits Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
        {data?.stance_name ? (
          <div className="p-4 bg-white/5 border border-white/5 rounded-xl group hover:border-primary/20 transition-all">
            <div className="flex items-center gap-2 mb-2 text-primary/60">
              <Sword size={14} />
              <span className="text-[10px] uppercase tracking-widest">戰鬥姿態 (Stance)</span>
            </div>
            <p className="text-lg font-bold text-white">{data.stance_name}</p>
          </div>
        ) : (
          <LockedCard label="戰鬥姿態" unlockHint="完成 DISC 試煉解鎖" />
        )}

        {data?.talents && data.talents.length > 0 ? (
          <div className="p-4 bg-white/5 border border-white/5 rounded-xl group hover:border-primary/20 transition-all">
            <div className="flex items-center gap-2 mb-2 text-primary/60">
              <Zap size={14} />
              <span className="text-[10px] uppercase tracking-widest">傳奇技能 (Talent)</span>
            </div>
            <p className="text-lg font-bold text-white">{data.talents[0]}</p>
          </div>
        ) : (
          <LockedCard label="傳奇技能" unlockHint="完成 Gallup 祭壇解鎖" />
        )}

        {/* Additional Slots could go here */}
        <LockedCard label="靈魂武器" unlockHint="等級 15 解鎖" />
        <LockedCard label="命運紋章" unlockHint="等級 20 解鎖" />
      </div>

      {/* Decorative border line */}
      <div className="mt-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Footer Text */}
      <div className="mt-6 text-center italic text-white/30 text-xs font-serif leading-relaxed px-4">
        「你的靈魂之書正在緩緩展開，每一道試煉都是命運交織的證明。」
      </div>
    </motion.div>
  );
};

export default HeroPanel;
