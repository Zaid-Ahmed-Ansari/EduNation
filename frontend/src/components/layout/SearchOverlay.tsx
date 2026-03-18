import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2, BookOpen, Heart } from 'lucide-react';
import { getCountries } from '../../api';
import { useUIStore } from '../../store/uiStore';

export const SearchOverlay = () => {
  const [query, setQuery] = useState('');
  const { selectCountry, setMode } = useUIStore();

  const { data: countries, isLoading } = useQuery({
    queryKey: ['countries'],
    queryFn: getCountries,
  });

  const filtered = query
    ? countries?.filter((c: any) => 
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.cca3?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  const handleSelect = (cca3: string) => {
    selectCountry(cca3);
    setMode('analytics');
    setQuery('');
  };

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50 bg-black/20 backdrop-blur-3xl border border-white/10 rounded-full py-3 px-6 flex justify-between items-center shadow-[0_15px_40px_rgba(0,0,0,0.6)] transition-all duration-500 hover:bg-black/30">
      
      {/* Brand Logo */}
      <div 
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => setMode('landing')}
      >
        <img 
          src="/logo.png" 
          alt="EduNation" 
          className="h-10 object-contain group-hover:scale-105 transition-transform duration-300" 
        />
      </div>

      {/* Search Input Area */}
      <div className="relative w-full max-w-md ml-4">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-brand-light animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-brand-light opacity-70" />
          )}
        </div>
        <input
          type="text"
          className="w-full bg-black/30 backdrop-blur-xl border border-white/10 text-white rounded-full py-2.5 pl-12 pr-6 shadow-inner text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 focus:bg-black/50 transition-all placeholder:text-slate-400 font-medium tracking-wide"
          placeholder="Explore countries..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        
        {/* Dropdown Results */}
        {filtered && filtered.length > 0 && query.length > 0 && (
          <div className="absolute top-14 right-0 w-full bg-slate-900/80 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.7)] flex flex-col max-h-[22rem] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600">
            {filtered.map((c: any) => (
              <button
                key={c.cca3}
                className="w-full text-left px-5 py-4 hover:bg-brand/10 flex items-center justify-between transition-colors border-b border-white/5 last:border-0 group"
                onClick={() => handleSelect(c.cca3)}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl drop-shadow-md group-hover:scale-110 transition-transform">{getFlagEmoji(c.cca2)}</span>
                  <span className="font-semibold text-slate-100 text-sm tracking-wide">{c.name}</span>
                </div>
                <span className="text-[10px] text-brand-light/70 font-mono tracking-widest">{c.cca3}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reference & Support Links */}
      <div className="hidden sm:flex items-center ml-2 border-l border-white/10 pl-6 gap-4">
        <button 
          onClick={() => setMode('reference')}
          className="flex flex-col items-center justify-center text-white/40 hover:text-white transition-colors group relative"
          title="Data & API Reference"
        >
          <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform mb-1" />
          <span className="text-[9px] uppercase tracking-widest font-mono">Reference</span>
        </button>
        <button 
          onClick={() => setMode('donate')}
          className="flex flex-col items-center justify-center text-white/40 hover:text-orange-400 transition-colors group relative"
          title="Support EduNation"
        >
          <Heart className="w-5 h-5 group-hover:scale-110 transition-transform mb-1" />
          <span className="text-[9px] uppercase tracking-widest font-mono">Support</span>
        </button>
      </div>

    </nav>
  );
};

function getFlagEmoji(countryCode: string) {
  if (!countryCode) return '🌍';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
