import { motion } from 'framer-motion';

interface MbtiPanelProps {
    result: any;
}

const MbtiPanel = ({ result }: MbtiPanelProps) => {
    if (!result?.class) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative group perspective-1000 w-full max-w-md mx-auto"
        >
            <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-2xl group-hover:bg-primary/20 transition-all duration-700"></div>

            {/* Hero Label */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30">
                <div className="bg-gradient-to-r from-primary to-emerald-400 text-black text-sm font-black px-4 py-1 rounded-full shadow-[0_0_15px_rgba(17,212,82,0.6)] border border-white/20 tracking-widest uppercase flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">bolt</span>
                    Hero Awakened
                </div>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-primary/50 shadow-[0_0_15px_rgba(17,212,82,0.1)] bg-[#0e1f15] transition-all duration-300 group-hover:border-primary mt-4 aspect-[12/12]">
                <div
                    className="absolute inset-0 bg-center bg-no-repeat bg-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    style={{
                        backgroundImage: `url(/assets/images/classes/${result.class_id?.toLowerCase() || 'civilian'}.png)`
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e1f15] via-[#0e1f15]/20 to-transparent"></div>

                    <div className="absolute bottom-0 left-0 w-full p-6 z-10">
                        <div className="flex items-center gap-1.5 mb-2">
                            <span className="size-6 rounded bg-primary text-black flex items-center justify-center font-bold text-xs shadow-lg">M</span>
                            <span className="text-primary font-bold text-xs tracking-widest uppercase">天選之道 (MBTI)</span>
                        </div>

                        <h2 className="text-3xl font-black text-white font-display tracking-tight mb-1">
                            {result.class.name}
                        </h2>

                        <p className="text-[#92c9a4] font-bold text-lg tracking-wide mb-3">
                            {result.class_id?.replace("CLS_", "")}
                        </p>

                        <p className="text-gray-200 text-sm leading-relaxed border-l-2 border-primary/50 pl-3 italic">
                            {result.class.description}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default MbtiPanel;
