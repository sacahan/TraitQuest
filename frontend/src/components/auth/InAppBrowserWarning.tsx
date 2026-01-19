/**
 * In-App Browser 警告組件
 * 當偵測到使用者在 LINE 等內建瀏覽器時，引導切換到外部瀏覽器
 * 樣式符合 TraitQuest 黑暗奇幻 RPG 風格
 */
import { useState, useEffect } from 'react';
import type { InAppBrowserInfo } from '../../utils/browserDetection';
import { getCurrentUrl, copyToClipboard } from '../../utils/browserDetection';

interface InAppBrowserWarningProps {
    /** 瀏覽器偵測資訊 */
    browserInfo: InAppBrowserInfo;
    /** 是否顯示 Modal */
    isOpen: boolean;
    /** 關閉 Modal 的回呼函式 */
    onClose: () => void;
}

/**
 * In-App Browser 警告 Modal
 * 提供複製連結與平台特定的操作指引
 */
const InAppBrowserWarning = ({ browserInfo, isOpen, onClose }: InAppBrowserWarningProps) => {
    const [copied, setCopied] = useState(false);
    const currentUrl = getCurrentUrl();

    // 複製成功後 2 秒重置狀態
    useEffect(() => {
        if (copied) {
            const timer = setTimeout(() => setCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [copied]);

    /**
     * 處理複製連結
     */
    const handleCopyLink = async () => {
        const success = await copyToClipboard(currentUrl);
        if (success) {
            setCopied(true);
        }
    };

    /**
     * 根據不同平台提供對應的操作指引
     */
    const getPlatformInstructions = () => {
        switch (browserInfo.platform) {
            case 'line':
                return (
                    <>
                        <p>請點擊右上角的 <span className="text-primary font-bold">⋮</span> 選單</p>
                        <p>選擇「<span className="text-primary font-bold">在瀏覽器中開啟</span>」</p>
                    </>
                );
            case 'facebook':
            case 'messenger':
                return (
                    <>
                        <p>請點擊右下角的 <span className="text-primary font-bold">⋯</span> 選單</p>
                        <p>選擇「<span className="text-primary font-bold">在瀏覽器開啟</span>」</p>
                    </>
                );
            case 'instagram':
                return (
                    <>
                        <p>請點擊右上角的 <span className="text-primary font-bold">⋯</span> 選單</p>
                        <p>選擇「<span className="text-primary font-bold">在瀏覽器中開啟</span>」</p>
                    </>
                );
            case 'wechat':
                return (
                    <>
                        <p>請點擊右上角的 <span className="text-primary font-bold">⋯</span> 選單</p>
                        <p>選擇「<span className="text-primary font-bold">在瀏覽器打開</span>」</p>
                    </>
                );
            case 'twitter':
                return (
                    <>
                        <p>請點擊右上角的 <span className="text-primary font-bold">⋮</span> 選單</p>
                        <p>選擇「<span className="text-primary font-bold">在瀏覽器中開啟</span>」</p>
                    </>
                );
            default:
                return (
                    <p>請複製下方連結，並在 Safari 或 Chrome 等瀏覽器中開啟</p>
                );
        }
    };

    // 不顯示時直接返回 null
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            style={{ animation: 'fadeIn 0.3s ease-out' }}
        >
            <div className="relative w-full max-w-md bg-gradient-to-b from-[#1a3323] to-[#112217] rounded-2xl border border-[#23482f] shadow-2xl shadow-primary/20 overflow-hidden">
                {/* 裝飾角落 - 古老卷軸風格 */}
                <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-primary/30 rounded-tl-2xl" />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-primary/30 rounded-br-2xl" />

                {/* 內容區域 */}
                <div className="relative p-6">
                    {/* 關閉按鈕 */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        aria-label="關閉"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>

                    {/* 警告圖示 */}
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center animate-pulse">
                            <span className="material-symbols-outlined text-4xl text-yellow-400">warning</span>
                        </div>
                    </div>

                    {/* 標題 */}
                    <h2 className="text-xl font-bold text-center text-white mb-2 font-display">
                        請使用外部瀏覽器開啟
                    </h2>

                    {/* 說明文字 */}
                    <div className="text-center text-gray-300 mb-6 font-body">
                        <p className="mb-2">
                            偵測到您正在使用 <span className="text-primary font-bold">{browserInfo.platformName}</span> 的內建瀏覽器
                        </p>
                        <p className="text-sm text-gray-400">
                            由於 Google 安全政策限制，無法在此瀏覽器中完成登入
                        </p>
                    </div>

                    {/* 操作指引區塊 */}
                    <div className="bg-black/30 rounded-xl p-4 mb-6 border border-primary/20">
                        <h3 className="text-primary font-bold mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">help</span>
                            操作方式
                        </h3>
                        <div className="text-sm text-gray-300 space-y-1 font-body">
                            {getPlatformInstructions()}
                        </div>
                    </div>

                    {/* 複製連結區域 */}
                    <div className="mb-4">
                        <p className="text-sm text-gray-400 mb-2 text-center">或複製連結到外部瀏覽器：</p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={currentUrl}
                                readOnly
                                className="flex-1 bg-black/40 border border-[#23482f] rounded-lg px-3 py-2 text-sm text-gray-300 truncate font-mono focus:outline-none focus:border-primary/50"
                            />
                            <button
                                onClick={handleCopyLink}
                                className={`px-4 py-2 rounded-lg font-bold transition-all duration-300 flex items-center gap-2 min-w-[90px] justify-center ${copied
                                        ? 'bg-primary text-[#112217]'
                                        : 'bg-[#23482f] text-white hover:bg-primary hover:text-[#112217]'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-sm">
                                    {copied ? 'check' : 'content_copy'}
                                </span>
                                {copied ? '已複製' : '複製'}
                            </button>
                        </div>
                    </div>

                    {/* 確認按鈕 */}
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-xl bg-[#23482f] text-gray-300 hover:bg-[#2a5639] transition-colors font-body"
                    >
                        我知道了
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InAppBrowserWarning;
