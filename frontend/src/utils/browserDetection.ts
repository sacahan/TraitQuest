/**
 * In-App Browser 偵測工具
 * 用於偵測 LINE、Facebook 等社群媒體應用程式的內建瀏覽器
 * 這些瀏覽器由於 Google 安全政策限制，無法使用 Google OAuth
 */

export interface InAppBrowserInfo {
  /** 是否為 In-App Browser */
  isInAppBrowser: boolean;
  /** 平台識別碼 */
  platform: 'line' | 'facebook' | 'instagram' | 'wechat' | 'messenger' | 'twitter' | 'unknown' | null;
  /** 平台顯示名稱 */
  platformName: string | null;
}

/**
 * 偵測當前是否在 In-App Browser 中運行
 * @returns InAppBrowserInfo 物件，包含偵測結果與平台資訊
 */
export const detectInAppBrowser = (): InAppBrowserInfo => {
  const ua = navigator.userAgent || '';
  
  // LINE Browser - 特徵: Line/
  if (/Line\//i.test(ua)) {
    return { isInAppBrowser: true, platform: 'line', platformName: 'LINE' };
  }
  
  // Facebook App - 特徵: FBAN (Facebook App Name) 或 FBAV (Facebook App Version)
  if (/FBAN|FBAV/i.test(ua)) {
    return { isInAppBrowser: true, platform: 'facebook', platformName: 'Facebook' };
  }
  
  // Instagram App - 特徵: Instagram
  if (/Instagram/i.test(ua)) {
    return { isInAppBrowser: true, platform: 'instagram', platformName: 'Instagram' };
  }
  
  // WeChat (微信) - 特徵: MicroMessenger
  if (/MicroMessenger/i.test(ua)) {
    return { isInAppBrowser: true, platform: 'wechat', platformName: 'WeChat' };
  }
  
  // Facebook Messenger - 特徵: Messenger (需在 Facebook 檢測之後)
  if (/\bMessenger\b/i.test(ua)) {
    return { isInAppBrowser: true, platform: 'messenger', platformName: 'Messenger' };
  }
  
  // Twitter / X App - 特徵: Twitter
  if (/Twitter/i.test(ua)) {
    return { isInAppBrowser: true, platform: 'twitter', platformName: 'Twitter' };
  }
  
  return { isInAppBrowser: false, platform: null, platformName: null };
};

/**
 * 取得當前完整 URL
 * @returns 當前頁面的完整 URL 字串
 */
export const getCurrentUrl = (): string => {
  return window.location.href;
};

/**
 * 複製文字到剪貼簿
 * @param text 要複製的文字
 * @returns Promise<boolean> 是否成功複製
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    // 優先使用現代 Clipboard API
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback: 使用傳統 execCommand 方法（適用於舊版瀏覽器或特殊環境）
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch {
      return false;
    }
  }
};
