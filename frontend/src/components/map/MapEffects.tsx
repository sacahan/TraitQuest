import React from 'react'

const MapEffects: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {/* 魔法背景層 */}
      <div 
        className="absolute inset-0 opacity-40 bg-cover bg-center"
        style={{
          backgroundImage: 'url("/assets/images/hero_bg.webp")',
          filter: 'brightness(0.5) contrast(1.2) saturate(1.2)'
        }}
      ></div>
      
      {/* 漸變覆蓋 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#112217] via-transparent to-[#112217]"></div>

      {/* 星空疊加 */}
      <div 
        className="absolute inset-0 animate-twinkle opacity-15"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 20px 30px, #ffffff, rgba(0, 0, 0, 0)),
            radial-gradient(1px 1px at 40px 70px, #ffffff, rgba(0, 0, 0, 0)),
            radial-gradient(2px 2px at 50px 160px, #ffffff, rgba(0, 0, 0, 0)),
            radial-gradient(1.5px 1.5px at 90px 40px, #ffffff, rgba(0, 0, 0, 0))
          `,
          backgroundSize: '200px 200px',
          backgroundRepeat: 'repeat'
        }}
      ></div>

      {/* 迷霧效果 */}
      <div 
        className="absolute inset-0 opacity-20 mix-blend-overlay animate-fog-flow"
        style={{
          backgroundImage: "url(\"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj48ZmlsdGVyIGlkPSJuIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC4wMDUiIG51bU9jdGF2ZXM9IjUiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbikiIG9wYWNpdHk9IjAuMyIvPjwvc3ZnPg==\")"
        }}
      ></div>

      {/* SVG 魔法線路 */}
      <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter height="140%" id="glowLine" width="140%" x="-20%" y="-20%">
            <feGaussianBlur result="blur" stdDeviation="2"></feGaussianBlur>
            <feComposite in="SourceGraphic" in2="blur" operator="over"></feComposite>
          </filter>
        </defs>
        {/* 固定線路模式 */}
        <path d="M 22% 18% Q 50% 10% 82% 22%" fill="none" filter="url(#glowLine)" stroke="#22d3ee" strokeDasharray="5,5" strokeWidth="2" />
        <path d="M 18% 20% Q 25% 60% 22% 70%" fill="none" filter="url(#glowLine)" stroke="#22d3ee" strokeDasharray="5,5" strokeWidth="2" />
        <path d="M 82% 22% Q 75% 50% 50% 45%" fill="none" filter="url(#glowLine)" stroke="#10b981" strokeDasharray="5,5" strokeWidth="2" />
        <path d="M 50% 45% Q 50% 65% 82% 68%" fill="none" filter="url(#glowLine)" stroke="#a78bfa" strokeDasharray="5,5" strokeWidth="2" />
        <path d="M 22% 70% L 50% 45%" fill="none" filter="url(#glowLine)" stroke="#dc2626" strokeDasharray="5,5" strokeWidth="2" />
      </svg>
    </div>
  )
}

export default MapEffects
