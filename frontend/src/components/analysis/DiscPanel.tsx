import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

interface DiscPanelProps {
    result: any;
}

const DiscPanel = ({ result }: DiscPanelProps) => {
    if (!result?.stance) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative group perspective-1000 w-full max-w-md mx-auto"
        >
            <div className="absolute inset-0 bg-red-500/10 rounded-2xl blur-2xl group-hover:bg-red-500/20 transition-all duration-700"></div>

            {/* Label */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30">
                <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-black px-4 py-1 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.6)] border border-white/20 tracking-widest uppercase flex items-center gap-1">
                    <Shield className="w-3 h-3 fill-current" />
                    Battle Stance
                </div>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)] bg-[#1a0f0f] transition-all duration-300 group-hover:border-red-500 mt-4 aspect-[3/4]">
                <div
                    className="absolute inset-0 bg-center bg-no-repeat bg-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    style={{
                         // Fallback to generic combat bg if specific stance image missing
                        backgroundImage: `url(/assets/images/stances/${result.stance_id?.toLowerCase() || 'generic'}.png), url(/assets/images/quest_bg.png)`
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f0f] via-[#1a0f0f]/30 to-transparent"></div>

                    <div className="absolute bottom-0 left-0 w-full p-6 z-10">
                        <div className="flex items-center gap-1.5 mb-2">
                             <div className="size-6 rounded bg-red-500 flex items-center justify-center shadow-lg">
                                <Shield className="w-3.5 h-3.5 text-black fill-current" />
                             </div>
                            <span className="text-red-400 font-bold text-xs tracking-widest uppercase">戰鬥流派 (DISC)</span>
                        </div>

                        <h2 className="text-3xl font-black text-white font-display tracking-tight mb-1">
                            {result.stance.name}
                        </h2>

                        <p className="text-red-300 font-bold text-lg tracking-wide mb-3">
                            {result.stance_id?.replace("STN_", "")}
                        </p>

                        <p className="text-gray-200 text-sm leading-relaxed border-l-2 border-red-500/50 pl-3 italic">
                            {result.stance.description}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default DiscPanel;
