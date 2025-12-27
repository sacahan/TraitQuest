# TraitQuest 組件映射規範 (Components Mapping)

**版本**: 1.0  
**最後更新**: 2025-12-27

---

## 📋 文件說明

本文件詳述 `demo/` 目錄中的 HTML 原型如何映射到 React 組件,確保視覺一致性與功能完整性。

---

## 核心原則

1. **DOM 結構保持一致**: React 組件的 JSX 結構應盡可能接近原始 HTML
2. **樣式完整遷移**: 所有 Tailwind class 都需要保留
3. **動畫效果保留**: 所有 CSS 動畫、transition、hover 效果都需要實作
4. **互動邏輯增強**: 在保持視覺一致的前提下,使用 React 狀態管理增強互動

---

## 1. 首頁 (Home Page)

### Demo 檔案
`demo/index/index.html`

### React 組件
`src/pages/Home.tsx`

### 組件結構

```tsx
<Home>
  ├─ <Header />              // 導航列
  ├─ <HeroSection />         // 主視覺區
  ├─ <QuestCardsGrid />      // 五大測驗卡片網格
  └─ <CTASection />          // 底部 CTA
  └─ <Footer />              // 頁尾
```

### 詳細映射

#### Header 組件

**HTML 對應**: `<header>` (L66-96)

**組件**: `src/components/Header.tsx`

```tsx
interface HeaderProps {
  isLoggedIn: boolean
  userName?: string
  onLogin: () => void
}

export function Header({ isLoggedIn, userName, onLogin }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-background-light/80 dark:bg-[#102216]/80 border-b border-solid border-b-[#23482f]">
      <div className="w-full px-4 md:px-10 py-3">
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <div className="flex items-center gap-2 text-slate-900 dark:text-white cursor-pointer">
            <span className="material-symbols-outlined text-primary text-3xl animate-pulse">swords</span>
            <h2 className="text-xl font-display font-black">TraitQuest</h2>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/map">世界地圖</Link>
            <Link to="/analysis">英雄面板</Link>
          </nav>
          
          {/* Login Button */}
          <button onClick={onLogin} className="...">
            Google 登入
          </button>
        </div>
      </div>
    </header>
  )
}
```

**狀態管理**:
- 使用 Zustand `useAuthStore` 管理登入狀態
- `isLoggedIn` 從 store 讀取
- `onLogin` 觸發 Google OAuth 流程

---

#### HeroSection 組件

**HTML 對應**: `<div class="flex min-h-[560px]...">` (L102-142)

**組件**: `src/components/HeroSection.tsx`

```tsx
export function HeroSection() {
  return (
    <div 
      className="flex min-h-[560px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-xl items-center justify-center p-8 relative overflow-hidden group shadow-2xl shadow-primary/10 transition-all duration-500 hover:shadow-primary/30"
      style={{
        backgroundImage: 'linear-gradient(rgba(16, 34, 22, 0.7) 0%, rgba(16, 34, 22, 0.85) 100%), url(...)'
      }}
    >
      {/* 裝飾性圖標 */}
      <div className="absolute top-4 left-4 text-white/20 transition-transform duration-700 group-hover:rotate-45">
        <span className="material-symbols-outlined text-6xl rotate-12">swords</span>
      </div>
      
      {/* 主要內容 */}
      <div className="flex flex-col gap-4 text-center z-10 max-w-[800px]">
        <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary w-fit mx-auto mb-2 backdrop-blur-sm animate-pulse">
          <span className="material-symbols-outlined text-sm">auto_awesome</span>
          <span className="text-xs font-bold uppercase tracking-wider">New Adventure Available</span>
        </div>
        
        <h1 className="text-white text-4xl font-black leading-tight tracking-tight font-display @[480px]:text-6xl">
          開啟你的心靈冒險
        </h1>
        
        <h2 className="text-gray-200 text-base font-medium leading-relaxed @[480px]:text-lg max-w-2xl mx-auto">
          從 MBTI 的職業聖殿到九型人格的靈魂神殿。選擇你的試煉，解鎖隱藏在內心深處的英雄屬性與專屬技能！
        </h2>
      </div>
      
      {/* CTA 按鈕 */}
      <button 
        onClick={() => navigate('/questionnaire')}
        className="group flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-full h-12 px-8 bg-white text-[#112217] hover:bg-gray-100 transition-all duration-300 text-base font-bold shadow-lg z-10 mt-4 animate-breathing-white hover:scale-105 active:scale-95"
      >
        <span className="material-symbols-outlined text-xl transition-transform group-hover:rotate-12">login</span>
        <span className="truncate">使用 Google 帳號開始</span>
      </button>
    </div>
  )
}
```

