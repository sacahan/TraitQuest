import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App'

// 在開發環境或透過環境變數啟用 vConsole（用於手機瀏覽器偵錯）
if (import.meta.env.VITE_ENABLE_VCONSOLE === 'true') {
  import('vconsole').then((module) => {
    new module.default()
    console.log('vConsole 已啟用 - 用於手機瀏覽器偵錯')
  })
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
