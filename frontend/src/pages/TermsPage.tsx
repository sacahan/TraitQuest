import AppLayout from '../layout/AppLayout';

/**
 * 服務條款頁面
 * 包含帳號守則、使用者權利、禁止事項、免責聲明等
 */
const TermsPage = () => {
    return (
        <AppLayout backgroundVariant="subtle">
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
                            <span className="material-symbols-outlined text-primary text-sm">history_edu</span>
                            <span className="text-primary text-xs font-bold uppercase tracking-wider">冒險者契約 (Adventurer Agreement)</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight tracking-tight">
                            <p className="mb-4">冒險守則</p><span className="text-primary drop-shadow-[0_0_10px_rgba(17,212,82,0.5)]">進入靈魂領域的準則</span>
                        </h1>
                        <p className="text-lg text-[#90cbad] max-w-2xl mx-auto leading-relaxed">
                            為了維護 TraitQuest 大陸的秩序與和平，請各位冒險者在踏上旅程前，仔細閱讀這份神聖契約。
                        </p>
                    </div>
                </section>

                {/* Scroll Layout */}
                <div className="w-full max-w-[1100px] px-6 py-20 flex flex-col lg:flex-row gap-12">
                    {/* Sidebar */}
                    <aside className="w-full lg:w-64 flex-shrink-0">
                        <div className="sticky top-28 bg-[#1a3323]/30 border border-[#23482f] rounded-2xl p-6">
                            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">format_list_bulleted</span>
                                契約章節
                            </h3>
                            <nav className="flex flex-col gap-2">
                                <a href="#section-1"
                                    className="text-sm py-2 px-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2 group text-[#90cbad]"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        document.getElementById('section-1')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                >
                                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                                    第一章：帳號守則
                                </a>
                                <a href="#section-2"
                                    className="text-sm py-2 px-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2 group text-[#90cbad]"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        document.getElementById('section-2')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                >
                                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                                    第二章：冒險權利
                                </a>
                                <a href="#section-3"
                                    className="text-sm py-2 px-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2 group text-[#90cbad]"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        document.getElementById('section-3')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                >
                                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                                    第三章：資料權利
                                </a>
                                <a href="#section-4"
                                    className="text-sm py-2 px-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2 group text-[#90cbad]"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        document.getElementById('section-4')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                >
                                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                                    第四章：禁止事項
                                </a>
                                <a href="#section-5"
                                    className="text-sm py-2 px-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2 group text-[#90cbad]"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        document.getElementById('section-5')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                >
                                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                                    第五章：免責聲明
                                </a>
                            </nav>
                        </div>
                    </aside>

                    {/* Content */}
                    <div className="flex-1 flex flex-col gap-12">
                        <section id="section-1" className="scroll-mt-32">
                            <div className="flex items-center gap-4 mb-6">
                                <span className="material-symbols-outlined text-primary text-3xl">person</span>
                                <h2 className="text-2xl font-bold text-white">第一章：帳號守則 (Account Rules)</h2>
                            </div>
                            <div className="space-y-4 text-[#90cbad] leading-relaxed">
                                <p>1. <strong>註冊資格：</strong> 冒險者需年滿 13 歲方可註冊公會成員。未滿 13 歲的見習生需在監護人的陪同下進行探索。</p>
                                <p>2. <strong>召喚儀式：</strong> 我們採用 Google OAuth 進行身份驗證。請確保您的 Google 帳號安全，若因個人疏忽導致帳號被盜，公會概不負責。
                                </p>
                                <p>3. <strong>帳號轉讓：</strong> 您的冒險者憑證（帳號）綁定於靈魂，禁止轉讓、出售或借予其他種族。一旦發現，公會將永久封印該帳號。</p>
                            </div>
                        </section>

                        <section id="section-2" className="scroll-mt-32">
                            <div className="flex items-center gap-4 mb-6">
                                <span className="material-symbols-outlined text-primary text-3xl">shield</span>
                                <h2 className="text-2xl font-bold text-white">第二章：冒險者權利 (User Rights)</h2>
                            </div>
                            <div className="space-y-4 text-[#90cbad] leading-relaxed">
                                <p>1. <strong>測試結果所有權：</strong> 您所有的性向測試結果歸您所有，您可以自由分享至社交卷軸或刻印在石板上。</p>
                                <p>2. <strong>隨時退出：</strong> 您有權隨時終止冒險並要求刪除您的英雄歷程記錄。</p>
                                <p>3. <strong>資料存取：</strong> 您有權要求查看我們所持有的關於您的所有個人資料。</p>
                            </div>
                        </section>

                        <section id="section-3" className="scroll-mt-32">
                            <div className="flex items-center gap-4 mb-6">
                                <span className="material-symbols-outlined text-primary text-3xl">database</span>
                                <h2 className="text-2xl font-bold text-white">第三章：資料權利 (Data Rights)</h2>
                            </div>
                            <div className="space-y-6 text-[#90cbad] leading-relaxed">
                                <div className="bg-[#1a3323]/30 border border-[#23482f] p-6 rounded-xl">
                                    <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">visibility</span>
                                        資料存取權
                                    </h3>
                                    <p>您有權要求我們提供一份您的個人資料副本，包括：基本個人資料、測驗紀錄、以及任何我們儲存的相關資料。</p>
                                </div>
                                <div className="bg-[#1a3323]/30 border border-[#23482f] p-6 rounded-xl">
                                    <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">delete_forever</span>
                                        資料刪除權
                                    </h3>
                                    <p className="mb-3">您有權要求刪除您的資料。您可以透過以下方式申請：</p>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li>發送電子郵件至 <a href="mailto:admin@brianhan.cc" className="text-primary hover:underline">admin@brianhan.cc</a></li>
                                        <li>使用應用程式設定中的「刪除帳號」功能</li>
                                    </ul>
                                    <p className="mt-3">收到申請後，我們將在 <strong className="text-primary">30 天內</strong>永久刪除您的資料。</p>
                                </div>
                                <div className="bg-[#1a3323]/30 border border-[#23482f] p-6 rounded-xl">
                                    <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">edit</span>
                                        資料更正權
                                    </h3>
                                    <p>若您發現我們持有的關於您的資料有任何錯誤，您有權要求我們進行更正。</p>
                                </div>
                            </div>
                        </section>

                        <section id="section-4" className="scroll-mt-32">
                            <div className="flex items-center gap-4 mb-6">
                                <span className="material-symbols-outlined text-primary text-3xl">block</span>
                                <h2 className="text-2xl font-bold text-white">第四章：禁止事項 (Prohibited Acts)</h2>
                            </div>
                            <div className="space-y-4 text-[#90cbad] leading-relaxed">
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>使用黑暗魔法（外掛程式、腳本）干擾網站運作或刷取測試結果。</li>
                                    <li>在公會留言板散佈仇恨言論、針對其他冒險者的惡意攻擊。</li>
                                    <li>試圖破解公會的防護結界（伺服器攻擊、SQL 注入等）。</li>
                                    <li>冒充其他冒險者或公會管理人員。</li>
                                    <li>未經授權收集或使用其他冒險者的個人資料。</li>
                                </ul>
                            </div>
                        </section>

                        <section id="section-5" className="scroll-mt-32">
                            <div className="flex items-center gap-4 mb-6">
                                <span className="material-symbols-outlined text-primary text-3xl">gavel</span>
                                <h2 className="text-2xl font-bold text-white">第五章：免責聲明 (Disclaimer)</h2>
                            </div>
                            <div className="space-y-4 text-[#90cbad] leading-relaxed">
                                <p>TraitQuest 提供的心理測驗結果僅供娛樂參考，並非專業諮商的診斷書。若您在現實生活中遇到嚴重的心理困擾，請尋求專業醫師/心理諮商師的協助。</p>
                                <div className="bg-primary/10 border border-primary/30 p-4 rounded-xl mt-4">
                                    <p className="text-sm text-primary font-medium flex items-start gap-2">
                                        <span className="material-symbols-outlined text-lg mt-0.5">info</span>
                                        <span>本服務依「現況」提供。我們不對服務的不中斷、無錯誤或完全安全作出任何明示或暗示的保證。</span>
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Last Updated */}
                        <div className="text-center text-sm text-[#90cbad]/70 pt-8 border-t border-[#23482f]">
                            <p>最後更新日期：2026 年 1 月 15 日</p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default TermsPage;
