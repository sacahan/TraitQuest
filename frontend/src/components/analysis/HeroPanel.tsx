import { motion } from 'framer-motion';

interface HeroPanelProps {
  race: string;
  className: string;
  traits: { label: string; value: string }[];
}

const HeroPanel = ({ race, className, traits }: HeroPanelProps) => {
  return (
    <motion.div 
      className="bg-zinc-900/90 border-2 border-secondary p-6 rounded-lg shadow-[0_0_30px_rgba(212,175,55,0.2)]"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-3xl font-bold text-secondary uppercase tracking-tighter mb-1">
             {className} - {race}
          </h3>
          <div className="flex items-center space-x-2">
             <span className="px-2 py-0.5 bg-secondary text-black text-[10px] font-bold rounded">LEGENDARY</span>
             <span className="text-[10px] text-zinc-500 uppercase">覺醒進度: 15%</span>
          </div>
        </div>
        <div className="w-16 h-16 border border-zinc-700 rounded-md bg-black/60 flex items-center justify-center">
           <span className="text-zinc-600 text-xs">圖騰</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {traits.map((trait, i) => (
          <div key={i} className="bg-black/40 p-3 rounded border border-zinc-800">
             <p className="text-[10px] text-zinc-500 uppercase mb-1">{trait.label}</p>
             <p className="text-sm font-bold text-white">{trait.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-zinc-800 italic text-zinc-400 text-sm font-serif">
         「在那片被遺忘的森林中，你的靈魂綻放出前所未有的光芒...」
      </div>
    </motion.div>
  );
};

export default HeroPanel;
