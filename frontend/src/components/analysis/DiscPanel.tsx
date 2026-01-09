import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

interface DiscPanelProps {
    result: any;
}

const STANCE_THEMES: Record<string, {
    main: string;
    gradient: string;
    shadow: string;
    border: string;
    glow: string;
    text: string;
    label: string;
}> = {
    'STN_D': {
        main: 'red',
        gradient: 'from-red-600 to-orange-600',
        shadow: 'shadow-[0_0_15px_rgba(239,68,68,0.6)]',
        border: 'border-red-500',
        glow: 'bg-red-500/10',
        text: 'text-red-400',
        label: '烈焰戰姿'
    },
    'STN_I': {
        main: 'cyan',
        gradient: 'from-blue-600 to-cyan-500',
        shadow: 'shadow-[0_0_15px_rgba(6,182,212,0.6)]',
        border: 'border-cyan-500',
        glow: 'bg-cyan-500/10',
        text: 'text-cyan-400',
        label: '潮汐之歌'
    },
    'STN_S': {
        main: 'emerald',
        gradient: 'from-emerald-600 to-yellow-600',
        shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.6)]',
        border: 'border-emerald-500',
        glow: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        label: '大地磐石'
    },
    'STN_C': {
        main: 'violet',
        gradient: 'from-violet-600 to-indigo-600',
        shadow: 'shadow-[0_0_15px_rgba(139,92,246,0.6)]',
        border: 'border-violet-500',
        glow: 'bg-violet-500/10',
        text: 'text-violet-400',
        label: '星辰軌跡'
    }
};

const DiscPanel = ({ result }: DiscPanelProps) => {
    if (!result?.stance) return null;

    const stanceId = result.stance_id;
    const theme = STANCE_THEMES[stanceId] || STANCE_THEMES['STN_D']; // Default fallback

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative group perspective-1000 w-full max-w-md mx-auto"
        >
            <div className={`absolute inset-0 ${theme.glow} rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-700`}></div>

            {/* Label */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 w-full flex justify-center">
                <div className={`bg-gradient-to-r ${theme.gradient} text-white text-sm font-black px-4 py-1 rounded-full ${theme.shadow} border border-white/20 tracking-widest uppercase flex items-center gap-1 min-w-max`}>
                    <Shield className="w-3 h-3 fill-current" />
                    Battle Stance
                </div>
            </div>

            <div className={`relative rounded-xl overflow-hidden border border-white/10 ${theme.border} ${theme.shadow} bg-[#1a0f0f] transition-all duration-300 mt-4 aspect-[3/4]`}>
                <div
                    className="absolute inset-0 bg-center bg-no-repeat bg-cover group-hover:scale-102 transition-transform duration-1000 ease-out"
                    style={{
                        // Use generated stance assets
                        backgroundImage: `url(/assets/images/stances/${stanceId?.toLowerCase()}.png)`
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f0d] via-[#0a0f0d]/40 to-transparent"></div>

                    <div className="absolute bottom-0 left-0 w-full p-6 z-10">
                        <div className="flex items-center gap-1.5 mb-2">
                            <div className={`size-6 rounded bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-lg border border-white/20`}>
                                <Shield className="w-3.5 h-3.5 text-white fill-current" />
                             </div>
                            <span className={`${theme.text} font-bold text-xs tracking-widest uppercase`}>戰鬥流派 (DISC)</span>
                        </div>

                        <h2 className="text-3xl font-black text-white font-display tracking-tight mb-1 drop-shadow-lg">
                            {theme.label}
                        </h2>

                        <p className={`${theme.text} font-bold text-lg tracking-wide mb-3 opacity-90`}>
                            {stanceId?.replace("STN_", "")} Type
                        </p>

                        <p className="text-gray-200 text-sm leading-relaxed border-l-2 border-white/50 pl-3 italic drop-shadow-md">
                            {result.stance.description}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default DiscPanel;
