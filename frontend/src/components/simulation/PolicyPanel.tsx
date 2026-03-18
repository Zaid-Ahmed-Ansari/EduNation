import { useState } from 'react';
import { useSimulationStore, type PolicyState } from '../../store/simulationStore';
import { Slider } from '../ui/Slider';
import { RotateCcw, ChevronDown, Banknote, Cpu, HeartPulse, Leaf, Globe2 } from 'lucide-react';

interface PolicyCategory {
  title: string;
  icon: React.ElementType;
  keys: Array<{ key: keyof PolicyState; label: string }>;
}

export const PolicyPanel = () => {
  const { policies, updatePolicy, resetPolicies } = useSimulationStore();
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    'Economy & Taxation': true,
  });

  const categories: PolicyCategory[] = [
    {
      title: 'Economy & Taxation',
      icon: Banknote,
      keys: [
        { key: 'taxRate', label: 'Income & Corporate Tax' },
        { key: 'wealthTax', label: 'Wealth Tax' },
        { key: 'govSpending', label: 'Government Spending' },
        { key: 'tradeOpenness', label: 'Trade Openness' },
        { key: 'deregulation', label: 'Financial Deregulation' },
        { key: 'smallBizGrants', label: 'Small Business Grants' },
      ]
    },
    {
      title: 'Infrastructure & Tech',
      icon: Cpu,
      keys: [
        { key: 'infrastructure', label: 'Infrastructure Investment' },
        { key: 'publicTransport', label: 'Public Transport' },
        { key: 'research', label: 'R&D Funding' },
        { key: 'spaceProgram', label: 'Space Program' },
        { key: 'techRegulation', label: 'Tech Monopolies Regulation' },
      ]
    },
    {
      title: 'Welfare & Society',
      icon: HeartPulse,
      keys: [
        { key: 'healthcare', label: 'Healthcare Spending' },
        { key: 'education', label: 'Education Spending' },
        { key: 'ubi', label: 'Universal Basic Income' },
        { key: 'minimumWage', label: 'Minimum Wage Level' },
        { key: 'housing', label: 'Housing Subsidies' },
        { key: 'justice', label: 'Criminal Justice Funding' },
      ]
    },
    {
      title: 'Environment & Earth',
      icon: Leaf,
      keys: [
        { key: 'carbonTax', label: 'Carbon Tax' },
        { key: 'renewableInvestment', label: 'Renewables Investment' },
        { key: 'industrialRegulation', label: 'Industrial Emissions Regs' },
        { key: 'conservation', label: 'National Parks & Conservation' },
        { key: 'agriculture', label: 'Agricultural Subsidies' },
      ]
    },
    {
      title: 'Foreign & Defense',
      icon: Globe2,
      keys: [
        { key: 'defense', label: 'Defense Spending' },
        { key: 'immigration', label: 'Immigration Quotas' },
        { key: 'foreignAid', label: 'Foreign Aid' },
      ]
    }
  ];

  const toggleCategory = (title: string) => {
    setOpenCategories(prev => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <div className="flex h-full w-[400px] flex-col bg-[#0E1017] text-white overflow-hidden">
      {/* ── Header ── */}
      <div className="flex-shrink-0 border-b border-white/[0.06] p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-serif text-[1.4rem] leading-none tracking-tight">
              Policy <em className="italic text-[#E07B35]">Engine</em>
            </h2>
            <p className="mt-1 text-[11px] leading-relaxed text-white/40 max-w-[240px]">
              Adjust parameters to simulate 10-year horizon impacts on GDP, population, and emissions.
            </p>
          </div>
          <button
            onClick={resetPolicies}
            title="Reset to Defaults"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-[#141720] text-white/40 transition-all hover:border-[rgba(224,123,53,0.3)] hover:bg-[rgba(224,123,53,0.1)] hover:text-[#E07B35]"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* ── Scrollable Parameters List ── */}
      <div className="flex-1 overflow-y-auto px-5 py-6 scrollbar-thin scrollbar-thumb-white/10">
        <div className="flex flex-col gap-3 pb-8">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isOpen = openCategories[cat.title];
            return (
              <div 
                key={cat.title} 
                className={`flex flex-col overflow-hidden rounded-xl border transition-colors duration-300
                  ${isOpen ? 'border-white/[0.08] bg-[#141720]' : 'border-white/[0.04] bg-[#0E1017]/50 hover:border-white/10'}
                `}
              >
                <button
                  className="flex w-full items-center justify-between p-4 text-left focus:outline-none"
                  onClick={() => toggleCategory(cat.title)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors
                      ${isOpen ? 'bg-[rgba(224,123,53,0.15)] text-[#E07B35]' : 'bg-white/[0.04] text-white/40'}
                    `}>
                      <Icon size={14} />
                    </div>
                    <span className={`text-[12px] font-semibold tracking-wide transition-colors ${isOpen ? 'text-white' : 'text-white/60'}`}>
                      {cat.title}
                    </span>
                  </div>
                  <div className={`text-white/30 transition-transform duration-300 ${isOpen ? 'rotate-180 text-white/60' : ''}`}>
                    <ChevronDown size={14} />
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-white/[0.04] bg-[#0c0e14] p-5">
                    <div className="flex flex-col gap-6">
                      {cat.keys.map(({ key, label }) => (
                        <Slider
                          key={key}
                          label={label}
                          value={policies[key]}
                          min={-50}
                          max={50}
                          onChange={(val) => updatePolicy(key, val)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
