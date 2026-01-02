import React, { useEffect } from 'react'
import { Header } from '../layout/Header'
import { Footer } from '../layout/Footer'
import MapEffects from '../components/map/MapEffects'
import RegionMarker from '../components/map/RegionMarker'
import { useMapStore } from '../stores/mapStore'
import { Map as MapIcon, Lock, ArrowRight, CheckCircle2 } from 'lucide-react'

const MapPage: React.FC = () => {
  const { regions, fetchRegions } = useMapStore()

  useEffect(() => {
    fetchRegions()
  }, [fetchRegions])

  return (
    <div className="min-h-screen flex flex-col bg-[#0a160e]">
      <Header />
      <main className="flex-grow flex flex-col relative overflow-hidden min-h-[calc(100vh-140px)]">
        <MapEffects />

        {/* 頁面標題與簡介 */}
        <div className="relative z-10 w-full px-6 py-5 pointer-events-none">
          <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="bg-[#112217]/80 backdrop-blur-md border border-white/5 p-6 rounded-2xl max-w-md pointer-events-auto shadow-2xl">
              <h1 className="text-3xl font-display font-black text-white mb-2 flex items-center gap-3">
                <MapIcon className="text-primary" size={28} />
                心靈大陸地圖
              </h1>
              <p className="text-white/40 text-[14px] leading-relaxed font-serif italic">
                每一步試煉都是靈魂的迴響。點擊未被封印的區域，開始你的命運之旅。
              </p>
            </div>

            {/* 區域圖例 (Desktop Only) */}
            <div className="hidden lg:flex flex-col gap-3 pointer-events-auto">
              <div className="bg-[#112217]/80 backdrop-blur-md border border-white/5 p-4 rounded-xl shadow-xl min-w-[200px]">
                <h3 className="text-[14px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">區域圖例</h3>
                <ul className="space-y-4">
                  {regions.map(region => (
                    <li key={region.id} className="flex items-center gap-3 text-[14px] text-white/60">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: region.color, boxShadow: `0 0 10px ${region.color}` }}
                      />
                      <span className="font-display tracking-wider">
                        {region.name}
                        {region.status === 'CONQUERED' && <span className="text-primary text-[9px] ml-2 opacity-80">(已征服)</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 互動地圖本體 */}
        <div className="hidden lg:block relative w-full h-[400px] max-w-[1300px] mx-auto mt-[-50px] mb-20 px-8">
          {regions.map((region) => (
            <RegionMarker
              key={region.id}
              region={region}
            />
          ))}
        </div>

        {/* 手機版列表模式 */}
        <div className="lg:hidden px-4 pb-32 flex flex-col gap-4 relative z-10">
          <h3 className="text-center text-white/20 text-[10px] uppercase tracking-widest mb-4">或選擇列表模式瀏覽</h3>
          {regions.map(region => (
            <div
              key={region.id}
              onClick={() => {
                if (region.status !== 'LOCKED') {
                  window.location.href = region.status === 'CONQUERED' ? `/analysis?region=${region.id}` : `/quest/intro?type=${region.id}`
                }
              }}
              className={`
                bg-white/5 border p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden transition-all
                ${region.status === 'LOCKED' ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100 hover:bg-white/10 active:scale-95'}
              `}
              style={{ borderColor: region.status === 'LOCKED' ? 'rgba(255,255,255,0.05)' : `${region.color}33` }}
            >
              <div className="flex-grow">
                <h4 className="font-display font-bold text-[16px] tracking-widest mb-1" style={{ color: region.status === 'LOCKED' ? '#52525b' : '#fff' }}>
                  {region.name}
                </h4>
                <p className="text-[14px] text-white/40 italic">
                  {region.status === 'LOCKED' ? (region.unlock_hint || '封印中') : '試煉之路已開啟'}
                </p>
              </div>

              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all`}
                style={{ backgroundColor: region.status === 'LOCKED' ? 'rgba(255,255,255,0.05)' : region.color }}
              >
                {region.status === 'LOCKED' ? (
                  <Lock size={16} className="text-white/20" />
                ) : region.status === 'CONQUERED' ? (
                  <CheckCircle2 size={18} className="text-black" />
                ) : (
                  <ArrowRight size={18} className="text-black" />
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default MapPage
