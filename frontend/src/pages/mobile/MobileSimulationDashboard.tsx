import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUIStore } from '../../store/uiStore';
import { useSimulationStore, type PolicyState } from '../../store/simulationStore';
import { getSimulationBaseline, getCountryByCode } from '../../api';
import { runSimulation } from '../../simulation/engine';
import { ProjectionChart } from '../../components/simulation/ProjectionChart';
import { Slider } from '../../components/ui/Slider';
import {
  Loader2, TrendingUp, TrendingDown, Minus,
  Banknote, ShieldCheck, Factory, HeartPulse,
  ChevronLeft, ChevronUp, RotateCcw, Cpu, Leaf, Globe2,
} from 'lucide-react';

// ALL policy categories — identical to desktop PolicyPanel
const POLICY_CATEGORIES = [
  {
    title: 'Economy & Taxation',
    icon: Banknote,
    keys: [
      { key: 'taxRate' as keyof PolicyState, label: 'Income & Corporate Tax' },
      { key: 'wealthTax' as keyof PolicyState, label: 'Wealth Tax' },
      { key: 'govSpending' as keyof PolicyState, label: 'Government Spending' },
      { key: 'tradeOpenness' as keyof PolicyState, label: 'Trade Openness' },
      { key: 'deregulation' as keyof PolicyState, label: 'Financial Deregulation' },
      { key: 'smallBizGrants' as keyof PolicyState, label: 'Small Business Grants' },
    ]
  },
  {
    title: 'Infrastructure & Tech',
    icon: Cpu,
    keys: [
      { key: 'infrastructure' as keyof PolicyState, label: 'Infrastructure Investment' },
      { key: 'publicTransport' as keyof PolicyState, label: 'Public Transport' },
      { key: 'research' as keyof PolicyState, label: 'R&D Funding' },
      { key: 'spaceProgram' as keyof PolicyState, label: 'Space Program' },
      { key: 'techRegulation' as keyof PolicyState, label: 'Tech Monopolies Regulation' },
    ]
  },
  {
    title: 'Welfare & Society',
    icon: HeartPulse,
    keys: [
      { key: 'healthcare' as keyof PolicyState, label: 'Healthcare Spending' },
      { key: 'education' as keyof PolicyState, label: 'Education Spending' },
      { key: 'ubi' as keyof PolicyState, label: 'Universal Basic Income' },
      { key: 'minimumWage' as keyof PolicyState, label: 'Minimum Wage Level' },
      { key: 'housing' as keyof PolicyState, label: 'Housing Subsidies' },
      { key: 'justice' as keyof PolicyState, label: 'Criminal Justice Funding' },
    ]
  },
  {
    title: 'Environment & Earth',
    icon: Leaf,
    keys: [
      { key: 'carbonTax' as keyof PolicyState, label: 'Carbon Tax' },
      { key: 'renewableInvestment' as keyof PolicyState, label: 'Renewables Investment' },
      { key: 'industrialRegulation' as keyof PolicyState, label: 'Industrial Emissions Regs' },
      { key: 'conservation' as keyof PolicyState, label: 'National Parks & Conservation' },
      { key: 'agriculture' as keyof PolicyState, label: 'Agricultural Subsidies' },
    ]
  },
  {
    title: 'Foreign & Defense',
    icon: Globe2,
    keys: [
      { key: 'defense' as keyof PolicyState, label: 'Defense Spending' },
      { key: 'immigration' as keyof PolicyState, label: 'Immigration Quotas' },
      { key: 'foreignAid' as keyof PolicyState, label: 'Foreign Aid' },
    ]
  },
];

