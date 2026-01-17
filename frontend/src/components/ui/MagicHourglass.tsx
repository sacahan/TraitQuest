import { motion } from 'framer-motion';
import { useMemo } from 'react';

const MagicHourglass = () => {
  // 預先計算粒子動畫的隨機參數,避免在 render 時呼叫 Math.random()
  const particleAnimations = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      xOffset: Math.sin(i) * 20,
      duration: 2 + Math.random(),
      delay: Math.random() * 2
    }));
  }, []);

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      
      {/* 外部魔法能量環 */}
      <motion.div
        animate={{ rotate: 360, scale: [1, 1.05, 1] }}
        transition={{ 
          rotate: { duration: 10, repeat: Infinity, ease: "linear" },
          scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }}
        className="absolute inset-0 border-2 border-primary/20 rounded-full border-dashed"
      />
      
      {/* 逆向旋轉的內光暈 */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute w-28 h-28 rounded-full shadow-[0_0_30px_rgba(17,212,82,0.15)]"
      />

      {/* 沙漏主體容器 - 負責翻轉 */}
      <motion.div
        animate={{ rotate: 180 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatDelay: 2, // 翻轉後的停留時間，讓沙子流
          ease: "easeInOut"
        }}
        className="relative w-16 h-24"
      >
        {/* 沙漏 SVG */}
        <svg viewBox="0 0 100 150" className="w-full h-full drop-shadow-[0_0_10px_rgba(17,212,82,0.4)]">
          {/* 定義漸層 */}
          <defs>
            <linearGradient id="sandGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#11D452" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0bda73" stopOpacity="0.4" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* 玻璃外殼 */}
          <path
            d="M20,5 L80,5 L80,15 L60,40 L60,50 L52,75 L60,100 L60,110 L80,135 L80,145 L20,145 L20,135 L40,110 L40,100 L48,75 L40,50 L40,40 L20,15 Z"
            fill="none"
            stroke="#4a6e5d"
            strokeWidth="2"
            className="opacity-60"
          />
          
          {/* 上半部沙子 (逐漸減少) */}
          <motion.path
            d="M25,20 L75,20 L55,45 L52,70 L48,70 L45,45 Z"
            fill="url(#sandGradient)"
            animate={{ 
              d: [
                "M25,20 L75,20 L55,45 L52,70 L48,70 L45,45 Z", // 滿
                "M45,65 L55,65 L52,70 L48,70 L45,65 Z"         // 空 (只剩底部一點點)
              ],
              opacity: [1, 0.2]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1.5,
              ease: "linear"
            }}
          />

          {/* 中間流動的沙線 */}
          <motion.line
            x1="50" y1="70" x2="50" y2="100"
            stroke="#11D452"
            strokeWidth="2"
            strokeLinecap="round"
            filter="url(#glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: [0, 1, 1, 0], 
              opacity: [0, 1, 1, 0] 
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1.5,
              times: [0, 0.1, 0.9, 1]
            }}
          />

          {/* 下半部沙子 (逐漸堆積) */}
          <motion.path
            d="M30,140 L70,140 L50,140 Z" // 初始扁平
            fill="url(#sandGradient)"
            animate={{ 
              d: [
                "M48,140 L52,140 L50,140 Z", // 空
                "M25,140 L75,140 L50,110 Z"  // 滿
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1.5,
              ease: "linear"
            }}
          />
          
          {/* 頂蓋與底座 */}
          <rect x="15" y="2" width="70" height="6" rx="2" fill="#162e24" stroke="#11D452" strokeWidth="1" />
          <rect x="15" y="142" width="70" height="6" rx="2" fill="#162e24" stroke="#11D452" strokeWidth="1" />
        </svg>
      </motion.div>

      {/* 粒子效果 */}
      {particleAnimations.map((anim, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary rounded-full blur-[1px]"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            y: [-20, -50],
            x: anim.xOffset,
            opacity: [0, 1, 0],
            scale: [0, 1.2, 0]
          }}
          transition={{
            duration: anim.duration,
            repeat: Infinity,
            delay: anim.delay
          }}
        />
      ))}
    </div>
  );
};

export default MagicHourglass;
