import React from 'react'
import { Header } from './Header'
import { Footer } from './Footer'

interface IntroLayoutProps {
  children: React.ReactNode
  title: string
}

const IntroLayout: React.FC<IntroLayoutProps> = ({ children, title: _title }) => {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-dark text-[#e0eadd] overflow-x-hidden font-sans">
      {/* 背景發光層 (Nebula Layers) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-magic-cyan/10 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-[#1a4031] rounded-full blur-[100px] opacity-60 animate-pulse" style={{ animationDuration: '6s' }}></div>
      </div>

      <Header />

      <main className="flex-1 w-full flex flex-col items-center relative z-10">
        {children}
      </main>

      <Footer />
    </div>
  )
}

export default IntroLayout