**動畫重點**:
- `animate-breathing-white`: 定義在 Tailwind config
- `group-hover:rotate-45`: 裝飾圖標旋轉
- `hover:scale-105`: 按鈕放大效果

---

#### QuestCardsGrid 組件

**HTML 對應**: `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3...">` (L157-297)

**組件**: `src/components/QuestCardsGrid.tsx`

```tsx
interface QuestCard {
  id: string
  title: string
  type: string
  description: string
  imageUrl: string
  icon: string
  route: string
}

const QUEST_CARDS: QuestCard[] = [
  {
    id: 'mbti',
    title: 'MBTI 分析',
    type: '英雄職業',
    description: '探索 E/I、S/N、T/F、J/P 四大維度...',
    imageUrl: 'https://...',
    icon: 'psychology',
    route: '/mbti'
  },
  // ... 其他四個測驗
]

export function QuestCardsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4 justify-items-center">
      {QUEST_CARDS.map(quest => (
        <QuestCard key={quest.id} {...quest} />
      ))}
    </div>
  )
}

function QuestCard({ title, type, description, imageUrl, icon, route }: QuestCard) {
  const navigate = useNavigate()
  
  return (
    <div className="w-full bg-[#1a3323] p-5 rounded-2xl border border-[#23482f] hover:border-primary hover:shadow-[0_0_30px_rgba(17,212,82,0.3)] transition-all duration-300 hover:-translate-y-2 group flex flex-col h-full animate-card-pulse hover:animate-none">
      {/* 圖片區 */}
      <div className="relative w-full aspect-[4/3] mb-4 rounded-xl overflow-hidden bg-[#102216]">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
        <div className="absolute top-3 left-3 bg-[#102216]/80 backdrop-blur-sm text-primary border border-primary/30 text-xs font-bold w-8 h-8 rounded-lg shadow-md flex items-center justify-center group-hover:bg-primary group-hover:text-[#102216] transition-colors duration-300">
          <span className="material-symbols-outlined text-sm">{icon}</span>
        </div>
      </div>
      
      {/* 內容區 */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-white text-xl font-bold font-display group-hover:text-primary transition-colors">
          {title}
        </h3>
      </div>
      <p className="text-primary text-sm font-bold uppercase tracking-wider mb-2 font-display">
        Type: {type}
      </p>
      <p className="text-gray-300 text-sm leading-relaxed mb-6 grow group-hover:text-gray-100 transition-colors font-body">
        {description}
      </p>
      
      {/* 按鈕 */}
      <button
        onClick={() => navigate(route)}
        className="w-full mt-auto py-3 px-4 rounded-xl bg-[#23482f] hover:bg-primary hover:text-[#112217] text-white font-bold transition-all duration-300 flex items-center justify-center gap-2 group/btn active:scale-95 active:brightness-110 hover:shadow-[0_0_15px_rgba(17,212,82,0.5)]"
      >
        <span>進入塔樓</span>
        <span className="material-symbols-outlined text-sm transition-transform group-hover/btn:translate-x-1">arrow_forward</span>
      </button>
    </div>
  )
}
```

**動畫重點**:
- `animate-card-pulse`: 卡片邊框脈衝
- `hover:-translate-y-2`: 懸浮上升
- `group-hover:scale-110`: 圖片放大
- `hover:animate-none`: 懸浮時停止脈衝

---

## 2. 測驗頁面 (Questionnaire)

### Demo 檔案
`demo/questionnaire/questionnaire.html`

### React 組件
`src/pages/Questionnaire.tsx`

### 組件結構

```tsx
<Questionnaire>
  ├─ <NarrativeDisplay />        // 敘事文字區 (打字機效果)
  ├─ <QuestionDisplay />         // 題目顯示
  ├─ <QuantitativeOptions />     // 量化試煉按鈕 (QUANTITATIVE)
  ├─ <SoulNarrativeInput />      // 靈魂對話輸入 (SOUL_NARRATIVE)
  └─ <DimensionSensors />        // 五大維度感應槽
```

### 詳細映射

#### NarrativeDisplay 組件

**功能**: 打字機效果顯示 AI 敘事

