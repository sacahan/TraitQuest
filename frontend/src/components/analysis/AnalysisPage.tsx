import HeroPanel from './HeroPanel';
import RadarChart from './RadarChart';
import { motion } from 'framer-motion';

const AnalysisPage = () => {
  const radarData = {
    labels: ['開放性', '嚴謹性', '外向性', '宜人性', '神經質'],
    datasets: [
      {
        label: '靈魂特質',
        data: [4.2, 3.5, 2.1, 4.8, 1.5],
        backgroundColor: 'rgba(17, 212, 82, 0.2)',
        borderColor: '#11D452',
        borderWidth: 2,
      },
    ],
  };

  const traits = [
    { label: '命運立場', value: '秩序守護者' },
    { label: '靈魂天賦', value: '生命共鳴' },
    { label: '核心衝動', value: '求知欲' },
    { label: '精神韌性', value: '堅不可摧' },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
      <motion.div
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold text-primary mb-8 text-center uppercase tracking-widest">
           靈魂圖騰剖析
        </h2>
        <RadarChart data={radarData} />
      </motion.div>

      <motion.div
        initial={{ x: 30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
         <HeroPanel 
            race="高等森林精靈" 
            className="大導師 (INFJ)" 
            traits={traits}
         />
      </motion.div>
    </div>
  );
};

export default AnalysisPage;
