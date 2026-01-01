import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { Footer } from './Footer'

interface IntroLayoutProps {
  children: React.ReactNode
  title: string
}

const IntroLayout: React.FC<IntroLayoutProps> = ({ children, title }) => {
  const { isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-dark text-[#e0eadd] overflow-x-hidden font-sans">
      {/* 背景發光層 (Nebula Layers) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-magic-cyan/10 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-[#1a4031] rounded-full blur-[100px] opacity-60 animate-pulse" style={{ animationDuration: '6s' }}></div>
      </div>

      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-background-dark/80 border-b border-solid border-b-guild-border">
        <div className="w-full px-4 md:px-10 py-3">
          <div className="flex items-center justify-between w-full">
            <Link to="/" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
              <span className="material-symbols-outlined text-primary text-3xl animate-pulse">swords</span>
              <h2 className="text-xl font-display font-black leading-tight tracking-tight">TraitQuest</h2>
            </Link>

            <div className="flex items-center gap-4 md:gap-8 ml-auto">
              <nav className="hidden md:flex items-center gap-6">
                <Link to="/map" className="text-sm font-bold hover:text-primary transition-colors relative group">
                  心靈大陸
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link to="/analysis" className="text-sm font-bold hover:text-primary transition-colors relative group">
                  英雄面板
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </nav>

              {isAuthenticated ? (
                <button
                  onClick={() => logout()}
                  className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-surface border border-guild-border hover:border-primary text-white text-sm font-bold transition-all duration-300 transform hover:scale-105 active:scale-95"
                >
                  登出
                </button>
              ) : (
                <button
                  onClick={() => navigate('/')}
                  className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-primary hover:bg-primary-hover text-[#112217] text-sm font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 animate-breathing-glow shadow-[0_0_15px_rgba(17,212,82,0.3)] hover:shadow-[0_0_25px_rgba(17,212,82,0.6)]"
                >
                  登入
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full flex flex-col items-center relative z-10">
        {children}
      </main>

      <Footer />
    </div>
  )
}

export default IntroLayout