```tsx
interface NarrativeDisplayProps {
  narrative: string
  speed?: number // 每個字的延遲 (ms)
}

export function NarrativeDisplay({ narrative, speed = 50 }: NarrativeDisplayProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  
  useEffect(() => {
    setIsTyping(true)
    setDisplayedText('')
    
    let index = 0
    const timer = setInterval(() => {
      if (index < narrative.length) {
        setDisplayedText(prev => prev + narrative[index])
        index++
      } else {
        setIsTyping(false)
        clearInterval(timer)
      }
    }, speed)
    
    return () => clearInterval(timer)
  }, [narrative, speed])
  
  return (
    <div className="bg-[#1a3323]/50 backdrop-blur-sm rounded-2xl p-6 border border-[#23482f] mb-6">
      <div className="flex items-start gap-3 mb-3">
        <span className="material-symbols-outlined text-primary text-2xl">auto_stories</span>
        <h3 className="text-primary text-lg font-bold font-display">艾比的引導</h3>
      </div>
      <p className="text-gray-200 text-base leading-relaxed font-body whitespace-pre-wrap">
        {displayedText}
        {isTyping && <span className="animate-pulse">|</span>}
      </p>
    </div>
  )
}
```

---

#### QuantitativeOptions 組件

**功能**: 五段式選擇按鈕

```tsx
const OPTIONS = [
  { value: 1, label: '非常不同意', color: 'bg-red-500/20 hover:bg-red-500/40' },
  { value: 2, label: '不同意', color: 'bg-orange-500/20 hover:bg-orange-500/40' },
  { value: 3, label: '中立', color: 'bg-gray-500/20 hover:bg-gray-500/40' },
  { value: 4, label: '同意', color: 'bg-green-500/20 hover:bg-green-500/40' },
  { value: 5, label: '非常同意', color: 'bg-primary/20 hover:bg-primary/40' }
]

export function QuantitativeOptions({ onSelect }: { onSelect: (value: number) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
      {OPTIONS.map(option => (
        <button
          key={option.value}
          onClick={() => onSelect(option.value)}
          className={`${option.color} border border-white/10 rounded-xl p-4 text-white font-bold transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
```

---

#### DimensionSensors 組件

**功能**: 五大維度即時感應槽

```tsx
interface Dimension {
  name: string
  value: number // 0-100
  color: string
}

