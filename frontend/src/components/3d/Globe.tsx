import { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import { useQuery } from '@tanstack/react-query';
import { getGeo } from '../../api';
import { useUIStore } from '../../store/uiStore';

export const InteractiveGlobe = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [hoverD, setHoverD] = useState<any>(null);
  
  const { selectedCountry, selectCountry, setMode, currentView } = useUIStore();

  // Responsive globe size — 75% of viewport
  const [size, setSize] = useState(600);
  useEffect(() => {
    const calc = () => setSize(Math.min(window.innerWidth, window.innerHeight) * 0.75);
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  const { data: geoData } = useQuery({
    queryKey: ['geo'],
    queryFn: getGeo,
    staleTime: Infinity,
  });

  // Controls setup
  useEffect(() => {
    if (!globeRef.current) return;
    const controls = globeRef.current.controls();
    controls.autoRotate = !selectedCountry;
    controls.autoRotateSpeed = 0.4;
    controls.enableZoom = false;
  }, [selectedCountry, currentView]);

  // Prevent the Three.js canvas from capturing wheel events
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const preventWheelCapture = (e: WheelEvent) => {
      e.stopPropagation();
    };

    const canvas = wrapper.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('wheel', preventWheelCapture, { passive: true });
      return () => canvas.removeEventListener('wheel', preventWheelCapture);
    }
  });

  const handlePolygonClick = (polygon: any) => {
    const iso3 = polygon.properties.ISO_A3 || polygon.properties.ADM0_A3;
    if (iso3 && iso3 !== '-99') {
      selectCountry(iso3);
      setMode('analytics');
    }
  };



  return (
    <div
      ref={wrapperRef}
      className="flex items-center justify-center pointer-events-auto relative"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
      }}
    >
      <Globe
        ref={globeRef}
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-dark.jpg"
        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl=""
        backgroundColor="rgba(0,0,0,0)"
        polygonsData={geoData?.features || []}
        polygonAltitude={(d) => (d === hoverD ? 0.06 : 0.01)}
        polygonCapColor={(d: any) => 
          (d.properties.ISO_A3 || d.properties.ADM0_A3) === selectedCountry 
            ? 'rgba(249, 115, 22, 0.85)'
            : d === hoverD 
              ? 'rgba(255, 255, 255, 0.25)' 
              : 'rgba(255, 255, 255, 0.03)'
        }
        polygonSideColor={() => 'rgba(255, 255, 255, 0.03)'}
        polygonStrokeColor={() => 'rgba(100, 116, 139, 0.4)'}
        atmosphereColor="#94a3b8"
        atmosphereAltitude={0.18}
        polygonLabel={(d: any) => `
          <div style="
            background: rgba(15, 23, 42, 0.9);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 10px;
            padding: 8px 14px;
            color: white;
            font-family: 'Inter', sans-serif;
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 0.02em;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            gap: 8px;
          ">
            <span style="font-size: 18px;">${getFlagEmoji(d.properties.ISO_A2 || d.properties.ISO_A2_EH || '')}</span>
            ${d.properties.NAME || d.properties.ADMIN || 'Unknown'}
          </div>
        `}
        onPolygonHover={setHoverD}
        onPolygonClick={handlePolygonClick}
        width={size}
        height={size}
      />
    </div>
  );
};

function getFlagEmoji(countryCode: string) {
  if (!countryCode || countryCode === '-99') return '🌍';
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch {
    return '🌍';
  }
}
