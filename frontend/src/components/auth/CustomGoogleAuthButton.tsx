import { useState, useMemo } from 'react';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import { detectInAppBrowser } from '../../utils/browserDetection';
import InAppBrowserWarning from './InAppBrowserWarning';

interface CustomGoogleAuthButtonProps {
  className?: string;
  children: React.ReactNode;
}

/**
 * 自定義 Google 登入按鈕
 * 內建 In-App Browser 偵測，若偵測到 LINE 等內建瀏覽器則顯示引導 Modal
 */
const CustomGoogleAuthButton = ({ className, children }: CustomGoogleAuthButtonProps) => {
  const { login } = useGoogleAuth();
  const [showWarning, setShowWarning] = useState(false);

  // 在組件載入時偵測瀏覽器類型（使用 useMemo 避免重複偵測）
  const browserInfo = useMemo(() => detectInAppBrowser(), []);

  /**
   * 處理點擊事件
   * 若為 In-App Browser 則顯示警告 Modal，否則直接觸發 Google 登入
   */
  const handleClick = () => {
    if (browserInfo.isInAppBrowser) {
      setShowWarning(true);
    } else {
      login();
    }
  };

  return (
    <>
      <button onClick={handleClick} className={className}>
        {children}
      </button>
      <InAppBrowserWarning
        browserInfo={browserInfo}
        isOpen={showWarning}
        onClose={() => setShowWarning(false)}
      />
    </>
  );
};

export default CustomGoogleAuthButton;
