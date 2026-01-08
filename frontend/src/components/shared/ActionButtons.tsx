import React, { useState } from 'react';
import { toPng, toBlob } from 'html-to-image';
import { Download, Share2, Check } from 'lucide-react';

interface ActionButtonsProps {
    targetRef: React.RefObject<HTMLElement | null>;
    filename?: string;
    className?: string;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
    targetRef,
    filename = 'traitquest-result',
    className = ''
}) => {
    const [isSharing, setIsSharing] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // 共用的圖片擷取選項，避免 CORS 安全錯誤
    const imageOptions = {
        cacheBust: true,
        pixelRatio: 2,
        // 跳過外部字體以避免 CORS 錯誤
        skipFonts: true,
        // 過濾掉可能導致問題的外部資源
        filter: (node: HTMLElement) => {
            // 跳過外部 link 標籤（如 Google Fonts）
            if (node.tagName === 'LINK' && node.getAttribute('rel') === 'stylesheet') {
                const href = node.getAttribute('href') || '';
                if (href.startsWith('http') && !href.includes(window.location.host)) {
                    return false;
                }
            }
            return true;
        },
    };

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!targetRef.current || isDownloading) return;

        try {
            setIsDownloading(true);
            const dataUrl = await toPng(targetRef.current, imageOptions);

            const link = document.createElement('a');
            link.download = `${filename}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Download failed:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!targetRef.current || isSharing) return;

        try {
            setIsSharing(true);
            const blob = await toBlob(targetRef.current, imageOptions);

            if (!blob) return;

            if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], `${filename}.png`, { type: 'image/png' })] })) {
                try {
                    const file = new File([blob], `${filename}.png`, { type: 'image/png' });
                    await navigator.share({
                        files: [file],
                        title: 'TraitQuest Result',
                        text: 'Check out my TraitQuest result!'
                    });
                    return;
                } catch (shareError) {
                    console.warn('Native share failed, falling back to clipboard', shareError);
                }
            }

            try {
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]);
                setTimeout(() => setIsSharing(false), 2000);
                return;
            } catch (clipboardError) {
                console.error('Clipboard copy failed:', clipboardError);
                alert('無法分享圖片，請嘗試下載。');
            }

        } catch (error) {
            console.error('Share failed:', error);
            setIsSharing(false);
        }
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white backdrop-blur-sm border border-white/10 transition-all active:scale-95 disabled:opacity-50"
                title="下載圖片"
            >
                <Download size={18} />
            </button>
            <button
                onClick={handleShare}
                disabled={isSharing}
                className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white backdrop-blur-sm border border-white/10 transition-all active:scale-95 disabled:opacity-50"
                title="分享"
            >
                {isSharing ? <Check size={18} className="text-emerald-400" /> : <Share2 size={18} />}
            </button>
        </div>
    );
};

export default ActionButtons;
