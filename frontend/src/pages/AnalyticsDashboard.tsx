import { useQuery } from '@tanstack/react-query';
import { useUIStore } from '../store/uiStore';
import { getCountryIndicators, getCountryByCode, getCountries } from '../api';
import { formatNumber, formatCurrency } from '../utils/formatters';
import {
  Loader2, DollarSign, Users, HeartPulse,
  Activity, TrendingUp, Landmark, GraduationCap, Zap, TreePine,
  Globe2, Wifi, Swords, Banknote, Plane, BarChart3,
  LayoutGrid, LineChart, ShieldCheck, Ship, Leaf, LayoutDashboard,
  GitCompare,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { useMemo, useState, useEffect, useRef } from 'react';

// ─── Indicator definitions (outside component — never recreated) ───────────
const ALL_INDICATORS = [
  { label: 'GDP',                  key: 'gdp',          icon: DollarSign,   fmt: formatCurrency,                           cat: 'economy',      color: '#E07B35' },
  { label: 'GDP per Capita',       key: 'gdpPerCapita', icon: Banknote,     fmt: formatCurrency,                           cat: 'economy',      color: '#E07B35' },
  { label: 'Population',           key: 'pop',          icon: Users,        fmt: formatNumber,                             cat: 'demographics', color: '#4190CC' },
  { label: 'Life Expectancy',      key: 'lifeExp',      icon: HeartPulse,   fmt: (v: number) => `${v.toFixed(1)} yrs`,     cat: 'health',       color: '#27B08A' },
  { label: 'Inflation',            key: 'inflation',    icon: TrendingUp,   fmt: (v: number) => `${v.toFixed(1)}%`,        cat: 'economy',      color: '#E07B35' },
  { label: 'Unemployment',         key: 'unemployment', icon: BarChart3,    fmt: (v: number) => `${v.toFixed(1)}%`,        cat: 'economy',      color: '#E07B35' },
  { label: 'Gini Index',           key: 'gini',         icon: Activity,     fmt: (v: number) => v.toFixed(1),              cat: 'economy',      color: '#E07B35' },
  { label: 'FDI Net Inflows',      key: 'fdi',          icon: Landmark,     fmt: formatCurrency,                           cat: 'trade',        color: '#4190CC' },
  { label: 'Military Spend',       key: 'military',     icon: Swords,       fmt: (v: number) => `${v.toFixed(2)}% GDP`,   cat: 'economy',      color: '#D95F5F' },
  { label: 'Healthcare Spend',     key: 'healthSpend',  icon: HeartPulse,   fmt: (v: number) => `${v.toFixed(1)}% GDP`,   cat: 'health',       color: '#27B08A' },
  { label: 'Education Spend',      key: 'eduSpend',     icon: GraduationCap,fmt: (v: number) => `${v.toFixed(1)}% GDP`,   cat: 'education',    color: '#B58AE0' },
  { label: 'Tech Exports',         key: 'techExports',  icon: Zap,          fmt: formatCurrency,                           cat: 'trade',        color: '#4190CC' },
  { label: 'Internet Users',       key: 'internet',     icon: Wifi,         fmt: (v: number) => `${v.toFixed(1)}%`,        cat: 'economy',      color: '#E07B35' },
  { label: 'Mobile Subscriptions', key: 'mobile',       icon: Wifi,         fmt: (v: number) => `${formatNumber(v)}/100`, cat: 'economy',      color: '#4190CC' },
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

const NAV_ITEMS = [
  { label: 'Overview',         icon: LayoutDashboard },
  { label: 'GDP & Economy',    icon: LineChart       },
  { label: 'Demographics',     icon: Users           },
  { label: 'Health & Social',  icon: ShieldCheck     },
  { label: 'Trade & FDI',      icon: Ship            },
  { label: 'Environment',      icon: Leaf            },
  { label: 'Compare Countries',icon: GitCompare      },
];

// ─── Helpers ──────────────────────────────────────────────────────────────
function getValueForYear(wbData: any, targetYear: number): number | null {
  const list: any[] = wbData?.[1] ?? [];
  // Find the exact requested year
  const found = list.find((d: any) => d.date === targetYear.toString());
  return (found && found.value !== null) ? found.value : null;
}

// ─── Sub-components ───────────────────────────────────────────────────────
interface PrimaryCardProps {
  label: string;
  value: string;
  sub: string;
  delta: string;
  deltaUp: boolean;
  icon: React.ElementType;
  accentColor: string;
  bgColor: string;
  loading?: boolean;
}

const PrimaryCard = ({ label, value, sub, delta, deltaUp, icon: Icon, accentColor, bgColor, loading }: PrimaryCardProps) => (
  <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0E1017] p-[18px] transition-colors hover:border-white/10">
    <div className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl" style={{ background: accentColor }} />
    <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: bgColor }}>
      <Icon size={15} style={{ color: accentColor }} />
    </div>
    <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-white/40">{label}</p>
    <div className="h-8 flex flex-col justify-center">
      {loading ? (
        <Loader2 size={24} className="animate-spin text-white/40" />
      ) : (
        <p className="font-mono text-[1.6rem] leading-none tracking-tight text-white">{value}</p>
      )}
    </div>
    <span
      className="mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px]"
      style={{
        background: deltaUp ? 'rgba(39,176,138,0.12)' : 'rgba(217,95,95,0.12)',
        color:      deltaUp ? '#27B08A'                : '#D95F5F',
      }}
    >
      {deltaUp ? '▲' : '▼'} {delta}
    </span>
    <p className="mt-2 text-[11px] leading-[1.5] text-white/25">{sub}</p>
  </div>
);

