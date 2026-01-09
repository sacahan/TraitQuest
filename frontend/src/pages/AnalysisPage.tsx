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
    const [profileData, setProfileData] = useState<any>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [showErrorAlert, setShowErrorAlert] = useState(false);

    // 總是從 API 獲取最新的 Profile 資料，確保資料一致性
    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoadingProfile(true);
            try {
                const response = await apiClient.get('/auth/me');
                const profile = response.data;
                const heroProfile = profile.heroProfile || {};
                const latestChronicle = profile.latestChronicle || '你的史詩正在等待編寫...';

                // 組合顯示用的資料結構
                const result = {
                    ...heroProfile,
                    levelInfo: {
                        level: profile.level,
                        exp: profile.exp,
                        // 如果 Store 中有剛剛完成的任務結果，且這是我們剛完成的任務，則顯示升級特效
                        isLeveledUp: finalResult?.level_info?.is_level_up || false,
                        earnedExp: finalResult?.level_info?.earned_exp || 0
                    },
                    latestChronicle
                };

                // 檢查是否有足夠的資料可以顯示
                if (Object.keys(heroProfile).length > 0) {
                    setProfileData(result);
                } else if (!isLoadingProfile) {
                    // 只有在非初始加載時才判斷為錯誤 (避免一閃而過的錯誤)
                    // 但這裡是 fetch 結束，所以如果是空的，可能就是真的沒資料
                    // 不過剛註冊可能沒資料，這取決於業務邏輯。
                    // 假設 AnalysisPage 只有在有資料時才有意義 (除了 region 參數? 但 region 參數也是看資料)
                    // 如果是直接與 regionQuestId 關聯...
                    if (!regionQuestId && !finalResult) {
                        // 如果沒有指定區域，也沒有剛剛的結果，且 Profile 也是空的，那就回地圖
                        // 但如果有 regionQuestId，可能是要看特定區域的分析，但這裡我們統一顯示 Profile
                        // 暫時維持原邏輯：沒資料就回地圖
                        // setShowErrorAlert(true); // 暫不彈窗，直接回地圖或顯示空狀態?
                        // 為了使用者體驗，如果真的沒資料，跳轉
                        if (Object.keys(heroProfile).length === 0) {
                            console.warn("No hero profile found, redirecting to map.");
                            navigate('/map');
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch profile for AnalysisPage:", error);
                setShowErrorAlert(true);
            } finally {
                setIsLoadingProfile(false);
            }
        };

        fetchProfile();
    }, [navigate, regionQuestId]); // 依賴項移除 finalResult，避免重複觸發，只在 mount 或 region 改變時抓取 (其實 region 改變不一定要重抓，但保險起見)

    const activeQuestId = questId || regionQuestId;

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
                            Loading Soul Architecture
                        </motion.p>
                        <motion.p
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-white/60 text-xs font-serif italic tracking-wider"
                        >
                            正在讀取靈魂檔案...
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

    if (!profileData || !activeQuestId) {
        return null;
    }

    const { levelInfo } = profileData;

    return (
        <AppLayout>
            <div className="w-full max-w-[1200px] mx-auto px-4 py-14 md:px-8 relative z-10">
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
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 2.5, ease: "easeOut", delay: 0.5 }}
                                className="text-gray-200 text-[16px] font-serif italic leading-relaxed text-left"
                            >
                                "{profileData.chronicle || profileData.latestChronicle || "命運的齒輪開始轉動，你的靈魂特質已在星圖中顯現..."}"
                            </motion.p>
                            <div className="flex items-center justify-end gap-2">
                                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-primary/50"></div>
                                <p className="text-primary/80 text-sm font-bold tracking-wider italic">心靈嚮導 Abby</p>
                            </div>

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
                        {activeQuestId === 'mbti' && <MbtiPanel result={profileData} />}
                        {activeQuestId === 'enneagram' && <EnneagramPanel result={profileData} />}
                        {activeQuestId === 'bigfive' && <BigFivePanel result={profileData} />}
                        {activeQuestId === 'disc' && <DiscPanel result={profileData} />}
                        {activeQuestId === 'gallup' && <GallupPanel result={profileData} />}
                    </div>
                </div>


                {/* Bottom Section: Destiny Info & Actions */}
                <div className="w-full max-w-[1200px] mx-auto space-y-12">

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-stretch">
                        {/* Destiny Guide 命運指引 */}
                        {profileData.destiny_guide && (
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

                                <div className="flex flex-col gap-3">
                                    {/* 今日預言 */}
                                    <div className="bg-[#0e1f15] p-4 rounded-xl border border-white/5 hover:border-primary/30 hover:bg-[#12241a] transition-all group flex items-center gap-4">
                                        <div className="hidden sm:flex size-10 rounded-full bg-primary/10 items-center justify-center shrink-0 border border-primary/20">
                                            <Sparkles className="w-5 h-5 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="bg-primary/10 text-primary text-[14px] font-bold px-2 py-0.5 rounded border border-primary/20 uppercase">每日實踐</div>
                                            </div>
                                            <p className="text-gray-300 text-[16px] leading-relaxed italic font-serif">{profileData.destiny_guide.daily}</p>
                                        </div>
                                    </div>

                                    {/* 主線任務 */}
                                    <div className="bg-[#0e1f15] p-4 rounded-xl border border-white/5 hover:border-amber-500/30 hover:bg-[#1f1a0e] transition-all group flex items-center gap-4">
                                        <div className="hidden sm:flex size-10 rounded-full bg-amber-500/10 items-center justify-center shrink-0 border border-amber-500/20">
                                            <TrendingUp className="w-5 h-5 text-amber-500" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="bg-amber-500/10 text-amber-400 text-[14px] font-bold px-2 py-0.5 rounded border border-amber-500/20 uppercase">主線任務</div>
                                            </div>
                                            <p className="text-gray-300 text-[16px] leading-relaxed italic font-serif">{profileData.destiny_guide.main}</p>
                                        </div>
                                    </div>

                                    {/* 支線任務 */}
                                    <div className="bg-[#0e1f15] p-4 rounded-xl border border-white/5 hover:border-sky-500/30 hover:bg-[#0e1c24] transition-all group flex items-center gap-4">
                                        <div className="hidden sm:flex size-10 rounded-full bg-sky-500/10 items-center justify-center shrink-0 border border-sky-500/20">
                                            <Compass className="w-5 h-5 text-sky-500" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="bg-sky-500/10 text-sky-400 text-[14px] font-bold px-2 py-0.5 rounded border border-sky-500/20 uppercase">支線任務</div>
                                            </div>
                                            <p className="text-gray-300 text-[16px] leading-relaxed italic font-serif">{profileData.destiny_guide.side}</p>
                                        </div>
                                    </div>

                                    {/* 神諭啟示 */}
                                    <div className="bg-[#0e1f15] p-4 rounded-xl border border-white/5 hover:border-purple-500/30 hover:bg-[#161024] transition-all group flex items-center gap-4">
                                        <div className="hidden sm:flex size-10 rounded-full bg-purple-500/10 items-center justify-center shrink-0 border border-purple-500/20">
                                            <Sparkles className="w-5 h-5 text-purple-500" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="bg-purple-500/10 text-purple-400 text-[14px] font-bold px-2 py-0.5 rounded border border-purple-500/20 uppercase flex items-center gap-1">神諭啟示</div>
                                            </div>
                                            <p className="text-gray-300 text-[16px] italic leading-relaxed font-serif">「{profileData.destiny_guide.oracle}」</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Destiny Bonds 命運羈絆 */}
                        {profileData.destiny_bonds && (
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
                                        {profileData.destiny_bonds.compatible.map((bond: any, idx: number) => (
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
                                        {profileData.destiny_bonds.conflicting.map((bond: any, idx: number) => (
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
