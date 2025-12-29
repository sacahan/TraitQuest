import { useNavigate } from 'react-router-dom';

interface QuestCardProps {
  id: string;
  title: string;
  type: string;
  description: string;
  imageUrl: string;
  icon: string;
  route: string;
}

export const HomeQuestCard = ({ title, type, description, imageUrl, icon, route }: QuestCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-[#1a3323] p-5 rounded-2xl border border-[#23482f] hover:border-primary hover:shadow-[0_0_30px_rgba(17,212,82,0.3)] transition-all duration-300 hover:-translate-y-2 group flex flex-col h-full animate-card-pulse hover:animate-none">
      {/* 圖片區 */}
      <div className="relative w-full aspect-[4/3] mb-4 rounded-xl overflow-hidden bg-[#102216]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
        <div
          className="absolute top-3 left-3 bg-[#102216]/80 backdrop-blur-sm text-primary border border-primary/30 text-xs font-bold w-8 h-8 rounded-lg shadow-md flex items-center justify-center group-hover:bg-primary group-hover:text-[#102216] transition-colors duration-300"
        >
          <span className="material-symbols-outlined text-sm">{icon}</span>
        </div>
      </div>
      
      {/* 內容區 */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-white text-xl font-bold font-display group-hover:text-primary transition-colors">
          {title}
        </h3>
      </div>
      <p className="text-primary text-sm font-bold uppercase tracking-wider mb-2 font-display">Type: {type}</p>
      <p className="text-gray-300 text-sm leading-relaxed mb-6 grow group-hover:text-gray-100 transition-colors font-body">
        {description}
      </p>
      
      {/* 按鈕 */}
      <button
        onClick={() => navigate(route)}
        className="w-full mt-auto py-3 px-4 rounded-xl bg-[#23482f] hover:bg-primary hover:text-[#112217] text-white font-bold transition-all duration-300 flex items-center justify-center gap-2 group/btn active:scale-95 active:brightness-110 hover:shadow-[0_0_15px_rgba(17,212,82,0.5)] font-body"
      >
        <span>開啟副本</span>
        <span className="material-symbols-outlined text-sm transition-transform group-hover/btn:translate-x-1">arrow_forward</span>
      </button>
    </div>
  );
};
