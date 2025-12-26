import { motion } from 'framer-motion';

interface Option {
  id: string;
  text: string;
}

interface QuestionCardProps {
  question: {
    id: string;
    type: 'QUANTITATIVE' | 'SOUL_NARRATIVE';
    text: string;
    options?: Option[];
    visualFeedback?: string;
  };
  onSubmit: (answer: string) => void;
  disabled: boolean;
}

const QuestionCard = ({ question, onSubmit, disabled }: QuestionCardProps) => {
  const isGlow = question.visualFeedback === 'GLOW_EFFECT';

  return (
    <motion.div 
      className={`relative p-6 md:p-10 bg-obsidian-glass rounded-[2rem] md:rounded-[3rem] overflow-hidden box-glow w-full ${isGlow ? 'shadow-[0_0_40px_rgba(20,212,82,0.3)]' : ''}`}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 符文背景圖案 */}
      <div className="absolute inset-0 bg-runes opacity-30 pointer-events-none mix-blend-overlay animate-pulse"></div>

      {/* 頂部裝飾線 */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-magic-cyan/60 to-transparent shadow-[0_0_10px_#00f0ff]"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4 opacity-60">
          <span className="material-symbols-outlined text-primary text-lg">auto_awesome</span>
          <span className="text-primary text-xs font-bold tracking-[0.2em] uppercase">Spirit Resonance Check</span>
        </div>

        <h3 className="text-xl md:text-3xl font-bold leading-tight mb-8 text-white text-glow">
          {question.text}
        </h3>

        {question.type === 'QUANTITATIVE' && question.options && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-8">
            {question.options.map((option) => (
              <button
                key={option.id}
                onClick={() => onSubmit(option.id)}
                disabled={disabled}
                className="group relative flex flex-col items-center justify-center p-3 rounded-2xl option-button h-28 md:h-36"
              >
                {/* 裝飾邊框 */}
                <span className="absolute top-2 left-2 w-2 h-2 border-t border-l border-white/20 rounded-tl-sm group-hover:border-magic-cyan/60"></span>
                <span className="absolute top-2 right-2 w-2 h-2 border-t border-r border-white/20 rounded-tr-sm group-hover:border-magic-cyan/60"></span>
                <span className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-white/20 rounded-bl-sm group-hover:border-magic-cyan/60"></span>
                <span className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-white/20 rounded-br-sm group-hover:border-magic-cyan/60"></span>

                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-full border border-white/5 bg-white/5 group-hover:bg-white/10 group-hover:border-magic-cyan/50 flex items-center justify-center transition-all">
                    <span className="text-2xl md:text-3xl font-serif text-white/70 group-hover:text-magic-cyan">
                      {/* 模擬符文字元 */}
                      {option.id === '1' && 'ᚠ'}
                      {option.id === '2' && 'ᚢ'}
                      {option.id === '3' && 'ᚦ'}
                      {option.id === '4' && 'ᚨ'}
                      {option.id === '5' && 'ᚱ'}
                      {!['1', '2', '3', '4', '5'].includes(option.id) && option.id}
                    </span>
                  </div>
                  <span className="text-[10px] md:text-xs font-bold text-white/40 group-hover:text-primary tracking-widest uppercase transition-colors">
                    {option.text}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {question.type === 'SOUL_NARRATIVE' && (
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-sm group-focus-within:bg-primary/10 transition-colors"></div>
              <textarea
                disabled={disabled}
                className="relative block w-full bg-[#0a1612] border border-white/10 rounded-2xl text-white placeholder-white/20 text-sm p-5 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] hover:border-white/20 resize-none leading-relaxed"
                placeholder="在此刻，如果你的靈魂能說話，它會說些什麼..."
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onSubmit((e.target as HTMLTextAreaElement).value);
                  }
                }}
              ></textarea>
            </div>
            <p className="text-xs text-primary/40 text-right font-mono tracking-widest uppercase">Spirit Echoes · Press Enter to Confirm</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default QuestionCard;
