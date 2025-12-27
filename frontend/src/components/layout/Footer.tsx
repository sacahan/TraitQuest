import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-[#23482f] bg-[#0b100d] px-4 md:px-10 py-12 text-white">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-3 text-white cursor-pointer hover:opacity-80 transition-opacity">
          <span className="material-symbols-outlined text-primary text-3xl animate-pulse">swords</span>
          <span className="text-xl font-display font-black tracking-tight uppercase">TraitQuest</span>
        </div>
        <div className="flex flex-wrap justify-center gap-6 md:gap-10">
          <Link className="text-sm font-medium text-gray-400 hover:text-primary transition-colors underline-offset-4 hover:underline" to="/privacy">隱私政策</Link>
          <Link className="text-sm font-medium text-gray-400 hover:text-primary transition-colors underline-offset-4 hover:underline" to="/services">服務條款</Link>
          <Link className="text-sm font-medium text-gray-400 hover:text-primary transition-colors underline-offset-4 hover:underline" to="/about">關於我們</Link>
          <a className="text-sm font-medium text-gray-400 hover:text-primary transition-colors underline-offset-4 hover:underline" href="#">聯絡公會</a>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-10 pt-8 border-t border-white/5 text-center md:text-left">
        <p className="text-xs text-gray-500 font-body">
          © {new Date().getFullYear()} TraitQuest. All loot reserved. Powered by Psychological Wisdom.
        </p>
      </div>
    </footer>
  );
};
