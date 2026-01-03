import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import apiClient from '../services/apiClient';
import { Header } from '../layout/Header';
import { Footer } from '../layout/Footer';

// 引入模組化組件
import HeroPanel from '../components/analysis/HeroPanel';
import RadarChart from '../components/analysis/RadarChart';
import DestinyGuide from '../components/analysis/DestinyGuide';
import DestinyBonds from '../components/analysis/DestinyBonds';
import LockedCard from '../components/analysis/LockedCard';

const DashboardPage = () => {
    const { } = useAuthStore();
    const [profileData, setProfileData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await apiClient.get('/auth/me');
                setProfileData(response.data);
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#050d09] text-primary">
                <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-x-0 -bottom-12 text-center font-display tracking-[0.3em] text-sm animate-pulse">
                        靈魂凝聚中...
                    </div>
                </div>
            </div>
        );
    }

    // 如果 profileData 為 null，顯示空狀態
    if (!profileData) {
        return (
            <div className="min-h-screen bg-[#050d09] text-white font-body selection:bg-primary/30 relative overflow-hidden flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <p className="text-gray-400 text-lg">無法載入英雄資料</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-primary text-black font-bold rounded hover:bg-primary/80 transition-colors"
                        >
                            重新載入
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const traits = profileData.traits || {};
    const identity = profileData.heroIdentity || {};
    const syncPercent = profileData.syncPercent || 0;

    return (
        <div className="min-h-screen bg-[#050d09] text-white font-body selection:bg-primary/30 relative overflow-hidden flex flex-col">
            <Header />

            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]"></div>
            </div>

            <main className="flex-1 relative z-10 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                {/* Hero section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Left: Hero Portrait */}
                    <div className="lg:col-span-5 space-y-6">
                        <HeroPanel
                            avatarUrl={profileData.heroAvatarUrl}
                            className={identity.class?.name}
                            classId={identity.class?.id}
                            classDescription={identity.class?.description}
                        />

                        {/* Awakening Progress */}
                        <div className="bg-card-dark rounded-xl p-5 border border-white/5 shadow-xl">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                                <span className="text-primary">Awakening Sync</span>
                                <span className="text-white">{syncPercent}%</span>
                            </div>
                            <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                                <div
                                    className="h-full bg-gradient-to-r from-primary via-emerald-400 to-primary background-animate transition-all duration-1000"
                                    style={{ width: `${syncPercent}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Detailed Stats Cards */}
                    <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Big 5 Stats Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="h-full"
                        >
                            {!traits.stats || Object.keys(traits.stats).length === 0 ? (
                                <LockedCard
                                    label="本源屬性 (Big 5)"
                                    unlockHint="元素能量尚未共鳴。完成屬性覺醒試煉以解鎖你的五大本源力量。"
                                    themeColor="blue"
                                    iconName="radar"
                                    onClick={() => window.location.href = '/map'}
                                />
                            ) : (
                                <div className="bg-card-dark rounded-2xl p-6 border border-blue-500/30 h-full relative overflow-hidden group hover:border-blue-500/60 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-blue-500/20 text-blue-300 p-1.5 rounded-lg border border-blue-500/30">
                                                <span className="material-symbols-outlined text-lg">radar</span>
                                            </span>
                                            <span className="text-sm font-bold text-blue-300 uppercase tracking-widest">本源屬性 (Big 5)</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center relative h-56">
                                        <RadarChart stats={traits.stats} />
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <span className="text-sm font-bold text-blue-400 bg-black/50 px-2 py-1 rounded backdrop-blur-sm border border-blue-500/20">
                                                屬性調和
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-center mt-4 space-y-2">
                                        <p className="text-sm text-gray-500 uppercase tracking-widest font-black">元素共鳴完畢</p>
                                        <div className="grid grid-cols-5 gap-2">
                                            {['智力(O)', '防禦(C)', '速度(E)', '魅力(A)', '洞察(N)'].map((label, idx) => (
                                                <div key={label} className="flex flex-col items-center">
                                                    <span className="text-blue-400 font-bold text-sm">{label.split('(')[0]}</span>
                                                    <span className="text-sm text-gray-500">
                                                        {Object.values(traits.stats || {})[idx] as number || 50}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        {/* DISC/Stance Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="h-full"
                        >
                            {!traits.stance_id ? (
                                <LockedCard
                                    label="戰技流派 (DISC)"
                                    unlockHint="戰魂沈睡於此。唯有經歷試煉方能覺醒專屬於你的戰鬥風格。"
                                    themeColor="red"
                                    onClick={() => window.location.href = '/map'}
                                />
                            ) : (
                                <div className="bg-card-dark rounded-2xl p-6 border border-red-500/30 h-full group hover:border-red-500/60 transition-colors">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-red-500/20 text-red-300 p-1.5 rounded-lg border border-red-500/30">
                                                <span className="material-symbols-outlined text-lg">shield</span>
                                            </span>
                                            <span className="text-sm font-bold text-red-300 uppercase tracking-widest">戰技姿態 (DISC)</span>
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-red-400 transition-colors">
                                        {traits.stance_id === 'D' ? '霸道征服者' : '優雅守護者'}
                                    </h3>
                                    <p className="text-sm text-gray-400 mb-4">{traits.stance_id} 型戰鬥風格</p>
                                    <div className="bg-black/30 p-3 rounded border border-white/10 italic text-sm text-gray-300">
                                        "以絕對的專注主宰戰局，洞察每一次破綻。"
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        {/* Gallup/Talent Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="h-full"
                        >
                            {!traits.talent_ids || traits.talent_ids.length === 0 ? (
                                <LockedCard
                                    label="天命之技 (Gallup)"
                                    unlockHint="上古卷軸封印著你的終極奧義。需集齊靈魂碎片以解鎖此力。"
                                    themeColor="yellow"
                                    iconName="lock_clock"
                                    onClick={() => window.location.href = '/map'}
                                />
                            ) : (
                                <div className="bg-card-dark rounded-2xl p-6 border border-yellow-500/30 h-full group hover:border-yellow-600/60 transition-colors">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-yellow-500/20 text-yellow-300 p-1.5 rounded-lg border border-yellow-500/30">
                                                <span className="material-symbols-outlined text-lg">menu_book</span>
                                            </span>
                                            <span className="text-sm font-bold text-yellow-300 uppercase tracking-widest">傳奇天賦 (Talents)</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {traits.talent_ids.map((tid: string) => (
                                            <span key={tid} className="bg-yellow-900/30 border border-yellow-500/30 text-yellow-500 text-sm font-bold px-2 py-1 rounded">
                                                {tid.replace('TAL_', '')}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-400 mt-4 leading-relaxed">
                                        已覺醒的靈魂天賦，賦予你超越常人的命運掌握力。
                                    </p>
                                </div>
                            )}
                        </motion.div>

                        {/* Enneagram Info Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="h-full"
                        >
                            {!traits.race_id ? (
                                <LockedCard
                                    label="靈魂印記 (Enneagram)"
                                    unlockHint="深層靈魂尚未覺醒。完成靈魂探索試煉以揭示你的本質動機。"
                                    themeColor="purple"
                                    iconName="visibility_lock"
                                    onClick={() => window.location.href = '/map'}
                                />
                            ) : (
                                <div className="bg-card-dark rounded-2xl p-6 border border-purple-500/30 h-full relative overflow-hidden group hover:border-purple-500/60 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-purple-500/20 text-purple-300 p-1.5 rounded-lg border border-purple-500/30">
                                                <span className="material-symbols-outlined text-lg">visibility</span>
                                            </span>
                                            <span className="text-sm font-bold text-purple-300 uppercase tracking-widest">靈魂印記 (Enneagram)</span>
                                        </div>
                                        <span className="text-sm px-2 py-0.5 rounded bg-purple-900/50 text-purple-200 border border-purple-500/20">Lv. MAX</span>
                                    </div>
                                    <div className="relative z-10">
                                        <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">
                                            {identity.race?.name?.split('(')[0] || "尚未尋獲"}
                                        </h3>
                                        <p className="text-sm text-gray-400 font-mono mb-4">{identity.race?.name?.match(/\((.*?)\)/)?.[1] || ""}</p>
                                        <div className="flex items-center gap-2 text-sm text-gray-300 bg-black/30 p-2 rounded border border-white/5">
                                            <span className="material-symbols-outlined text-purple-400 text-sm">auto_stories</span>
                                            <span>{identity.race?.description || "試煉將於地圖中展開。"}</span>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-4 -right-4 text-purple-500/5 rotate-12 group-hover:scale-110 transition-transform duration-500">
                                        <span className="material-symbols-outlined text-[100px]">visibility</span>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>

                {/* Bottom Section: Destiny Guide and Bonds */}
                <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Chronicle & Guide */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Chronicle */}
                        <div className="bg-card-dark rounded-xl p-6 border border-primary/20 relative overflow-hidden group hover:border-primary/40 transition-colors">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-primary">auto_stories</span>
                                <span className="text-sm font-bold text-primary uppercase tracking-widest">英雄史詩 (Chronicle)</span>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed font-serif italic border-l-2 border-primary/30 pl-4 py-1">
                                {profileData.latestChronicle || "尚未開始你的冒險，命運之書正等待著你的筆跡。"}
                            </p>
                            <div className="absolute bottom-0 right-0 p-4 opacity-5 pointer-events-none">
                                <span className="material-symbols-outlined text-[120px]">menu_book</span>
                            </div>
                        </div>

                        {/* Destiny Guide Section */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-1">
                                <h3 className="text-lg font-bold text-white/60 tracking-widest uppercase">命運概論 (Destiny Guide)</h3>
                            </div>
                            <DestinyGuide guide={profileData?.destiny_guide || {}} />
                        </div>
                    </div>

                    {/* Bonds */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <h3 className="text-lg font-bold text-white/60 tracking-widest uppercase">命運羈絆 (Destiny Bonds)</h3>
                        </div>
                        <DestinyBonds bonds={profileData?.destiny_bonds || {}} />
                    </div>
                </div>

                {/* Action Footer */}
                <div className="mt-20 flex justify-center pb-12">
                    <button
                        onClick={() => window.location.href = '/map'}
                        className="group relative px-12 py-4 bg-[#11d452] text-black font-black uppercase tracking-[0.3em] overflow-hidden hover:bg-white transition-all duration-500 hover:shadow-[0_0_30px_rgba(17,212,82,0.5)] active:scale-95"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            <span className="material-symbols-outlined text-xl">map</span>
                            重返主地圖
                        </span>
                        <div className="absolute inset-0 w-1/4 h-full bg-white/20 -skew-x-[30deg] -translate-x-full group-hover:translate-x-[400%] transition-transform duration-700"></div>
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default DashboardPage;
