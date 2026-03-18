import { Heart, ArrowLeft } from 'lucide-react';
import { useUIStore } from '../store/uiStore';

export const DonatePage = () => {
  const { setMode } = useUIStore();

  return (
    <div className="min-h-screen bg-[#08090C] flex flex-col items-center justify-center relative overflow-hidden px-4">
      
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-orange-500/8 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Back button */}
      <button
        onClick={() => setMode('landing')}
        className="absolute top-8 left-8 flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-mono tracking-wider"
      >
        <ArrowLeft size={16} />
        Back to Globe
      </button>

      {/* Main card */}
      <div className="relative max-w-md w-full">
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-10 text-center shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
          
          {/* Heart icon */}
          <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-rose-500/20 flex items-center justify-center border border-orange-500/20">
            <Heart className="w-8 h-8 text-orange-400" fill="rgba(251,146,60,0.3)" />
          </div>

          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
            Support EduNation
          </h1>
          <p className="text-white/50 text-sm leading-relaxed mb-8">
            Helps cover API & server costs and keeps EduNation free for students, researchers, and curious minds everywhere.
          </p>

          {/* QR Code */}
          <div className="bg-white rounded-2xl p-4 inline-block mb-4 shadow-lg">
            <img
              src="/donate.jpeg"
              alt="UPI QR Code"
              className="w-52 h-52 object-contain"
            />
          </div>

          <p className="text-white/30 text-xs font-mono tracking-wider mt-4">
            Scan with any UPI app
          </p>

          {/* Divider */}
          <div className="my-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <p className="text-white/20 text-[10px] font-mono uppercase tracking-[0.15em]">
            Every contribution fuels open-source innovation
          </p>
        </div>
      </div>
    </div>
  );
};
