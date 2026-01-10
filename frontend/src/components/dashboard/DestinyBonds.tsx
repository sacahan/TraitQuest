import React from 'react';
import { Users, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

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
  if (!bonds || (!bonds.compatible?.length && !bonds.conflicting?.length)) {
    return (
      <div className="bg-[#1a2e1a] rounded-xl p-6 border border-[#293829] text-center">
        <p className="text-gray-500 text-sm italic">命運之弦尚未交織...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full h-full">
      {/* 建議夥伴 - 天命盟友 */}
      {bonds.compatible && bonds.compatible.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-[#1a2e1a] border border-[#293829] rounded-xl p-6 flex-1"
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 pb-4 border-b border-white/5">
            <Users className="w-5 h-5 text-primary" />
            天命盟友
          </h3>
          <div className="space-y-3">
            {bonds.compatible.map((bond: any, idx: number) => (
              <div key={idx} className="p-4 bg-[#112111]/50 rounded-lg border border-primary/20 hover:border-primary/40 transition-colors hover:bg-primary/5">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-bold">
                    {bond.class_name}{' '}
                    <span className="text-xs text-gray-500 font-normal ml-1">
                      ({bond.class_id.replace('CLS_', '').replace('STN_', '')})
                    </span>
                  </h4>
                  <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-bold rounded">
                    契合度 {bond.sync_rate || 'High'}%
                  </span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {bond.description || bond.advantage}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 警戒對象 - 宿命之敵 */}
      {bonds.conflicting && bonds.conflicting.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-[#1a2e1a] border border-[#293829] rounded-xl p-6 flex-1"
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 pb-4 border-b border-white/5">
            <Shield className="w-5 h-5 text-red-500" />
            宿命之敵
          </h3>
          <div className="space-y-3">
            {bonds.conflicting.map((bond: any, idx: number) => (
              <div key={idx} className="p-4 bg-[#2a1111]/50 rounded-lg border border-red-500/20 hover:border-red-500/40 transition-colors hover:bg-red-500/5">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-bold">
                    {bond.class_name}{' '}
                    <span className="text-xs text-gray-500 font-normal ml-1">
                      ({bond.class_id.replace('CLS_', '').replace('STN_', '')})
                    </span>
                  </h4>
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded">
                    風險: {bond.risk_level}
                  </span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {bond.description || bond.friction_reason}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DestinyBonds;

