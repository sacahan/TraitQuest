import { motion } from 'framer-motion';

interface EnneagramPanelProps {
    result: any;
}

const EnneagramPanel = ({ result }: EnneagramPanelProps) => {
    if (!result?.race) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative group perspective-1000 w-full max-w-md mx-auto"
        >
            <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl blur-2xl group-hover:bg-emerald-500/20 transition-all duration-700"></div>

            {/* Label */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30">
                <div className="bg-gradient-to-r from-emerald-500 to-green-400 text-black text-sm font-black px-4 py-1 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.6)] border border-white/20 tracking-widest uppercase flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">groups</span>
                    Soul Origin
                </div>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)] bg-[#0e1f15] transition-all duration-300 group-hover:border-emerald-500 mt-4 aspect-[3/4]">
                 {/* Placeholder image for races since we might not have specific assets yet, or use generic race bg */}
                <div
                    className="absolute inset-0 bg-center bg-no-repeat bg-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    style={{
                        backgroundImage: `url(/assets/images/races/${result.race_id?.toLowerCase() || 'human'}.png), url(/assets/images/quest_bg.png)`
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e1f15] via-[#0e1f15]/20 to-transparent"></div>

                    <div className="absolute bottom-0 left-0 w-full p-6 z-10">
                        <div className="flex items-center gap-1.5 mb-2">
                            <span className="size-6 rounded bg-emerald-500 text-black flex items-center justify-center font-bold text-xs shadow-lg">E</span>
                            <span className="text-emerald-400 font-bold text-xs tracking-widest uppercase">靈魂種族 (Enneagram)</span>
                        </div>

                        <h2 className="text-3xl font-black text-white font-display tracking-tight mb-1">
                            {result.race.name}
                        </h2>

                        <p className="text-emerald-300 font-bold text-lg tracking-wide mb-3">
                            {result.race_id?.replace("RACE_", "Type ")}
                        </p>

                        <p className="text-gray-200 text-sm leading-relaxed border-l-2 border-emerald-500/50 pl-3 italic">
                            {result.race.description}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default EnneagramPanel;
