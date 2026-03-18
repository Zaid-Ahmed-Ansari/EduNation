import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUIStore } from '../store/uiStore';
import { useSimulationStore } from '../store/simulationStore';
import { getSimulationBaseline, getCountryByCode } from '../api';
import { runSimulation } from '../simulation/engine';
import { ProjectionChart } from '../components/simulation/ProjectionChart';
import {
  Loader2, TrendingUp, TrendingDown, Minus,
  LayoutDashboard, ShieldCheck, TreePine, Banknote, Factory, HeartPulse
} from 'lucide-react';

export const SimulationDashboard = () => {
  const { selectedCountry, setMode } = useUIStore();
  const { policies } = useSimulationStore();
  
  // Navigation State
  const [activeNav, setActiveNav] = useState('Overview');
  const [activeTopTab, setActiveTopTab] = useState<'Dashboard' | 'Raw Projections'>('Dashboard');

  const { data: countryData, isLoading: loadingCountry } = useQuery({
    queryKey: ['country', selectedCountry],
    queryFn: () => getCountryByCode(selectedCountry!),
    enabled: !!selectedCountry,
  });

  const { data: baseline, isLoading: loadingBaseline } = useQuery({
    queryKey: ['simulation-baseline', selectedCountry],
    queryFn: () => getSimulationBaseline(selectedCountry!),
    enabled: !!selectedCountry,
  });

  // Run simulation with real baselines
  const projections = useMemo(() => {
    if (!baseline) return [];
    return runSimulation(
      {
        gdp: baseline.gdp || 500000000000,
        pop: baseline.pop || 50000000,
        lifeExp: baseline.lifeExp || 70,
        co2: baseline.co2 || 5.0,
      },
      policies,
      10
    );
  }, [baseline, policies]);

  // Scroll-reveal via IntersectionObserver
  useEffect(() => {
    if (loadingCountry || loadingBaseline) return;
    const els = document.querySelectorAll<HTMLElement>('.dash-reveal');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).style.opacity = '1';
          (e.target as HTMLElement).style.transform = 'translateY(0)';
        }
      }),
      { threshold: 0.08 }
    );
    els.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(28px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      obs.observe(el);
    });
    return () => obs.disconnect();
  }, [loadingCountry, loadingBaseline, activeTopTab, activeNav]);

  const isLoading = loadingCountry || loadingBaseline;

  if (isLoading) {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-[#08090C]">
        <Loader2 className="h-10 w-10 animate-spin text-[#E07B35]" />
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/30">
          Loading Simulation Engine…
        </span>
      </div>
    );
  }

  if (!selectedCountry || !countryData || !baseline || projections.length === 0) return null;

  const first = projections[0];
  const last = projections[projections.length - 1];

  const SIM_NAV_ITEMS = [
    { label: 'Overview', icon: LayoutDashboard },
    { label: 'Economic Impact', icon: Banknote },
    { label: 'Social Impact', icon: ShieldCheck },
    { label: 'Environmental Impact', icon: TreePine },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#08090C] font-sans text-white">
      
      {/* ═══ SIDEBAR ═══ */}
      <aside className="relative z-10 flex h-full w-[256px] flex-shrink-0 flex-col overflow-y-auto border-r border-white/[0.06] bg-[#0E1017]">
        {/* Country header */}
        <div className="border-b border-white/[0.06] p-5 pb-4">
          <div className="mb-4 flex items-center gap-3">
            <img
              src={countryData.flags?.svg}
              alt="flag"
              className="h-9 w-[52px] flex-shrink-0 rounded-[6px] border border-white/10 object-cover"
            />
            <div>
              <p className="font-serif text-[1.2rem] leading-tight tracking-tight">
                {countryData.name?.common}
              </p>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-white/40">
                {countryData.region}
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex w-full rounded-lg bg-white/[0.03] p-1">
            <button
              onClick={() => setMode('analytics')}
              className="flex-1 flex items-center justify-center gap-2 rounded-md py-1.5 font-mono text-[10px] uppercase tracking-[0.05em] transition-all text-white/40 hover:text-white"
            >
              Analytics
            </button>
            <button
              className="flex-1 flex items-center justify-center gap-2 rounded-md py-1.5 font-mono text-[10px] uppercase tracking-[0.05em] transition-all bg-[rgba(224,123,53,0.15)] text-[#E07B35] shadow-sm ring-1 ring-[rgba(224,123,53,0.3)]"
            >
              Simulation
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4">
          <p className="mb-1 px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-white/20">Projections</p>
          {SIM_NAV_ITEMS.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => {
                setActiveNav(label);
                setActiveTopTab('Dashboard');
              }}
              className={`mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200
                ${activeNav === label
                  ? 'border border-[rgba(224,123,53,0.15)] bg-[rgba(224,123,53,0.1)] text-[#E07B35]'
                  : 'text-white/40 hover:bg-white/[0.04] hover:text-white'
                }`}
            >
              <Icon size={14} className="flex-shrink-0 opacity-70" />
              {label}
            </button>
          ))}
        </nav>

        {/* Quick stats / Baseline */}
        <div className="border-t border-white/[0.06] px-5 py-4 space-y-2.5">
          <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-white/20 font-mono">Baseline Year ({baseline.year || 2022})</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-[11px] text-white/40">GDP</span>
            <span className="font-serif text-[1.05rem] leading-none">${(baseline.gdp / 1e9).toFixed(1)}B</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] text-white/40">Happiness Index</span>
            <span className="font-serif text-[1.05rem] leading-none text-[#B58AE0]">{first.happiness.toFixed(2)}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] text-white/40">Population</span>
            <span className="font-serif text-[1.05rem] leading-none">{(baseline.pop / 1e6).toFixed(1)}M</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] text-white/40">Life Expectancy</span>
            <span className="font-serif text-[1.05rem] leading-none">{baseline.lifeExp.toFixed(1)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-white/[0.06] px-4 py-4">
          <button
            onClick={() => setMode('landing')}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-[rgba(224,123,53,0.3)] bg-[rgba(224,123,53,0.1)] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#E07B35] transition-all hover:bg-[rgba(224,123,53,0.2)]"
          >
            ← Exit to Globe
          </button>
        </div>
      </aside>

      {/* ═══ MAIN ═══ */}
      {/* 
        Note: The PolicyPanel floats on the right and is 400px wide. 
        We use pr-[424px] to ensure the main content doesn't get obscured. 
      */}
      <main className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5 pr-[424px]">
        {/* Warning Banner */}
        <div className="dash-reveal rounded-lg bg-[rgba(224,123,53,0.1)] border border-[rgba(224,123,53,0.2)] p-3 text-[11px] text-[#E07B35] flex items-start gap-2">
          <span className="text-[13px] leading-none">⚠️</span>
          <span>
            <strong>Notice:</strong> To guarantee accuracy and data consistency across all metrics, 
            the simulation starts from the optimal comprehensive baseline year of {baseline.year || 2022}.
          </span>
        </div>

        {/* Top bar */}
        <div className="dash-reveal flex items-center justify-between">
          <div>
            <h1 className="font-serif text-[1.6rem] leading-none tracking-tight">
              Simulation <em className="italic text-[#E07B35]">Results</em>
            </h1>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-white/30">
              10-Year Horizon ({baseline.year || 2022} - {(baseline.year || 2022) + 10})
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#141720] p-1">
            {(['Dashboard', 'Raw Projections'] as const).map((t) => (
              <button
                key={t}
                className={`rounded-full px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.05em] transition-all
                  ${activeTopTab === t ? 'bg-[#0E1017] text-white shadow-sm' : 'text-white/35 hover:text-white'}`}
                onClick={() => setActiveTopTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {activeTopTab === 'Dashboard' && (
          <>
            {/* 10-Year Projected Deltas row */}
            {activeNav === 'Overview' && (
              <div className="dash-reveal grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    label: 'GDP Growth',
                    value: ((last.gdp - first.gdp) / first.gdp * 100),
                    format: (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`,
                    good: (v: number) => v >= 0,
                    icon: Banknote,
                    description: 'Total economic output vs baseline'
                  },
                  {
                    label: 'Happiness Index',
                    value: last.happiness - first.happiness,
                    format: (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(2)} pts`,
                    good: (v: number) => v >= 0,
                    icon: HeartPulse, // We'll add HeartPulse to imports
                    description: 'Aggregated quality of life index (0-10)'
                  },
                  {
                    label: 'Life Expectancy',
                    value: last.lifeExp - first.lifeExp,
                    format: (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)} yrs`,
                    good: (v: number) => v >= 0,
                    icon: ShieldCheck,
                    description: 'Avg lifespan based on funding/welfare'
                  },
                  {
                    label: 'CO₂ Emissions',
                    value: ((last.co2 - first.co2) / first.co2 * 100),
                    format: (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`,
                    good: (v: number) => v <= 0, // Less is better
                    icon: Factory,
                    description: 'Per capita carbon footprint change'
                  },
                ].map((d, i) => {
                  const isNeutral = Math.abs(d.value) < 0.05;
                  const isGood = d.good(d.value);
                  const Icon = d.icon;
                  const TrendIcon = isNeutral ? Minus : isGood ? TrendingUp : TrendingDown;
                  
                  const color = isNeutral ? '#8e96a3' : isGood ? '#27B08A' : '#D95F5F';

                  return (
                    <div key={i} className="rounded-xl border border-white/[0.06] bg-[#0E1017] p-4 flex flex-col justify-between h-28 group relative">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon size={14} className="opacity-50" />
                          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-white/50">{d.label}</span>
                        </div>
                        <TrendIcon size={14} style={{ color }} />
                      </div>
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-serif text-[1.8rem] leading-none tracking-tight" style={{ color }}>
                            {d.format(d.value)}
                          </span>
                        </div>
                        <p className="mt-1 text-[10px] text-white/30 truncate" title={d.description}>{d.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Projection Charts Grid */}
            <div className="dash-reveal grid grid-cols-1 xl:grid-cols-2 gap-4 pb-6">
              {(activeNav === 'Overview' || activeNav === 'Economic Impact') && (
                <div className="rounded-2xl border border-white/[0.06] bg-[#0E1017] p-5">
                  <ProjectionChart 
                    data={projections} 
                    dataKey="gdp" 
                    title="Gross Domestic Product" 
                    color="#E07B35" 
                    formatValue={(val) => `$${(val / 1e9).toFixed(1)}B`}
                  />
                </div>
              )}
              
              {(activeNav === 'Overview' || activeNav === 'Social Impact') && (
                <div className="rounded-2xl border border-white/[0.06] bg-[#0E1017] p-5">
                  <ProjectionChart 
                    data={projections} 
                    dataKey="happiness" 
                    title="Happiness Index" 
                    color="#B58AE0" 
                    formatValue={(val) => `${val.toFixed(2)}/10`}
                  />
                </div>
              )}
              
              {(activeNav === 'Overview' || activeNav === 'Social Impact') && (
                <div className="rounded-2xl border border-white/[0.06] bg-[#0E1017] p-5">
                  <ProjectionChart 
                    data={projections} 
                    dataKey="lifeExp" 
                    title="Life Expectancy" 
                    color="#4190CC" 
                    formatValue={(val) => val.toFixed(1)}
                  />
                </div>
              )}
              
              {(activeNav === 'Overview' || activeNav === 'Environmental Impact') && (
                <div className="rounded-2xl border border-white/[0.06] bg-[#0E1017] p-5">
                  <ProjectionChart 
                    data={projections} 
                    dataKey="co2" 
                    title="Emissions (CO₂/Capita)" 
                    color="#D95F5F" 
                    formatValue={(val) => val.toFixed(2)}
                  />
                </div>
              )}

              {activeNav === 'Overview' && (
                <div className="rounded-2xl border border-white/[0.06] bg-[rgba(224,123,53,0.03)] p-6 flex items-center justify-center text-center">
                  <div>
                    <h3 className="text-sm font-semibold text-[#E07B35] mb-2 tracking-tight">Interactive Simulation</h3>
                    <p className="text-[11px] text-white/40 leading-relaxed max-w-[250px] mx-auto">
                      Use the Policy Tuning Engine on the right to adjust budget allocations, tax rates, and trade policies. Watch how the 10-year projections map out different national futures.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ======================================== */}
        {/* RAW DATA TAB VIEW                        */}
        {/* ======================================== */}
        {activeTopTab === 'Raw Projections' && (
          <div className="dash-reveal pb-6">
            <div className="rounded-2xl border border-white/[0.06] bg-[#0E1017] p-5 overflow-hidden flex flex-col h-[calc(100vh-140px)]">
              <div className="mb-4">
                <p className="text-[13px] font-semibold tracking-tight">Annual Simulation Output</p>
                <p className="mt-0.5 text-[11px] text-white/35">Raw generated values based on cumulative policy engine multipliers.</p>
              </div>
              
              <div className="flex-1 overflow-auto rounded-xl border border-white/[0.04] bg-[#0a0c10]">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="sticky top-0 bg-[#0E1017] border-b border-white/[0.06] z-10 text-white/40 uppercase tracking-widest text-[10px]">
                    <tr>
                      <th className="px-5 py-3 font-medium">Year</th>
                      <th className="px-5 py-3 font-medium text-right">GDP (USD)</th>
                      <th className="px-5 py-3 font-medium text-right">Population (M)</th>
                      <th className="px-5 py-3 font-medium text-right">Life Exp. (Yrs)</th>
                      <th className="px-5 py-3 font-medium text-right">Happiness (0-10)</th>
                      <th className="px-5 py-3 font-medium text-right">CO₂ (t/capita)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.02]">
                    {projections.map((p) => (
                      <tr key={p.year} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3 text-[#E07B35]">Year {p.year}</td>
                        <td className="px-5 py-3 text-right text-white/90">{(p.gdp / 1e9).toFixed(1)}B</td>
                        <td className="px-5 py-3 text-right text-white/90">{(p.pop / 1e6).toFixed(2)}M</td>
                        <td className="px-5 py-3 text-right text-white/90">{p.lifeExp.toFixed(2)}</td>
                        <td className="px-5 py-3 text-right text-[#B58AE0]">{p.happiness.toFixed(2)}</td>
                        <td className="px-5 py-3 text-right text-white/90 text-[#D95F5F]">{p.co2.toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
