import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppLayout from '../layout/AppLayout';
import { useQuestStore } from '../stores/questStore';
import { useAuthStore } from '../stores/authStore';
import { useMapStore } from '../stores/mapStore';
import Questionnaire from '../components/quest/Questionnaire';
import { AlertModal } from '../components/ui/AlertModal';

const QuestionnairePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const questType = searchParams.get('type') || 'unknown';
  const { initQuest, resetQuest, sessionId } = useQuestStore();
  const { accessToken } = useAuthStore();
  const { checkRegionAccess } = useMapStore();
  const [isChecking, setIsChecking] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [lockedMessage, setLockedMessage] = useState('');
  const [showLockedModal, setShowLockedModal] = useState(false);

  // 檢查區域是否已解鎖
  useEffect(() => {
    const checkUnlock = async () => {
      if (!accessToken) {
        navigate('/');
        return;
      }

      setIsChecking(true);
      const result = await checkRegionAccess(questType);

      if (!result.can_enter) {
        setLockedMessage(result.message || '此區域尚未解鎖');
        setShowLockedModal(true);
        setIsChecking(false);
        return;
      }

      setIsUnlocked(true);
      setIsChecking(false);
    };

    checkUnlock();
  }, [accessToken, questType, navigate, checkRegionAccess]);

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

  const handleLockedConfirm = () => {
    navigate('/map', {
      state: {
        lockedMessage // Pass message back if needed, though we just showed it
      }
    });
  };

  // 顯示載入畫面
  if (isChecking) {
    return (
      <AppLayout backgroundVariant="none">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-white/60">正在檢查區域狀態...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // 顯示鎖定提示
  if (showLockedModal) {
    return (
      <AppLayout backgroundVariant="none">
        <div className="flex-grow flex items-center justify-center">
          <AlertModal
            isOpen={true}
            title="區域封印中"
            message={lockedMessage}
            confirmText="返回地圖"
            onConfirm={handleLockedConfirm}
            onClose={handleLockedConfirm}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout backgroundVariant="none">
      <div className="w-full flex-grow flex flex-col">
        <Questionnaire />
      </div>
    </AppLayout>
  );
};

export default QuestionnairePage;
