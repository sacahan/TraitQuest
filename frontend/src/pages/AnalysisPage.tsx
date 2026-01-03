import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuestStore } from '../stores/questStore';
import apiClient from '../services/apiClient';
import { Sparkles, TrendingUp, Zap, ChevronRight, Award, Shield, Target, Users, Compass } from 'lucide-react';
import { Header } from '../layout/Header';

/**
 * AnalysisPage - 測驗完成後的分析結果頁面
 * 
 * 此頁面用於顯示玩家完成「單次測驗」後的分析結果。
 * 根據測驗類型（questId）只顯示對應的結果：
 * - MBTI → 職業（Class）
 * - Big Five → 基礎屬性（Stats）
 * - DISC → 戰鬥姿態（Stance）
 * - Enneagram → 種族（Race）
 * - Gallup → 天賦技能（Talent）
 * 
 * 所有測驗都會顯示升級資訊（Level, Exp）
 * 
 * 完整的五大類型展示由 DashboardPage 負責。
 */

// 測驗類型對應的配置
const QUEST_CONFIG: Record<string, {
    title: string;
    icon: any;
    color: string;
    getContent: (finalResult: any) => { title: string; name: string; description: string } | null;
}> = {
    mbti: {
        title: '職業覺醒',
        icon: Award,
        color: 'from-blue-500 to-cyan-500',
        getContent: (result) => result.class ? {
            title: '職業 · Class',
            name: result.class.name,
            description: result.class.description
        } : null
    },
    big_five: {
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
            description: result.stance.description
        } : null
    },
    enneagram: {
        title: '種族覺醒',
        icon: Users,
        color: 'from-green-500 to-emerald-500',
        getContent: (result) => result.race ? {
            title: '種族 · Race',
            name: result.race.name,
            description: result.race.description
        } : null
    },
    gallup: {
        title: '天賦覺醒',
        icon: Compass,
        color: 'from-yellow-500 to-amber-500',
        getContent: (result) => result.talent ? {
            title: '天賦技能 · Talent',
            name: result.talent.name,
            description: result.talent.description
        } : null
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
                    const finalReport = profile.traits?.final_report;

                    if (finalReport) {
                        // 構造 AnalysisPage 需要的結構
                        // 注意：這裡假設歷史資料中的 levelInfo 使用當前等級
                        const result = {
                            ...finalReport,
                            levelInfo: {
                                level: profile.level,
                                exp: profile.exp,
                                isLeveledUp: false,
                                earnedExp: 0
                            }
                        };
                        setLocalResult(result);
                    } else {
                        // 如果連歷史資料都沒有
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
    const Icon = config?.icon || Sparkles;

    return (
        <>
            <Header />
            <div className="min-h-screen bg-background-dark pt-20 pb-12 px-4 relative overflow-hidden">
                {/* 背景效果 */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(17,212,82,0.08)_0%,rgba(16,34,22,0)_70%)] opacity-60"></div>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto">
                    {/* 標題區 */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 px-4 py-2 rounded-full mb-4">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-primary text-sm font-bold uppercase tracking-wider">Analysis Complete</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 mb-4">
                            {config?.title || '靈魂解析'}完成
                        </h1>
                        <p className="text-gray-400 text-lg">你的英雄特質已被揭示</p>
                    </motion.div>

                    {/* Level Info */}
                    {levelInfo && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-[#11251c] border border-primary/30 rounded-lg p-6 mb-8"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center">
                                        <TrendingUp className="w-8 h-8 text-black" />
                                    </div>
                                    <div>
                                        <p className="text-primary text-sm font-bold uppercase tracking-wider">Level {levelInfo.level}</p>
                                        <p className="text-white text-2xl font-bold">{levelInfo.earnedExp} EXP 獲得</p>
                                    </div>
                                </div>
                                {levelInfo.isLeveledUp && (
                                    <div className="bg-primary/20 border border-primary/50 px-4 py-2 rounded-lg">
                                        <p className="text-primary font-bold">LEVEL UP!</p>
                                    </div>
                                )}
                            </div>
                            {levelInfo.milestone && (
                                <div className="mt-4 p-3 bg-black/30 rounded border-l-4 border-primary">
                                    <p className="text-gray-300 text-sm">{levelInfo.milestone}</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* 主要結果卡片 */}
                    {content && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-[#11251c] border border-primary/30 rounded-lg p-8 mb-8"
                        >
                            {/* Icon Header */}
                            <div className="flex items-center justify-center mb-6">
                                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                                    <Icon className="w-10 h-10 text-white" />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="text-center mb-6">
                                <div className="flex items-center justify-center gap-3 mb-4">
                                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                    <h2 className="text-primary text-sm font-bold uppercase tracking-wider">{content.title}</h2>
                                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                </div>
                                <h3 className="text-white text-3xl font-black mb-4">{content.name}</h3>
                                <p className="text-gray-300 text-base leading-relaxed max-w-2xl mx-auto">{content.description}</p>
                            </div>

                            {/* Stats Grid (僅 Big Five 測驗顯示) */}
                            {questId === 'big_five' && stats && (
                                <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
                                    {Object.entries(stats).map(([key, value]: [string, any]) => (
                                        <div key={key} className="bg-black/30 rounded-lg p-4 border border-white/5">
                                            <p className="text-gray-400 text-xs uppercase mb-2">{value.label}</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-white text-2xl font-bold">{value.score}</span>
                                                <span className="text-gray-500 text-sm">/100</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* 提示訊息 */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-black/20 border border-primary/20 rounded-lg p-4 mb-8 text-center"
                    >
                        <p className="text-gray-400 text-sm">
                            <Zap className="w-4 h-4 inline-block mr-2 text-primary" />
                            完整的英雄檔案（包含所有五大類型）可在
                            <span className="text-primary font-bold mx-1">完整檔案</span>
                            頁面查看
                        </p>
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <button
                            onClick={() => {
                                resetQuest();
                                navigate('/dashboard');
                            }}
                            className="group relative px-8 py-4 bg-primary/10 hover:bg-primary/20 border border-primary/50 hover:border-primary text-primary font-bold uppercase tracking-wider rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            查看完整檔案
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <button
                            onClick={() => {
                                resetQuest();
                                navigate('/map');
                            }}
                            className="group relative px-8 py-4 bg-[#11251c] hover:bg-primary/20 border border-primary/30 hover:border-primary text-white hover:text-primary font-bold uppercase tracking-wider rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            返回地圖
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                </div>
            </div>
        </>
    );
};

export default AnalysisPage;