interface InsightCardProps {
  label: string;
  value: string;
  desc: string;
  color: string;
  bg: string;
  icon: React.ElementType;
  loading?: boolean;
}

const InsightCard = ({ label, value, desc, color, bg, icon: Icon, loading }: InsightCardProps) => (
  <div className="rounded-xl border border-white/[0.06] bg-[#0E1017] p-[14px]">
    <div className="mb-2 flex items-center gap-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-[7px]" style={{ background: bg }}>
        <Icon size={13} style={{ color }} />
      </div>
      <span className="font-mono text-[10px] uppercase tracking-[0.08em]" style={{ color }}>{label}</span>
    </div>
    <div className="h-[1.4rem] flex flex-col justify-center">
      {loading ? (
        <Loader2 size={16} className="animate-spin text-white/40" />
      ) : (
        <p className="font-mono text-[1.4rem] leading-none tracking-tight text-white">{value}</p>
      )}
    </div>
    <p className="mt-1.5 text-[11px] leading-[1.5] text-white/40">{desc}</p>
  </div>
);

const chartTooltipStyle = {
  contentStyle: {
    backgroundColor: '#0E1017',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    fontSize: '12px',
    fontFamily: "'DM Sans', system-ui",
  },
  labelStyle: { color: 'rgba(238,236,228,0.5)', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px' },
};

const axisStyle = {
  tick: { fill: 'rgba(238,236,228,0.3)', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" },
  axisLine: false as const,
  tickLine: false as const,
};

// ─── Main Component ───────────────────────────────────────────────────────
export const AnalyticsDashboard = () => {
  const { selectedCountry, setMode, isSidebarOpen, toggleSidebar } = useUIStore();
  const [activeCat, setActiveCat] = useState('all');
  const [activeNav, setActiveNav] = useState('Overview');
  const [activeTopTab, setActiveTopTab] = useState<'Overview' | 'Trends' | 'Raw Data' | 'Compare'>('Overview');
  const [dataYear, setDataYear] = useState<number>(2023);
  const [compareCode, setCompareCode] = useState<string>('');
  const indGridRef = useRef<HTMLDivElement>(null);

  const handleNavClick = (label: string) => {
    setActiveNav(label);
    if (label === 'Overview') {
      setActiveCat('all');
      setActiveTopTab('Overview');
    } else if (label === 'GDP & Economy') {
      setActiveCat('economy');
      setActiveTopTab('Overview');
    } else if (label === 'Demographics') {
      setActiveCat('demographics');
      setActiveTopTab('Overview');
    } else if (label === 'Health & Social') {
      setActiveCat('health');
      setActiveTopTab('Overview');
    } else if (label === 'Trade & FDI') {
      setActiveCat('trade');
      setActiveTopTab('Overview');
    } else if (label === 'Environment') {
      setActiveCat('environment');
      setActiveTopTab('Overview');
    } else if (label === 'Compare Countries') {
      setActiveTopTab('Compare');
    }
  };

  // ── Queries ──
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

  // ── Memoised derivations (never recomputed unless data changes) ──
  const latestValues = useMemo(() => {
    if (!indicators) return {};
    const vals = Object.fromEntries(
      ALL_INDICATORS.map(({ key }) => [key, getValueForYear(indicators[key], dataYear)])
    );
    // Synthetic calculations based strictly on the selected dataYear
    if (vals.gdp && vals.pop) {
      vals.gdpPerCapita = vals.gdp / vals.pop;
    }
    return vals;
  }, [indicators, dataYear]);

  const gdpHistory = useMemo(() => {
    if (!indicators?.gdp?.[1]) return [];
    return [...indicators.gdp[1]]
      .reverse()
      .filter((d: any) => d.value !== null)
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

  // ── Filtered indicators ──
  const filteredIndicators = useMemo(
    () => activeCat === 'all' ? ALL_INDICATORS : ALL_INDICATORS.filter(i => i.cat === activeCat),
    [activeCat]
  );

  // ── Scroll-reveal via IntersectionObserver ──
  useEffect(() => {
    // We let intersection observer run even if loadingInd is true, so skeleton shell animates in
    if (loadingMeta) return;
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
  }, [loadingMeta, activeCat]);

  // ── Income level helper ──
  const incomeLevel = useMemo(() => {
    const gdppc = latestValues['gdpPerCapita'] ?? latestValues['gdp'];
    if (!gdppc) return 'Unknown';
    if (gdppc > 12000) return 'High Income';
    if (gdppc > 4000)  return 'Upper-Middle Income';
    if (gdppc > 1000)  return 'Lower-Middle Income';
    return 'Low Income';
  }, [latestValues]);

  // ─────────────────────────────────────────────────────────────────────────
  if (loadingMeta) {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-[#08090C]">
        <Loader2 className="h-10 w-10 animate-spin text-[#E07B35]" />
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/30">
          Loading Framework…
        </span>
      </div>
    );
  }

  if (!selectedCountry || !countryData) return null;

  const latestGdp    = latestValues['gdp'];
  const latestPop    = latestValues['pop'];
  const latestLifeExp = latestValues['lifeExp'];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#08090C] font-sans text-white relative">

      {/* ═══ MOBILE SIDEBAR TOGGLE (floating) ═══ */}
      {!isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-16 left-3 z-[130] lg:hidden flex items-center justify-center w-10 h-10 rounded-full bg-[#0E1017] border border-white/10 text-white/60 shadow-lg hover:text-white transition-colors"
        >
          ☰
        </button>
      )}

      {/* ═══ MOBILE SIDEBAR BACKDROP ═══ */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm lg:hidden animate-[fadeIn_0.3s_ease]"
          onClick={toggleSidebar}
        />
      )}

      {/* ═══ SIDEBAR ═══ */}
      <aside className={`fixed inset-y-0 left-0 z-[120] flex h-full w-[280px] flex-shrink-0 flex-col overflow-y-auto border-r border-white/[0.06] bg-[#0E1017] transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>

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
                {countryData.region} • {incomeLevel}
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex w-full rounded-lg bg-white/[0.03] p-1">
            <button
              className="flex-1 flex items-center justify-center gap-2 rounded-md py-1.5 font-mono text-[10px] uppercase tracking-[0.05em] transition-all bg-[#0E1017] text-white shadow-sm ring-1 ring-white/10"
            >
              Analytics
            </button>
            <button
              onClick={() => setMode('simulation')}
              className="flex-1 flex items-center justify-center gap-2 rounded-md py-1.5 font-mono text-[10px] uppercase tracking-[0.05em] transition-all text-white/40 hover:text-white"
            >
              Simulation
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4">
          <p className="mb-1 px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-white/20">Navigate</p>
          {NAV_ITEMS.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => handleNavClick(label)}
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

        {/* Quick stats */}
        <div className="border-t border-white/[0.06] px-5 py-4 space-y-2.5">
          <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-white/20 font-mono">Quick Stats</p>
          {[
            ['GDP per capita', loadingInd ? <Loader2 size={12} className="animate-spin" /> : (latestValues['gdpPerCapita'] ? formatCurrency(latestValues['gdpPerCapita']) : 'N/A')],
            ['Happiness Index', loadingInd ? <Loader2 size={12} className="animate-spin" /> : (latestValues['happiness'] ? `${latestValues['happiness'].toFixed(2)}/10` : 'N/A')],
            ['Life expectancy', loadingInd ? <Loader2 size={12} className="animate-spin" /> : (latestLifeExp ? `${latestLifeExp.toFixed(1)} yrs` : 'N/A')],
          ].map(([lbl, val], idx) => (
            <div key={idx} className="flex items-baseline justify-between mt-1">
              <span className="text-[11px] text-white/40">{lbl}</span>
              <span className="font-mono text-[14px] leading-none">{val}</span>
            </div>
          ))}
          
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06]">
             <span className="text-[11px] text-white/40">Data Year</span>
             <select 
               value={dataYear}
               onChange={(e) => setDataYear(parseInt(e.target.value))}
               className="bg-black border border-white/10 text-white rounded px-2 py-1 text-xs outline-none"
             >
               {Array.from({length: 25}, (_, i) => 2024 - i).map(year => (
                 <option key={year} value={year}>{year}</option>
               ))}
             </select>
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
      <main className="flex flex-1 flex-col gap-3 sm:gap-5 overflow-y-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 pt-16 sm:pt-20 lg:pt-5 scroll-smooth">

        {/* Top bar */}
        <div className="dash-reveal flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <div>
            <h1 className="font-serif text-[1.2rem] sm:text-[1.4rem] lg:text-[1.6rem] leading-none tracking-tight">
              Analytics <em className="italic text-[#E07B35]">Dashboard</em>
            </h1>
            <p className="mt-1 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.08em] text-white/30">
              Filtered to {dataYear} · {ALL_INDICATORS.length} indicators
            </p>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 rounded-full border border-white/[0.08] bg-[#141720] p-1 overflow-x-auto flex-nowrap">
            {(['Overview', 'Trends', 'Raw Data', 'Compare'] as const).map((t) => (
              <button
                key={t}
                className={`rounded-full px-2.5 sm:px-3.5 py-1 sm:py-1.5 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.05em] transition-all whitespace-nowrap
                  ${activeTopTab === t ? 'bg-[#0E1017] text-white shadow-sm' : 'text-white/35 hover:text-white'}`}
                onClick={() => {
                   setActiveTopTab(t);
                   if (t === 'Compare') setActiveNav('Compare Countries');
                   else if (t === 'Overview') setActiveNav('Overview');
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* CONDITIONAL RENDER START ======================================== */}
        
        {activeTopTab === 'Overview' && (
          <>
            {/* Primary 4 metrics (Only on 'all' category or 'Overview' top tab for context) */}
            {activeCat === 'all' && (
              <div className="dash-reveal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                <PrimaryCard
                  label="Gross Domestic Product" icon={DollarSign}
                  value={latestGdp ? formatCurrency(latestGdp) : 'N/A'}
                  sub="Total monetary value of all goods and services"
                  delta="1.9% YoY" deltaUp accentColor="#E07B35" bgColor="rgba(224,123,53,0.12)" loading={loadingInd}
                />
                <PrimaryCard
                  label="Population" icon={Users}
                  value={latestPop ? formatNumber(latestPop) : 'N/A'}
                  sub="Estimated total inhabitants"
                  delta="0.3% YoY" deltaUp={false} accentColor="#4190CC" bgColor="rgba(65,144,204,0.12)" loading={loadingInd}
                />
                <PrimaryCard
                  label="Life Expectancy" icon={HeartPulse}
                  value={latestLifeExp ? `${latestLifeExp.toFixed(1)} yrs` : 'N/A'}
                  sub="Average years a newborn is expected to live"
                  delta="0.4 yrs" deltaUp accentColor="#27B08A" bgColor="rgba(39,176,138,0.12)" loading={loadingInd}
                />
                <PrimaryCard
                  label="Happiness Index" icon={Activity}
                  value={latestValues['happiness'] ? `${latestValues['happiness'].toFixed(2)}` : 'N/A'}
                  sub="National happiness relative aggregate score"
                  delta="0.1 pts" deltaUp accentColor="#B58AE0" bgColor="rgba(181,138,224,0.12)" loading={loadingInd}
                />
              </div>
            )}

            {/* Insights row */}
            {activeCat === 'all' && (
              <div className="dash-reveal grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                <InsightCard
                  label="GDP per Capita" icon={TrendingUp}
                  value={latestValues['gdp'] && latestValues['pop'] ? `$${Math.round(latestValues['gdp'] / latestValues['pop']).toLocaleString()}` : 'N/A'}
                  desc="Economic output divided by total population, indicating average standard of living."
                  color="#E07B35" bg="rgba(224,123,53,0.12)" loading={loadingInd} 
                />
                <InsightCard
                  label="Unemployment" icon={ShieldCheck}
                  value={latestValues['unemployment'] ? `${latestValues['unemployment'].toFixed(1)}%` : 'N/A'}
                  desc="Percentage of the total labor force that is unemployed but actively seeking employment."
                  color="#27B08A" bg="rgba(39,176,138,0.12)" loading={loadingInd}
                />
                <InsightCard
                  label="Trade Openness" icon={Ship}
                  value={latestValues['exports'] && latestValues['imports'] && latestValues['gdp'] ? 
                    `${(((latestValues['exports'] + latestValues['imports']) / latestValues['gdp']) * 100).toFixed(1)}% GDP` 
                    : 'N/A'} 
                  desc="Sum of exports and imports as a percentage of GDP, measuring integration into the global economy."
                  color="#4190CC" bg="rgba(65,144,204,0.12)" loading={loadingInd}
                />
              </div>
            )}

            {/* Category filter + indicators */}
            <div className="dash-reveal">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[13px] font-semibold tracking-tight">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#E07B35]" />
                  {activeCat === 'all' ? 'All Indicators' : `${activeCat.charAt(0).toUpperCase() + activeCat.slice(1)} Indicators`}
                </div>
                <span className="font-mono text-[10px] text-white/25">{filteredIndicators.length} shown</span>
              </div>

              {/* Category chips */}
              <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-nowrap sm:flex-wrap">
                {CATEGORIES.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveCat(key)}
                    className={`flex items-center gap-1.5 rounded-full border px-2.5 sm:px-3 py-1 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.06em] transition-all whitespace-nowrap flex-shrink-0
                      ${activeCat === key
                        ? 'border-[rgba(224,123,53,0.25)] bg-[rgba(224,123,53,0.1)] text-[#E07B35]'
                        : 'border-white/[0.07] text-white/35 hover:border-white/15 hover:text-white'
                      }`}
                  >
                    <Icon size={11} />
                    {label}
                  </button>
                ))}
              </div>

              {/* Indicator cards grid */}
              <div
                ref={indGridRef}
                className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
              >
                {filteredIndicators.map((ind) => {
                  const val = latestValues[ind.key];
                  const Icon = ind.icon;
                  return (
                    <div
                      key={ind.key}
                      className="group rounded-xl border border-white/[0.06] bg-[#0E1017] p-3 transition-all duration-200 hover:-translate-y-px hover:border-white/10 hover:bg-[#141720]"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-mono text-[10px] uppercase tracking-[0.07em] text-white/25">{ind.label}</span>
                        <Icon size={12} className="opacity-30 transition-opacity group-hover:opacity-60" style={{ color: ind.color }} />
                      </div>
                      <div className="h-5 flex flex-col justify-center mb-1">
                        {loadingInd ? (
                          <Loader2 size={14} className="animate-spin text-white/30" />
                        ) : (
                          <p className="font-mono text-[1.15rem] leading-none tracking-tight text-white">
                            {val !== null && val !== undefined ? ind.fmt(val) : 'N/A'}
                          </p>
                        )}
                      </div>
                      <div className="mt-2.5 h-[2px] overflow-hidden rounded-sm bg-white/[0.06]">
                        <div
                          className="h-full rounded-sm transition-all duration-1000"
                          style={{ width: val !== null && val !== undefined ? '60%' : '0%', background: ind.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Charts preview for Overview layout */}
            {activeCat === 'all' && (
              <div className="dash-reveal grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 pb-6">
                 <div className="rounded-2xl border border-white/[0.06] bg-[#0E1017] p-5 cursor-pointer hover:border-white/10 transition-colors" onClick={() => setActiveTopTab('Trends')}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[13px] font-semibold tracking-tight">Nominal GDP Trend (Preview)</p>
                      <p className="mt-0.5 text-[11px] text-white/35">Click to view full Trends</p>
                    </div>
                  </div>
                  <div className="mt-4 h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={gdpHistory} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                        <defs><linearGradient id="gdpGradSmall" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#E07B35" stopOpacity={0.25} /><stop offset="95%" stopColor="#E07B35" stopOpacity={0} /></linearGradient></defs>
                        <XAxis dataKey="year" hide />
                        <YAxis hide />
                        <Area type="monotone" dataKey="value" stroke="#E07B35" strokeWidth={1.5} fill="url(#gdpGradSmall)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ======================================== */}
        {/* TRENDS TAB VIEW                          */}
        {/* ======================================== */}
        {activeTopTab === 'Trends' && (
          <div className="flex flex-col gap-4">
            <div className="dash-reveal grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/[0.06] bg-[#0E1017] p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[13px] font-semibold tracking-tight">Nominal GDP Trend</p>
                    <p className="mt-0.5 text-[11px] text-white/35">1990 – 2023 · USD billions</p>
                  </div>
                  <span className="rounded-full bg-[rgba(224,123,53,0.12)] px-2 py-0.5 font-mono text-[10px] text-[#E07B35]">
                    Nominal
                  </span>
                </div>
                <div className="mt-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={gdpHistory} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gdpGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#E07B35" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#E07B35" stopOpacity={0}    />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="year" {...axisStyle} minTickGap={28} />
                      <YAxis {...axisStyle} tickFormatter={(v) => `$${v}B`} />
                      <Tooltip {...chartTooltipStyle} formatter={(v: any) => [`$${v}B`, 'Nominal GDP']} />
                      <Area type="monotone" dataKey="value" stroke="#E07B35" strokeWidth={1.5} fill="url(#gdpGrad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-[#0E1017] p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[13px] font-semibold tracking-tight">Real GDP (Inflation-Adjusted)</p>
                    <p className="mt-0.5 text-[11px] text-white/35">Deflated to base year 1990</p>
                  </div>
                  <span className="rounded-full bg-[rgba(39,176,138,0.12)] px-2 py-0.5 font-mono text-[10px] text-[#27B08A]">
                    Real
                  </span>
                </div>
                <div className="mt-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={realGdpHistory} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="realGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#27B08A" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#27B08A" stopOpacity={0}    />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="year" {...axisStyle} minTickGap={28} />
                      <YAxis {...axisStyle} tickFormatter={(v) => `$${v}B`} />
                      <Tooltip {...chartTooltipStyle} formatter={(v: any) => [`$${v}B`, 'Real GDP']} />
                      <Area type="monotone" dataKey="realGdp" stroke="#27B08A" strokeWidth={1.5} fill="url(#realGrad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="dash-reveal grid grid-cols-1 lg:grid-cols-2 gap-3 pb-6">
              <div className="rounded-2xl border border-white/[0.06] bg-[#0E1017] p-5">
                <p className="text-[13px] font-semibold tracking-tight">Population Growth</p>
                <p className="mt-0.5 text-[11px] text-white/35">Annual % change 1990 – 2023</p>
                <div className="mt-4 h-56">
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
                      <XAxis dataKey="year" {...axisStyle} minTickGap={28} />
                      <YAxis {...axisStyle} tickFormatter={(v) => `${v}%`} />
                      <Tooltip {...chartTooltipStyle} formatter={(v: any) => [`${v}%`, 'Growth']} />
                      <Area type="monotone" dataKey="growth" stroke="#4190CC" strokeWidth={1.5} fill="rgba(65,144,204,0.12)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-[#0E1017] p-5">
                <p className="text-[13px] font-semibold tracking-tight">Key Rates Comparison</p>
                <p className="mt-0.5 text-[11px] text-white/35">Unemployment · Inflation · Renewables %</p>
                <div className="mt-4 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Unemployment', value: latestValues['unemployment'] ?? 0 },
                        { name: 'Inflation',    value: latestValues['inflation']    ?? 0 },
                        { name: 'Renewables',   value: latestValues['renewables']   ?? 0 },
                        { name: 'Edu Spend',    value: latestValues['eduSpend']     ?? 0 },
                        { name: 'Health Spend', value: latestValues['healthSpend']  ?? 0 },
                      ]}
                      margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="name" {...axisStyle} />
                      <YAxis {...axisStyle} tickFormatter={(v) => `${v}%`} />
                      <Tooltip {...chartTooltipStyle} formatter={(v: any) => [`${v}%`]} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#E07B35" fillOpacity={0.7} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================== */}
        {/* RAW DATA TAB VIEW                        */}
        {/* ======================================== */}
        {activeTopTab === 'Raw Data' && (
          <div className="dash-reveal pb-6">
            <div className="rounded-2xl border border-white/[0.06] bg-[#0E1017] p-5 overflow-hidden flex flex-col h-[calc(100vh-140px)]">
              <div className="mb-4">
                <p className="text-[13px] font-semibold tracking-tight">Raw Data Inspector</p>
                <p className="mt-0.5 text-[11px] text-white/35">Direct readout of latest indicator values without abstraction.</p>
              </div>
              
              <div className="flex-1 overflow-auto rounded-xl border border-white/[0.04] bg-[#0a0c10]">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="sticky top-0 bg-[#0E1017] border-b border-white/[0.06] z-10 text-white/40 uppercase tracking-widest text-[10px]">
                    <tr>
                      <th className="px-5 py-3 font-medium">Indicator ID</th>
                      <th className="px-5 py-3 font-medium">Description</th>
                      <th className="px-5 py-3 font-medium">Category</th>
                      <th className="px-5 py-3 font-medium text-right">Latest Value (Unformatted)</th>
                      <th className="px-5 py-3 font-medium">Formatted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.02]">
                    {ALL_INDICATORS.map(ind => {
                      const val = latestValues[ind.key];
                      return (
                        <tr key={ind.key} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-5 py-3 text-brand text-[11px] opacity-80">{ind.key.toUpperCase()}</td>
                          <td className="px-5 py-3 font-sans text-white/80">{ind.label}</td>
                          <td className="px-5 py-3 text-white/40 uppercase text-[9px] tracking-wider">{ind.cat}</td>
                          <td className="px-5 py-3 text-right text-white hover:text-[#E07B35] transition-colors">{val !== null ? val : 'null'}</td>
                          <td className="px-5 py-3 text-[#27B08A]">{val !== null ? ind.fmt(val) : 'N/A'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================== */}
        {/* COMPARE TAB VIEW                         */}
        {/* ======================================== */}
        {activeTopTab === 'Compare' && (
          <div className="dash-reveal pb-6">
            <div className="rounded-2xl border border-white/[0.06] bg-[#0E1017] p-5 overflow-hidden flex flex-col h-[calc(100vh-140px)]">
              <div className="mb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <p className="text-[13px] font-semibold tracking-tight">Cross-Country Comparison</p>
                  <p className="mt-0.5 text-[11px] text-white/35">Compare {countryData?.name?.common} against any other nation for the year {dataYear}.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">Compare vs:</span>
                  <select 
                    value={compareCode}
                    onChange={(e) => setCompareCode(e.target.value)}
                    className="bg-black border border-white/10 text-white rounded-md px-3 py-1.5 text-xs outline-none min-w-[140px] lg:min-w-[180px]"
                  >
                    <option value="" disabled>Select Country</option>
                    {globalCountries?.filter((c: any) => c.cca3 !== selectedCountry).sort((a: any,b: any) => a.name.localeCompare(b.name)).map((c: any) => (
                      <option key={c.cca3} value={c.cca3}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {!compareCode ? (
                <div className="flex-1 flex items-center justify-center rounded-xl border border-white/[0.04] bg-[#0a0c10] border-dashed">
                   <p className="font-mono text-xs uppercase tracking-widest text-white/30">Select a target country above to initiate comparison</p>
                </div>
              ) : loadingCompare ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 rounded-xl border border-white/[0.04] bg-[#0a0c10]">
                   <Loader2 className="h-6 w-6 animate-spin text-[#E07B35]" />
                   <p className="font-mono text-[10px] uppercase tracking-widest text-[#E07B35]/70">Gathering Comparative Metrics...</p>
                </div>
              ) : (
                <div className="flex-1 overflow-auto rounded-xl border border-white/[0.04] bg-[#0a0c10]">
                  <table className="w-full text-left font-mono text-xs">
                    <thead className="sticky top-0 bg-[#0E1017] border-b border-white/[0.06] z-10 text-white/40 uppercase tracking-widest text-[10px]">
                      <tr>
                        <th className="px-5 py-3 font-medium">Metric</th>
                        <th className="px-5 py-3 font-medium w-1/4">Category</th>
                        <th className="px-5 py-3 font-medium text-right w-1/4">
                          <span className="text-[#4190CC]">{countryData?.name?.common}</span>
                        </th>
                        <th className="px-5 py-3 font-medium text-right w-1/4">
                          <span className="text-[#E07B35]">
                             {globalCountries?.find((c: any) => c.cca3 === compareCode)?.name || compareCode}
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                      {ALL_INDICATORS.map(ind => {
                        const val1 = latestValues[ind.key];
                        // If it's a synthetic formula that requires gdp/pop division
                        let val2 = null;
                        if (ind.key === 'gdpPerCapita') {
                           const cGdp = getValueForYear(compareInd?.['gdp'], dataYear);
                           const cPop = getValueForYear(compareInd?.['pop'], dataYear);
                           if (cGdp && cPop) val2 = cGdp / cPop;
                        } else {
                           val2 = getValueForYear(compareInd?.[ind.key], dataYear);
                        }

                        // Determine better value for visual cue if both exist
                        let isV1Better = false;
                        let isV2Better = false;
                        if (val1 !== null && val2 !== null) {
                           // For things like unemployment/poverty/debt, lower is better. Assuming default higher is better for MVP.
                           const reversePolarity = ['unemployment', 'poverty', 'debt', 'inflation', 'infantMortality', 'co2emissions'].includes(ind.key);
                           if (val1 > val2) {
                              isV1Better = !reversePolarity;
                              isV2Better = reversePolarity;
                           } else if (val2 > val1) {
                              isV2Better = !reversePolarity;
                              isV1Better = reversePolarity;
                           }
                        }

                        return (
                          <tr key={ind.key} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-5 py-3 font-sans text-white/80">{ind.label}</td>
                            <td className="px-5 py-3 text-white/40 uppercase text-[9px] tracking-wider">{ind.cat}</td>
                            <td className={`px-5 py-3 text-right ${isV1Better ? 'text-white font-bold' : 'text-white/50'}`}>
                              {val1 !== null && val1 !== undefined ? ind.fmt(val1) : 'N/A'}
                            </td>
                            <td className={`px-5 py-3 text-right ${isV2Better ? 'text-white font-bold' : 'text-white/50'}`}>
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
          </div>
        )}

      </main>
    </div>
  );
};