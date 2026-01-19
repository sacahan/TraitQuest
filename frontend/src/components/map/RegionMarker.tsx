import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import type { Region } from '../../stores/mapStore'
import { Lock, Sparkles, Zap, ScrollText, Sword, Trophy, AlertCircle, RotateCcw, BookOpen } from 'lucide-react'

const ICON_MAP: Record<string, any> = {
  Sparkles, Zap, ScrollText, Sword, Trophy
}

interface RegionMarkerProps {
  region: Region
}

const RegionMarker: React.FC<RegionMarkerProps> = ({ region }) => {
  const [isHovered, setIsHovered] = React.useState(false)
  const navigate = useNavigate()
  const markerRef = React.useRef<HTMLDivElement>(null)
  const isLocked = region.status === 'LOCKED'
  const isConquered = region.status === 'CONQUERED'
  const IconComponent = ICON_MAP[region.icon || 'Sparkles'] || Sparkles

  const handleClick = (e: React.MouseEvent) => {
    if (isLocked) return

    // For conquered regions, toggle popup on mobile/touch
    if (isConquered) {
      e.stopPropagation()
      setIsHovered(!isHovered)
      return
    }

    navigate(`/launch?type=${region.id}`);
  };

  return (
    <div
      ref={markerRef}
      className={`absolute z-20 group ${isHovered ? 'z-[100]' : ''}`}
      style={{
        top: region.position?.top,
        left: region.position?.left,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className={`relative flex flex-col items-center ${isLocked ? 'cursor-not-allowed' : isConquered ? 'cursor-default' : 'cursor-pointer'}`}>
        {/* Glow Layer */}
        {!isLocked && (
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 w-24 h-48 bg-gradient-to-t from-current via-transparent to-transparent blur-2xl pointer-events-none z-0 opacity-20 group-hover:opacity-40 transition-opacity"
            style={{ color: region.color }}
          ></div>
        )}

        {/* Marker Core */}
        <motion.div
          animate={isLocked ? {} : { y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className={`
            w-16 h-16 rounded-xl flex items-center justify-center relative z-20 transition-all duration-500
            ${isLocked ? 'bg-zinc-900 border-2 border-zinc-800 grayscale opacity-60' : 'bg-black/80 border-2 group-hover:scale-110 group-hover:-translate-y-2'}
          `}
          style={{
            borderColor: isLocked ? '#27272a' : region.color,
            boxShadow: isLocked ? 'none' : `0 0 20px ${region.color}44`
          }}
        >
          <IconComponent
            size={32}
            style={{
              color: isLocked ? '#3f3f46' : region.color,
              filter: isLocked ? 'none' : `drop-shadow(0 0 8px ${region.color})`
            }}
          />

          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl backdrop-blur-[1px]">
              <Lock size={20} className="text-white/40" />
            </div>
          )}
        </motion.div>

        {/* Label */}
        <div
          className="mt-4 bg-black/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/5 shadow-2xl z-10 transition-colors"
          style={{ borderColor: !isLocked ? `${region.color}44` : 'rgba(255,255,255,0.05)' }}
        >
          <span
            className="font-display font-bold text-[12px] tracking-[0.2em] uppercase flex items-center gap-2"
            style={{ color: isLocked ? '#52525b' : '#fff' }}
          >
            {region.name}
            {isConquered && (
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] bg-primary/20 px-1.5 py-0.5 rounded text-primary border border-primary/30">已征服</span>
                {/* Mobile-only Rematch Action */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/launch?type=${region.id}`);
                  }}
                  className="sm:hidden flex items-center gap-1 bg-red-600/90 hover:bg-red-500 px-2 py-0.5 rounded text-white text-[9px] font-bold border border-red-400/30 transition-colors shadow-lg shadow-red-900/40"
                >
                  <RotateCcw size={10} strokeWidth={3} />
                  再戰
                </button>
              </div>
            )}
          </span>
        </div>

        {/* Popup */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute bottom-full mb-6 w-72 bg-zinc-900/95 border border-white/10 rounded-xl p-4 shadow-2xl z-[9999] backdrop-blur-xl pointer-events-auto
                after:content-[''] after:absolute after:top-full after:left-0 after:w-full after:h-6 after:bg-transparent"
              style={{ borderColor: isLocked ? 'rgba(255,255,255,0.1)' : `${region.color}44` }}
            >
              <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wide flex items-center justify-between">
                {region.name}
                {isConquered && <Trophy size={14} className="text-yellow-500" />}
              </h3>

              {isLocked ? (
                <div className="flex items-start gap-2 text-red-500/70">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <p className="text-[12px] italic leading-relaxed">{region.unlock_hint || "前置條件未達成"}</p>
                </div>
              ) : isConquered ? (
                <div className="space-y-3">
                  <p className="text-[12px] text-zinc-400 italic leading-relaxed">
                    「你已征服此地，但靈魂的試煉永無止境...」
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                          navigate(`/launch?type=${region.id}`);
                      }}
                      className="flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-white/5 transition-colors group/btn"
                    >
                      <RotateCcw size={16} className="text-zinc-400 group-hover/btn:text-white transition-colors" />
                      <span className="text-[10px] text-zinc-400 group-hover/btn:text-white font-medium">再戰</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                          navigate(`/analysis?region=${region.id}`);
                      }}
                      className="flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-white/5 transition-colors group/btn"
                    >
                      <BookOpen size={16} style={{ color: region.color }} />
                      <span className="text-[10px] text-zinc-300 group-hover/btn:text-white font-medium">回顧歷程</span>
                    </button>
                  </div>
                </div>
              ) : (
                    <div className="space-y-4">
                      <p className="text-[12px] text-white/50 italic leading-relaxed">「此處的命運正等待你的抉擇...」</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/launch?type=${region.id}`);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-black text-[12px] font-black uppercase tracking-widest hover:brightness-110 transition-all"
                        style={{ backgroundColor: region.color }}
                      >
                        <span>踏入試煉之路</span>
                        <Sword size={14} fill="currentColor" />
                      </button>
                    </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default RegionMarker
