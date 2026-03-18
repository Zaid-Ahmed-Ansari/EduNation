import { type LucideIcon } from 'lucide-react';

interface CardProps {
  title: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: LucideIcon;
  subtext?: string;
  className?: string;
}

export const MetricCard = ({
  title,
  value,
  trend,
  trendValue,
  icon: Icon,
  subtext,
  className = ''
}: CardProps) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className={`relative group bg-slate-900/60 backdrop-blur-3xl border border-white/5 p-5 rounded-2xl flex flex-col gap-3 overflow-hidden transition-all duration-300 hover:bg-slate-800/60 hover:-translate-y-1 hover:shadow-[0_15px_40px_-15px_rgba(249,115,22,0.3)] ${className}`}>
      
      {/* Background Glow Effect */}
      <div className="absolute -inset-24 bg-gradient-to-br from-brand/20 to-transparent opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700 pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between text-slate-400">
        <span className="text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent">
          {title}
        </span>
        {Icon && <Icon size={20} className="text-brand opacity-80 group-hover:opacity-100 transition-opacity" />}
      </div>
      
      <div className="relative z-10 flex items-end justify-between mt-1">
        <span className="text-3xl font-black text-white tracking-tight drop-shadow-md">
          {value}
        </span>
        {trendValue && (
          <span className={`text-sm font-semibold ${getTrendColor()} flex items-center gap-1 bg-black/40 px-2 py-1 rounded border border-white/5`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
          </span>
        )}
      </div>

      {subtext && <div className="relative z-10 mt-2 pt-3 border-t border-white/5 text-xs text-slate-400 leading-relaxed font-medium">
        {subtext}
      </div>}
    </div>
  );
};
