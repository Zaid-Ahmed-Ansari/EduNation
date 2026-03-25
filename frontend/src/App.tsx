
import { useEffect, useRef, Suspense, lazy } from 'react';
import { LandingPage } from './pages/LandingPage';
const AnalyticsDashboard = lazy(() => import('./pages/AnalyticsDashboard').then(m => ({ default: m.AnalyticsDashboard })));
const SimulationDashboard = lazy(() => import('./pages/SimulationDashboard').then(m => ({ default: m.SimulationDashboard })));
const MobileAnalyticsDashboard = lazy(() => import('./pages/mobile/MobileAnalyticsDashboard').then(m => ({ default: m.MobileAnalyticsDashboard })));
const MobileSimulationDashboard = lazy(() => import('./pages/mobile/MobileSimulationDashboard').then(m => ({ default: m.MobileSimulationDashboard })));
const ReferencePage = lazy(() => import('./pages/ReferencePage').then(m => ({ default: m.ReferencePage })));
const DonatePage = lazy(() => import('./pages/DonatePage').then(m => ({ default: m.DonatePage })));
const PolicyPanel = lazy(() => import('./components/simulation/PolicyPanel').then(m => ({ default: m.PolicyPanel })));
import { SupportModal } from './components/layout/SupportModal';
import { useUIStore } from './store/uiStore';
import { useIsMobile } from './hooks/useIsMobile';
import gsap from 'gsap';

function App() {
  const { currentView, isPolicyPanelOpen, togglePolicyPanel } = useUIStore();
  const uiContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // GSAP animation for the UI container mapping to view changes (desktop only)
  useEffect(() => {
    if (isMobile || !uiContainerRef.current) return;
    if (currentView === 'landing') {
      gsap.to(uiContainerRef.current, { opacity: 0, scale: 0.95, pointerEvents: 'none', duration: 0.8, ease: 'power3.out' });
    } else {
      gsap.to(uiContainerRef.current, { opacity: 1, scale: 1, pointerEvents: 'auto', duration: 0.8, ease: 'power3.out', delay: 0.2 });
    }
  }, [currentView, isMobile]);

  return (
    <div className="app-container font-sans bg-[#020617] min-h-screen text-slate-200 relative">
      
      {/* ═══ Landing Page content (scroll track + fixed layers) ═══ */}
      <LandingPage />

      {/* ═══ MOBILE DASHBOARD LAYERS ═══ */}
      {isMobile && (
        <Suspense fallback={null}>
          {currentView === 'analytics' && (
            <div className="fixed inset-0 z-[40] bg-[#08090C]">
              <MobileAnalyticsDashboard />
            </div>
          )}
          {currentView === 'simulation' && (
            <div className="fixed inset-0 z-[40] bg-[#08090C]">
              <MobileSimulationDashboard />
            </div>
          )}
        </Suspense>
      )}

      {/* ═══ DESKTOP Dashboard UI Layer (fixed full screen, Appears on Country Select) ═══ */}
      {!isMobile && (
        <div 
          ref={uiContainerRef}
          className="fixed inset-0 z-[40] opacity-0 pointer-events-none"
        >
          <Suspense fallback={null}>
            {currentView === 'analytics' && <AnalyticsDashboard />}
            {currentView === 'simulation' && (
              <div className="relative h-full w-full">
                <SimulationDashboard />
                
                {/* Policy Panel Backdrop (tablet) */}
                {isPolicyPanelOpen && (
                  <div 
                    className="fixed inset-0 z-[45] bg-black/60 backdrop-blur-sm xl:hidden animate-[fadeIn_0.3s_ease]"
                    onClick={togglePolicyPanel}
                  />
                )}

                {/* Policy Panel */}
                <div className={`fixed xl:absolute right-0 top-0 z-[50] h-full w-full sm:w-[400px] border-l border-white/[0.06] bg-[#0E1017] shadow-2xl transition-transform duration-300 ease-in-out ${isPolicyPanelOpen ? 'translate-x-0' : 'translate-x-full xl:translate-x-0'}`}>
                  <PolicyPanel />
                </div>
              </div>
            )}
          </Suspense>
        </div>
      )}

      {/* ═══ Reference Page Layer (Full Screen overlay) ═══ */}
      {currentView === 'reference' && (
        <div className="fixed inset-0 z-[150] bg-[#08090C]">
          <Suspense fallback={null}>
            <ReferencePage />
          </Suspense>
        </div>
      )}

      {/* ═══ Donate Page Layer (Full Screen overlay) ═══ */}
      {currentView === 'donate' && (
        <div className="fixed inset-0 z-[150] bg-[#08090C]">
          <Suspense fallback={null}>
            <DonatePage />
          </Suspense>
        </div>
      )}

      {/* ═══ One-time Support Modal ═══ */}
      <SupportModal />

    </div>
  );
}

export default App;
