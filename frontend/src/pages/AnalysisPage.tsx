import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuestStore } from "../stores/questStore";
import apiClient from "../services/apiClient";
import {
  TrendingUp,
  ChevronRight,
  Shield,
  Compass,
  Users,
  Sparkles,
  History,
} from "lucide-react";
import AppLayout from "../layout/AppLayout";
import MagicHourglass from "../components/ui/MagicHourglass";
import { AlertModal } from "../components/ui/AlertModal";

// Specialized Analysis Panels
import MbtiPanel from "../components/analysis/MbtiPanel";
import EnneagramPanel from "../components/analysis/EnneagramPanel";
import BigFivePanel from "../components/analysis/BigFivePanel";
import DiscPanel from "../components/analysis/DiscPanel";
import GallupPanel from "../components/analysis/GallupPanel";

const AnalysisPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const regionQuestId = searchParams.get("region");
  const { finalResult, questId, resetQuest } = useQuestStore();
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  const activeQuestId = questId || regionQuestId;

  // 總是從 API 獲取最新的 Report 資料 (QuestReport)
  useEffect(() => {
    const fetchProfile = async () => {
      if (!activeQuestId) return;

      setIsLoadingProfile(true);
      try {
        // [Modified] 根據 quest type 獲取專屬報告
        const response = await apiClient.get(`/quests/report/${activeQuestId}`);
        const report = response.data;

        if (!report) {
          throw new Error("No report data found");
        }

        // 映射後端資料結構到前端組件所需格式
        // Backend: QuestReport { level_info, hero_chronicle, destiny_guide, ... }
        const result = {
          ...report, // 包含 race, class, stats 等

          // 映射 level_info (snake_case) -> levelInfo (Frontend prop)
          levelInfo: report.level_info
            ? {
                ...report.level_info,
                expProgress:
                  report.level_info.exp / report.level_info.expToNextLevel,
              }
            : null,

          // 顯示用的 chronicle
          chronicle: report.hero_chronicle,
        };

        setProfileData(result);
      } catch (error: any) {
        // 忽略被取消的請求
        if (error.name === "CanceledError" || error.code === "ERR_CANCELED") {
          return;
        }

        console.error("Failed to fetch quest report:", error);

        // 如果是 404，可能是該測驗還沒做過
        // 這裡可以導向地圖或顯示 Empty State
        // 暫時維持回地圖導向 (除錯時可以先註解掉)
        if (!finalResult) {
          // 只有在剛做完測驗也沒有結果時才強制導向
          // 如果是單純查看舊資料失敗，可能只需顯示錯誤
          console.warn("Redirecting to map due to missing report.");
          // navigate('/map');
          setShowErrorAlert(true);
        }
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [navigate, activeQuestId, finalResult]); // 依賴 activeQuestId

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
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-primary/40 to-transparent"
              />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (!activeQuestId) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-white/60">未指定測驗類型</p>
        </div>
      </AppLayout>
    );
  }

  // 當正在載入或資料還沒回來時，如果是正在載入就顯示 Hourglass (原本邏輯)
  // 但如果載入完成了 profileData 還是 null，通常代表失敗了，這時應該讓 AppLayout 渲染以便顯示 AlertModal
  if (!profileData && !isLoadingProfile) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <p className="text-white/60 mb-4">無法讀取報告資料</p>
            <button
              onClick={() => navigate("/map")}
              className="text-primary hover:underline"
            >
              返回地圖
            </button>
          </div>
        </div>
        <AlertModal
          isOpen={showErrorAlert}
          onClose={() => navigate("/map")}
          title="資料錯誤"
          message="無法讀取冒險結果，將返回地圖。"
          confirmText="返回地圖"
          onConfirm={() => navigate("/map")}
        />
      </AppLayout>
    );
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
                  style={{
                    backgroundImage: 'url("/assets/images/quest_bg.webp")',
                  }}
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
                "
                {profileData.chronicle ||
                  profileData.latestChronicle ||
                  "命運的齒輪開始轉動，你的靈魂特質已在星圖中顯現..."}
                "
              </motion.p>
              <div className="flex items-center justify-end gap-2 mt-2 mr-4">
                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-primary/50"></div>
                <p className="text-primary/80 text-sm font-bold tracking-wider italic">
                  心靈嚮導 Abby
                </p>
              </div>

              {/* Level Info - Integrated into Abby's section */}
              <div className="mt-6 pt-6 border-t border-white/5 flex flex-col items-center gap-3">
                <div className="flex items-center gap-4 text-sm w-full">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-lg text-primary">
                      military_tech
                    </span>
                    <span className="text-primary font-bold whitespace-nowrap">
                      Lv.{levelInfo?.level || 1}
                    </span>
                  </div>
                  <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-primary via-emerald-400 to-primary background-animate transition-all duration-1000"
                      style={{ width: `${levelInfo?.expProgress * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-400 font-mono whitespace-nowrap">
                    {levelInfo?.exp || 0} XP
                  </span>
                </div>

                {levelInfo && levelInfo.isLeveledUp && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 text-primary"
                  >
                    <span className="text-xs font-black animate-bounce bg-primary text-black px-2 py-0.5 rounded">
                      LEVEL UP!
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Last Test Time - RPG Style */}
            {profileData.completed_at && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 w-full group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-emerald-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative flex items-center justify-between p-3 bg-[#1a2e1a]/40 border border-white/5 rounded-lg backdrop-blur-sm group-hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-primary/10 text-primary border border-primary/20 group-hover:shadow-[0_0_10px_rgba(17,212,82,0.2)] transition-shadow">
                      <History className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-primary/60 font-black tracking-[0.2em] uppercase leading-tight">
                        SYNC TIMESTAMP
                      </span>
                      <span className="text-xs text-gray-300 font-mono mt-1 tracking-wider">
                        {new Date(profileData.completed_at).toLocaleString(
                          "zh-TW",
                          {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          },
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column: Specialized Result Panels */}
          <div className="w-full">
            {activeQuestId === "mbti" && <MbtiPanel result={profileData} />}
            {activeQuestId === "enneagram" && (
              <EnneagramPanel result={profileData} />
            )}
            {activeQuestId === "bigfive" && (
              <BigFivePanel result={profileData} />
            )}
            {activeQuestId === "disc" && <DiscPanel result={profileData} />}
            {activeQuestId === "gallup" && <GallupPanel result={profileData} />}
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
                        <div className="bg-primary/10 text-primary text-[14px] font-bold px-2 py-0.5 rounded border border-primary/20 uppercase">
                          每日實踐
                        </div>
                      </div>
                      <p className="text-gray-300 text-[16px] leading-relaxed italic font-serif">
                        {profileData.destiny_guide.daily}
                      </p>
                    </div>
                  </div>

                  {/* 主線任務 */}
                  <div className="bg-[#0e1f15] p-4 rounded-xl border border-white/5 hover:border-amber-500/30 hover:bg-[#1f1a0e] transition-all group flex items-center gap-4">
                    <div className="hidden sm:flex size-10 rounded-full bg-amber-500/10 items-center justify-center shrink-0 border border-amber-500/20">
                      <TrendingUp className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <div className="bg-amber-500/10 text-amber-400 text-[14px] font-bold px-2 py-0.5 rounded border border-amber-500/20 uppercase">
                          主線任務
                        </div>
                      </div>
                      <p className="text-gray-300 text-[16px] leading-relaxed italic font-serif">
                        {profileData.destiny_guide.main}
                      </p>
                    </div>
                  </div>

                  {/* 支線任務 */}
                  <div className="bg-[#0e1f15] p-4 rounded-xl border border-white/5 hover:border-sky-500/30 hover:bg-[#0e1c24] transition-all group flex items-center gap-4">
                    <div className="hidden sm:flex size-10 rounded-full bg-sky-500/10 items-center justify-center shrink-0 border border-sky-500/20">
                      <Compass className="w-5 h-5 text-sky-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <div className="bg-sky-500/10 text-sky-400 text-[14px] font-bold px-2 py-0.5 rounded border border-sky-500/20 uppercase">
                          支線任務
                        </div>
                      </div>
                      <p className="text-gray-300 text-[16px] leading-relaxed italic font-serif">
                        {profileData.destiny_guide.side}
                      </p>
                    </div>
                  </div>

                  {/* 神諭啟示 */}
                  <div className="bg-[#0e1f15] p-4 rounded-xl border border-white/5 hover:border-purple-500/30 hover:bg-[#161024] transition-all group flex items-center gap-4">
                    <div className="hidden sm:flex size-10 rounded-full bg-purple-500/10 items-center justify-center shrink-0 border border-purple-500/20">
                      <Sparkles className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <div className="bg-purple-500/10 text-purple-400 text-[14px] font-bold px-2 py-0.5 rounded border border-purple-500/20 uppercase flex items-center gap-1">
                          神諭啟示
                        </div>
                      </div>
                      <p className="text-gray-300 text-[16px] italic leading-relaxed font-serif">
                        「{profileData.destiny_guide.oracle}」
                      </p>
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
                    {profileData.destiny_bonds.compatible.map(
                      (bond: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-4 bg-[#112111]/50 rounded-lg border border-primary/20 hover:border-primary/40 transition-colors hover:bg-primary/5"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-white font-bold">
                              {bond.class_name}{" "}
                              <span className="text-xs text-gray-500 font-normal ml-1">
                                (
                                {bond.class_id
                                  .replace("CLS_", "")
                                  .replace("STN_", "")}
                                )
                              </span>
                            </h4>
                            <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-bold rounded">
                              契合度 {bond.sync_rate || "High"}%
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm">
                            {bond.description || bond.advantage}
                          </p>
                        </div>
                      ),
                    )}
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
                    {profileData.destiny_bonds.conflicting.map(
                      (bond: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-4 bg-[#2a1111]/50 rounded-lg border border-red-500/20 hover:border-red-500/40 transition-colors hover:bg-red-500/5"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-white font-bold">
                              {bond.class_name}{" "}
                              <span className="text-xs text-gray-500 font-normal ml-1">
                                (
                                {bond.class_id
                                  .replace("CLS_", "")
                                  .replace("STN_", "")}
                                )
                              </span>
                            </h4>
                            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded">
                              風險: {bond.risk_level}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm">
                            {bond.description || bond.friction_reason}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </div>

          {/* 按鈕區 */}
          <div className="w-full flex flex-col items-center gap-6 pb-12">
            {/* Secondary Actions */}
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg opacity-80">
              <button
                onClick={() => {
                  resetQuest();
                  navigate("/dashboard");
                }}
                className="flex-1 rounded-full border border-white/10 bg-[#0a1510] px-6 py-3 text-gray-300 font-bold hover:bg-white/5 transition-all active:scale-95"
              >
                <span className="flex items-center justify-center gap-2">
                  前往公會大廳
                  <ChevronRight className="w-4 h-4" />
                </span>
              </button>
              <button
                onClick={() => {
                  resetQuest();
                  navigate("/map");
                }}
                className="flex-1 rounded-full border border-white/10 bg-[#0a1510] px-6 py-3 text-gray-300 font-bold hover:bg-white/5 transition-all active:scale-95"
              >
                返回地圖
              </button>
            </div>
          </div>
        </div>
      </div>
      <AlertModal
        isOpen={showErrorAlert}
        onClose={() => navigate("/map")}
        title="資料錯誤"
        message="無法讀取冒險結果，將返回地圖。"
        confirmText="返回地圖"
        onConfirm={() => navigate("/map")}
      />
    </AppLayout>
  );
};

export default AnalysisPage;
