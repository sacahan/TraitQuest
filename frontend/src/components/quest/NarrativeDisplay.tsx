import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface NarrativeDisplayProps {
  text: string;
  onComplete?: () => void;  // 打字機效果完成時的回調
}

const NarrativeDisplay = ({ text, onComplete }: NarrativeDisplayProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setDisplayedText('');
    setIndex(0);
  }, [text]);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, 30); // Typing speed
      return () => clearTimeout(timeout);
    } else if (index > 0 && index === text.length && onComplete) {
      // 當打字機效果完成時調用回調
      onComplete();
    }
  }, [index, text, onComplete]);

  return (
    <div className="bg-black/60 p-6 rounded-lg border-l-4 border-primary shadow-lg mb-6 min-h-[120px]">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary flex items-center justify-center flex-shrink-0 relative overflow-hidden">
           {/* Abby Avatar Placeholder */}
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-primary)_0%,_transparent_70%)] opacity-30 animate-pulse"></div>
           <span className="text-primary font-bold z-10">A</span>
        </div>
        <motion.p 
          className="text-lg leading-relaxed font-serif italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {displayedText}
          <span className="inline-block w-2 h-5 bg-primary ml-1 animate-pulse"></span>
        </motion.p>
      </div>
    </div>
  );
};

export default NarrativeDisplay;
