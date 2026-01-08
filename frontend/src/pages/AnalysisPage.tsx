import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuestStore } from '../stores/questStore';
import apiClient from '../services/apiClient';
import {
    TrendingUp, ChevronRight, Shield, Compass, Users, Sparkles
} from 'lucide-react';
import AppLayout from '../layout/AppLayout';
import MagicHourglass from '../components/ui/MagicHourglass';
import { AlertModal } from '../components/ui/AlertModal';

// Specialized Analysis Panels
import MbtiPanel from '../components/analysis/MbtiPanel';
import EnneagramPanel from '../components/analysis/EnneagramPanel';
import BigFivePanel from '../components/analysis/BigFivePanel';
import DiscPanel from '../components/analysis/DiscPanel';
import GallupPanel from '../components/analysis/GallupPanel';

const AnalysisPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const regionQuestId = searchParams.get('region');
    const { finalResult, questId, resetQuest } = useQuestStore();
    const [localResult, setLocalResult] = useState<any>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [showErrorAlert, setShowErrorAlert] = useState(false);

    // 優先使用 Store 中的結果（剛完成測驗），否則使用本地抓取的歷史結果
    const displayResult = finalResult || localResult;
    const activeQuestId = questId || regionQuestId;

    // 若無結果且無 region 參數，跳轉回地圖
    // 若無結果且無 region 參數，顯示錯誤並跳轉回地圖
    useEffect(() => {
        if (!finalResult && !regionQuestId && !isLoadingProfile) {
            setShowErrorAlert(true);
        }
    }, [finalResult, regionQuestId, navigate, isLoadingProfile]);

    // 如果帶有 region 參數且 Store 為空，嘗試抓取歷史資料
    useEffect(() => {
        const fetchHistory = async () => {
            if (!finalResult && regionQuestId) {
                setIsLoadingProfile(true);
                try {
                    const response = await apiClient.get('/auth/me');
                    const profile = response.data;
                    const heroProfile = profile.heroProfile || {};
                    const latestChronicle = profile.latestChronicle || '你的史詩正在等著編寫...';

                    if (heroProfile && Object.keys(heroProfile).length > 0) {
                        const result = {
                            ...heroProfile,
                            levelInfo: {
                                level: profile.level,
                                exp: profile.exp,
                                isLeveledUp: false,
                                earnedExp: 0
                            },
                            latestChronicle
                        };
                        setLocalResult(result);
                    } else {
                        navigate('/map');
                    }
                } catch (error) {
                    console.error("Failed to fetch history for AnalysisPage:", error);
                    navigate('/map');
                } finally {
                    setIsLoadingProfile(false);
                }
            }
        };
        fetchHistory();
    }, [finalResult, regionQuestId, navigate]);

    if (isLoadingProfile) {
        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-[#0a0f0d]/90 backdrop-blur-xl z-[100] flex flex-col items-center justify-center overflow-hidden"
                >
                    {/* 背景氛圍光 */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#11D45222_0%,_transparent_70%)] animate-pulse"></div>

                    <div className="relative flex items-center justify-center scale-125 lg:scale-150 mb-12">
                        <MagicHourglass />
                    </div>

                    <div className="mt-8 flex flex-col items-center z-10">
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-primary text-sm font-black tracking-[0.4em] uppercase mb-2"
                        >
                            Hero Chronicle Opening
                        </motion.p>
                        <motion.p
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-white/60 text-xs font-serif italic tracking-wider"
                        >
                            展開英雄史詩...
                        </motion.p>

                        <div className="mt-6 w-32 h-[1px] bg-white/10 relative overflow-hidden rounded-full">
                            <motion.div
                                animate={{ left: ["-100%", "100%"] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-primary/40 to-transparent"
                            />
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        );
    }

    if (!displayResult || !activeQuestId) {
        return null;
    }

    const { levelInfo } = displayResult;

    return (
        <AppLayout>
            <div className="w-full max-w-[1200px] mx-auto px-4 py-24 md:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full mb-12 items-start">

                    {/* Left Column: Abby & Chronicle */}
                    <div className="w-full flex flex-col items-center">
                        {/* Abby Avatar */}
                        <div className="relative group cursor-pointer mb-6">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-emerald-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                            <div className="relative size-32 md:size-40 rounded-full border-4 border-[#293829] bg-[#1a2e1a] overflow-hidden flex items-center justify-center">
                                <div
                                    className="w-full h-full bg-cover bg-center"
                                    style={{ backgroundImage: 'url("/assets/images/quest_bg.png")' }}
                                />
                            </div>
                            <div className="absolute bottom-2 right-2 bg-[#1a2e1a] rounded-full p-1.5 border border-[#293829]">
                                <div className="size-3 bg-primary rounded-full animate-pulse"></div>
                            </div>
                        </div>

                        {/* Abby Dialogue (Chronicle) */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative w-full bg-[#1a2e1a]/80 backdrop-blur-md border border-[#293829] rounded-2xl p-6 text-center shadow-xl"
                        >
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#1a2e1a] border-t border-l border-[#293829] rotate-45 transform origin-center"></div>

                            <h3 className="text-primary font-bold text-sm mb-2 uppercase tracking-wider">心靈嚮導 Abby</h3>
                            <p className="text-gray-200 text-[16px] font-serif italic leading-relaxed">
                                "{displayResult.chronicle || displayResult.latestChronicle || "命運的齒輪開始轉動，你的靈魂特質已在星圖中顯現..."}"
                            </p>

                            {/* Level Info - Integrated into Abby's section */}
                            <div className="mt-6 pt-6 border-t border-white/5 flex flex-col items-center gap-3">
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="text-primary font-bold">Lv.{levelInfo?.level || 1}</span>
                                    <div className="w-32 md:w-48 h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary via-emerald-400 to-primary background-animate"
                                            style={{ width: `${Math.max(Math.min(((levelInfo?.exp || 0) / 5500) * 100, 100), 2)}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-gray-400 font-mono">{levelInfo?.exp || 0} XP</span>
                                </div>

                                {levelInfo && levelInfo.earnedExp > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex items-center gap-2 text-primary"
                                    >
                                        <TrendingUp className="w-4 h-4" />
                                        <span className="text-sm font-bold">+{levelInfo.earnedExp} EXP</span>
                                        {levelInfo.isLeveledUp && (
                                            <span className="ml-2 text-xs font-black animate-bounce bg-primary text-black px-2 py-0.5 rounded">LEVEL UP!</span>
                                        )}
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Specialized Result Panels */}
                    <div className="w-full">
                        {activeQuestId === 'mbti' && <MbtiPanel result={displayResult} />}
                        {activeQuestId === 'enneagram' && <EnneagramPanel result={displayResult} />}
                        {activeQuestId === 'bigfive' && <BigFivePanel result={displayResult} />}
                        {activeQuestId === 'disc' && <DiscPanel result={displayResult} />}
                        {activeQuestId === 'gallup' && <GallupPanel result={displayResult} />}
                    </div>
                </div>


                {/* Bottom Section: Destiny Info & Actions */}
                <div className="w-full max-w-[1200px] mx-auto space-y-12">

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-stretch">
                        {/* Destiny Guide 命運指引 */}
                        {displayResult.destiny_guide && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="bg-[#1a2e1a] border border-[#293829] rounded-xl p-8 w-full h-full"
                            >
                                <div className="flex items-center justify-center gap-3 mb-8">
                                    <Compass className="w-6 h-6 text-primary" />
                                    <h3 className="text-2xl font-bold text-white">命運指引</h3>
                                </div>

                                <div className="flex flex-col gap-6">
                                    <div className="space-y-4">
                                        <div className="p-4 bg-[#112111]/50 rounded-lg border border-[#293829] hover:border-primary/20 transition-colors">
                                            <h4 className="text-primary font-bold mb-2 flex items-center gap-2">
                                                <span className="size-1.5 bg-primary rounded-full"></span>
                                                今日預言
                                            </h4>
                                            <p className="text-gray-300 text-sm leading-relaxed">{displayResult.destiny_guide.daily}</p>
                                        </div>
                                        <div className="p-4 bg-[#112111]/50 rounded-lg border border-[#293829] hover:border-primary/20 transition-colors">
                                            <h4 className="text-primary font-bold mb-2 flex items-center gap-2">
                                                <span className="size-1.5 bg-primary rounded-full"></span>
                                                主線任務
                                            </h4>
                                            <p className="text-gray-300 text-sm leading-relaxed">{displayResult.destiny_guide.main}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-[#112111]/50 rounded-lg border border-[#293829] hover:border-primary/20 transition-colors">
                                            <h4 className="text-primary font-bold mb-2 flex items-center gap-2">
                                                <span className="size-1.5 bg-primary rounded-full"></span>
                                                支線任務
                                            </h4>
                                            <p className="text-gray-300 text-sm leading-relaxed">{displayResult.destiny_guide.side}</p>
                                        </div>
                                        <div className="p-4 bg-gradient-to-br from-[#112111]/70 to-[#1a2e1a]/50 rounded-lg border-2 border-primary/30 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-2 opacity-10">
                                                <Sparkles className="w-12 h-12 text-primary" />
                                            </div>
                                            <h4 className="text-primary font-bold mb-2 flex items-center gap-2">
                                                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                                                神諭啟示
                                            </h4>
                                            <p className="text-primary/90 text-sm italic leading-relaxed font-serif">
                                                「{displayResult.destiny_guide.oracle}」
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Destiny Bonds 命運羈絆 */}
                        {displayResult.destiny_bonds && (
                            <div className="flex flex-col gap-6 w-full h-full">
                                {/* 建議夥伴 */}
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
                                        {displayResult.destiny_bonds.compatible.map((bond: any, idx: number) => (
                                            <div key={idx} className="p-4 bg-[#112111]/50 rounded-lg border border-primary/20 hover:border-primary/40 transition-colors hover:bg-primary/5">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="text-white font-bold">{bond.class_name} <span className="text-xs text-gray-500 font-normal ml-1">({bond.class_id.replace('CLS_', '').replace('STN_', '')})</span></h4>
                                                    <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-bold rounded">
                                                        契合度 {bond.sync_rate || 'High'}%
                                                    </span>
                                                </div>
                                                <p className="text-gray-400 text-sm">{bond.description || bond.advantage}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* 警戒對象 */}
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
                                        {displayResult.destiny_bonds.conflicting.map((bond: any, idx: number) => (
                                            <div key={idx} className="p-4 bg-[#2a1111]/50 rounded-lg border border-red-500/20 hover:border-red-500/40 transition-colors hover:bg-red-500/5">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="text-white font-bold">{bond.class_name} <span className="text-xs text-gray-500 font-normal ml-1">({bond.class_id.replace('CLS_', '').replace('STN_', '')})</span></h4>
                                                    <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded">
                                                        風險: {bond.risk_level}
                                                    </span>
                                                </div>
                                                <p className="text-gray-400 text-sm">{bond.description || bond.friction_reason}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </div>


                    {/* 按鈕區 */}
                    <div className="w-full flex flex-col items-center gap-6 pb-12">
                        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
                            <button
                                onClick={() => {
                                    resetQuest();
                                    navigate('/dashboard');
                                }}
                                className="flex-1 group relative overflow-hidden rounded-full bg-primary px-8 py-4 text-[#10231a] font-extrabold shadow-[0_0_20px_rgba(54,226,54,0.4)] transition-all hover:shadow-[0_0_30px_rgba(54,226,54,0.6)] hover:scale-105 active:scale-95"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    前往公會大廳
                                    <ChevronRight className="w-5 h-5" />
                                </span>
                            </button>
                            <button
                                onClick={() => {
                                    resetQuest();
                                    navigate('/map');
                                }}
                                className="flex-1 rounded-full border border-primary/30 bg-[#1a2e1a] px-8 py-4 text-white font-bold hover:bg-primary/10 transition-all hover:border-primary active:scale-95"
                            >
                                返回地圖
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <AlertModal
                isOpen={showErrorAlert}
                onClose={() => navigate('/map')}
                title="資料錯誤"
                message="無法讀取冒險結果，將返回地圖。"
                confirmText="返回地圖"
                onConfirm={() => navigate('/map')}
            />
        </AppLayout>
    );
};

export default AnalysisPage;
