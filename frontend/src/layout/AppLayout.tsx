import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import BackgroundEffects from './BackgroundEffects';
import BackToTop from '../components/ui/BackToTop';

interface AppLayoutProps {
  children: React.ReactNode;
  /**
   * 背景效果變體
   * - 'default': 預設呼吸效果
   * - 'subtle': 淡化版呼吸效果
   * - 'none': 無背景效果
   */
  backgroundVariant?: 'default' | 'subtle' | 'none';
  /** 額外的容器樣式 */
  className?: string;
}

/**
 * 統一版型組件
 * 整合 Header、Footer 與背景效果，供所有頁面使用
 */
const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  backgroundVariant = 'default',
  className = '',
}) => {
  return (
    <div
      className={`relative flex h-auto min-h-screen w-full flex-col bg-background-dark text-[#e0eadd] overflow-x-hidden font-sans ${className}`}
    >
      <BackgroundEffects variant={backgroundVariant} />

      <Header />

      <main className="flex-1 w-full flex flex-col items-center relative z-10">
        {children}
      </main>

      <Footer />

      {/* 手機版返回頂部按鈕 */}
      <BackToTop />
    </div>
  );
};

export default AppLayout;
