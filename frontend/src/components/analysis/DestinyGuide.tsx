import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Target, Map, Sparkles } from 'lucide-react';

interface GuideItemProps {
  icon: React.ReactNode;
  label: string;
  content: string;
  delay: number;
}

const GuideItem: React.FC<GuideItemProps> = ({ icon, label, content, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-primary/40 group transition-all"
  >
    <div className="flex items-center gap-3 mb-2">
      <div className="text-primary/60 group-hover:text-primary transition-colors">
        {icon}
      </div>
      <span className="text-xs font-display text-white/40 uppercase tracking-widest">{label}</span>
    </div>
    <p className="text-sm text-white/80 leading-relaxed italic">
      「{content}」
    </p>
  </motion.div>
);

interface DestinyGuideProps {
  guide: {
    daily: string;
    main: string;
    side: string;
    oracle: string;
  };
}

const DestinyGuide: React.FC<DestinyGuideProps> = ({ guide }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <GuideItem 
        icon={<Compass size={18} />} 
        label="今日預言 (Daily)" 
        content={guide.daily} 
        delay={0.1}
      />
      <GuideItem 
        icon={<Target size={18} />} 
        label="主線試煉 (Main)" 
        content={guide.main} 
        delay={0.2}
      />
      <GuideItem 
        icon={<Map size={18} />} 
        label="意料之外 (Side)" 
        content={guide.side} 
        delay={0.3}
      />
      <GuideItem 
        icon={<Sparkles size={18} />} 
        label="靈魂神諭 (Oracle)" 
        content={guide.oracle} 
        delay={0.4}
      />
    </div>
  );
};

export default DestinyGuide;
