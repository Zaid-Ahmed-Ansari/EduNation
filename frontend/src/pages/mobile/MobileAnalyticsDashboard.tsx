import { useQuery } from '@tanstack/react-query';
import { useUIStore } from '../../store/uiStore';
import { getCountryIndicators, getCountryByCode, getCountries } from '../../api';
import { formatNumber, formatCurrency } from '../../utils/formatters';
import {
  Loader2, DollarSign, Users, HeartPulse,
  Activity, TrendingUp, Landmark, GraduationCap, Zap, TreePine,
  Globe2, Wifi, Swords, Banknote, Plane, BarChart3,
  LayoutGrid, ShieldCheck, Ship, Leaf,
  ChevronLeft,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { useMemo, useState } from 'react';

// ── ALL indicators — identical to desktop ──
const ALL_INDICATORS = [
  { label: 'GDP',                  key: 'gdp',          icon: DollarSign,   fmt: formatCurrency,                           cat: 'economy',      color: '#E07B35' },
  { label: 'GDP per Capita',       key: 'gdpPerCapita', icon: Banknote,     fmt: formatCurrency,                           cat: 'economy',      color: '#E07B35' },
  { label: 'Population',           key: 'pop',          icon: Users,        fmt: formatNumber,                             cat: 'demographics', color: '#4190CC' },
  { label: 'Life Expectancy',      key: 'lifeExp',      icon: HeartPulse,   fmt: (v: number) => `${v.toFixed(1)} yrs`,     cat: 'health',       color: '#27B08A' },
  { label: 'Inflation',            key: 'inflation',    icon: TrendingUp,   fmt: (v: number) => `${v.toFixed(1)}%`,        cat: 'economy',      color: '#E07B35' },
  { label: 'Unemployment',         key: 'unemployment', icon: BarChart3,    fmt: (v: number) => `${v.toFixed(1)}%`,        cat: 'economy',      color: '#E07B35' },
  { label: 'Gini Index',           key: 'gini',         icon: Activity,     fmt: (v: number) => v.toFixed(1),              cat: 'economy',      color: '#E07B35' },
  { label: 'FDI Net Inflows',      key: 'fdi',          icon: Landmark,     fmt: formatCurrency,                           cat: 'trade',        color: '#4190CC' },
  { label: 'Military Spend',       key: 'military',     icon: Swords,       fmt: (v: number) => `${v.toFixed(2)}% GDP`,    cat: 'economy',      color: '#D95F5F' },
  { label: 'Healthcare Spend',     key: 'healthSpend',  icon: HeartPulse,   fmt: (v: number) => `${v.toFixed(1)}% GDP`,    cat: 'health',       color: '#27B08A' },
  { label: 'Education Spend',      key: 'eduSpend',     icon: GraduationCap,fmt: (v: number) => `${v.toFixed(1)}% GDP`,    cat: 'education',    color: '#B58AE0' },
  { label: 'Tech Exports',         key: 'techExports',  icon: Zap,          fmt: formatCurrency,                           cat: 'trade',        color: '#4190CC' },
  { label: 'Internet Users',       key: 'internet',     icon: Wifi,         fmt: (v: number) => `${v.toFixed(1)}%`,        cat: 'economy',      color: '#E07B35' },
  { label: 'Mobile Subscriptions', key: 'mobile',       icon: Wifi,         fmt: (v: number) => `${formatNumber(v)}/100`,  cat: 'economy',      color: '#4190CC' },
  { label: 'Poverty Rate',         key: 'poverty',      icon: DollarSign,   fmt: (v: number) => `${v.toFixed(1)}%`,        cat: 'economy',      color: '#D95F5F' },
  { label: 'Electricity Access',   key: 'electricity',  icon: Zap,          fmt: (v: number) => `${v.toFixed(1)}%`,        cat: 'energy',       color: '#F0B429' },
  { label: 'Renewable Energy',     key: 'renewables',   icon: TreePine,     fmt: (v: number) => `${v.toFixed(1)}%`,        cat: 'energy',       color: '#27B08A' },
  { label: 'Forest Area',          key: 'forest',       icon: TreePine,     fmt: (v: number) => `${v.toFixed(1)}%`,        cat: 'environment',  color: '#27B08A' },
  { label: 'Agricultural Land',    key: 'agriLand',     icon: Globe2,       fmt: (v: number) => `${v.toFixed(1)}%`,        cat: 'environment',  color: '#27B08A' },
  { label: 'Urban Population',     key: 'urbanPop',     icon: Globe2,       fmt: (v: number) => `${v.toFixed(1)}%`,        cat: 'demographics', color: '#4190CC' },
  { label: 'Literacy Rate',        key: 'literacy',     icon: GraduationCap,fmt: (v: number) => `${v.toFixed(1)}%`,        cat: 'education',    color: '#B58AE0' },
  { label: 'Labor Force',          key: 'laborForce',   icon: Users,        fmt: formatNumber,                             cat: 'economy',      color: '#E07B35' },
  { label: 'Exports',              key: 'exports',      icon: Plane,        fmt: formatCurrency,                           cat: 'trade',        color: '#4190CC' },
  { label: 'Imports',              key: 'imports',      icon: Plane,        fmt: formatCurrency,                           cat: 'trade',        color: '#4190CC' },
  { label: 'Gov Debt (% GDP)',     key: 'debt',         icon: Landmark,     fmt: (v: number) => `${v.toFixed(1)}%`,        cat: 'economy',      color: '#D95F5F' },
  { label: 'Tourism Arrivals',     key: 'tourism',      icon: Plane,        fmt: formatNumber,                             cat: 'trade',        color: '#4190CC' },
  { label: 'Happiness Index',      key: 'happiness',    icon: HeartPulse,   fmt: (v: number) => `${v.toFixed(2)} / 10`,    cat: 'health',       color: '#B58AE0' },
];

const CATEGORIES = [
  { key: 'all',          label: 'All',           icon: LayoutGrid  },
  { key: 'economy',      label: 'Economy',       icon: TrendingUp  },
  { key: 'health',       label: 'Health',        icon: HeartPulse  },
  { key: 'education',    label: 'Education',     icon: GraduationCap },
  { key: 'trade',        label: 'Trade',         icon: Ship        },
  { key: 'energy',       label: 'Energy',        icon: Zap         },
  { key: 'demographics', label: 'Demographics',  icon: Users       },
  { key: 'environment',  label: 'Environment',   icon: Leaf        },
];

const TABS = ['Overview', 'Trends', 'Raw Data', 'Compare'] as const;
type Tab = typeof TABS[number];

function getValueForYear(wbData: any, targetYear: number): number | null {
  const list: any[] = wbData?.[1] ?? [];
  const found = list.find((d: any) => d.date === targetYear.toString());
  return (found && found.value !== null) ? found.value : null;
}

const tooltipStyle = {
  contentStyle: { backgroundColor: '#0E1017', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '11px' },
  labelStyle: { color: 'rgba(255,255,255,0.5)', fontSize: '10px' },
};
const axStyle = { tick: { fill: 'rgba(255,255,255,0.3)', fontSize: 9 }, axisLine: false as const, tickLine: false as const };

export const MobileAnalyticsDashboard = () => {
  const { selectedCountry, setMode } = useUIStore();
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [activeCat, setActiveCat] = useState('all');
  const [dataYear, setDataYear] = useState(2023);
  const [compareCode, setCompareCode] = useState('');

  const { data: countryData, isLoading: loadingMeta } = useQuery({
    queryKey: ['country', selectedCountry],
    queryFn: () => getCountryByCode(selectedCountry!),
    enabled: !!selectedCountry,
  });

  const { data: indicators, isLoading: loadingInd } = useQuery({
    queryKey: ['indicators', selectedCountry],
    queryFn: () => getCountryIndicators(selectedCountry!),
    enabled: !!selectedCountry,
  });

  const { data: globalCountries } = useQuery({
    queryKey: ['globalCountries'],
    queryFn: getCountries,
  });

  const { data: compareInd, isLoading: loadingCompare } = useQuery({
    queryKey: ['indicators', compareCode],
    queryFn: () => getCountryIndicators(compareCode),
    enabled: !!compareCode,
  });

  // Derived data — same as desktop
  const latestValues = useMemo(() => {
    if (!indicators) return {} as Record<string, number | null>;
    const vals: Record<string, number | null> = {};
    ALL_INDICATORS.forEach(({ key }) => { vals[key] = getValueForYear(indicators[key], dataYear); });
    if (vals.gdp && vals.pop) vals.gdpPerCapita = vals.gdp / vals.pop;
    return vals;
  }, [indicators, dataYear]);

  const gdpHistory = useMemo(() => {
    if (!indicators?.gdp?.[1]) return [];
    return [...indicators.gdp[1]].reverse().filter((d: any) => d.value !== null)
      .map((d: any) => ({ year: d.date, value: +(d.value / 1e9).toFixed(1) }));
  }, [indicators]);

  const realGdpHistory = useMemo(() => {
    if (!gdpHistory.length || !indicators?.inflation?.[1]) return [];
    const inflMap: Record<string, number> = {};
    indicators.inflation[1].forEach((d: any) => { if (d.value !== null) inflMap[d.date] = d.value; });
    let deflator = 100;
    return gdpHistory.map((pt, i) => {
      if (i > 0) deflator *= 1 + (inflMap[pt.year] ?? 0) / 100;
      return { year: pt.year, realGdp: +((pt.value / deflator) * 100).toFixed(1) };
    });
  }, [gdpHistory, indicators]);

  const filteredIndicators = useMemo(
    () => activeCat === 'all' ? ALL_INDICATORS : ALL_INDICATORS.filter(i => i.cat === activeCat),
    [activeCat]
  );

  if (loadingMeta) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-[#08090C]">
        <Loader2 className="h-8 w-8 animate-spin text-[#E07B35]" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">Loading…</span>
      </div>
    );
  }

  if (!selectedCountry || !countryData) return null;

  return (
    <div className="flex flex-col h-screen w-full bg-[#08090C] text-white overflow-hidden">

      {/* ═══ HEADER ═══ */}
      <div className="flex-shrink-0 bg-[#0E1017] border-b border-white/[0.06] px-3 pt-3 pb-2">
        <div className="flex items-center gap-2 mb-2">
          <button onClick={() => setMode('landing')} className="flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.05] text-white/60">
            <ChevronLeft size={18} />
          </button>
          <img src={countryData.flags?.svg} alt="flag" className="h-6 w-9 rounded-[3px] border border-white/10 object-cover" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold tracking-tight truncate">{countryData.name?.common}</p>
            <p className="text-[9px] text-white/40 font-mono uppercase tracking-wider">{countryData.region}</p>
          </div>
          <button onClick={() => setMode('simulation')} className="px-2.5 py-1 rounded-full bg-[rgba(224,123,53,0.15)] text-[#E07B35] text-[9px] font-bold uppercase tracking-wider border border-[rgba(224,123,53,0.3)]">
            Simulate
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-0.5 bg-white/[0.03] rounded-lg p-0.5">
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`flex-1 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all
                ${activeTab === t ? 'bg-[#0a0c10] text-white shadow-sm' : 'text-white/35'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ SCROLLABLE CONTENT ═══ */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">

        {/* ──────────── OVERVIEW TAB ──────────── */}
        {activeTab === 'Overview' && (
          <>
            {/* Data year selector */}
            <div className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-[#0E1017] p-3">
              <span className="text-[10px] text-white/40">Data Year</span>
              <select value={dataYear} onChange={(e) => setDataYear(parseInt(e.target.value))}
                className="bg-black border border-white/10 text-white rounded px-2 py-1 text-[10px] outline-none">
                {Array.from({length: 25}, (_, i) => 2024 - i).map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {/* Primary 4 cards */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'GDP', value: latestValues.gdp ? formatCurrency(latestValues.gdp) : 'N/A', color: '#E07B35', sub: 'Total output' },
                { label: 'Population', value: latestValues.pop ? formatNumber(latestValues.pop) : 'N/A', color: '#4190CC', sub: 'Total inhabitants' },
                { label: 'Life Exp.', value: latestValues.lifeExp ? `${(latestValues.lifeExp as number).toFixed(1)} yrs` : 'N/A', color: '#27B08A', sub: 'Avg lifespan' },
                { label: 'Happiness', value: latestValues.happiness ? `${(latestValues.happiness as number).toFixed(2)}/10` : 'N/A', color: '#B58AE0', sub: 'Score index' },
              ].map((s, i) => (
                <div key={i} className="rounded-xl border border-white/[0.06] bg-[#0E1017] p-3 relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-[2px]" style={{ background: s.color }} />
                  <p className="text-[8px] font-mono uppercase tracking-wider text-white/30 mb-1">{s.label}</p>
                  <p className="text-[15px] font-bold tracking-tight" style={{ color: s.color }}>
                    {loadingInd ? <Loader2 size={14} className="animate-spin text-white/30" /> : s.value}
                  </p>
                  <p className="text-[9px] text-white/25 mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Insight row */}
            <div className="space-y-2">
              {[
                { label: 'GDP per Capita', value: latestValues.gdpPerCapita ? formatCurrency(latestValues.gdpPerCapita) : 'N/A', color: '#E07B35', icon: TrendingUp },
                { label: 'Unemployment', value: latestValues.unemployment ? `${(latestValues.unemployment as number).toFixed(1)}%` : 'N/A', color: '#27B08A', icon: ShieldCheck },
                { label: 'Trade Openness', value: latestValues.exports && latestValues.imports && latestValues.gdp ? `${(((latestValues.exports + latestValues.imports) / latestValues.gdp) * 100).toFixed(1)}% GDP` : 'N/A', color: '#4190CC', icon: Ship },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#0E1017] p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md" style={{ background: `${item.color}20` }}>
                        <Icon size={12} style={{ color: item.color }} />
                      </div>
                      <span className="text-[11px] text-white/50">{item.label}</span>
                    </div>
                    <span className="font-mono text-[13px] font-bold" style={{ color: item.color }}>
                      {loadingInd ? <Loader2 size={14} className="animate-spin text-white/30" /> : item.value}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Category chips — horizontal scroll */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-nowrap">
              {CATEGORIES.map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => setActiveCat(key)}
                  className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider whitespace-nowrap flex-shrink-0 transition-all
                    ${activeCat === key
                      ? 'border-[rgba(224,123,53,0.25)] bg-[rgba(224,123,53,0.1)] text-[#E07B35]'
                      : 'border-white/[0.07] text-white/35'}`}
                >
                  <Icon size={10} /> {label}
                </button>
              ))}
            </div>

            {/* All indicator cards — 2-col grid */}
            <div className="grid grid-cols-2 gap-2">
              {filteredIndicators.map((ind) => {
                const val = latestValues[ind.key];
                const Icon = ind.icon;
                return (
                  <div key={ind.key} className="rounded-xl border border-white/[0.06] bg-[#0E1017] p-2.5">
                    <div className="flex items-center gap-1 mb-1.5">
                      <Icon size={10} style={{ color: ind.color }} className="opacity-60" />
                      <span className="text-[8px] font-mono uppercase tracking-wider text-white/30 truncate">{ind.label}</span>
                    </div>
                    <p className="font-mono text-[13px] font-bold text-white truncate">
                      {loadingInd ? <Loader2 size={12} className="animate-spin text-white/30" /> : (val !== null && val !== undefined ? ind.fmt(val) : 'N/A')}
                    </p>
                    <div className="mt-1.5 h-[2px] bg-white/[0.06] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: val ? '60%' : '0%', background: ind.color }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* GDP preview chart */}
            {gdpHistory.length > 0 && (
              <div className="rounded-xl border border-white/[0.06] bg-[#0E1017] p-3">
                <p className="text-[10px] font-mono uppercase tracking-wider text-white/30 mb-2">GDP Trend (Preview)</p>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={gdpHistory} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                      <defs><linearGradient id="mgdpS" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#E07B35" stopOpacity={0.25}/><stop offset="95%" stopColor="#E07B35" stopOpacity={0}/></linearGradient></defs>
                      <XAxis dataKey="year" hide /><YAxis hide />
                      <Area type="monotone" dataKey="value" stroke="#E07B35" strokeWidth={1.5} fill="url(#mgdpS)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}


          </>
        )}

        {/* ──────────── TRENDS TAB ──────────── */}
        {activeTab === 'Trends' && (
          <div className="space-y-3">
            {/* Nominal GDP */}
            {gdpHistory.length > 0 && (
              <div className="rounded-xl border border-white/[0.06] bg-[#0E1017] p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-[11px] font-semibold tracking-tight">Nominal GDP Trend</p>
                    <p className="text-[9px] text-white/35">1990 – 2023 · USD billions</p>
                  </div>
                  <span className="rounded-full bg-[rgba(224,123,53,0.12)] px-1.5 py-0.5 text-[8px] font-mono text-[#E07B35]">Nominal</span>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={gdpHistory} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                      <defs><linearGradient id="mGdpG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#E07B35" stopOpacity={0.25}/><stop offset="95%" stopColor="#E07B35" stopOpacity={0}/></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="year" {...axStyle} minTickGap={40} />
                      <YAxis {...axStyle} tickFormatter={(v) => `$${v}B`} />
                      <Tooltip {...tooltipStyle} formatter={(v: any) => [`$${v}B`, 'Nominal GDP']} />
                      <Area type="monotone" dataKey="value" stroke="#E07B35" strokeWidth={1.5} fill="url(#mGdpG)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Real GDP */}
            {realGdpHistory.length > 0 && (
              <div className="rounded-xl border border-white/[0.06] bg-[#0E1017] p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-[11px] font-semibold tracking-tight">Real GDP (Inflation-Adjusted)</p>
                    <p className="text-[9px] text-white/35">Deflated to base year 1990</p>
                  </div>
                  <span className="rounded-full bg-[rgba(39,176,138,0.12)] px-1.5 py-0.5 text-[8px] font-mono text-[#27B08A]">Real</span>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={realGdpHistory} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                      <defs><linearGradient id="mRealG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#27B08A" stopOpacity={0.25}/><stop offset="95%" stopColor="#27B08A" stopOpacity={0}/></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="year" {...axStyle} minTickGap={40} />
                      <YAxis {...axStyle} tickFormatter={(v) => `$${v}B`} />
                      <Tooltip {...tooltipStyle} formatter={(v: any) => [`$${v}B`, 'Real GDP']} />
                      <Area type="monotone" dataKey="realGdp" stroke="#27B08A" strokeWidth={1.5} fill="url(#mRealG)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Population Growth */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0E1017] p-3">
              <p className="text-[11px] font-semibold tracking-tight">Population Growth</p>
              <p className="text-[9px] text-white/35 mb-2">Annual % change</p>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[...(indicators?.pop?.[1] ?? [])].reverse()
                      .filter((d: any) => d.value !== null)
                      .map((d: any, i: number, arr: any[]) => ({
                        year: d.date,
                        growth: i === 0 ? 0 : +((d.value - arr[i - 1].value) / arr[i - 1].value * 100).toFixed(2),
                      }))}
                    margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="year" {...axStyle} minTickGap={40} />
                    <YAxis {...axStyle} tickFormatter={(v) => `${v}%`} />
                    <Tooltip {...tooltipStyle} formatter={(v: any) => [`${v}%`, 'Growth']} />
                    <Area type="monotone" dataKey="growth" stroke="#4190CC" strokeWidth={1.5} fill="rgba(65,144,204,0.12)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Key Rates Bar Chart */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0E1017] p-3">
              <p className="text-[11px] font-semibold tracking-tight">Key Rates Comparison</p>
              <p className="text-[9px] text-white/35 mb-2">Unemployment · Inflation · Renewables %</p>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Unemp.', value: latestValues['unemployment'] ?? 0 },
                      { name: 'Infl.', value: latestValues['inflation'] ?? 0 },
                      { name: 'Renew.', value: latestValues['renewables'] ?? 0 },
                      { name: 'Edu', value: latestValues['eduSpend'] ?? 0 },
                      { name: 'Health', value: latestValues['healthSpend'] ?? 0 },
                    ]}
                    margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="name" {...axStyle} />
                    <YAxis {...axStyle} tickFormatter={(v) => `${v}%`} />
                    <Tooltip {...tooltipStyle} formatter={(v: any) => [`${v}%`]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#E07B35" fillOpacity={0.7} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ──────────── RAW DATA TAB ──────────── */}
        {activeTab === 'Raw Data' && (
          <div className="rounded-xl border border-white/[0.06] bg-[#0E1017] p-3 overflow-hidden">
            <p className="text-[11px] font-semibold tracking-tight mb-1">Raw Data Inspector</p>
            <p className="text-[9px] text-white/35 mb-3">All indicator values for {dataYear}</p>
            <div className="overflow-x-auto rounded-lg border border-white/[0.04] bg-[#0a0c10]">
              <table className="w-full min-w-[500px] text-left font-mono text-[10px]">
                <thead className="sticky top-0 bg-[#0E1017] border-b border-white/[0.06] z-10 text-white/40 uppercase tracking-widest text-[8px]">
                  <tr>
                    <th className="px-3 py-2 font-medium">ID</th>
                    <th className="px-3 py-2 font-medium">Indicator</th>
                    <th className="px-3 py-2 font-medium">Category</th>
                    <th className="px-3 py-2 font-medium text-right">Raw</th>
                    <th className="px-3 py-2 font-medium text-right">Formatted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {ALL_INDICATORS.map(ind => {
                    const val = latestValues[ind.key];
                    return (
                      <tr key={ind.key} className="hover:bg-white/[0.02]">
                        <td className="px-3 py-2 text-[#E07B35] text-[9px]">{ind.key.toUpperCase()}</td>
                        <td className="px-3 py-2 font-sans text-white/80 text-[10px]">{ind.label}</td>
                        <td className="px-3 py-2 text-white/40 uppercase text-[8px]">{ind.cat}</td>
                        <td className="px-3 py-2 text-right text-white/70">{val !== null && val !== undefined ? val : 'null'}</td>
                        <td className="px-3 py-2 text-right text-[#27B08A]">{val !== null && val !== undefined ? ind.fmt(val) : 'N/A'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ──────────── COMPARE TAB ──────────── */}
        {activeTab === 'Compare' && (
          <div className="rounded-xl border border-white/[0.06] bg-[#0E1017] p-3 overflow-hidden">
            <p className="text-[11px] font-semibold tracking-tight mb-1">Cross-Country Comparison</p>
            <p className="text-[9px] text-white/35 mb-3">Compare {countryData.name?.common} against any nation</p>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-[9px] font-mono uppercase text-white/40">vs:</span>
              <select value={compareCode} onChange={(e) => setCompareCode(e.target.value)}
                className="flex-1 bg-black border border-white/10 text-white rounded-md px-2 py-1.5 text-[10px] outline-none">
                <option value="" disabled>Select Country</option>
                {globalCountries?.filter((c: any) => c.cca3 !== selectedCountry).sort((a: any, b: any) => a.name.localeCompare(b.name)).map((c: any) => (
                  <option key={c.cca3} value={c.cca3}>{c.name}</option>
                ))}
              </select>
            </div>

            {!compareCode ? (
              <div className="flex items-center justify-center rounded-lg border border-dashed border-white/[0.08] bg-[#0a0c10] py-12">
                <p className="text-[10px] font-mono text-white/30 text-center">Select a country above</p>
              </div>
            ) : loadingCompare ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12">
                <Loader2 className="h-5 w-5 animate-spin text-[#E07B35]" />
                <p className="text-[9px] font-mono text-[#E07B35]/70 uppercase tracking-wider">Loading…</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-white/[0.04] bg-[#0a0c10]">
                <table className="w-full min-w-[420px] text-left font-mono text-[10px]">
                  <thead className="sticky top-0 bg-[#0E1017] border-b border-white/[0.06] z-10 text-white/40 uppercase tracking-widest text-[8px]">
                    <tr>
                      <th className="px-3 py-2 font-medium">Metric</th>
                      <th className="px-3 py-2 font-medium text-right text-[#4190CC]">{countryData.name?.common}</th>
                      <th className="px-3 py-2 font-medium text-right text-[#E07B35]">
                        {globalCountries?.find((c: any) => c.cca3 === compareCode)?.name || compareCode}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.02]">
                    {ALL_INDICATORS.map(ind => {
                      const val1 = latestValues[ind.key];
                      let val2: number | null = null;
                      if (ind.key === 'gdpPerCapita') {
                        const cGdp = getValueForYear(compareInd?.['gdp'], dataYear);
                        const cPop = getValueForYear(compareInd?.['pop'], dataYear);
                        if (cGdp && cPop) val2 = cGdp / cPop;
                      } else {
                        val2 = getValueForYear(compareInd?.[ind.key], dataYear);
                      }

                      let isV1Better = false, isV2Better = false;
                      if (val1 !== null && val2 !== null) {
                        const reverse = ['unemployment', 'poverty', 'debt', 'inflation'].includes(ind.key);
                        if (val1 > val2) { isV1Better = !reverse; isV2Better = reverse; }
                        else if (val2 > val1) { isV2Better = !reverse; isV1Better = reverse; }
                      }

                      return (
                        <tr key={ind.key} className="hover:bg-white/[0.02]">
                          <td className="px-3 py-2 font-sans text-white/80 text-[10px]">{ind.label}</td>
                          <td className={`px-3 py-2 text-right ${isV1Better ? 'text-white font-bold' : 'text-white/50'}`}>
                            {val1 !== null && val1 !== undefined ? ind.fmt(val1) : 'N/A'}
                          </td>
                          <td className={`px-3 py-2 text-right ${isV2Better ? 'text-white font-bold' : 'text-white/50'}`}>
                            {val2 !== null && val2 !== undefined ? ind.fmt(val2) : 'N/A'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <div className="h-4" />
      </div>
    </div>
  );
};
