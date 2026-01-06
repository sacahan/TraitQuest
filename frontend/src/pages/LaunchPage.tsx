import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '../layout/Header';
import { Footer } from '../layout/Footer';

const QUEST_CONFIG: Record<string, {
    title: string;
    icon: string;
    amount: string;
}> = {
    mbti: {
        title: 'MBTI 測驗',
        icon: 'Award',
        amount: '10',
    },
    big_five: {
        title: '大五人格測驗',
        icon: 'Target',
        amount: '10',
    },
    disc: {
        title: 'DISC 倫理測驗',
        icon: 'Shield',
        amount: '10',
    },
    enneagram: {
        title: '九型人格測驗',
        icon: 'Users',
        amount: '10',
    },
    gallup: {
        title: '馬斯洛需求測驗',
        icon: 'Compass',
        amount: '10',
    },
};

const LaunchPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const handleStart = () => {
        const type = searchParams.get('type');
        if (type) {
            navigate(`/questionnaire?type=${type}`);
        } else {
            navigate('/questionnaire');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background-dark text-white relative overflow-hidden">
            {/* 魔法背景特效層 */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                {/* 粒子特效 (使用 Framer Motion 模擬) */}
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={`particle-${i}`}
                        className="absolute rounded-full bg-primary/20 blur-sm"
                        initial={{
                            y: '110vh',
                            x: `${10 + i * 15}%`,
                            scale: 0.2,
                            opacity: 0
                        }}
                        animate={{
                            y: '-10vh',
                            x: `${10 + i * 15 + Math.random() * 5}%`,
                            scale: 1.2,
                            opacity: [0, 0.6, 0.4, 0]
                        }}
                        transition={{
                            duration: 6 + Math.random() * 6,
                            repeat: Infinity,
                            delay: i * 1.5,
                            ease: "linear"
                        }}
                        style={{ width: 4 + i + 'px', height: 4 + i + 'px' }}
                    />
                ))}

                {/* 羽毛特效 */}
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={`feather-${i}`}
                        className="absolute text-white/10 text-2xl"
                        initial={{
                            top: '-10%',
                            left: `${15 + i * 35}%`,
                            rotate: 0,
                            x: 0,
                            opacity: 0
                        }}
                        animate={{
                            top: '110%',
                            left: `${15 + i * 35 + 10}%`,
                            rotate: 360,
                            x: 50,
                            opacity: [0, 0.5, 0]
                        }}
                        transition={{
                            duration: 12 + Math.random() * 5,
                            repeat: Infinity,
                            delay: i * 3,
                            ease: "linear"
                        }}
                        style={{ fontFamily: 'Material Symbols Outlined' }}
                    >
                        find your soul
                    </motion.div>
                ))}

                {/* 頂部發光 */}
                <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[80%] h-[60%] bg-[#059669] rounded-full blur-[150px] opacity-30 animate-pulse"></div>
                {/* 底部發光 */}
                <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-primary rounded-full blur-[180px] opacity-10"></div>
            </div>

            <Header />

            <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 py-20 lg:px-40">
                <div className="w-full max-w-[1100px] flex flex-col md:flex-row items-center gap-10 md:gap-20">

                    {/* 左側 Abby 形象 */}
                    <div className="relative w-full md:w-5/12 flex justify-center items-center py-8">
                        {/* 魔法光環 */}
                        <motion.div
                            className="absolute w-[320px] h-[320px] md:w-[360px] md:h-[360px] border border-primary/20 rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        />
                        <motion.div
                            className="absolute w-[360px] h-[360px] md:w-[400px] md:h-[400px] border border-dashed border-primary/10 rounded-full"
                            animate={{ rotate: -360 }}
                            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                        />
                        <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full scale-90" />

                        <div className="relative z-10 w-[280px] h-[280px] md:w-[350px] md:h-[350px] rounded-full p-2 bg-gradient-to-b from-primary/50 to-transparent shadow-[0_0_50px_rgba(52,211,153,0.3)]">
                            <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#064e3b] relative group">
                                <div
                                    className="w-full h-full bg-center bg-cover bg-no-repeat transition-transform duration-1000 ease-in-out group-hover:scale-110"
                                    style={{ backgroundImage: 'url("/assets/images/quest_bg.png")' }}
                                />
                            </div>

                            {/* 漂浮標籤 */}
                            <motion.div
                                className="absolute -bottom-2 right-10 bg-[#064e3b] text-primary border border-primary/30 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1"
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <span className="material-symbols-outlined text-sm">temp_preferences_custom</span>
                                <span>心靈嚮導</span>
                            </motion.div>
                        </div>
                    </div>

                    {/* 右側 內容區 */}
                    <div className="flex-1 w-full flex flex-col gap-8 relative">
                        <div className="space-y-3 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
                                <span className="material-symbols-outlined text-sm">token</span>
                                Eve of Departure
                            </div>
                            <h1 className="text-white text-4xl md:text-5xl font-black leading-tight tracking-tight">
                                啟程前夕：<br className="md:hidden" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-magic-glow filter drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">Abby的叮嚀</span>
                            </h1>
                        </div>

                        {/* Abby 對話框 */}
                        <motion.div
                            className="bg-[#064e3b]/40 border border-primary/30 backdrop-blur-md p-6 md:p-8 rounded-2xl relative group shadow-[0_0_40px_rgba(52,211,153,0.1)]"
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <span className="material-symbols-outlined absolute -top-4 -left-2 text-primary text-5xl opacity-30 transform -rotate-12">format_quote</span>
                            <div className="relative z-10 space-y-4">
                                <p className="text-emerald-50 text-lg md:text-xl leading-relaxed font-medium tracking-wide">
                                    「親愛的旅人，你聽見了嗎？那是內心深處的召喚。請放慢呼吸，感受周圍流動的能量。這裡沒有評判，只有接納與發現。」
                                </p>
                                <div className="flex items-center justify-end gap-2">
                                    <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-primary/50"></div>
                                    <p className="text-primary/80 text-sm font-bold tracking-wider">ABBY</p>
                                </div>
                            </div>
                            {/* 四角裝飾 */}
                            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary rounded-tl-lg opacity-50"></div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary rounded-br-lg opacity-50"></div>
                        </motion.div>

                        {/* 資訊卡片 */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* 試煉方式 */}
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#064e3b]/30 border border-primary/10">
                                <div className="w-10 h-10 rounded-full bg-[#fbbf24]/10 flex items-center justify-center text-[#fbbf24]">
                                    <span className="material-symbols-outlined text-xl">swords</span>
                                </div>
                                <div>
                                    <div className="text-[10px] text-white/50 uppercase tracking-wider">試煉類型</div>
                                    <div className="text-white font-bold">{QUEST_CONFIG[searchParams.get('type') || 'mbti']?.title || '心靈試煉'}</div>
                                </div>
                            </div>
                            {/* 試煉數量 */}
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#064e3b]/30 border border-primary/10">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined text-xl">quiz</span>
                                </div>
                                <div>
                                    <div className="text-[10px] text-white/50 uppercase tracking-wider">試煉數量</div>
                                    <div className="text-white font-bold">{QUEST_CONFIG[searchParams.get('type') || 'mbti']?.amount || '10'} 道題</div>
                                </div>
                            </div>
                            {/* 試煉形式 (根據等級顯示) */}
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#064e3b]/30 border border-purple-500/20">
                                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                                    <span className="material-symbols-outlined text-xl">psychology</span>
                                </div>
                                <div>
                                    <div className="text-[10px] text-white/50 uppercase tracking-wider">試煉形式</div>
                                    <div className="text-white font-bold">量化試煉</div>
                                    <div className="text-[10px] text-purple-400/70">選擇題型</div>
                                </div>
                            </div>
                            {/* 解鎖提示 */}
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#064e3b]/30 border border-cyan-500/20">
                                <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                                    <span className="material-symbols-outlined text-xl">lock_open</span>
                                </div>
                                <div>
                                    <div className="text-[10px] text-white/50 uppercase tracking-wider">進階模式</div>
                                    <div className="text-white font-bold text-sm">Lv.11 解鎖</div>
                                    <div className="text-[10px] text-cyan-400/70">靈魂對話・開放式輸入</div>
                                </div>
                            </div>
                        </div>

                        {/* 按鈕區 */}
                        <div className="flex flex-col sm:flex-row gap-5 pt-2">
                            <button
                                onClick={handleStart}
                                className="group relative flex-1 h-16 bg-gradient-to-r from-[#059669] to-[#10b981] hover:to-[#34d399] text-white font-bold text-lg rounded-2xl overflow-hidden transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_35px_rgba(52,211,153,0.5)] border border-white/10 active:scale-95"
                            >
                                <div className="relative flex items-center justify-center gap-3">
                                    <span>準備好了，開啟連結</span>
                                    <span className="material-symbols-outlined group-hover:translate-x-1 group-hover:scale-110 transition-transform">auto_awesome</span>
                                </div>
                            </button>
                            <button
                                onClick={() => navigate(-1)}
                                className="flex-none sm:w-auto px-8 h-16 border border-[#064e3b] bg-[#022c22]/50 hover:bg-[#064e3b] text-emerald-100/80 hover:text-white font-bold text-base rounded-2xl transition-all flex items-center justify-center gap-2 hover:border-primary/50 active:scale-95"
                            >
                                <span className="material-symbols-outlined">hourglass_empty</span>
                                <span>再深呼吸一下</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 底部小字 */}
                <div className="mt-12 flex items-center justify-center gap-3 text-emerald-100/30 py-3 px-8 bg-[#022c22]/40 rounded-full border border-primary/5 mx-auto backdrop-blur-sm">
                    <span className="material-symbols-outlined text-base">verified_user</span>
                    <p className="text-xs font-medium tracking-wide">魔法結界已啟動，您的心靈數據絕對安全</p>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default LaunchPage;
