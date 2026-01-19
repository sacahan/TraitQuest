import MagicHourglass from './MagicHourglass';

const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background-dark/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6">
        <MagicHourglass />
        <p className="text-primary/80 font-display text-lg animate-pulse tracking-widest uppercase">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default PageLoader;
