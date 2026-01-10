import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';

interface GallupPanelProps {
    result: any;
}

const GallupPanel = ({ result }: GallupPanelProps) => {
    const talents = result?.talents || [];
    if (talents.length === 0) return null;

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-amber-500/50"></div>
                <div className="flex items-center gap-2">
                    <Compass className="w-6 h-6 text-amber-400" />
                    <h2 className="text-2xl font-bold text-white whitespace-nowrap">
                        <span className="text-amber-400">傳奇技能</span> 總覽
                    </h2>
                </div>
                <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-amber-500/50"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {talents.map((talent: any, idx: number) => (
                    <motion.div
                        key={talent.id || idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ y: -4, borderColor: 'rgba(251, 191, 36, 0.5)' }}
                        className="bg-[#1a2e1a] border border-[#293829] rounded-xl p-5 transition-all duration-300 relative overflow-hidden group hover:shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                    >
                        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                            <span className="material-symbols-outlined text-amber-500 text-[80px]">
                                {talent.symbol}
                            </span>
                        </div>

                        <div className="flex items-center gap-3 mb-3 relative z-10">
                            <div className="size-10 rounded-full bg-[#112111] border border-amber-500 flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.3)] ">
                                <span className="material-symbols-outlined text-amber-500 text-[20px]">
                                    {talent.symbol}
                                </span>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-white font-bold text-lg">{talent.name}</h4>
                                <span className="text-sm text-amber-400/80 font-medium tracking-wide">
                                    {talent.origin}
                                </span>
                            </div>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed relative z-10 border-l mb-1 border-amber-500/20 pl-3">
                            {talent.description}
                        </p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default GallupPanel;
