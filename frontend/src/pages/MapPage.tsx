import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../layout/AppLayout'
import MapEffects from '../components/map/MapEffects'
import RegionMarker from '../components/map/RegionMarker'
import { useMapStore } from '../stores/mapStore'
import { Map as MapIcon, Lock, RotateCcw, BookOpen, Sparkles, Zap, ScrollText, Sword, Trophy } from 'lucide-react'

// 與 RegionMarker 保持一致的圖示映射
const ICON_MAP: Record<string, any> = {
    Sparkles, Zap, ScrollText, Sword, Trophy
}

const MapPage: React.FC = () => {
    const { regions, fetchRegions } = useMapStore()
    const navigate = useNavigate()

    useEffect(() => {
        fetchRegions(true)
    }, [fetchRegions])

    return (
        <AppLayout backgroundVariant="none">
            <div className="w-full flex-grow flex flex-col relative overflow-hidden min-h-[calc(100vh-140px)]">
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
                                if (region.status !== 'LOCKED' && region.status !== 'CONQUERED') {
                                    navigate(`/launch?type=${region.id}`)
                                }
                            }}
                            className={`
                bg-white/5 border p-5 rounded-2xl flex flex-col gap-4 relative overflow-hidden transition-all
                ${region.status === 'LOCKED' ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}
                ${region.status !== 'LOCKED' && region.status !== 'CONQUERED' ? 'hover:bg-white/10 active:scale-95' : ''}
              `}
                            style={{ borderColor: region.status === 'LOCKED' ? 'rgba(255,255,255,0.05)' : `${region.color}33` }}
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex-grow">
                                    <h4 className="font-display font-bold text-[16px] tracking-widest mb-1" style={{ color: region.status === 'LOCKED' ? '#52525b' : '#fff' }}>
                                        {region.name}
                                    </h4>
                                    <p className="text-[14px] text-white/40 italic">
                                        {region.status === 'LOCKED' ? (region.unlock_hint || '封印中') : region.status === 'CONQUERED' ? '你已征服此地，靈魂的試煉永無止境...' : '試煉之路已開啟'}
                                    </p>
                                </div>

                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 relative`}
                                    style={{ backgroundColor: region.status === 'LOCKED' ? 'rgba(255,255,255,0.05)' : region.color }}
                                >
                                    {(() => {
                                        const IconComponent = ICON_MAP[region.icon || 'Sparkles'] || Sparkles
                                        return (
                                            <>
                                                <IconComponent
                                                    size={18}
                                                    style={{
                                                        color: region.status === 'LOCKED' ? '#3f3f46' : '#000',
                                                    }}
                                                />
                                                {region.status === 'LOCKED' && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                                                        <Lock size={16} className="text-white/40" />
                                                    </div>
                                                )}
                                            </>
                                        )
                                    })()}
                                </div>
                            </div>

                            {/* 已征服區域：顯示「再戰」和「回顧歷程」選項 */}
                            {region.status === 'CONQUERED' && (
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            navigate(`/launch?type=${region.id}`)
                                        }}
                                        className="flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-white/5 transition-colors group/btn"
                                    >
                                        <RotateCcw size={16} className="text-zinc-400 group-hover/btn:text-white transition-colors" />
                                        <span className="text-[10px] text-zinc-400 group-hover/btn:text-white font-medium">再戰</span>
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            navigate(`/analysis?region=${region.id}`)
                                        }}
                                        className="flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-white/5 transition-colors group/btn"
                                    >
                                        <BookOpen size={16} style={{ color: region.color }} />
                                        <span className="text-[10px] text-zinc-300 group-hover/btn:text-white font-medium">回顧歷程</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    )
}

export default MapPage
