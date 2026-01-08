import { motion } from 'framer-motion';
import { Target } from 'lucide-react';

interface BigFivePanelProps {
    result: any;
}

const BIGFIVE_MAP: Record<string, string> = {
    STA_O: '開創性',
    STA_C: '嚴謹性',
    STA_E: '外向性',
    STA_A: '親和性',
    STA_N: '神經質'
};

const BigFivePanel = ({ result }: BigFivePanelProps) => {
    const stats = result?.stats;
    if (!stats) return null;

    return (
        <div className="w-full max-w-4xl mx-auto">
             <div className="flex items-center gap-4 mb-6">
                <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-purple-500/50"></div>
                <div className="flex items-center gap-2">
                    <Target className="w-6 h-6 text-purple-400" />
                    <h2 className="text-2xl font-bold text-white whitespace-nowrap">
                        <span className="text-purple-400">角色屬性</span> 解析
                    </h2>
                </div>
                <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-purple-500/50"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(stats).map(([key, value]: [string, any], index) => {
                    // Handle both raw numbers and object format (legacy/store compatibility)
                    const score = typeof value === 'number' ? value : value.score;
                    const label = (typeof value === 'object' && value.label) ? value.label : (BIGFIVE_MAP[key] || key);
                    
                    return (
                        <motion.div
                            key={key}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -4, borderColor: 'rgba(192, 132, 252, 0.5)' }}
                            className="bg-[#1a2e1a] border border-[#293829] rounded-xl p-6 transition-all duration-300 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Target className="w-24 h-24 text-purple-500" />
                            </div>

                            <div className="flex items-center gap-4 mb-4 relative z-10">
                                <div className="size-12 rounded-full bg-[#112111] border border-purple-500 flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                                    <span className="text-purple-400 font-bold text-lg">{key.replace('STA_', '')}</span>
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-lg">{label}</h4>
                                    <span className="text-xs text-purple-400/80">基礎屬性</span>
                                </div>
                            </div>
                            
                            <div className="relative z-10">
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-white text-4xl font-bold">{score}</span>
                                    <span className="text-gray-500 text-sm">/ 100</span>
                                </div>
                                <div className="h-2 w-full bg-[#112111] rounded-full overflow-hidden border border-white/5">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${score}%` }}
                                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                                        className="h-full bg-gradient-to-r from-purple-600 to-pink-500"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default BigFivePanel;