export function DimensionSensors({ dimensions }: { dimensions: Dimension[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
      {dimensions.map(dim => (
        <div key={dim.name} className="bg-[#1a3323]/30 rounded-lg p-3 border border-[#23482f]">
          <div className="text-xs text-gray-400 mb-2">{dim.name}</div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full ${dim.color} transition-all duration-500`}
              style={{ width: `${dim.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

## 3. 分析頁面 (Analysis)

### Demo 檔案
`demo/analysis/analysis.html`

### React 組件
`src/pages/Analysis.tsx`

### 組件結構

```tsx
<Analysis>
  ├─ <HeroProfile />             // 核心形象區
  ├─ <SystemStatusCards />       // 五大系統狀態卡片
  │   ├─ <MBTICard />
  │   ├─ <EnneagramCard />
  │   ├─ <BigFiveRadarCard />
  │   ├─ <DISCCard />
  │   └─ <GallupCard />
  ├─ <DestinyGuide />            // 命運指引
  └─ <DestinyBonds />            // 命運羈絆
```

### 詳細映射

#### BigFiveRadarCard 組件

**功能**: Big Five 雷達圖

```tsx
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts'

interface BigFiveRadarCardProps {
  stats: {
    openness: number
    conscientiousness: number
    extraversion: number
    agreeableness: number
    neuroticism: number
  }
}

export function BigFiveRadarCard({ stats }: BigFiveRadarCardProps) {
  const data = [
    { stat: 'INT (開放性)', value: stats.openness },
    { stat: 'VIT (盡責性)', value: stats.conscientiousness },
    { stat: 'AGI (外向性)', value: stats.extraversion },
    { stat: 'CHA (親和性)', value: stats.agreeableness },
    { stat: 'DEX (神經質)', value: stats.neuroticism }
  ]
  
  return (
    <div className="bg-[#1a3323] rounded-2xl border border-[#23482f] p-6">
      <h3 className="text-white text-xl font-bold mb-4">Big Five 屬性</h3>
      <RadarChart width={300} height={300} data={data}>
        <PolarGrid stroke="#23482f" />
        <PolarAngleAxis dataKey="stat" stroke="#92c9a4" />
        <PolarRadiusAxis stroke="#23482f" />
        <Radar 
          dataKey="value" 
          stroke="#11D452" 
          fill="#11D452" 
          fillOpacity={0.3} 
        />
      </RadarChart>
    </div>
  )
}
```

---

## Demo 頁面完整對照表

| Demo 檔案 | React 頁面 | 主要組件 | 狀態管理 |
|-----------|-----------|---------|---------|
| `index/index.html` | `Home.tsx` | Header, HeroSection, QuestCardsGrid, CTASection, Footer | useAuthStore |
| `questionnaire/questionnaire.html` | `Questionnaire.tsx` | NarrativeDisplay, QuestionDisplay, QuantitativeOptions, SoulNarrativeInput, DimensionSensors | useQuestStore, useWebSocket |
| `analysis/analysis.html` | `Analysis.tsx` | HeroProfile, SystemStatusCards, BigFiveRadarCard, DestinyGuide, DestinyBonds | useAnalysisStore |
| `mbti/mbti.html` | `MbtiIntro.tsx` | IntroHero, FeatureList, CTAButton | - |
| `big_five/big_five.html` | `BigFiveIntro.tsx` | IntroHero, FeatureList, CTAButton | - |
| `disc/disc.html` | `DiscIntro.tsx` | IntroHero, FeatureList, CTAButton | - |
| `enneagram/enneagram.html` | `EnneagramIntro.tsx` | IntroHero, FeatureList, CTAButton | - |
| `gallup/gallup.html` | `GallupIntro.tsx` | IntroHero, FeatureList, CTAButton | - |
| `map/map.html` | `Map.tsx` | InteractiveMap, RegionMarker, UnlockStatus | useMapStore |
| `about/about.html` | `About.tsx` | ContentSection | - |
| `privacy/privacy.html` | `Privacy.tsx` | ContentSection | - |
| `services/services.html` | `Services.tsx` | ContentSection | - |
| `bulletin_board/bulletin_board.html` | `BulletinBoard.tsx` | PostList, PostCard, CommentSection | useBulletinStore |

---

## 共用組件庫

### Layout 組件

```
src/components/layout/
├─ Header.tsx              // 導航列
├─ Footer.tsx              // 頁尾
└─ PageContainer.tsx       // 頁面容器
```

### UI 組件

```
src/components/ui/
├─ Button.tsx              // 按鈕 (多種變體)
├─ Card.tsx                // 卡片容器
├─ Badge.tsx               // 徽章標籤
├─ ProgressBar.tsx         // 進度條
└─ TypewriterText.tsx      // 打字機效果文字
```

### 動畫組件

```
src/components/animations/
├─ BreathingGlow.tsx       // 呼吸光暈效果
├─ CardPulse.tsx           // 卡片脈衝效果
└─ FadeInUp.tsx            // 淡入上升效果
```

---

## Tailwind 自定義配置

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#11D452',
        'primary-hover': '#0fb847',
        'background-dark': '#102216',
        surface: '#1a3323',
        'guild-border': '#23482f'
      },
      animation: {
        'breathing-glow': 'breathing-glow 3s ease-in-out infinite',
        'breathing-white': 'breathing-white 3s ease-in-out infinite',
        'card-pulse': 'card-pulse 4s ease-in-out infinite'
      },
      keyframes: {
        'breathing-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(17, 212, 82, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(17, 212, 82, 0.7)' }
        },
        'breathing-white': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(255, 255, 255, 0.2)' },
          '50%': { boxShadow: '0 0 20px rgba(255, 255, 255, 0.6)' }
        },
        'card-pulse': {
          '0%, 100%': { borderColor: 'rgba(35, 72, 47, 1)' },
          '50%': { borderColor: 'rgba(17, 212, 82, 0.4)' }
        }
      }
    }
  }
}
```

---

## 關鍵提醒

1. **嚴格保留 class 名稱**: 所有 Tailwind class 都需要完整遷移
2. **動畫定義**: 自定義動畫需在 Tailwind config 中定義
3. **Material Icons**: 使用 `material-symbols-outlined` 字體
4. **響應式設計**: 保留所有 `md:`, `lg:`, `@[480px]:` 等 breakpoint
5. **狀態管理**: 使用 Zustand 管理全局狀態,避免 prop drilling
