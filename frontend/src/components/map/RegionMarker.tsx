import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Region } from '../../stores/mapStore'

interface RegionMarkerProps {
  region: Region
  position: { top: string; left?: string; right?: string }
  isLocked?: boolean
}

const RegionMarker: React.FC<RegionMarkerProps> = ({ region, position, isLocked }) => {
  const [isHovered, setIsHovered] = React.useState(false)
  const markerRef = React.useRef<HTMLDivElement>(null)
  const [popupPosition, setPopupPosition] = React.useState<'left' | 'right' | 'top'>('left')

  // 檢測 popup 是否會超出視窗邊界
  React.useEffect(() => {
    if (!markerRef.current || !isHovered) return

    const rect = markerRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // 如果在右側且會溢出，改為左側顯示
    if (position.left && rect.right + 300 > viewportWidth) {
      setPopupPosition('right')
    } else if (position.right && rect.left - 300 < 0) {
      setPopupPosition('left')
    } else if (rect.bottom + 200 > viewportHeight) {
      // 如果在下方會溢出，改為向上顯示
      setPopupPosition('top')
    } else {
      setPopupPosition(position.left ? 'left' : 'right')
    }
  }, [isHovered, position])

  return (
    <div
      ref={markerRef}
      className="absolute z-20 group hover:!z-[100]"
      style={{
        top: position.top,
        left: position.left,
        right: position.right,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`relative flex flex-col items-center ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
        {/* 背景發光層 */}
        {!isLocked && (
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 w-24 h-80 bg-gradient-to-t from-current via-transparent to-transparent blur-xl pointer-events-none z-0 opacity-30 group-hover:opacity-50 transition-opacity"
            style={{ color: region.color }}
          ></div>
        )}

        {/* 據點旗幟/圖示 */}
        <motion.div
          animate={isLocked ? {} : { y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className={`
            w-20 h-20 rounded-2xl flex items-center justify-center relative z-20 transition-all duration-300
            ${isLocked ? 'bg-gray-900 border-2 border-gray-700 grayscale' : 'bg-[#122023] border-2 group-hover:scale-110 group-hover:-translate-y-2'}
          `}
          style={{
            borderColor: isLocked ? '#374151' : region.color,
            boxShadow: isLocked ? 'none' : `0 0 20px ${region.color}66`
          }}
        >
          <span
            className="material-symbols-outlined text-4xl"
            style={{
              color: isLocked ? '#4b5563' : region.color,
              textShadow: isLocked ? 'none' : `0 0 10px ${region.color}`
            }}
          >
            {region.icon}
          </span>

          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl backdrop-blur-sm">
              <span className="material-symbols-outlined text-white text-3xl opacity-90">lock</span>
            </div>
          )}

          {!isLocked && (
            <div
              className="absolute -bottom-2 rotate-45 w-4 h-4 z-0"
              style={{ backgroundColor: region.color, boxShadow: `0 0 10px ${region.color}` }}
            ></div>
          )}
        </motion.div>

        {/* 區域名稱標籤 */}
        <div
          className="mt-6 bg-black/60 backdrop-blur px-4 py-1.5 rounded-full border shadow-lg z-10"
          style={{ borderColor: isLocked ? '#37415133' : `${region.color}44` }}
        >
          <span
            className="font-bold text-sm tracking-widest flex items-center gap-2"
            style={{ color: isLocked ? '#6b7280' : region.color }}
          >
            {region.name}
            {region.status === 'CONQUERED' && (
              <span className="text-[10px] bg-primary/20 px-1.5 py-0.5 rounded text-primary border border-primary/30">已征服</span>
            )}
            {isLocked && (
              <span className="text-[10px] bg-gray-800 px-1.5 py-0.5 rounded text-gray-500 border border-gray-700">未解鎖</span>
            )}
          </span>
        </div>

        {/* 懸停彈窗 (Popup) */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: popupPosition === 'left' ? 20 : popupPosition === 'right' ? -20 : 0, y: popupPosition === 'top' ? 10 : 0 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`
                absolute w-72 bg-[#122023] border border-white/10 rounded-xl p-4 shadow-2xl z-[9999] pointer-events-auto
                ${popupPosition === 'left' ? 'top-0 left-full ml-6' : ''}
                ${popupPosition === 'right' ? 'top-0 right-full mr-6' : ''}
                ${popupPosition === 'top' ? 'bottom-full mb-6 left-1/2 -translate-x-1/2' : ''}
              `}
              style={{ borderColor: `${region.color}44` }}
            >
              <div className="relative h-32 w-full mb-3 rounded-lg overflow-hidden border border-white/10 bg-surface">
                <img
                  src={region.preview_image}
                  alt={region.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#122023] to-transparent"></div>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{region.name}</h3>
              <p className="text-xs text-gray-300 mb-3">{region.description}</p>

              {isLocked ? (
                <div className="space-y-2">
                  <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: `${region.progress}%` }}></div>
                  </div>
                  <p className="text-[10px] text-gray-500 text-right">解鎖進度: {region.progress}%</p>
                </div>
              ) : (
                <button
                  className="w-full py-2 rounded-lg text-xs font-bold transition-all"
                  style={{
                    backgroundColor: region.color,
                    color: '#000',
                    boxShadow: `0 0 15px ${region.color}44`
                  }}
                >
                  {region.status === 'CONQUERED' ? '查看報告' : '開始試煉'}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default RegionMarker