export const MobileSimulationDashboard = () => {
  const { selectedCountry, setMode } = useUIStore();
  const { policies, updatePolicy, resetPolicies } = useSimulationStore();
  const [showPolicies, setShowPolicies] = useState(false);
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({ 'Economy & Taxation': true });

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

  const projections = useMemo(() => {
    if (!baseline) return [];
    return runSimulation(
      { gdp: baseline.gdp || 5e11, pop: baseline.pop || 5e7, lifeExp: baseline.lifeExp || 70, co2: baseline.co2 || 5.0 },
      policies, 10
    );
  }, [baseline, policies]);

  const isLoading = loadingCountry || loadingBaseline;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-[#08090C]">
        <Loader2 className="h-8 w-8 animate-spin text-[#E07B35]" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">Loading Simulation…</span>
      </div>
    );
  }

  if (!selectedCountry || !countryData || !baseline || projections.length === 0) return null;

  const first = projections[0];
  const last = projections[projections.length - 1];

  const deltas = [
    { label: 'GDP', value: ((last.gdp - first.gdp) / first.gdp * 100), format: (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`, good: (v: number) => v >= 0, icon: Banknote },
    { label: 'Happiness', value: last.happiness - first.happiness, format: (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}`, good: (v: number) => v >= 0, icon: HeartPulse },
    { label: 'Life Exp.', value: last.lifeExp - first.lifeExp, format: (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)} yr`, good: (v: number) => v >= 0, icon: ShieldCheck },
    { label: 'CO₂', value: ((last.co2 - first.co2) / first.co2 * 100), format: (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`, good: (v: number) => v <= 0, icon: Factory },
  ].map(d => {
    const isNeutral = Math.abs(d.value) < 0.05;
    const isGood = d.good(d.value);
    return { ...d, color: isNeutral ? '#8e96a3' : isGood ? '#27B08A' : '#D95F5F', TrendIcon: isNeutral ? Minus : isGood ? TrendingUp : TrendingDown };
  });

  const toggleCat = (title: string) => setOpenCats(prev => ({ ...prev, [title]: !prev[title] }));

  return (
    <div className="flex flex-col h-screen w-full bg-[#08090C] text-white overflow-hidden">

      {/* ═══ HEADER ═══ */}
      <div className="flex-shrink-0 bg-[#0E1017] border-b border-white/[0.06] px-3 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <button onClick={() => setMode('analytics')} className="flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.05] text-white/60">
            <ChevronLeft size={18} />
          </button>
          <img src={countryData.flags?.svg} alt="flag" className="h-6 w-9 rounded-[3px] border border-white/10 object-cover" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold tracking-tight truncate">Simulation</p>
            <p className="text-[9px] text-white/40 font-mono uppercase tracking-wider">{countryData.name?.common} · {baseline.year || 2022}–{(baseline.year || 2022) + 10}</p>
          </div>
          <button
            onClick={() => setShowPolicies(!showPolicies)}
            className={`px-2.5 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider border transition-all
              ${showPolicies ? 'bg-orange-500/20 border-orange-500/30 text-[#E07B35]' : 'bg-white/[0.05] border-white/10 text-white/60'}`}
          >
            {showPolicies ? '← Results' : 'Tune Policies'}
          </button>
        </div>
      </div>

      {/* ═══ CONTENT ═══ */}
      <div className="flex-1 overflow-y-auto">

        {/* ── RESULTS VIEW ── */}
        {!showPolicies && (
          <div className="px-3 py-3 space-y-3">
            {/* Warning notice */}
            <div className="rounded-lg bg-[rgba(224,123,53,0.1)] border border-[rgba(224,123,53,0.2)] p-2.5 text-[10px] text-[#E07B35] flex items-start gap-2">
              <span className="text-[12px] leading-none">⚠️</span>
              <span><strong>Notice:</strong> Simulation starts from baseline year {baseline.year || 2022}.</span>
            </div>

            {/* Delta cards */}
            <div className="grid grid-cols-2 gap-2">
              {deltas.map((d, i) => {
                const Icon = d.icon;
                const TIcon = d.TrendIcon;
                return (
                  <div key={i} className="rounded-xl border border-white/[0.06] bg-[#0E1017] p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1">
                        <Icon size={10} className="opacity-50" />
                        <span className="text-[8px] font-mono uppercase tracking-wider text-white/40">{d.label}</span>
                      </div>
                      <TIcon size={11} style={{ color: d.color }} />
                    </div>
                    <p className="font-mono text-[16px] font-bold leading-none" style={{ color: d.color }}>{d.format(d.value)}</p>
                  </div>
                );
              })}
            </div>

            {/* Baseline stats */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0E1017] p-3 space-y-1.5">
              <p className="text-[9px] font-mono uppercase tracking-wider text-white/30 mb-1">Baseline ({baseline.year || 2022})</p>
              {[
                ['GDP', `$${(baseline.gdp / 1e9).toFixed(1)}B`],
                ['Population', `${(baseline.pop / 1e6).toFixed(1)}M`],
                ['Life Expectancy', `${baseline.lifeExp.toFixed(1)}`],
                ['Happiness', `${first.happiness.toFixed(2)}`],
              ].map(([lbl, val], idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-[10px] text-white/40">{lbl}</span>
                  <span className="font-mono text-[12px] font-bold">{val}</span>
                </div>
              ))}
            </div>

            {/* ALL 4 Charts — full width stacked */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0E1017] p-3">
              <ProjectionChart data={projections} dataKey="gdp" title="Gross Domestic Product" color="#E07B35" formatValue={(v) => `$${(v / 1e9).toFixed(1)}B`} />
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-[#0E1017] p-3">
              <ProjectionChart data={projections} dataKey="happiness" title="Happiness Index" color="#B58AE0" formatValue={(v) => `${v.toFixed(2)}/10`} />
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-[#0E1017] p-3">
              <ProjectionChart data={projections} dataKey="lifeExp" title="Life Expectancy" color="#4190CC" formatValue={(v) => v.toFixed(1)} />
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-[#0E1017] p-3">
              <ProjectionChart data={projections} dataKey="co2" title="Emissions (CO₂/Capita)" color="#D95F5F" formatValue={(v) => v.toFixed(2)} />
            </div>

            {/* Interactive hint */}
            <div className="rounded-xl border border-white/[0.06] bg-[rgba(224,123,53,0.03)] p-4 text-center">
              <p className="text-[11px] font-bold text-[#E07B35] mb-1">Interactive Simulation</p>
              <p className="text-[10px] text-white/40 leading-relaxed">Tap "Tune Policies" above to adjust 25 policy levers and see how projections change in real-time.</p>
            </div>

            {/* Raw projections table */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0E1017] p-3">
              <p className="text-[11px] font-semibold tracking-tight mb-2">10-Year Projections</p>
              <div className="overflow-x-auto rounded-lg border border-white/[0.04] bg-[#0a0c10]">
                <table className="w-full min-w-[500px] text-left font-mono text-[9px]">
                  <thead className="sticky top-0 bg-[#0E1017] border-b border-white/[0.06] text-white/40 uppercase tracking-widest text-[8px]">
                    <tr>
                      <th className="px-3 py-2">Year</th>
                      <th className="px-3 py-2 text-right">GDP (USD)</th>
                      <th className="px-3 py-2 text-right">Pop (M)</th>
                      <th className="px-3 py-2 text-right">Life Exp.</th>
                      <th className="px-3 py-2 text-right">Happiness</th>
                      <th className="px-3 py-2 text-right">CO₂</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.02]">
                    {projections.map((p) => (
                      <tr key={p.year} className="hover:bg-white/[0.02]">
                        <td className="px-3 py-2 text-[#E07B35]">Year {p.year}</td>
                        <td className="px-3 py-2 text-right">{(p.gdp / 1e9).toFixed(1)}B</td>
                        <td className="px-3 py-2 text-right">{(p.pop / 1e6).toFixed(2)}M</td>
                        <td className="px-3 py-2 text-right">{p.lifeExp.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right text-[#B58AE0]">{p.happiness.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right text-[#D95F5F]">{p.co2.toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="h-4" />
          </div>
        )}

        {/* ── POLICY TUNING VIEW — ALL 25 sliders ── */}
        {showPolicies && (
          <div className="px-3 py-3 space-y-2.5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] font-bold text-white/70">Policy Engine · 25 Parameters</p>
              <button onClick={resetPolicies} className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-white/10 text-[9px] text-white/40">
                <RotateCcw size={10} /> Reset
              </button>
            </div>

            {POLICY_CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const isOpen = openCats[cat.title];
              return (
                <div key={cat.title} className={`rounded-xl border overflow-hidden transition-colors ${isOpen ? 'border-white/[0.08] bg-[#141720]' : 'border-white/[0.04] bg-[#0E1017]/50'}`}>
                  <button className="flex w-full items-center justify-between p-3 text-left" onClick={() => toggleCat(cat.title)}>
                    <div className="flex items-center gap-2">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${isOpen ? 'bg-[rgba(224,123,53,0.15)] text-[#E07B35]' : 'bg-white/[0.04] text-white/40'}`}>
                        <Icon size={12} />
                      </div>
                      <span className={`text-[11px] font-semibold tracking-wide transition-colors ${isOpen ? 'text-white' : 'text-white/60'}`}>{cat.title}</span>
                      <span className="text-[9px] text-white/20 font-mono">{cat.keys.length}</span>
                    </div>
                    <div className={`text-white/30 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▾</div>
                  </button>
                  {isOpen && (
                    <div className="border-t border-white/[0.04] bg-[#0c0e14] p-4 space-y-5">
                      {cat.keys.map(({ key, label }) => (
                        <Slider key={key} label={label} value={policies[key]} min={-50} max={50} onChange={(val) => updatePolicy(key, val)} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* See results button */}
            <button
              onClick={() => setShowPolicies(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500/80 to-amber-500/80 text-white text-sm font-bold uppercase tracking-wider hover:from-orange-500 hover:to-amber-500 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <ChevronUp size={16} /> View Results
            </button>

            <div className="h-6" />
          </div>
        )}
      </div>
    </div>
  );
};
