import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import apiClient from '../services/apiClient';
import AppLayout from '../layout/AppLayout';
import MagicHourglass from '../components/ui/MagicHourglass';

// 引入模組化組件
import HeroPanel from '../components/dashboard/HeroPanel';
import RadarChart from '../components/dashboard/RadarChart';
import DestinyGuide from '../components/dashboard/DestinyGuide';
import DestinyBonds from '../components/dashboard/DestinyBonds';
import LockedCard from '../components/dashboard/LockedCard';

const DashboardPage = () => {
    const { } = useAuthStore();
    const navigate = useNavigate();
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
                            Soul Awakening
                        </motion.p>
                        <motion.p
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-white/60 text-xs font-serif italic tracking-wider"
                        >
                            靈魂凝聚中... 開啟英雄史詩
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

    // 如果 profileData 為 null，顯示空狀態
    if (!profileData) {
        return (
            <AppLayout backgroundVariant="none">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <p className="text-gray-400 text-lg">無法載入英雄資料</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-primary text-black font-bold rounded hover:bg-primary/80 transition-colors"
                        >
                            重新載入
                        </button>
                        <button
                            onClick={() => {
                                useAuthStore.getState().logout();
                                window.location.href = '/';
                            }}
                            className="block w-full px-6 py-2 text-primary hover:text-white transition-colors text-sm underline"
                        >
                            登出並重試
                        </button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const profile = profileData.heroProfile || {};
    const identity = profileData.heroIdentity || {};
    const level = profileData.level || 1;
    const exp = profileData.exp || 0;

    return (
        <AppLayout>
            <div className="flex-1 relative z-10 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                {/* Chronicle - Full width */}
                <motion.div
                    className="w-full mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="bg-card-dark rounded-xl p-6 border border-primary/20 relative overflow-hidden group hover:border-primary/40 transition-colors h-full">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">auto_stories</span>
                                <span className="text-[16px] font-bold text-primary uppercase tracking-widest">英雄史詩 (Chronicle)</span>
                            </div>
                            <button
                                onClick={() => {
                                    const content = document.getElementById('chronicle-content');
                                    if (content) {
                                        content.classList.toggle('hidden');
                                    }
                                }}
                                className="text-primary hover:text-primary/70 transition-colors"
                            >
                                <span className="material-symbols-outlined">expand_more</span>
                            </button>
                        </div>
                        <motion.div
                            id="chronicle-content"
                            className="transition-all duration-300"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 0.3 }}
                        >
                            <p className="text-gray-300 text-[16px] leading-relaxed font-serif italic border-l-2 border-primary/30 pl-4 py-1 min-h-[60px]">
                                {profileData.latestChronicle || "尚未開始你的冒險,命運之書正等待著你的筆跡。"}
                            </p>
                            <div className="flex items-center justify-end gap-2 mt-2 mr-6">
                                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-primary/50"></div>
                                <p className="text-primary/80 text-sm font-bold tracking-wider italic">心靈嚮導 Abby</p>
                            </div>
                        </motion.div>
                        <div className="absolute bottom-0 right-0 p-4 opacity-5 pointer-events-none">
                            <span className="material-symbols-outlined text-[120px]">menu_book</span>
                        </div>
                    </div>
                </motion.div>

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

                        {/* Level & Experience - Moved here */}
                        <div className="bg-card-dark rounded-xl p-5 border border-white/5 shadow-xl flex flex-col justify-center">
                            <div className="flex items-center justify-center gap-4 text-sm w-full">
                                <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-lg text-primary">military_tech</span>
                                    <span className="text-primary font-bold whitespace-nowrap">Lv.{level}</span>
                                </div>
                                <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary via-emerald-400 to-primary background-animate transition-all duration-1000"
                                        style={{ width: `${Math.max((profileData.expProgress || 0) * 100, 2)}%` }}
                                    ></div>
                                </div>
                                <span className="text-gray-400 font-mono whitespace-nowrap">{exp} / {profileData.expToNextLevel || '???'} XP</span>
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
                            {!profile.stats || Object.keys(profile.stats).length === 0 ? (
                                <LockedCard
                                    label="角色屬性 (Big 5)"
                                    unlockHint="元素能量尚未共鳴。完成屬性覺醒試煉以解鎖你的五大本源力量。"
                                    themeColor="#00f0ff"
                                    onClick={() => window.location.href = '/intro/bigfive'}
                                />
                            ) : (
                                <div className="bg-card-dark rounded-2xl p-6 border border-blue-500/30 h-full relative overflow-hidden group hover:border-blue-500/60 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-2">
                                                <span className="bg-blue-500/20 text-blue-300 p-1 rounded-lg border border-blue-500/30">B</span>
                                                <span className="text-sm font-bold text-blue-300 uppercase tracking-widest">角色屬性 (Big 5)</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center relative h-56">
                                            <RadarChart stats={profile.stats} />
                                    </div>
                                        <div className="text-center mt-4 space-y-2">
                                        <div className="grid grid-cols-5 gap-2">
                                                {[
                                                    { key: 'STA_O', label: '智力' },
                                                    { key: 'STA_C', label: '防禦' },
                                                    { key: 'STA_E', label: '速度' },
                                                    { key: 'STA_A', label: '魅力' },
                                                    { key: 'STA_N', label: '洞察' }
                                                ].map((item) => {
                                                    const score = profile.stats?.[item.key] || 0;

                                                    return (
                                                        <div key={item.key} className="flex flex-col items-center">
                                                            <span className="text-blue-400 font-bold text-sm">{item.label}</span>
                                                            <span className="text-sm text-gray-500">
                                                                {score}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
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
                            {!profile.stance_id ? (
                                <LockedCard
                                    label="戰鬥流派 (DISC)"
                                    unlockHint="戰魂沈睡於此。唯有經歷試煉方能覺醒專屬於你的戰鬥風格。"
                                    themeColor="#ff4f4f"
                                    onClick={() => window.location.href = '/intro/disc'}
                                />
                            ) : (
                                    <div className="relative group h-full">
                                        <div className={`absolute inset-0 rounded-2xl blur-lg transition-all duration-700 ${profile.stance_id === 'STN_I' ? 'bg-cyan-500/10 group-hover:bg-cyan-500/20' :
                                            profile.stance_id === 'STN_S' ? 'bg-emerald-500/10 group-hover:bg-emerald-500/20' :
                                                profile.stance_id === 'STN_C' ? 'bg-violet-500/10 group-hover:bg-violet-500/20' :
                                                    'bg-red-500/10 group-hover:bg-red-500/20'
                                            }`}></div>
                                        <div className={`relative rounded-xl overflow-hidden border shadow-[0_0_15px_rgba(0,0,0,0.2)] bg-[#0e1f15] transition-all duration-300 h-full ${profile.stance_id === 'STN_I' ? 'border-cyan-500/50 group-hover:border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]' :
                                            profile.stance_id === 'STN_S' ? 'border-emerald-500/50 group-hover:border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]' :
                                                profile.stance_id === 'STN_C' ? 'border-violet-500/50 group-hover:border-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.15)]' :
                                                    'border-red-500/50 group-hover:border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                                            }`}>
                                            <div
                                                className="aspect-[11/12] w-full bg-center bg-no-repeat bg-cover group-hover:scale-105 transition-transform duration-700 ease-out relative"
                                                style={{
                                                    backgroundImage: `url(/assets/images/stances/${profile.stance_id?.toLowerCase() || 'stn_d'}.png)`
                                                }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#0e1f15] via-[#0e1f15]/40 to-transparent"></div>

                                                <div className="absolute bottom-0 left-0 w-full p-6 z-10">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={`p-1.5 rounded-lg border backdrop-blur-sm ${profile.stance_id === 'STN_I' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' :
                                                            profile.stance_id === 'STN_S' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                                                                profile.stance_id === 'STN_C' ? 'bg-violet-500/20 text-violet-300 border-violet-500/30' :
                                                                    'bg-red-500/20 text-red-300 border-red-500/30'
                                                            }`}>
                                                            <span className="material-symbols-outlined text-lg">swords</span>
                                                        </span>
                                                        <span className={`text-xs font-bold uppercase tracking-widest ${profile.stance_id === 'STN_I' ? 'text-cyan-300' :
                                                            profile.stance_id === 'STN_S' ? 'text-emerald-300' :
                                                                profile.stance_id === 'STN_C' ? 'text-violet-300' :
                                                                    'text-red-300'
                                                            }`}>戰鬥流派 (DISC)</span>
                                                    </div>

                                                    <h3 className={`text-2xl font-black font-display tracking-tight mb-1 transition-colors drop-shadow-lg ${profile.stance_id === 'STN_I' ? 'text-white group-hover:text-cyan-200' :
                                                        profile.stance_id === 'STN_S' ? 'text-white group-hover:text-emerald-200' :
                                                            profile.stance_id === 'STN_C' ? 'text-white group-hover:text-violet-200' :
                                                                'text-white group-hover:text-red-200'
                                                        }`}>
                                                        {profile.stance_id === 'STN_D' ? '烈焰戰姿' :
                                                            profile.stance_id === 'STN_I' ? '潮汐之歌' :
                                                                profile.stance_id === 'STN_S' ? '大地磐石' :
                                                                    profile.stance_id === 'STN_C' ? '星辰軌跡' : '未覺醒'}
                                                    </h3>

                                                    <p className={`font-bold text-sm tracking-wide mb-1 italic ${profile.stance_id === 'STN_I' ? 'text-cyan-400' :
                                                        profile.stance_id === 'STN_S' ? 'text-emerald-400' :
                                                            profile.stance_id === 'STN_C' ? 'text-violet-400' :
                                                                'text-red-400'
                                                        }`}>
                                                        {profile.stance_id.replace('STN_', '')} Type
                                                    </p>

                                                    <div className="backdrop-blur-sm p-1 italic text-sm text-gray-300 line-clamp-2 ">
                                                        {profile.stance?.description || '以絕對的專注主宰戰局，洞察每一次破綻。'}
                                                    </div>
                                                </div>
                                            </div>
                                    </div>
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
                            {!profile.race_id ? (
                                <LockedCard
                                    label="靈魂種族 (Enneagram)"
                                    unlockHint="深層靈魂尚未覺醒。完成靈魂探索試煉以揭示你的本質動機。"
                                    themeColor="#bd00ff"
                                    onClick={() => window.location.href = '/intro/enneagram'}
                                />
                            ) : (
                                    <div className="relative group h-full">
                                        <div className="absolute inset-0 bg-purple-500/10 rounded-2xl blur-lg group-hover:bg-purple-500/20 transition-all duration-700"></div>
                                        <div className="relative rounded-xl overflow-hidden border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-[#0e1f15] transition-all duration-300 group-hover:border-purple-400 h-full">
                                            <div
                                                className="aspect-[12/10] w-full bg-center bg-no-repeat bg-cover group-hover:scale-105 transition-transform duration-700 ease-out relative"
                                                style={{
                                                    backgroundImage: `url(/assets/images/races/race_${profile.race_id?.match(/RACE_(\d+)/)?.[1] || '1'}.png)`
                                                }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#0e1f15] via-[#0e1f15]/30 to-transparent"></div>

                                                <div className="absolute bottom-0 left-0 w-full p-4 z-10">
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <span className="size-4 rounded bg-purple-600 text-white flex items-center justify-center font-bold text-[10px] shadow-lg">E</span>
                                                        <span className="text-purple-400 font-bold text-[10px] tracking-widest uppercase">靈魂種族 (Enneagram)</span>
                                                    </div>

                                                    <h3 className="text-xl font-black text-white font-display tracking-tight group-hover:text-purple-200 transition-colors">
                                                        {profile.race?.name || "尚未尋獲"}
                                                    </h3>

                                                    <p className="text-[#c9a0dc] font-bold text-sm mt-0.5 tracking-wide">
                                                        {profile.race_id?.replace("RACE_", "Type ")}
                                                    </p>

                                                    <p className="text-gray-300 text-xs mt-2 leading-relaxed border-l-2 border-purple-500/50 pl-2 italic line-clamp-2">
                                                        {profile.race?.description || "試煉將於地圖中展開。"}
                                                    </p>
                                            </div>
                                            </div>
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
                            {!profile.talent_ids || profile.talent_ids.length === 0 ? (
                                <LockedCard
                                    label="天賦技能 (Gallup)"
                                    unlockHint="上古卷軸封印著你的終極奧義。需集齊靈魂碎片以解鎖此力。"
                                    themeColor="#ffd000"
                                    onClick={() => window.location.href = '/intro/gallup'}
                                />
                            ) : (
                                    <div className="bg-card-dark rounded-2xl p-6 border border-yellow-500/30 h-full group hover:border-yellow-600/60 transition-colors">
                                        <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-2">
                                                <span className="bg-yellow-500/20 text-yellow-300 p-1.5 rounded-lg border border-yellow-500/30">
                                                    <span className="material-symbols-outlined text-lg">trophy</span>
                                            </span>
                                                <span className="text-sm font-bold text-yellow-300 uppercase tracking-widest">天賦技能 (Talents)</span>
                                        </div>
                                    </div>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.talent_ids.map((tid: string, index: number) => {
                                                // 優先使用 talent_names,如果不存在則顯示 ID
                                                const displayName = profile.talent_names?.[index] || tid.replace('TAL_', '');
                                                return (
                                                    <span key={tid} className="bg-yellow-900/30 border border-yellow-500/30 text-yellow-500 text-sm font-bold px-2 py-1 rounded">
                                                        {displayName}
                                                    </span>
                                                );
                                            })}
                                    </div>
                                        <p className="text-sm text-gray-400 mt-4 leading-relaxed">
                                            已覺醒的靈魂天賦，賦予你超越常人的命運掌握力。
                                        </p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>

                {/* Bottom Section: Destiny Guide and Bonds */}
                <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Destiny Guide Section */}
                    <div className="lg:col-span-8 space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <h3 className="text-lg font-bold text-white/60 tracking-widest uppercase">靈魂指引</h3>
                        </div>
                        <DestinyGuide guide={profile.destiny_guide || {}} />
                    </div>

                    {/* Bonds */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <h3 className="text-lg font-bold text-white/60 tracking-widest uppercase">命運羈絆</h3>
                        </div>
                        <DestinyBonds bonds={profile.destiny_bonds || {}} />
                    </div>
                </div>

                {/* Action Footer */}
                <div className="mt-20 flex justify-center pb-12">
                    <button
                        onClick={() => navigate('/map')}
                        className="group flex min-w-[200px] cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-full h-14 px-10 bg-primary text-[#112217] hover:scale-105 active:scale-95 active:brightness-125 transition-all duration-300 text-lg font-bold shadow-[0_0_20px_rgba(17,212,82,0.4)] hover:shadow-[0_0_30px_rgba(17,212,82,0.8)] animate-breathing-glow z-10"
                    >
                        <span className="material-symbols-outlined text-2xl transition-transform group-hover:rotate-12">map</span>
                        <span className="truncate font-body uppercase tracking-wider">重返地圖</span>
                    </button>
                </div>
            </div>
        </AppLayout>
    );
};

export default DashboardPage;
