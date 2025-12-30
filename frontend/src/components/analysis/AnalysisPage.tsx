import { useEffect } from 'react';
import { motion } from 'framer-motion';
import HeroPanel from './HeroPanel';
import RadarChart from './RadarChart';
import DestinyGuide from './DestinyGuide';
import DestinyBonds from './DestinyBonds';
import { useQuestStore } from '../../stores/questStore';
import { Sparkles, ScrollText, Binary } from 'lucide-react';

const AnalysisPage = () => {
  const { finalResult, requestResult, isLoading } = useQuestStore();

  useEffect(() => {
    // 如果已經完成測驗且沒有結果，則自動請求
    if (!finalResult && !isLoading) {
      // 避免重複請求邏輯由 store 處理
      requestResult();
    }
  }, [finalResult, isLoading]);

  // 將後端 stats 轉換為雷達圖數據
  const radarData = {
    labels: ['開放性 (O)', '嚴謹性 (C)', '外向性 (E)', '宜人性 (A)', '神經質 (N)'],
    datasets: [
      {
        label: '靈魂能量',
        data: finalResult?.stats ? [
          finalResult.stats.O || 3,
          finalResult.stats.C || 3,
          finalResult.stats.E || 3,
          finalResult.stats.A || 3,
          finalResult.stats.N || 3
        ] : [3, 3, 3, 3, 3],
        backgroundColor: 'rgba(17, 212, 82, 0.2)',
        borderColor: '#11D452',
        borderWidth: 2,
        pointBackgroundColor: '#11D452',
      },
    ],
  };

  if (isLoading && !finalResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-primary space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="font-display tracking-widest text-sm animate-pulse">正在轉生靈魂資料...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12 space-y-16">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
      </div>

      {/* Hero Header Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <Binary className="text-primary" size={20} />
            <h2 className="text-xl font-display font-medium text-white/40 uppercase tracking-[0.4em]">靈魂圖騰剖析</h2>
          </div>
          <RadarChart data={radarData} />
        </motion.div>

        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <HeroPanel data={finalResult} />
        </motion.div>
      </section>

      {/* Destiny Details Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
        {/* Destiny Guide (8 cols) */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="lg:col-span-8 space-y-8"
        >
          <div className="flex items-center gap-4">
            <ScrollText className="text-primary" size={20} />
            <h3 className="text-lg font-display font-medium text-white/40 uppercase tracking-[0.4em]">命運指引</h3>
          </div>
          {finalResult?.destiny_guide ? (
            <DestinyGuide guide={finalResult.destiny_guide} />
          ) : (
            <div className="h-48 flex items-center justify-center border border-white/5 rounded-xl bg-white/5 text-white/10 italic">
              指引尚未凝聚...
            </div>
          )}
        </motion.div>

        {/* Destiny Bonds (4 cols) */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-4 space-y-8"
        >
          <div className="flex items-center gap-4">
            <Sparkles className="text-primary" size={20} />
            <h3 className="text-lg font-display font-medium text-white/40 uppercase tracking-[0.4em]">命運羈絆</h3>
          </div>
          {finalResult?.destiny_bonds ? (
            <DestinyBonds bonds={finalResult.destiny_bonds} />
          ) : (
            <div className="h-48 flex items-center justify-center border border-white/5 rounded-xl bg-white/5 text-white/10 italic">
              因果正在交織...
            </div>
          )}
        </motion.div>
      </section>

      {/* Action Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="flex justify-center pt-8"
      >
        <button
          onClick={() => window.location.href = '/map'}
          className="px-10 py-4 bg-primary text-black font-black uppercase tracking-widest text-sm rounded-0 hover:bg-white transition-colors duration-500 hover:shadow-[0_0_20px_rgba(17,212,82,0.4)]"
        >
          回歸世界地圖
        </button>
      </motion.div>
    </div>
  );
};

export default AnalysisPage;
