import { motion } from 'framer-motion';

interface RadarChartProps {
    stats: {
        STA_IN?: number;
        STA_DE?: number;
        STA_SP?: number;
        STA_CH?: number;
        STA_NI?: number;
        [key: string]: number | undefined;
    };
}

const RadarChart = ({ stats }: RadarChartProps) => {
    // 將 Big Five 映射到座標
    // 順序：STA_IN (智力), STA_DE (防禦), STA_SP (速度), STA_CH (魅力), STA_NI (洞察)
    const keys = ['STA_IN', 'STA_DE', 'STA_SP', 'STA_CH', 'STA_NI'];
    const values = keys.map(k => (stats && stats[k] ? stats[k] : 50));

    // 計算五角形頂點 (中心 50, 50, 半徑 40)
    const points = values.map((v, i) => {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const r = (v / 100) * 40;
        return `${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`;
    }).join(' ');

    const gridPoints = (r: number) => {
        return Array.from({ length: 5 }).map((_, i) => {
            const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
            return `${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`;
        }).join(' ');
    };

    return (
      <div className="w-full h-full p-4 flex items-center justify-center">
          <svg className="w-full h-full max-w-[300px] overflow-visible" viewBox="0 0 100 100">
              {/* 網格 */}
              <g fill="none" stroke="rgba(17, 212, 82, 0.2)" strokeWidth="0.5">
                  <polygon points={gridPoints(40)} />
                  <polygon points={gridPoints(30)} />
                  <polygon points={gridPoints(20)} />
                  <polygon points={gridPoints(10)} />
                  {Array.from({ length: 5 }).map((_, i) => {
                      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                      return (
                          <line
                              key={i}
                              x1="50" y1="50"
                              x2={50 + 40 * Math.cos(angle)}
                              y2={50 + 40 * Math.sin(angle)}
                          />
                      );
                  })}
              </g>

              {/* 數據區塊 */}
              <motion.polygon
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  fill="rgba(17, 212, 82, 0.2)"
                  stroke="#11D452"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  points={points}
                  className="animate-radar-polygon"
              />

              {/* 頂點點綴 */}
              {values.map((v, i) => {
                  const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                  const r = (v / 100) * 40;
                  return (
                      <circle
                          key={i}
                          cx={50 + r * Math.cos(angle)}
                          cy={50 + r * Math.sin(angle)}
                          r="1.5"
                          fill="#11D452"
                      />
                  );
              })}
          </svg>
      </div>
  );
};

export default RadarChart;
