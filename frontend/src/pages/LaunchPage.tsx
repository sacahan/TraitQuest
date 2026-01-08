import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AppLayout from '../layout/AppLayout';
import { useAuthStore } from '../stores/authStore';
import { useMapStore } from '../stores/mapStore';
import { AlertModal } from '../components/ui/AlertModal';

const QUEST_CONFIG: Record<string, {
    title: string;
    icon: string;
}> = {
    mbti: {
        title: 'MBTI 測驗',
        icon: 'Award',
    },
    bigfive: {
        title: '大五人格測驗',
        icon: 'Target',
    },
    disc: {
        title: 'DISC 倫理測驗',
        icon: 'Shield',
    },
    enneagram: {
        title: '九型人格測驗',
        icon: 'Users',
    },
    'gallup': {
        title: '馬斯洛需求測驗',
        icon: 'Compass',
    },
};

const LaunchPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const { user, fetchUser } = useAuthStore();
    const { regions, fetchRegions } = useMapStore();

    // Default values if user not loaded yet
    const questMode = user?.questMode || { mode: 'QUANTITATIVE', name: '量化試煉', description: '五段式選擇題' };
    const questionCount = user?.questionCount || 10;
    const isUnlocked = (user?.level || 0) >= 11;

    // Local state for alert
    const [alertConfig, setAlertConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmText: string;
    }>({
        isOpen: false,
        title: '',
        message: '',
        confirmText: '返回地圖'
    });

    useEffect(() => {
        // Fetch latest user data to ensure level/questMode is up to date
        fetchUser();
        // Ensure regions are loaded to check status
        fetchRegions();
    }, [fetchUser, fetchRegions]);

    useEffect(() => {
        const type = searchParams.get('type');

        if (!type) {
            setAlertConfig({
                isOpen: true,
                title: "迷失方向",
                message: "似乎遺失了試煉的指引信物（Type），無法開啟連結。請返回地圖重新選擇試煉區域。",
                confirmText: "返回地圖"
            });
            return;
        }

        // Wait for regions to load
        if (regions.length === 0) return;

        const region = regions.find(r => r.id === type);
        if (!region) {
            // Invalid region type
            setAlertConfig({
                isOpen: true,
                title: "未知區域",
                message: "此區域不存在於星圖之中。",
                confirmText: "返回地圖"
            });
            return;
        }

        if (region.status === 'LOCKED') {
            setAlertConfig({
                isOpen: true,
                title: "區域未解鎖",
                message: region.unlock_hint || "此區域尚未對您開放，請先完成前置試煉。",
                confirmText: "返回地圖"
            });
        }
    }, [searchParams, regions]);

    const handleStart = () => {
        const type = searchParams.get('type');
        if (type) {
            // Double check (though useEffect should cover it)
            const region = regions.find(r => r.id === type);
            if (region && region.status === 'LOCKED') {
                return; // Alert should be showing already
            }
            navigate(`/questionnaire?type=${type}`);
        }
    };

    const handleErrorClose = () => {
        setAlertConfig(prev => ({ ...prev, isOpen: false }));
        navigate('/map');
    };

    return (
        <AppLayout backgroundVariant="subtle">
            <AlertModal
                isOpen={alertConfig.isOpen}
                onClose={handleErrorClose}
                title={alertConfig.title}
                message={alertConfig.message}
                confirmText={alertConfig.confirmText}
                onConfirm={handleErrorClose}
            />

            {/* 魔法背景特效層 - 粒子與羽毛效果 */}
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
            </div>

            <div className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 py-8 lg:px-40">
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
                                    <span className="material-symbols-outlined text-xl">self_improvement</span>
                                </div>
                                <div>
                                    <div className="text-[12px] text-white/50 uppercase tracking-wider">試煉類型</div>
                                    <div className="text-white font-bold text-md">{QUEST_CONFIG[searchParams.get('type') || 'mbti']?.title || '心靈試煉'}</div>
                                </div>
                            </div>
                            {/* 試煉數量 */}
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#064e3b]/30 border border-primary/10">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined text-xl">quiz</span>
                                </div>
                                <div>
                                    <div className="text-[12px] text-white/50 uppercase tracking-wider">試煉數量</div>
                                    <div className="text-white font-bold text-md">{questionCount} 道題</div>
                                </div>
                            </div>
                            {/* 試煉形式 (根據等級顯示) */}
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#064e3b]/30 border border-purple-500/20">
                                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                                    <span className="material-symbols-outlined text-xl">psychology</span>
                                </div>
                                <div>
                                    <div className="text-[12px] text-white/50 uppercase tracking-wider">試煉形式</div>
                                    <div className="text-white font-bold text-md">{questMode.name}</div>
                                    <div className="text-[12px] text-purple-400/70">{questMode.mode === 'QUANTITATIVE' ? '選擇題型' : '開放式輸入'}</div>
                                </div>
                            </div>
                            {/* 解鎖提示 */}
                            <div className={`flex items-center gap-3 p-3 rounded-lg bg-[#064e3b]/30 border ${isUnlocked ? 'border-cyan-500/20' : 'border-white/10'}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isUnlocked ? 'bg-cyan-500/10 text-cyan-400' : 'bg-white/5 text-white/40'}`}>
                                    <span className="material-symbols-outlined text-xl">{isUnlocked ? 'lock_open' : 'lock'}</span>
                                </div>
                                <div>
                                    <div className="text-[12px] text-white/50 uppercase tracking-wider">靈性對話</div>
                                    {isUnlocked ? (
                                        <>
                                            <div className="text-white font-bold text-md">等級解鎖</div>
                                            <div className="text-[12px] text-cyan-400/70">深度靈魂對話</div>
                                        </>
                                    ) : (
                                        <>
                                                <div className="text-white/60 font-bold text-md">等級未達</div>
                                                <div className="text-[12px] text-white/30">等級達 11 級，即可解鎖</div>
                                        </>
                                    )}
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
            </div>
        </AppLayout>
    );
};

export default LaunchPage;
