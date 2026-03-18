
import { useEffect, useRef } from 'react';
import { LandingPage } from './pages/LandingPage';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import { SimulationDashboard } from './pages/SimulationDashboard';
import { ReferencePage } from './pages/ReferencePage';
import { PolicyPanel } from './components/simulation/PolicyPanel';
import { useUIStore } from './store/uiStore';
import gsap from 'gsap';

function App() {
  const { currentView } = useUIStore();
  const uiContainerRef = useRef<HTMLDivElement>(null);

  // GSAP animation for the UI container mapping to view changes
  useEffect(() => {
    if (uiContainerRef.current) {
      if (currentView === 'landing') {
        gsap.to(uiContainerRef.current, { opacity: 0, scale: 0.95, pointerEvents: 'none', duration: 0.8, ease: 'power3.out' });
      } else {
        gsap.to(uiContainerRef.current, { opacity: 1, scale: 1, pointerEvents: 'auto', duration: 0.8, ease: 'power3.out', delay: 0.2 });
      }
    }
  }, [currentView]);

  return (
    <div className="app-container font-sans bg-[#020617] min-h-screen text-slate-200 relative">
      
      {/* ═══ Landing Page content (scroll track + fixed layers) ═══ */}
      <LandingPage />

      {/* ═══ Dashboard UI Layer (fixed full screen, Appears on Country Select) ═══ */}
      <div 
        ref={uiContainerRef}
        className="fixed inset-0 z-[40] opacity-0 pointer-events-none"
      >
        {currentView === 'analytics' && <AnalyticsDashboard />}
        {currentView === 'simulation' && (
          <div className="relative h-full w-full">
            <SimulationDashboard />
            <div className="absolute right-0 top-0 z-50 h-full w-[400px] border-l border-white/[0.06] bg-[#0E1017] shadow-2xl">
              <PolicyPanel />
            </div>
          </div>
        )}
      </div>

      {/* ═══ Reference Page Layer (Full Screen overlay) ═══ */}
      {currentView === 'reference' && (
        <div className="absolute inset-0 z-[150] bg-[#08090C]">
          <ReferencePage />
        </div>
      )}

    </div>
  );
}

export default App;
