import React, { Suspense, useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useUIStore } from '../store/uiStore';
import { SearchOverlay } from '../components/layout/SearchOverlay';
import { useIsMobile } from '../hooks/useIsMobile';
import { MobileLandingPage } from './mobile/MobileLandingPage';

gsap.registerPlugin(ScrollTrigger);

const InteractiveGlobe = React.lazy(() => 
  import('../components/3d/Globe').then(module => ({ default: module.InteractiveGlobe }))
);

export const LandingPage = () => {
  const isMobile = useIsMobile();
  const { currentView } = useUIStore();

  // On mobile, render the simplified landing page
  if (isMobile) return <MobileLandingPage />;
  
  // Master container for pinning
  const containerRef = useRef<HTMLDivElement>(null);
  const globeWrapperRef = useRef<HTMLDivElement>(null);
  
  // Scene elements
  const heroTextRef = useRef<HTMLDivElement>(null);
  const feature1Ref = useRef<HTMLDivElement>(null);
  const feature2Ref = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (currentView !== 'landing') return;

    // gsap.context is crucial in React to easily revert animations on unmount
    const ctx = gsap.context(() => {
      
      // Initial cinematic load-in (independent of scroll)
      gsap.set(globeWrapperRef.current, { opacity: 0, y: '10vh' });
      gsap.set([feature1Ref.current, feature2Ref.current, ctaRef.current], { autoAlpha: 0, y: 40 });
      
      gsap.to(globeWrapperRef.current, {
        opacity: 1,
        y: '0vh',
        duration: 3,
        ease: 'expo.out',
        delay: 0.2
      });

      // Master ScrollTrigger Timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=4000', // Creates 4000px of scroll distance to scrub through
          scrub: 1.5,    // High scrub value for fluid, heavy inertia
          pin: true,     // Locks the screen in place
          anticipatePin: 1,
        }
      });

      // SCENE 1: Hero fades up & out
      tl.to(heroTextRef.current, { autoAlpha: 0, y: -80, scale: 0.95, duration: 1.5, ease: 'power3.inOut' }, 0)
        
        // SCENE 2: First Feature enters from the left
        .to(feature1Ref.current, { autoAlpha: 1, y: 0, duration: 1.5, ease: 'power3.out' }, 1)
        .to(feature1Ref.current, { autoAlpha: 0, y: -40, duration: 1.5, ease: 'power3.in' }, 3)
        
        // SCENE 3: Second Feature enters
        .to(feature2Ref.current, { autoAlpha: 1, y: 0, duration: 1.5, ease: 'power3.out' }, 4.5)
        .to(feature2Ref.current, { autoAlpha: 0, y: -40, duration: 1.5, ease: 'power3.in' }, 6.5)

        // SCENE 4: CTA fires
        .to(ctaRef.current, { autoAlpha: 1, y: 0, duration: 1.5, ease: 'back.out(1.2)' }, 7.5);

    }, containerRef);

    // Cleanup ensures no memory leaks or duplicate ScrollTriggers
    return () => ctx.revert();
  }, [currentView]);

  if (currentView !== 'landing') return null;

  return (
    <div className="landing-page-root">
      <div ref={containerRef} className="h-screen w-full bg-black overflow-hidden relative text-white">
        
        <div className="fixed top-0 left-0 right-0 z-[100]">
          <SearchOverlay />
        </div>

      {/* ═══ THE GLOBE (ALWAYS PRESENT) ═══ */}
      <div
        ref={globeWrapperRef}
        className="absolute inset-0 z-[10] flex items-center justify-center pointer-events-none"
      >
        <Suspense fallback={
          <div className="text-white/30 animate-pulse font-mono tracking-widest text-xs sm:text-sm">
            IGNITING RENDER ENGINE...
          </div>
        }>
          <InteractiveGlobe />
        </Suspense>
      </div>

      {/* ═══ TYPOGRAPHY LAYERS (Z-INDEX 20) ═══ */}
      <div className="absolute inset-0 z-[20] pointer-events-none flex items-center justify-center">
        
        {/* HERO TITLE */}
        <div ref={heroTextRef} className="flex flex-col items-center justify-center w-full px-4">
          <h1 
            className="text-[11vw] sm:text-[13vw] md:text-[15vw] font-black tracking-tighter leading-none select-none text-transparent mix-blend-overlay"
            style={{ WebkitTextStroke: '1px rgba(255,255,255,0.4)' }}
          >
            EDUNATION
          </h1>
          <p className="mt-2 sm:mt-4 text-sm sm:text-lg md:text-xl font-light tracking-[0.2em] sm:tracking-[0.3em] uppercase text-white/50">
            Scroll to explore
          </p>
        </div>

        {/* SCENE 1 TEXT (LEFT) */}
        <div 
          ref={feature1Ref} 
          className="absolute left-[5%] sm:left-[8%] md:left-[12%] w-[90%] sm:w-full max-w-sm sm:max-w-md text-left"
        >
          <div className="overflow-hidden mb-2 sm:mb-4">
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]">
              Analyze <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-300">
                Everything.
              </span>
            </h2>
          </div>
          <p className="text-sm sm:text-lg md:text-xl text-white/60 font-light leading-relaxed">
            Real-time macroeconomic intelligence seamlessly mapped to a high-fidelity 3D interface.
          </p>
        </div>

        {/* SCENE 2 TEXT (RIGHT) */}
        <div 
          ref={feature2Ref} 
          className="absolute right-[5%] sm:right-[8%] md:right-[12%] w-[90%] sm:w-full max-w-sm sm:max-w-md text-right flex flex-col items-end"
        >
          <div className="overflow-hidden mb-2 sm:mb-4">
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]">
              Simulate <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-orange-500 to-amber-300">
                Tomorrow.
              </span>
            </h2>
          </div>
          <p className="text-sm sm:text-lg md:text-xl text-white/60 font-light leading-relaxed text-right">
            Adjust global policies and instantly visualize the ripple effects across 30+ comprehensive data points.
          </p>
        </div>

        {/* CTA (CENTER BOTTOM) */}
        <div 
          ref={ctaRef} 
          className="absolute bottom-[12%] sm:bottom-[15%] flex flex-col items-center justify-center w-full px-4"
        >
          <button className="group relative pointer-events-auto px-6 py-3 sm:px-10 sm:py-5 bg-transparent overflow-hidden rounded-full border border-white/20 transition-all duration-700 hover:border-orange-500/50 hover:shadow-[0_0_40px_rgba(249,115,22,0.2)]">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
            <span className="relative text-xs sm:text-sm md:text-base font-medium tracking-[0.15em] sm:tracking-[0.2em] uppercase text-white group-hover:text-orange-300 transition-colors duration-300">
              Initialize Environment
            </span>
          </button>
        </div>

      </div>
      </div>
    </div>
  );
};