import { useUIStore } from '../store/uiStore';
import { ArrowLeft, Database, Code, BookOpen, ShieldAlert } from 'lucide-react';

export const ReferencePage = () => {
  const { setMode } = useUIStore();

  return (
    <div className="min-h-screen bg-[#08090C] text-white overflow-y-auto">
      {/* ═══ Header ═══ */}
      <div className="sticky top-0 z-50 bg-[#0E1017]/80 backdrop-blur-xl border-b border-white/[0.06] p-4 lg:p-6 lg:px-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4 lg:gap-0">
        <div>
          <h1 className="font-serif text-[1.5rem] lg:text-[1.8rem] leading-none tracking-tight">
            Legal & <em className="italic text-[#E07B35]">Reference</em>
          </h1>
          <p className="mt-1 font-mono text-[9px] lg:text-[10px] uppercase tracking-[0.08em] text-white/40">
            Transparency • Data Sources • Formulas
          </p>
        </div>
        <button
          onClick={() => setMode('landing')}
          className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-[11px] lg:text-[12px] font-semibold uppercase tracking-[0.05em] text-white/60 transition-all hover:border-white/20 hover:text-white w-fit"
        >
          <ArrowLeft size={14} />
          Back to Globe
        </button>
      </div>

      {/* ═══ Content ═══ */}
      <div className="max-w-5xl mx-auto p-6 lg:py-12 flex flex-col gap-10">
        
        {/* Transparency Statement */}
        <section className="rounded-2xl border border-[rgba(224,123,53,0.2)] bg-[rgba(224,123,53,0.02)] p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert className="text-[#E07B35]" size={24} />
            <h2 className="text-xl font-bold tracking-tight">Transparency & Legal Disclaimer</h2>
          </div>
          <p className="text-white/70 leading-relaxed text-sm lg:text-base">
            NationHub is a simulation and analytics platform. All data presented regarding Gross Domestic Product, Population, Demographics, Emissions, and other indicators are aggregated from public, non-commercial sources for educational and analytical purposes. We do not guarantee real-time accuracy. Policies simulated within this application are purely theoretical constructs based on macroeconomic formulas and do not represent guaranteed real-world outcomes. By using this application, users acknowledge that NationHub and its creators are not liable for decisions made based on this synthesized data.
          </p>
        </section>

        {/* Data Sources */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Database className="text-[#4190CC]" size={24} />
            <h2 className="text-2xl font-serif tracking-tight">Data Sources & Endpoints</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SourceCard 
              name="World Bank Open Data"
              description="Primary source for the 25+ macroeconomic internal indicators (GDP, GINI, Education Spend, etc)."
              endpoint="api.worldbank.org/v2/country/{cc}/indicator/{id}"
            />
            <SourceCard 
              name="REST Countries API"
              description="Geographic and border data, common names, regions, populations, and country flags."
              endpoint="restcountries.com/v3.1/alpha/{cc}"
            />
            <SourceCard 
              name="Our World in Data (OWID)"
              description="Historical climate datasets and long-term emission historical tracking."
              endpoint="github.com/owid/co2-data"
            />
            <SourceCard 
              name="Natural Earth (GeoJSON)"
              description="Resolution geometry defining the 3D globe polygons for raycasting."
              endpoint="Local GeoJSON Asset"
            />
          </div>
        </section>

        {/* Internal APIs */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Code className="text-[#27B08A]" size={24} />
            <h2 className="text-2xl font-serif tracking-tight">Internal API Routes</h2>
          </div>
          <div className="space-y-3">
            <ApiRoute route="GET /api/countries" desc="Fetches all simplified countries for local caching." />
            <ApiRoute route="GET /api/country/:code" desc="Fetches core metadata (flag, region, latlng)." />
            <ApiRoute route="GET /api/country/:code/indicators" desc="Fetches 25+ World Bank indicators in parallel." />
            <ApiRoute route="GET /api/country/:code/analytics" desc="Fetches comprehensive climate and environment data." />
            <ApiRoute route="GET /api/country/:code/neighbours" desc="Fetches bordering countries using the REST Countries borders array." />
            <ApiRoute route="GET /api/simulation/baseline/:code" desc="Fetches the base values for policy simulation." />
          </div>
        </section>

        {/* Formulas */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="text-[#B58AE0]" size={24} />
            <h2 className="text-2xl font-serif tracking-tight">Formulas & Computations</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 text-sm">
            <FormulaCard 
              title="Real GDP (Inflation-Adjusted)"
              formula="Real GDP_t = (Nominal GDP_t / Deflator_t) * 100"
              desc="We calculate the GDP deflator iteratively based on the World Bank YoY Inflation metric (FP.CPI.TOTL.ZG) starting from a base year of 1990."
            />
            <FormulaCard 
              title="Population Growth Rate"
              formula="Growth Rate = ((Pop_t - Pop_{t-1}) / Pop_{t-1}) * 100"
              desc="Calculated per year iteratively based on World Bank absolute total population metric (SP.POP.TOTL)."
            />
            <FormulaCard 
              title="Policy Simulation Effects"
              formula="New Value = Base Value * (1 + Σ (Policy Modifier_i * Intensity_i))"
              desc="Simulation changes are applied linearly where policy impacts stack additively as percentage modifiers against the latest World Bank real value."
            />
          </div>
        </section>

      </div>
    </div>
  );
};

const SourceCard = ({ name, description, endpoint }: { name: string, description: string, endpoint: string }) => (
  <div className="rounded-xl border border-white/[0.06] bg-[#0E1017] p-5 hover:border-white/10 transition-colors">
    <h3 className="font-bold text-lg mb-2">{name}</h3>
    <p className="text-white/60 text-sm mb-4 leading-relaxed">{description}</p>
    <div className="bg-black/50 rounded-lg p-3 font-mono text-[11px] text-[#4190CC] flex items-center gap-2 overflow-x-auto">
      <span className="text-white/30 truncate">{endpoint}</span>
    </div>
  </div>
);

const ApiRoute = ({ route, desc }: { route: string, desc: string }) => {
  const [method, path] = route.split(' ');
  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 rounded-lg border border-white/[0.04] bg-[#0E1017] p-3 text-sm">
      <div className="flex items-center gap-2 min-w-0 lg:min-w-[300px]">
        <span className="font-mono text-[9px] lg:text-[10px] bg-[#27B08A]/10 text-[#27B08A] px-2 py-1 rounded font-bold">{method}</span>
        <span className="font-mono text-[#E07B35] text-[11px] lg:text-[12px] truncate">{path}</span>
      </div>
      <span className="text-white/50 text-xs lg:text-sm">{desc}</span>
    </div>
  );
};

const FormulaCard = ({ title, formula, desc }: { title: string, formula: string, desc: string }) => (
  <div className="rounded-xl border border-white/[0.06] bg-[#0E1017] p-5">
    <h3 className="font-bold text-white mb-3">{title}</h3>
    <div className="bg-black/50 border border-white/5 rounded-lg p-3 font-mono text-[12px] text-[#B58AE0] mb-3 overflow-x-auto">
      {formula}
    </div>
    <p className="text-white/50 text-xs leading-relaxed">{desc}</p>
  </div>
);
