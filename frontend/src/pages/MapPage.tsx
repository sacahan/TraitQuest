import React, { useEffect } from 'react'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
import MapEffects from '../components/map/MapEffects'
import RegionMarker from '../components/map/RegionMarker'
import { useMapStore } from '../stores/mapStore'

const MapPage: React.FC = () => {
  const { regions, fetchRegions, isLoading } = useMapStore()

  useEffect(() => {
    fetchRegions()
  }, [fetchRegions])

  // 各區域在地圖上的定位百分比 (參考 demo)
  const regionPositions: Record<string, { top: string; left?: string; right?: string }> = {
    mbti: { top: '17%', left: '15%' },
    big_five: { top: '16%', right: '15%' },
    enneagram: { top: '38%', left: '42%' }, // 居中
    disc: { top: '75%', left: '20%' },
    gallup: { top: '75%', right: '20%' },
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a160e]">
      <Header />
      <main className="flex-grow flex flex-col relative overflow-hidden min-h-[calc(100vh-140px)]">
        <MapEffects />

        {/* 頁面標題與簡介 */}
        <div className="relative z-10 w-full px-6 py-5 pointer-events-none">
          <div className="max-w-[1400px] mx-auto flex justify-between items-start">
            <div className="bg-[#112217]/80 backdrop-blur-md border border-[#23482f] p-6 rounded-2xl max-w-md pointer-events-auto shadow-xl ring-1 ring-white/5">
              <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">public</span>
                心靈大陸地圖
              </h1>
              <p className="text-gray-400 text-sm leading-relaxed">
                歡迎來到 TraitQuest 的世界。請點擊地圖上的據點，進入不同的人格試煉。每個區域都由強大的守護者鎮守。
              </p>
              <div className="mt-4 flex gap-2">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <span className="w-3 h-3 rounded-full bg-primary animate-pulse"></span>
                  當前區域: 安全區
                </div>
              </div>
            </div>

            {/* 區域圖例 (Desktop Only) */}
            <div className="hidden lg:flex flex-col gap-3 pointer-events-auto">
              <div className="bg-[#112217]/80 backdrop-blur-md border border-[#23482f] p-4 rounded-xl shadow-xl ring-1 ring-white/5 min-w-[200px]">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">區域圖例</h3>
                <ul className="space-y-3">
                  {regions.map(region => (
                    <li key={region.id} className="flex items-center gap-3 text-sm text-gray-300">
                      <span
                        className="material-symbols-outlined text-lg"
                        style={{ color: region.color, filter: `drop-shadow(0 0 5px ${region.color})` }}
                      >
                        {region.icon}
                      </span>
                      <span>
                        {region.name}
                        {region.status === 'CONQUERED' && <span className="text-xs ml-1 opacity-60">(已征服)</span>}
                        {region.status === 'LOCKED' && <span className="text-xs ml-1 opacity-40">(未解鎖)</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 互動地圖本體 */}
        <div className="hidden lg:block flex-grow relative w-full h-full min-h-[400px] max-w-[1200px] mx-auto perspective-1000 mt-[-100px] mb-32 px-8">
          {regions.map((region) => (
            <RegionMarker
              key={region.id}
              region={region}
              position={regionPositions[region.id] || { top: '50%', left: '50%' }}
              isLocked={region.status === 'LOCKED'}
            />
          ))}
        </div>

        {/* 手機版列表模式 */}
        <div className="lg:hidden px-4 pb-32 flex flex-col gap-4 relative z-10">
          <h3 className="text-center text-gray-400 text-sm mb-2">或選擇列表模式瀏覽</h3>
          {regions.map(region => (
            <div
              key={region.id}
              className={`
              bg-[#1a3323] border p-4 rounded-xl flex items-center gap-4 relative overflow-hidden shadow-lg transition-opacity
              ${region.status === 'LOCKED' ? 'opacity-70 grayscale' : 'opacity-100'}
            `}
              style={{ borderColor: region.status === 'LOCKED' ? '#374151' : `${region.color}44` }}
            >
              {region.status === 'CONQUERED' && (
                <div className="absolute top-0 right-0 bg-primary text-[#112217] text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">已征服</div>
              )}
              <div
                className="w-16 h-16 rounded-lg bg-cover bg-center shrink-0 border-2"
                style={{
                  backgroundImage: `url("${region.preview_image}")`,
                  borderColor: region.status === 'LOCKED' ? '#374151' : region.color
                }}
              >
                {region.status === 'LOCKED' && (
                  <div className="w-full h-full bg-black/50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white">lock</span>
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <h4 className="font-bold flex items-center gap-2" style={{ color: region.status === 'LOCKED' ? '#6b7280' : region.color }}>
                  {region.name}
                </h4>
                <p className="text-xs text-gray-300 line-clamp-1">{region.description}</p>
              </div>
              <button
                disabled={region.status === 'LOCKED'}
                className={`p-2 rounded-full font-bold shadow-lg ${region.status === 'LOCKED' ? 'bg-gray-800 text-gray-500' : ''}`}
                style={{ backgroundColor: region.status === 'LOCKED' ? undefined : region.color, color: region.status === 'LOCKED' ? undefined : '#000' }}
              >
                <span className="material-symbols-outlined">{region.status === 'LOCKED' ? 'lock' : 'arrow_forward'}</span>
              </button>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default MapPage
