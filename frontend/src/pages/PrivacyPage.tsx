import AppLayout from '../layout/AppLayout';

const PrivacyPage = () => {
    return (
        <AppLayout backgroundVariant="none">
            <div className="w-full flex-grow flex flex-col items-center relative">
                {/* Hero Section */}
                <section className="w-full relative py-20 overflow-hidden border-b border-[#23482f]">
                    <div
                        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2727&auto=format&fit=crop')] bg-cover bg-center opacity-10 pointer-events-none"
                    ></div>
                    <div className="max-w-[1000px] mx-auto px-6 relative z-10 text-center">
                        <div
                            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 backdrop-blur-sm"
                        >
                            <span className="material-symbols-outlined text-primary text-sm">shield</span>
                            <span className="text-primary text-xs font-bold uppercase tracking-wider">靈魂契約 (Privacy Scroll)</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight tracking-tight">
                            <p className="mb-4">隱私卷軸</p><span className="text-primary drop-shadow-[0_0_10px_rgba(17,212,82,0.5)]">守護你的秘密</span>
                        </h1>
                        <p className="text-lg text-[#90cbad] max-w-2xl mx-auto leading-relaxed">
                            在我們探索你的靈魂屬性之前，我們必須立下誓約。這份隱私卷軸詳細記載了我們如何收集、使用並守護你在冒險途中留下的足跡。
                        </p>
                    </div>
                </section>

                {/* Privacy Content */}
                <div className="w-full max-w-[900px] px-6 py-20 flex flex-col gap-10">
                    {/* Section 1 */}
                    <div
                        className="bg-[#1a3323]/30 border border-[#23482f] p-8 rounded-2xl flex flex-col gap-6 group hover:border-primary transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-3xl text-primary">auto_stories</span>
                            <h3 className="text-2xl font-bold text-white">序章：我們的承諾</h3>
                        </div>
                        <p className="text-[#90cbad] leading-relaxed">
                            當你使用 Google 帳號 (OAuth) 登入 TraitQuest
                            世界時，你將一部分信任交給了我們。我們深知這份信任的重要性，並承諾像守護稀有裝備一樣守護你的資料。我們不會將你的靈魂碎片（個人數據）出售給任何黑暗勢力。
                        </p>
                    </div>

                    {/* Section 2 */}
                    <div className="flex flex-col gap-8">
                        <h2 className="text-white text-2xl font-bold flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">inventory_2</span>
                            資料收集 (戰利品清單)
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div
                                className="bg-[#1a3323]/50 border border-[#23482f] p-6 rounded-xl hover:border-primary transition-colors"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="material-symbols-outlined text-primary">badge</span>
                                    <h4 className="text-white font-bold">Google OAuth 身份</h4>
                                </div>
                                <p className="text-sm text-[#90cbad]">我們會讀取你的基本個人資料（姓名、Email、頭像）以建立你的冒險者檔案卡。</p>
                            </div>
                            <div
                                className="bg-[#1a3323]/50 border border-[#23482f] p-6 rounded-xl hover:border-primary transition-colors"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="material-symbols-outlined text-primary">psychology_alt</span>
                                    <h4 className="text-white font-bold">冒險紀錄</h4>
                                </div>
                                <p className="text-sm text-[#90cbad]">為了計算你的性向屬性，我們需要收集你在測驗中的每一個抉擇。</p>
                            </div>
                            <div
                                className="bg-[#1a3323]/50 border border-[#23482f] p-6 rounded-xl hover:border-primary transition-colors"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="material-symbols-outlined text-primary">cookie</span>
                                    <h4 className="text-white font-bold">魔法餅乾 (Cookies)</h4>
                                </div>
                                <p className="text-sm text-[#90cbad]">用於記住你的登入狀態與冒險進度，確保地圖加載時進度不遺失。</p>
                            </div>
                            <div
                                className="bg-[#1a3323]/50 border border-[#23482f] p-6 rounded-xl hover:border-primary transition-colors"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="material-symbols-outlined text-primary">devices</span>
                                    <h4 className="text-white font-bold">裝置資訊</h4>
                                </div>
                                <p className="text-sm text-[#90cbad]">收集基本的裝置型號與瀏覽器版本，優化魔法捲軸的顯示效果。</p>
                            </div>
                        </div>
                    </div>

                    {/* Section 3 */}
                    <div className="bg-[#1a3323]/30 border border-[#23482f] p-8 rounded-2xl flex flex-col gap-6">
                        <h2 className="text-white text-2xl font-bold flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">explore</span>
                            資料使用 (任務目標)
                        </h2>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                                <span className="text-[#90cbad]">生成角色分析圖表</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                                <span className="text-[#90cbad]">維護公會穩定運作</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                                <span className="text-[#90cbad]">提供個人化冒險體驗</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                                <span className="text-[#90cbad]">開發新的地下城功能</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default PrivacyPage;
