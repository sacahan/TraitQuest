import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import PageLoader from './components/ui/PageLoader'
import Home from './pages/Home'

// Lazy load components
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const AnalysisPage = lazy(() => import('./pages/AnalysisPage'))
const QuestionnairePage = lazy(() => import('./pages/QuestionnairePage'))
const MapPage = lazy(() => import('./pages/MapPage'))
const LaunchPage = lazy(() => import('./pages/LaunchPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))

// Lazy load Intro Pages
const MbtiIntro = lazy(() => import('./pages/intro/MbtiIntro'))
const BigFiveIntro = lazy(() => import('./pages/intro/BigFiveIntro'))
const DiscIntro = lazy(() => import('./pages/intro/DiscIntro'))
const EnneagramIntro = lazy(() => import('./pages/intro/EnneagramIntro'))
const GallupIntro = lazy(() => import('./pages/intro/GallupIntro'))

/**
 * 全域自動捲動至頂部組件
 * 當路由路徑發生變化時，自動將視窗滾動條重置回頂部。
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ScrollToTop />
      <div className="bg-background-dark min-h-screen relative overflow-hidden flex flex-col">
        {/* 背景發光層 (Nebula Layers) */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]"></div>
          <div className="absolute top-1/4 left-10 w-64 h-64 bg-magic-cyan/10 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '4s' }}></div>
          <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-[#1a4031] rounded-full blur-[100px] opacity-60 animate-pulse" style={{ animationDuration: '6s' }}></div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/questionnaire"
                element={isAuthenticated ? <QuestionnairePage /> : <Navigate to="/" />}
              />
              <Route
                path="/map"
                element={isAuthenticated ? <MapPage /> : <Navigate to="/" />}
              />
              <Route
                path="/launch"
                element={isAuthenticated ? <LaunchPage /> : <Navigate to="/" />}
              />
              <Route
                path="/dashboard"
                element={isAuthenticated ? <DashboardPage /> : <Navigate to="/" />}
              />
              <Route
                path="/analysis"
                element={isAuthenticated ? <AnalysisPage /> : <Navigate to="/" />}
              />

              {/* Intro Pages */}
              <Route path="/intro/mbti" element={<MbtiIntro />} />
              <Route path="/intro/bigfive" element={<BigFiveIntro />} />
              <Route path="/intro/disc" element={<DiscIntro />} />
              <Route path="/intro/enneagram" element={<EnneagramIntro />} />
              <Route path="/intro/gallup" element={<GallupIntro />} />

              {/* Static Pages */}
              <Route path="/about" element={<AboutPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/services" element={<TermsPage />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </Router>
  )
}

export default App
