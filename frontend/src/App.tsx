import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import AnalysisPage from './pages/AnalysisPage'
import Home from './pages/Home'
import Questionnaire from './pages/Questionnaire'
import QuestIntro from './pages/QuestIntro'
import MapPage from './pages/MapPage'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <Router>
      <div className="bg-background-dark min-h-screen relative overflow-hidden flex flex-col">
        {/* 背景發光層 (Nebula Layers) */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]"></div>
          <div className="absolute top-1/4 left-10 w-64 h-64 bg-magic-cyan/10 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '4s' }}></div>
          <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-[#1a4031] rounded-full blur-[100px] opacity-60 animate-pulse" style={{ animationDuration: '6s' }}></div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/questionnaire"
              element={isAuthenticated ? <Questionnaire /> : <Navigate to="/" />}
            />
            <Route
              path="/quest/:questId"
              element={isAuthenticated ? <QuestIntro /> : <Navigate to="/" />}
            />
            <Route
              path="/map"
              element={isAuthenticated ? <MapPage /> : <Navigate to="/" />}
            />
            <Route
              path="/analysis"
              element={isAuthenticated ? <AnalysisPage /> : <Navigate to="/" />}
            />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
