import { useRef } from 'react';
import { motion } from 'framer-motion';
import ActionButtons from '../shared/ActionButtons';

interface EnneagramPanelProps {
    result: any;
}

const EnneagramPanel = ({ result }: EnneagramPanelProps) => {
    const panelRef = useRef<HTMLDivElement>(null);

    if (!result?.race) return null;

    // Helper to get race number from ID (e.g., RACE_1 -> 1)
    const getRaceNumber = (id: string) => {
        const match = id?.match(/RACE_(\d+)/);
        return match ? match[1] : '1';
    };

    const raceNumber = getRaceNumber(result.race.id);
    const raceId = result.race.id || 'unknown';

    return (
        <motion.div 
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative group perspective-1000"
        >
            <div className="absolute inset-0 bg-purple-500/10 rounded-2xl blur-2xl group-hover:bg-purple-500/20 transition-all duration-700"></div>

            {/* Action Buttons */}
            <div className="absolute top-2 right-2 z-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ActionButtons targetRef={panelRef} filename={`race-${raceId || 'unknown'}`} />
            </div>

            {/* Soul Origin Label */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30">
                <div className="bg-gradient-to-r from-purple-600 to-purple-400 text-white text-sm font-black px-4 py-1 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.6)] border border-white/20 tracking-widest uppercase flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">groups</span>
                    Soul Origin
                </div>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-primary/50 shadow-[0_0_15px_rgba(17,212,82,0.1)] bg-[#0e1f15] transition-all duration-300 group-hover:border-primary mt-4 aspect-[7/9]">
                <div
                    className="aspect-[4/5] w-full bg-center bg-no-repeat bg-cover group-hover:scale-102 transition-transform duration-700 ease-out relative"
                    style={{
                        backgroundImage: `url(/assets/images/races/race_${raceNumber}.png)`
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e1f15] via-[#0e1f15]/20 to-transparent"></div>

                    <div className="absolute bottom-0 left-0 w-full p-4 z-10">
                        <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="size-5 rounded bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-lg">E</span>
                            <span className="text-purple-400 font-bold text-xs tracking-widest uppercase">靈魂種族 (Enneagram)</span>
                        </div>

                        <h2 className="text-2xl font-black text-white font-display tracking-tight text-glow">
                            {result.race.name}
                        </h2>

                        <p className="text-[#c9a0dc] font-bold text-base mt-0.5 tracking-wide">
                            {result.race.id.replace("RACE_", "Type ")}
                        </p>

                        <p className="text-gray-300 text-xs mt-2 leading-relaxed border-l-2 border-purple-500/50 pl-2 italic">
                            {result.race.description}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default EnneagramPanel;
