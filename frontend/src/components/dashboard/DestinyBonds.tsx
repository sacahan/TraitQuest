import React from 'react';
import { Users, ShieldAlert } from 'lucide-react';

interface BondItemProps {
  type: 'compatible' | 'conflicting';
  name: string;
  id: string;
  description: string;
}

const BondItem: React.FC<BondItemProps> = ({ type, name, id, description }) => {
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
          <p className={`text-[18px] font-bold ${isCompatible ? 'text-primary' : 'text-red-400'}`}>
            {isCompatible ? '天命盟友' : '宿命之敵'}
          </p>
        </div>
      </div>

      <p className={`text-[16px] font-bold ${isCompatible ? 'text-primary' : 'text-red-400'}`}>
        {name} ({id.replace('CLS_', '')})
      </p>    

      <p className="text-[14px] text-white/60 leading-relaxed italic pt-2">
        {description?.replace('CLS_', '') ?? '尚無描述'}
      </p>
    </div>
  );
};

interface DestinyBondsProps {
  bonds: {
    compatible?: Array<{
      class_id: string;
      advantage: string;
      sync_rate: number;
      class_name: string;
    }>;
    conflicting?: Array<{
      class_id: string;
      class_name: string;
      risk_level: string;
      friction_reason: string;
    }>;
  };
}

const DestinyBonds: React.FC<DestinyBondsProps> = ({ bonds }) => {
  // 如果沒有羈絆數據，顯示空狀態
  if (!bonds || (!bonds.compatible && !bonds.conflicting)) {
    return (
      <div className="bg-card-dark rounded-xl p-6 border border-white/5 text-center">
        <p className="text-gray-500 text-sm">羈絆尚未建立...</p>
      </div>
    );
  }

  // 取第一個相容與衝突羈絆(若存在)
  const compatibleBond = bonds.compatible?.[0];
  const conflictingBond = bonds.conflicting?.[0];

  return (
    <div className="space-y-4">
      {compatibleBond && (
        <BondItem
          type="compatible"
          id={compatibleBond.class_id}
          name={compatibleBond.class_name}
          description={compatibleBond.advantage}
        />
      )}
      {conflictingBond && (
        <BondItem
          type="conflicting"
          id={conflictingBond.class_id}
          name={conflictingBond.class_name}
          description={conflictingBond.friction_reason}
        />
      )}
    </div>
  );
};

export default DestinyBonds;
