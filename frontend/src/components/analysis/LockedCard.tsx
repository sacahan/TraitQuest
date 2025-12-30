import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

interface LockedCardProps {
  label: string;
  unlockHint: string;
}

const LockedCard: React.FC<LockedCardProps> = ({ label, unlockHint }) => {
  return (
    <div className="relative group overflow-hidden bg-black/40 border border-white/5 backdrop-blur-md rounded-xl p-6 flex flex-col items-center justify-center min-h-[140px] transition-all duration-500 hover:border-primary/30">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Lock Icon */}
      <motion.div 
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        className="text-white/20 group-hover:text-primary/50 transition-colors duration-500 mb-3"
      >
        <Lock size={32} strokeWidth={1.5} />
      </motion.div>
      
      {/* Text Info */}
      <div className="text-center relative z-10">
        <h3 className="text-white/40 font-display text-sm uppercase tracking-widest mb-1 group-hover:text-white/60 transition-colors">
          {label}
        </h3>
        <p className="text-xs text-white/20 italic group-hover:text-primary/60 transition-colors">
          {unlockHint}
        </p>
      </div>
      
      {/* Decorative Corners */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/10 group-hover:border-primary/40 transition-colors" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/10 group-hover:border-primary/40 transition-colors" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/10 group-hover:border-primary/40 transition-colors" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/10 group-hover:border-primary/40 transition-colors" />
    </div>
  );
};

export default LockedCard;
