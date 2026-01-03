import { Header } from '../layout/Header';
import { Footer } from '../layout/Footer';

const AboutPage = () => {
    return (
        <div className="flex flex-col min-h-screen bg-[#050d09] text-[#e0eadd] selection:bg-primary selection:text-[#102216]">
            <Header />

            <main className="flex-grow flex flex-col items-center relative">
                {/* Hero Section */}
                <section className="w-full relative py-20 overflow-hidden border-b border-[#23482f]">
                    <div
                        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2727&auto=format&fit=crop')] bg-cover bg-center opacity-10 pointer-events-none"
                    ></div>
                    <div className="max-w-[1000px] mx-auto px-6 relative z-10 text-center">
                        <div
                            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 backdrop-blur-sm"
                        >
                            <span className="material-symbols-outlined text-primary text-sm">stars</span>
                            <span className="text-primary text-xs font-bold uppercase tracking-wider">起源 (Guild Origin)</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
                            歡迎來到 <span className="text-primary drop-shadow-[0_0_10px_rgba(17,212,82,0.5)]">TraitQuest</span> 大陸
                        </h1>
                        <p className="text-lg text-[#90cbad] max-w-2xl mx-auto leading-relaxed">
                            每個靈魂都是獨特的英雄角色。在這裡，我們結合心理學與奇幻冒險，協助你解鎖隱藏屬性，踏上屬於自己的自我探索之旅。
                        </p>
                    </div>
                </section>

                {/* Vision & Mission Nodes */}
                <section className="max-w-[1000px] w-full px-6 py-20 flex flex-col gap-16">
                    <div className="flex gap-8 items-start group">
                        <div
                            className="size-16 rounded-2xl bg-[#1a3323] border-2 border-primary flex items-center justify-center text-primary shadow-[0_0_20px_rgba(17,212,82,0.2)] group-hover:scale-110 transition-transform duration-500 shrink-0"
                        >
                            <span className="material-symbols-outlined text-3xl">map</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-primary transition-colors">
                                我們的願景：繪製心靈地圖
                            </h3>
                            <p
                                className="text-[#90cbad] text-lg leading-relaxed bg-[#1a3323]/30 p-6 rounded-xl border border-[#23482f]"
                            >
                                在這個混亂的世界中，每個人都需要導航。TraitQuest 致力於成為你探索內心的引路人。我們的願景是讓每位冒險者都能清楚看見自己的心靈版圖，找到最適合自己的英雄之路。
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-8 items-start group">
                        <div
                            className="size-16 rounded-2xl bg-[#1a3323] border-2 border-primary flex items-center justify-center text-primary shadow-[0_0_20px_rgba(17,212,82,0.2)] group-hover:scale-110 transition-transform duration-500 shrink-0"
                        >
                            <span className="material-symbols-outlined text-3xl">vpn_key</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-primary transition-colors">
                                我們的使命：解鎖靈魂屬性
                            </h3>
                            <p
                                className="text-[#90cbad] text-lg leading-relaxed bg-[#1a3323]/30 p-6 rounded-xl border border-[#23482f]"
                            >
                                我們利用科學的人格理論，將枯燥的測試轉化為有趣的試煉。就像鑑定傳奇裝備一樣，我們幫你識別核心優勢，將潛在特質轉化為現實世界的強大技能，讓你在人生副本中無往不利。
                            </p>
                        </div>
                    </div>
                </section>

                {/* Guild Masters */}
                <section className="w-full bg-[#0d1c14] py-20 border-y border-[#23482f]">
                    <div className="max-w-[1000px] mx-auto px-6 text-center">
                        <h2 className="text-white text-3xl font-black mb-12">Founders</h2>
                        <div className="flex flex-wrap justify-center gap-12">
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative size-32 group">
                                    <div
                                        className="absolute inset-0 bg-primary opacity-20 blur-xl group-hover:opacity-60 transition-opacity rounded-full"
                                    ></div>
                                    <div
                                        className="relative size-full rounded-full border-2 border-primary overflow-hidden p-1 bg-[#1a3323]"
                                    >
                                        <img
                                            className="size-full object-cover rounded-full grayscale group-hover:grayscale-0 transition-all"
                                            alt="Portrait of Brian Han"
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGJeAbTo7PcyMoWcIJT9UPoUDWxw2WlFhtUtOL1mXw_ZSYNw_qOlJr0UDaPYcn5Q23MKUGAkcVw1_39yn1UJcbrMtNFURwu9_B4U1B4u-gWdU45jZ9VXu13omJjBAjiiKC47uaKZOcn0nYxfn0D8Ssak0ealxlXdHj15FHNeUOceIeEsAekvEGEpQvwmY4H7U9lgxOxc8xRJF74FnQ2BeLC9SvCoOjs2oQZegqKr15AB2dFaL_RJNPFKpVo0HYgNKaiYrQXrVYZPKW"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-xl">Brian Han</h4>
                                    <span className="text-primary text-xs font-mono uppercase tracking-widest">Architect</span>
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-4">
                                <div className="relative size-32 group">
                                    <div
                                        className="absolute inset-0 bg-primary opacity-20 blur-xl group-hover:opacity-60 transition-opacity rounded-full"
                                    ></div>
                                    <div
                                        className="relative size-full rounded-full border-2 border-primary overflow-hidden p-1 bg-[#1a3323]"
                                    >
                                        <img
                                            className="size-full object-cover rounded-full grayscale group-hover:grayscale-0 transition-all"
                                            alt="Portrait of Abby Wang"
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdgsdPqi5uGvwrf5iPWXEJC9qS8i9aTLpjHw3SiAV2TTttciCM3iZNUdRRPurYc2p92sLZgoPOMhkZDbN1mC4faxb2KKyofRy9P5uCJY-C22N-vAsHP76EH_60g3b-zk0wnyr38wNP8fpHLbX_XIHXmdO9At5o9JytdxUKLu2Fgt0gLU4JGL_uWVMbJhkaE-rh2QlFPisJ99D43_dTbqiCXh7lTlnLmHWsZ3HYuY_bNKyU_7vs6rTdJhmV91GcvmDPMYWmBFcHNN1k"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-xl">Abby Wang</h4>
                                    <span className="text-primary text-xs font-mono uppercase tracking-widest">Spirit Guide</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default AboutPage;
