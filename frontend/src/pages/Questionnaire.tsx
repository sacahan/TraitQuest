import { useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { useQuestStore } from '../stores/questStore';
import { useAuthStore } from '../stores/authStore';
import QuestionnairePage from '../components/quest/QuestionnairePage';

const Questionnaire = () => {
  const { initQuest, resetQuest, sessionId } = useQuestStore();
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (accessToken && !sessionId) {
      // 預設啟動 mbti 測驗，未來可從路徑參數獲取
      initQuest('mbti', accessToken);
    }

    return () => {
      resetQuest();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]); // 只在 accessToken 變化時評估，且內部有 !sessionId 鎖定

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
