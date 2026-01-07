import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuestStore } from '../stores/questStore';
import apiClient from '../services/apiClient';
import {
    TrendingUp, ChevronRight, Award,
    Shield, Target, Users, Compass, Trophy, Sparkles
} from 'lucide-react';
import { Header } from '../layout/Header';
import { Footer } from '../layout/Footer';

/**
 * AnalysisPage - 測驗完成後的分析結果頁面
 * 
 * 此頁面用於顯示玩家完成「單次測驗」後的分析結果。
 * 根據 quest_type 動態展示不同類型的結果內容。
 */

// 測驗類型對應的配置
const QUEST_CONFIG: Record<string, {
    title: string;
    icon: any;
    color: string;
    getContent: (finalResult: any) => { title: string; name: string; description: string; typeLabel?: string } | null;
}> = {
    mbti: {
        title: '職業覺醒',
        icon: Award,
        color: 'from-blue-500 to-cyan-500',
        getContent: (result) => result.class ? {
            title: '職業 · Class',
            name: result.class.name,
            description: result.class.description,
            typeLabel: result.class.metadata_info?.mbti || result.class_id?.replace('CLS_', '')
        } : null
    },
    bigfive: {
        title: '屬性解析',
        icon: Target,
        color: 'from-purple-500 to-pink-500',
        getContent: (result) => result.stats ? {
            title: '基礎屬性 · Stats',
            name: '五大屬性已解鎖',
            description: '你的心靈特質已被量化為五項基礎屬性'
        } : null
    },
    disc: {
        title: '戰鬥姿態',
        icon: Shield,
        color: 'from-red-500 to-orange-500',
        getContent: (result) => result.stance ? {
            title: '戰鬥姿態 · Stance',
            name: result.stance.name,
            description: result.stance.description,
            typeLabel: result.stance.metadata_info?.disc || result.stance_id?.replace('STN_', '')
        } : null
    },
    enneagram: {
        title: '種族覺醒',
        icon: Users,
        color: 'from-green-500 to-emerald-500',
        getContent: (result) => result.race ? {
            title: '種族 · Race',
            name: result.race.name,
            description: result.race.description,
            typeLabel: result.race.metadata_info?.enneagram
        } : null
    },
    gallup: {
        title: '天賦覺醒',
        icon: Compass,
        color: 'from-yellow-500 to-amber-500',
        getContent: (result) => {
            if (result.talents && result.talents.length > 0) {
                return {
                    title: '天賦技能 · Talent',
                    name: `已解鎖 ${result.talents.length} 個天賦`,
                    description: result.talents.map((t: any) => t.name).join('、')
                };
            }
            return null;
        }
    }
};

const AnalysisPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const regionQuestId = searchParams.get('region');
    const { finalResult, questId, resetQuest } = useQuestStore();
    const [localResult, setLocalResult] = useState<any>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);

    // 優先使用 Store 中的結果（剛完成測驗），否則使用本地抓取的歷史結果
    const displayResult = finalResult || localResult;
    const activeQuestId = questId || regionQuestId;

    // 若無結果且無 region 參數，跳轉回地圖
    useEffect(() => {
        if (!finalResult && !regionQuestId && !isLoadingProfile) {
            navigate('/map');
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

                    if (heroProfile && Object.keys(heroProfile).length > 0) {
                        const result = {
                            ...heroProfile,
                            levelInfo: {
                                level: profile.level,
                                exp: profile.exp,
                                isLeveledUp: false,
                                earnedExp: 0
                            }
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
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#050d09] text-primary">
                <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-x-0 -bottom-12 text-center font-display tracking-[0.3em] text-sm animate-pulse">
                        讀取歷史紀錄中...
                    </div>
                </div>
            </div>
        );
    }

    if (!displayResult || !activeQuestId) {
        return null;
    }

    const config = QUEST_CONFIG[activeQuestId];
    const content = config?.getContent(displayResult);
    const { levelInfo, stats } = displayResult;
    // 解析 Top 5 (這裡假設從 displayResult 中可以拿到或是構造)
    // 如果是 Gallup, 可能有多個 talent
    const topTalents = displayResult.topTalents || (displayResult.talent ? [displayResult.talent] : []);

    return (
        <div className="min-h-screen bg-background-dark text-white font-display">
            <Header />

            <main className="flex-1 flex flex-col items-center w-full max-w-[1200px] mx-auto px-4 py-24 md:px-8">
                <div className="w-full flex flex-col md:flex-row gap-8 md:gap-12 mb-16">

                    {/* 左側 Abby 嚮導欄 (Sticky) */}
                    <aside className="md:w-1/3 flex flex-col items-center md:items-start md:sticky md:top-28 h-fit self-start order-1 md:order-1">
                        <div className="relative group cursor-pointer">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-emerald-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                            <div className="relative size-32 md:size-48 rounded-full border-4 border-[#293829] bg-[#1a2e1a] overflow-hidden flex items-center justify-center">
                                <div
                                    className="w-full h-full bg-cover bg-center"
                                    style={{ backgroundImage: 'url("/assets/images/quest_bg.png")' }}
                                />
                            </div>
                            <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 bg-[#1a2e1a] rounded-full p-1.5 border border-[#293829]">
                                <div className="size-3 md:size-4 bg-primary rounded-full animate-pulse"></div>
                            </div>
                        </div>

                        <div className="mt-6 text-center md:text-left w-full">
                            <h3 className="text-xl font-bold text-white mb-1">嚮導 Abby</h3>
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                                <p className="text-primary/80 text-sm font-medium">Lv. 99 心靈導師</p>
                                {levelInfo && (
                                    <span className="px-2 py-0.5 rounded bg-primary/20 border border-primary/30 text-[10px] text-primary font-bold">
                                        YOUR LEVEL: {levelInfo.level}
                                    </span>
                                )}
                            </div>

                            {/* Abby 對話框 */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="mt-4 p-4 rounded-xl bg-[#1a2e1a] border border-[#293829] relative w-full max-w-[280px] mx-auto md:mx-0"
                            >
                                <div className="absolute -top-2 left-1/2 md:left-8 -translate-x-1/2 md:translate-x-0 w-4 h-4 bg-[#1a2e1a] border-t border-l border-[#293829] rotate-45"></div>
                                <p className="text-gray-300 text-sm leading-relaxed italic">
                                    "我看見你身上閃耀著獨特的光芒！這些符文代表著你與生俱來的最強武器。"
                                </p>
                            </motion.div>

                            {/* Level Up Info 放在左側 */}
                            {levelInfo && levelInfo.earnedExp > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20 w-full"
                                >
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="w-5 h-5 text-primary" />
                                        <span className="text-white text-sm font-bold">獲得 {levelInfo.earnedExp} EXP</span>
                                    </div>
                                    {levelInfo.isLeveledUp && (
                                        <div className="mt-2 text-primary text-xs font-black animate-bounce">LEVEL UP!</div>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    </aside>

                    {/* 右側 結果展示區 */}
                    <div className="flex-1 flex flex-col gap-6 order-2 md:order-2">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-[#293829]"></div>
                            <h2 className="text-2xl font-bold text-white whitespace-nowrap">
                                <span className="text-primary">{config?.title || '靈魂'}</span> 解析結果
                            </h2>
                            <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-[#293829]"></div>
                        </div>

                        {/* 主要結果卡片 */}
                        {content && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative bg-[#1a2e1a] border border-[#293829] rounded-xl p-6 md:p-8 hover:border-primary/50 transition-all duration-300 group"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Trophy className="w-32 h-32 text-white" />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-6 relative z-10">
                                    <div className="shrink-0">
                                        <div className="size-20 rounded-full bg-[#112111] border-2 border-primary flex items-center justify-center shadow-[0_0_15px_rgba(54,226,54,0.3)]">
                                            {config.icon && <config.icon className="w-10 h-10 text-primary" />}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-xl font-bold text-white">{content.name}</h3>
                                            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                                                {content.title}
                                            </span>
                                        </div>
                                        {content.typeLabel && (
                                            <div className="flex items-center gap-2 mb-3">
                                                <Sparkles className="w-4 h-4 text-primary" />
                                                <span className="text-primary text-sm font-bold tracking-wide">
                                                    {content.typeLabel}
                                                </span>
                                            </div>
                                        )}
                                        <div className="bg-[#112111]/50 rounded-lg p-4 border border-[#293829]">
                                            <p className="text-gray-300 text-sm leading-relaxed">
                                                {content.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* 如果有 Stats (Big Five) */}
                        {stats && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {Object.entries(stats).map(([key, value]: [string, any]) => (
                                    <motion.div
                                        key={key}
                                        whileHover={{ y: -4 }}
                                        className="bg-[#1a2e1a] border border-[#293829] rounded-xl p-6 transition-all duration-300 hover:border-primary/30"
                                    >
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="size-12 rounded-full bg-[#112111] border border-primary flex items-center justify-center">
                                                <Target className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold">{value.label}</h4>
                                                <span className="text-xs text-primary/80">基礎屬性</span>
                                            </div>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-white text-3xl font-bold">{value.score}</span>
                                            <span className="text-gray-500 text-sm">/ 100</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Gallup 多天賦展示 */}
                        {activeQuestId === 'gallup' && displayResult.talents && displayResult.talents.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-[#293829]"></div>
                                    <h3 className="text-lg font-bold text-white whitespace-nowrap">
                                        <span className="text-primary">傳奇技能</span> 解析
                                    </h3>
                                    <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-[#293829]"></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {displayResult.talents.map((talent: any, idx: number) => (
                                        <motion.div
                                            key={talent.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            whileHover={{ y: -4 }}
                                            className="bg-[#1a2e1a] border border-[#293829] rounded-xl p-5 transition-all duration-300 hover:border-primary/30"
                                        >
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="size-10 rounded-full bg-[#112111] border border-primary flex items-center justify-center">
                                                    <Compass className="w-5 h-5 text-primary" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-white font-bold">{talent.name}</h4>
                                                    <span className="text-xs text-primary/60">
                                                        {talent.metadata_info?.domain || '天賦技能'} #{idx + 1}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-gray-300 text-sm leading-relaxed">{talent.description}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Destiny Guide 命運指引 */}
                        {displayResult.destiny_guide && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-[#1a2e1a] border border-[#293829] rounded-xl p-6"
                            >
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Compass className="w-6 h-6 text-primary" />
                                    命運指引
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-[#112111]/50 rounded-lg border border-[#293829]">
                                        <h4 className="text-primary font-bold mb-2 flex items-center gap-2">
                                            <span className="size-2 bg-primary rounded-full"></span>
                                            今日預言
                                        </h4>
                                        <p className="text-gray-300 text-sm">{displayResult.destiny_guide.daily}</p>
                                    </div>
                                    <div className="p-4 bg-[#112111]/50 rounded-lg border border-[#293829]">
                                        <h4 className="text-primary font-bold mb-2 flex items-center gap-2">
                                            <span className="size-2 bg-primary rounded-full"></span>
                                            主線任務
                                        </h4>
                                        <p className="text-gray-300 text-sm">{displayResult.destiny_guide.main}</p>
                                    </div>
                                    <div className="p-4 bg-[#112111]/50 rounded-lg border border-[#293829]">
                                        <h4 className="text-primary font-bold mb-2 flex items-center gap-2">
                                            <span className="size-2 bg-primary rounded-full"></span>
                                            支線任務
                                        </h4>
                                        <p className="text-gray-300 text-sm">{displayResult.destiny_guide.side}</p>
                                    </div>
                                    <div className="p-4 bg-gradient-to-br from-[#112111]/70 to-[#1a2e1a]/50 rounded-lg border-2 border-primary/30">
                                        <h4 className="text-primary font-bold mb-2 flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                                            神諭啟示
                                        </h4>
                                        <p className="text-primary/90 text-sm italic leading-relaxed">
                                            「{displayResult.destiny_guide.oracle}」
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Destiny Bonds 命運羈絆 */}
                        {displayResult.destiny_bonds && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* 建議夥伴 */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-[#1a2e1a] border border-[#293829] rounded-xl p-6"
                                >
                                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <Users className="w-6 h-6 text-primary" />
                                        建議夥伴
                                    </h3>
                                    <div className="space-y-3">
                                        {displayResult.destiny_bonds.compatible.map((bond: any, idx: number) => (
                                            <div key={idx} className="p-3 bg-[#112111]/50 rounded-lg border border-primary/20 hover:border-primary/40 transition-colors">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="text-white font-bold">{bond.class_name}</h4>
                                                    <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-bold rounded">
                                                        {bond.sync_rate}%
                                                    </span>
                                                </div>
                                                <p className="text-gray-400 text-xs">{bond.advantage}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* 警戒對象 */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-[#1a2e1a] border border-[#293829] rounded-xl p-6"
                                >
                                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <Shield className="w-6 h-6 text-red-500" />
                                        警戒對象
                                    </h3>
                                    <div className="space-y-3">
                                        {displayResult.destiny_bonds.conflicting.map((bond: any, idx: number) => (
                                            <div key={idx} className="p-3 bg-[#2a1111]/50 rounded-lg border border-red-500/20 hover:border-red-500/40 transition-colors">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="text-white font-bold">{bond.class_name}</h4>
                                                    <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded">
                                                        {bond.risk_level}
                                                    </span>
                                                </div>
                                                <p className="text-gray-400 text-xs">{bond.friction_reason}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>
                        )}


                        {/* 按鈕區 */}
                        <div className="w-full flex flex-col items-center gap-6 mt-8">
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
            </main>

            <Footer />
        </div>
    );
};

export default AnalysisPage;
