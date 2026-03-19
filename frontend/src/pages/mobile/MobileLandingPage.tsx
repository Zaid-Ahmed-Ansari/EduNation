import React, { Suspense } from 'react';
import { useUIStore } from '../../store/uiStore';
import { SearchOverlay } from '../../components/layout/SearchOverlay';

const InteractiveGlobe = React.lazy(() =>
  import('../../components/3d/Globe').then(module => ({ default: module.InteractiveGlobe }))
);

export const MobileLandingPage = () => {
  const { currentView } = useUIStore();

  if (currentView !== 'landing') return null;

  return (
    <div className="landing-page-root">
      <div className="min-h-screen w-full bg-black relative text-white flex flex-col">

        {/* Navbar */}
        <div className="fixed top-0 left-0 right-0 z-[100]">
          <SearchOverlay />
        </div>

        {/* Hero section: globe + text */}
        <div className="flex-1 flex flex-col items-center justify-center relative pt-20 pb-8 px-4">

          {/* Globe */}
          <div className="w-full flex items-center justify-center mb-6">
            <Suspense fallback={
              <div className="text-white/30 animate-pulse font-mono tracking-widest text-xs">
                LOADING GLOBE...
              </div>
            }>
              <InteractiveGlobe />
            </Suspense>
          </div>

          {/* Title */}
          <h1
            className="text-[13vw] font-black tracking-tighter leading-none select-none text-transparent text-center"
            style={{ WebkitTextStroke: '1px rgba(255,255,255,0.4)' }}
          >
            EDUNATION
          </h1>

          {/* Subtitle */}
          <p className="mt-3 text-xs font-light tracking-[0.2em] uppercase text-white/50 text-center">
            Tap any country to explore
          </p>

          {/* Feature cards */}
          <div className="mt-8 flex flex-col gap-3 w-full max-w-sm">
            <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-4">
              <h3 className="text-sm font-bold text-white mb-1">
                Analyze <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-300">Everything</span>
              </h3>
              <p className="text-[11px] text-white/40 leading-relaxed">
                Real-time macroeconomic intelligence mapped on a 3D globe.
              </p>
            </div>
            <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-4">
              <h3 className="text-sm font-bold text-white mb-1">
                Simulate <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-300">Tomorrow</span>
              </h3>
              <p className="text-[11px] text-white/40 leading-relaxed">
                Adjust 25 policy levers and see 10-year projections instantly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
