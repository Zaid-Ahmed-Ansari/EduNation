import { useState, useEffect } from 'react';
import { Heart, X } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

const SUPPORT_MODAL_KEY = 'edunation_support_shown';

export const SupportModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { currentView, setMode } = useUIStore();
  const [prevView, setPrevView] = useState<string | null>(null);

  useEffect(() => {
    // Detect the transition: user was in analytics/simulation and now returned to landing
    if (prevView && prevView !== 'landing' && currentView === 'landing') {
      const alreadyShown = localStorage.getItem(SUPPORT_MODAL_KEY);
      if (!alreadyShown) {
        // Short delay so the globe animation settles first
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    }
    setPrevView(currentView);
  }, [currentView]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(SUPPORT_MODAL_KEY, 'true');
  };

  const handleSupport = () => {
    setIsVisible(false);
    localStorage.setItem(SUPPORT_MODAL_KEY, 'true');
    setMode('donate');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.3s_ease]"
        onClick={handleDismiss}
      />

      {/* Modal */}
      <div className="relative max-w-sm w-[90%] animate-[scaleIn_0.35s_cubic-bezier(0.16,1,0.3,1)]">
        <div className="bg-[#0E1017]/95 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-8 text-center shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
          
          {/* Close */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-white/20 hover:text-white/60 transition-colors"
          >
            <X size={16} />
          </button>

          {/* Icon */}
          <div className="mx-auto mb-5 w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-rose-500/20 flex items-center justify-center border border-orange-500/15">
            <Heart className="w-6 h-6 text-orange-400" fill="rgba(251,146,60,0.3)" />
          </div>

          <h3 className="text-lg font-bold text-white tracking-tight mb-2">
            Enjoyed exploring?
          </h3>
          <p className="text-white/40 text-sm leading-relaxed mb-6">
            Helps cover API & server costs and keeps EduNation free for everyone.
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleDismiss}
              className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-white/40 text-sm font-medium hover:bg-white/[0.04] hover:text-white/60 transition-all"
            >
              Maybe later
            </button>
            <button
              onClick={handleSupport}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500/80 to-amber-500/80 text-white text-sm font-semibold hover:from-orange-500 hover:to-amber-500 transition-all shadow-lg shadow-orange-500/20"
            >
              Support ♥
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};
