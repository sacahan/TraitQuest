import React from 'react';
import { motion } from 'framer-motion';
import { Users, ShieldAlert } from 'lucide-react';

interface BondItemProps {
  type: 'compatible' | 'conflicting';
  name: string;
  syncRate: number;
  description: string;
}

const BondItem: React.FC<BondItemProps> = ({ type, name, syncRate, description }) => {
  const isCompatible = type === 'compatible';
  
  return (
    <div className={`p-4 rounded-lg border ${isCompatible ? 'border-primary/20 bg-primary/5' : 'border-red-500/20 bg-red-500/5'}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {isCompatible ? (
            <Users size={16} className="text-primary" />
          ) : (
            <ShieldAlert size={16} className="text-red-500" />
          )}
          <span className={`text-sm font-bold ${isCompatible ? 'text-primary' : 'text-red-400'}`}>
            {isCompatible ? '天命盟友' : '宿命之敵'}：{name}
          </span>
        </div>
        <div className="text-[10px] font-mono opacity-60">
          SYNC: {syncRate}%
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full h-1 bg-white/5 rounded-full mb-3 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${syncRate}%` }}
          className={`h-full ${isCompatible ? 'bg-primary' : 'bg-red-500'}`}
        />
      </div>
      
      <p className="text-xs text-white/60 leading-relaxed italic">
        {description}
      </p>
    </div>
  );
};

interface DestinyBondsProps {
  bonds: {
    compatible: { name: string; syncRate: number; description: string };
    conflicting: { name: string; syncRate: number; description: string };
  };
}

const DestinyBonds: React.FC<DestinyBondsProps> = ({ bonds }) => {
  // 如果沒有羈絆數據，顯示空狀態
  if (!bonds || !bonds.compatible || !bonds.conflicting) {
    return (
      <div className="bg-card-dark rounded-xl p-6 border border-white/5 text-center">
        <p className="text-gray-500 text-sm">羈絆尚未建立...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <BondItem 
        type="compatible"
        name={bonds.compatible.name}
        syncRate={bonds.compatible.syncRate}
        description={bonds.compatible.description}
      />
      <BondItem 
        type="conflicting"
        name={bonds.conflicting.name}
        syncRate={bonds.conflicting.syncRate}
        description={bonds.conflicting.description}
      />
    </div>
  );
};

export default DestinyBonds;
