import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { useQuestStore } from '../stores/questStore';
import { useAuthStore } from '../stores/authStore';
import { useMapStore } from '../stores/mapStore';
import QuestionnairePage from '../components/quest/QuestionnairePage';

const Questionnaire = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const questType = searchParams.get('type') || 'mbti';
  const { initQuest, resetQuest, sessionId } = useQuestStore();
  const { accessToken } = useAuthStore();
  const { regions, fetchRegions } = useMapStore();
  const [isChecking, setIsChecking] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);

  // 檢查區域是否已解鎖
  useEffect(() => {
    const checkUnlock = async () => {
      if (!accessToken) {
        navigate('/');
        return;
      }

      // 檢查是否已有區域數據，若無則抓取
      if (regions.length === 0) {
        await fetchRegions();
      }

      const region = regions.find(r => r.id === questType);

      // 如果數據抓取後發現是鎖定的，才重定向
      if (region?.status === 'LOCKED') {
        navigate('/map', {
          state: {
            lockedMessage: region.unlock_hint || '此區域尚未解鎖'
          }
        });
        return;
      }

      // 只有在確定拿到數據且非鎖定時才設為 unlocked
      if (region) {
        setIsUnlocked(true);
        setIsChecking(false);
      }
    };

    checkUnlock();
  }, [accessToken, questType, navigate, fetchRegions, regions.length]); // 僅依賴 regions.length，避免內容變化導致迴圈

  // 初始化測驗
  useEffect(() => {
    if (accessToken && !sessionId && isUnlocked) {
      initQuest(questType, accessToken);
    }

    return () => {
      resetQuest();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, isUnlocked]); // 只在 accessToken 和 isUnlocked 變化時評估，且內部有 !sessionId 鎖定

  // 顯示載入畫面
  if (isChecking) {
    return (
      <div className="flex flex-col min-h-screen bg-background-dark">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-white/60">正在檢查區域狀態...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <QuestionnairePage />
      </main>
      <Footer />
    </div>
  );
};

export default Questionnaire;
