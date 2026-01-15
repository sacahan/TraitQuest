import React, { useState, useEffect } from 'react';

/**
 * BackToTop 按鈕元件
 * 
 * 當使用者向下滾動超過一定距離時顯示，
 * 點擊後平滑滾動回頁面頂部。
 * 主要針對手機版使用者設計。
 */
const BackToTop: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            // 當滾動超過 400px 時顯示按鈕
            if (window.scrollY > 400) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);

        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <button
            onClick={scrollToTop}
            aria-label="返回頂部"
            className={`
                fixed bottom-24 right-4 z-50
                lg:hidden
                w-12 h-12 rounded-full
                bg-primary/90 hover:bg-primary
                text-[#10231a] 
                shadow-[0_0_20px_rgba(17,212,82,0.3)] hover:shadow-[0_0_30px_rgba(17,212,82,0.5)]
                flex items-center justify-center
                transition-all duration-300 ease-in-out
                ${isVisible 
                    ? 'opacity-100 translate-y-0 pointer-events-auto' 
                    : 'opacity-0 translate-y-4 pointer-events-none'
                }
                active:scale-90
                backdrop-blur-sm
                border border-white/20
            `}
        >
            <span className="material-symbols-outlined text-xl font-bold">
                keyboard_arrow_up
            </span>
        </button>
    );
};

export default BackToTop;
