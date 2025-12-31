import React from 'react';
import { motion } from 'framer-motion';

interface HeroPanelProps {
  avatarUrl?: string;
  className?: string;
  classId?: string;
  classDescription?: string;
}

const HeroPanel: React.FC<HeroPanelProps> = ({
  avatarUrl,
  className = "未知職業",
  classId = "???",
  classDescription = "尚未覺醒的靈魂..."
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative group perspective-1000"
    >
      <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-2xl group-hover:bg-primary/20 transition-all duration-700"></div>

      {/* Hero Label */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30">
        <div className="bg-gradient-to-r from-primary to-emerald-400 text-black text-sm font-black px-4 py-1 rounded-full shadow-[0_0_15px_rgba(17,212,82,0.6)] border border-white/20 tracking-widest uppercase flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">bolt</span> Hero Awakened
        </div>
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-primary/50 shadow-[0_0_20px_rgba(17,212,82,0.1)] bg-[#0e1f15] transition-all duration-300 group-hover:border-primary">
        <div
          className="aspect-[3/4] w-full bg-center bg-no-repeat bg-cover group-hover:scale-105 transition-transform duration-700 ease-out relative"
          style={{ backgroundImage: `url(${avatarUrl || '/assets/images/default_avatar.jpg'})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e1f15] via-[#0e1f15]/20 to-transparent"></div>

          <div className="absolute bottom-0 left-0 w-full p-6 z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="size-6 rounded bg-primary text-black flex items-center justify-center font-bold text-sm shadow-lg">M</span>
              <span className="text-primary font-bold text-sm tracking-widest uppercase">天選之道 (MBTI)</span>
            </div>

            <h2 className="text-4xl font-black text-white font-display tracking-tight text-glow">
              {className}
            </h2>

            <p className="text-[#92c9a4] font-bold text-lg mt-1 tracking-wide">
              {classId}
            </p>

            <p className="text-gray-300 text-sm mt-3 leading-relaxed border-l-2 border-primary/50 pl-3 italic">
              {classDescription.split('。')[0]}。
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HeroPanel;
