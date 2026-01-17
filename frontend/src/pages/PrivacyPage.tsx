import AppLayout from '../layout/AppLayout';

/**
 * 隱私權政策頁面
 * 根據 Google API Services User Data Policy 要求更新
 */
const PrivacyPage = () => {
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
                    {/* Section 1: 序章 */}
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

                    {/* Section 2: 我們存取的資料 (Data Accessed) */}
                    <div className="flex flex-col gap-8">
                        <h2 className="text-white text-2xl font-bold flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">inventory_2</span>
                            我們存取的資料 (Data Accessed)
                        </h2>
                        <div className="bg-[#1a3323]/30 border border-[#23482f] p-6 rounded-xl">
                            <p className="text-[#90cbad] leading-relaxed mb-4">
                                我們的應用程式 TraitQuest 僅存取以下 Google 使用者資料：
                            </p>
                            <div className="bg-[#1a3323]/50 border border-[#23482f] p-6 rounded-xl mb-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="material-symbols-outlined text-primary">badge</span>
                                    <h4 className="text-white font-bold">基本個人資料</h4>
                                </div>
                                <p className="text-sm text-[#90cbad]">
                                    我們存取您的姓名、電子郵件地址、個人頭像以及 Google 使用者 ID。
                                </p>
                            </div>
                            <div className="bg-primary/10 border border-primary/30 p-4 rounded-xl">
                                <p className="text-sm text-primary font-medium flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">info</span>
                                    我們<strong>不會</strong>存取您的聯絡人、行事曆、雲端硬碟檔案或其他敏感個人資料。
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: 資料使用方式 (Data Usage) */}
                    <div className="bg-[#1a3323]/30 border border-[#23482f] p-8 rounded-2xl flex flex-col gap-6">
                        <h2 className="text-white text-2xl font-bold flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">explore</span>
                            資料使用方式 (Data Usage)
                        </h2>
                        <p className="text-[#90cbad] leading-relaxed">
                            我們僅將存取的 Google 使用者資料用於以下目的：
                        </p>
                        <ul className="grid grid-cols-1 gap-4">
                            <li className="flex items-start gap-3 bg-[#1a3323]/50 p-4 rounded-xl border border-[#23482f]">
                                <span className="material-symbols-outlined text-primary text-xl mt-0.5">verified_user</span>
                                <div>
                                    <span className="text-white font-bold">身份驗證與帳號管理</span>
                                    <p className="text-sm text-[#90cbad] mt-1">驗證您的身份、協助安全登入（Sign in with Google），並在我們的系統中建立您的專屬使用者帳號。</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3 bg-[#1a3323]/50 p-4 rounded-xl border border-[#23482f]">
                                <span className="material-symbols-outlined text-primary text-xl mt-0.5">mail</span>
                                <div>
                                    <span className="text-white font-bold">通訊聯繫</span>
                                    <p className="text-sm text-[#90cbad] mt-1">向您發送與帳號相關的重要系統通知（例如：歡迎郵件）。</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3 bg-[#1a3323]/50 p-4 rounded-xl border border-[#23482f]">
                                <span className="material-symbols-outlined text-primary text-xl mt-0.5">dashboard</span>
                                <div>
                                    <span className="text-white font-bold">功能呈現</span>
                                    <p className="text-sm text-[#90cbad] mt-1">在您的使用者儀表板中顯示您的姓名和個人頭像。</p>
                                </div>
                            </li>
                        </ul>
                        <div className="bg-primary/10 border border-primary/30 p-4 rounded-xl">
                            <p className="text-sm text-primary font-medium flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">info</span>
                                我們<strong>不會</strong>將您的 Google 使用者資料用於廣告或行銷目的。
                            </p>
                        </div>
                    </div>

                    {/* Section 4: 資料分享 (Data Sharing) */}
                    <div className="bg-[#1a3323]/30 border border-[#23482f] p-8 rounded-2xl flex flex-col gap-6">
                        <h2 className="text-white text-2xl font-bold flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">share</span>
                            資料分享 (Data Sharing)
                        </h2>
                        <p className="text-[#90cbad] leading-relaxed">
                            我們<strong>不會</strong>將您的 Google 使用者資料分享給任何第三方，除非在以下有限情況下：
                        </p>
                        <ul className="grid grid-cols-1 gap-4">
                            <li className="flex items-start gap-3 bg-[#1a3323]/50 p-4 rounded-xl border border-[#23482f]">
                                <span className="material-symbols-outlined text-primary text-xl mt-0.5">cloud</span>
                                <div>
                                    <span className="text-white font-bold">服務供應商</span>
                                    <p className="text-sm text-[#90cbad] mt-1">我們可能會與受信任的雲端服務供應商（例如：資料庫託管）分享資料，嚴格僅用於託管和運行我們的服務。這些供應商受保密協議約束。</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3 bg-[#1a3323]/50 p-4 rounded-xl border border-[#23482f]">
                                <span className="material-symbols-outlined text-primary text-xl mt-0.5">gavel</span>
                                <div>
                                    <span className="text-white font-bold">法律要求</span>
                                    <p className="text-sm text-[#90cbad] mt-1">若法律或法律程序要求時。</p>
                                </div>
                            </li>
                        </ul>
                        <div className="bg-primary/10 border border-primary/30 p-4 rounded-xl">
                            <p className="text-sm text-primary font-medium flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">sell</span>
                                我們<strong>不會出售</strong>您的個人資料。
                            </p>
                        </div>
                    </div>

                    {/* Section 5: 資料儲存與保護 (Data Storage & Protection) */}
                    <div className="bg-[#1a3323]/30 border border-[#23482f] p-8 rounded-2xl flex flex-col gap-6">
                        <h2 className="text-white text-2xl font-bold flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">security</span>
                            資料儲存與保護 (Data Storage & Protection)
                        </h2>
                        <p className="text-[#90cbad] leading-relaxed">
                            您的資料安全地儲存在由 Google Cloud Platform (GCP) 託管的加密伺服器上。我們採用業界標準的安全措施來保護您的資訊免受未經授權的存取，包括：
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-[#1a3323]/50 border border-[#23482f] p-4 rounded-xl flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">https</span>
                                <span className="text-[#90cbad] text-sm">傳輸中資料的 HTTPS 加密</span>
                            </div>
                            <div className="bg-[#1a3323]/50 border border-[#23482f] p-4 rounded-xl flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">lock</span>
                                <span className="text-[#90cbad] text-sm">敏感靜態資料的加密保護</span>
                            </div>
                        </div>
                    </div>

                    {/* Section 6: 資料保留與刪除 (Data Retention & Deletion) */}
                    <div className="bg-[#1a3323]/30 border border-[#23482f] p-8 rounded-2xl flex flex-col gap-6">
                        <h2 className="text-white text-2xl font-bold flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">delete_forever</span>
                            資料保留與刪除 (Data Retention & Deletion)
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="bg-[#1a3323]/50 border border-[#23482f] p-4 rounded-xl">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="material-symbols-outlined text-primary">schedule</span>
                                    <span className="text-white font-bold">資料保留</span>
                                </div>
                                <p className="text-sm text-[#90cbad]">我們僅在您的帳號處於使用狀態期間，或為向您提供服務所需的時間內保留您的使用者資料。</p>
                            </div>
                            <div className="bg-[#1a3323]/50 border border-[#23482f] p-4 rounded-xl">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="material-symbols-outlined text-primary">person_remove</span>
                                    <span className="text-white font-bold">資料刪除</span>
                                </div>
                                <p className="text-sm text-[#90cbad]">
                                    您有權要求刪除您的資料。您可以透過發送電子郵件至 <a href="mailto:admin@brianhan.cc" className="text-primary hover:underline">admin@brianhan.cc</a>，或使用應用程式設定中的「刪除帳號」功能來申請資料刪除。收到申請後，我們將在 <strong>30 天內</strong>永久刪除您的資料。
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Section 7: 有限使用聲明 (Limited Use Disclosure) */}
                    <div className="bg-primary/5 border-2 border-primary/50 p-8 rounded-2xl flex flex-col gap-6">
                        <h2 className="text-white text-2xl font-bold flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">verified</span>
                            有限使用聲明 (Limited Use Disclosure)
                        </h2>
                        <p className="text-[#90cbad] leading-relaxed">
                            TraitQuest 對從 Google APIs 接收的資訊的使用和傳輸將遵守{' '}
                            <a
                                href="https://developers.google.com/terms/api-services-user-data-policy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                            >
                                Google API 服務使用者資料政策
                            </a>
                            ，包括有限使用要求。
                        </p>
                    </div>

                    {/* Section 8: 冒險紀錄與 Cookies */}
                    <div className="flex flex-col gap-8">
                        <h2 className="text-white text-2xl font-bold flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">cookie</span>
                            其他資料收集 (Additional Data Collection)
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-[#1a3323]/50 border border-[#23482f] p-6 rounded-xl hover:border-primary transition-colors">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="material-symbols-outlined text-primary">psychology_alt</span>
                                    <h4 className="text-white font-bold">冒險紀錄</h4>
                                </div>
                                <p className="text-sm text-[#90cbad]">為了計算你的性向屬性，我們需要收集你在測驗中的每一個抉擇。</p>
                            </div>
                            <div className="bg-[#1a3323]/50 border border-[#23482f] p-6 rounded-xl hover:border-primary transition-colors">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="material-symbols-outlined text-primary">cookie</span>
                                    <h4 className="text-white font-bold">魔法餅乾 (Cookies)</h4>
                                </div>
                                <p className="text-sm text-[#90cbad]">用於記住你的登入狀態與冒險進度，確保地圖加載時進度不遺失。</p>
                            </div>
                            <div className="bg-[#1a3323]/50 border border-[#23482f] p-6 rounded-xl hover:border-primary transition-colors">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="material-symbols-outlined text-primary">devices</span>
                                    <h4 className="text-white font-bold">裝置資訊</h4>
                                </div>
                                <p className="text-sm text-[#90cbad]">收集基本的裝置型號與瀏覽器版本，優化魔法捲軸的顯示效果。</p>
                            </div>
                        </div>
                    </div>

                    {/* Last Updated */}
                    <div className="text-center text-sm text-[#90cbad]/70 pt-8 border-t border-[#23482f]">
                        <p>最後更新日期：2026 年 1 月 15 日</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default PrivacyPage;
