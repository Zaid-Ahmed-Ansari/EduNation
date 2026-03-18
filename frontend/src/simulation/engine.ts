import { type PolicyState } from '../store/simulationStore';

/**
 * NationHub Simulation Engine
 * 
 * Computes projected indicators over a 10 year timeline based on a baseline 
 * and varying 25 policy bounds (0-100).
 */

export interface BaselineData {
  gdp: number; // in USD
  pop: number; // population
  lifeExp: number; // years
  co2: number; // emissions per capita
  happiness?: number; // 0-10 index
  year?: number; // Starting year
}

export interface ProjectionTimeline {
  yearOffset: number;
  year: number;
  gdp: number;
  pop: number;
  lifeExp: number;
  co2: number;
  happiness: number;
}

export const runSimulation = (
  baseline: BaselineData,
  policies: PolicyState,
  yearsToProject: number = 10
): ProjectionTimeline[] => {
  const projections: ProjectionTimeline[] = [];

  // Policy normalized deviations (-1 to 1 around the default 0 mark)
  const norm = (val: number) => val / 50;

  // Derive coefficients
  const dGov = norm(policies.govSpending); 
  const dTax = norm(policies.taxRate);      
  const dEdu = norm(policies.education);
  const dHealth = norm(policies.healthcare);
  const dInfra = norm(policies.infrastructure);
  const dRnd = norm(policies.research);
  const dTrade = norm(policies.tradeOpenness);
  const dCarbonTax = norm(policies.carbonTax);
  const dRenewable = norm(policies.renewableInvestment);
  const dRegs = norm(policies.industrialRegulation);
  const dUbi = norm(policies.ubi);
  const dMinWage = norm(policies.minimumWage);
  const dImmig = norm(policies.immigration);
  const dDefense = norm(policies.defense);
  const dSpace = norm(policies.spaceProgram);
  const dAgri = norm(policies.agriculture);
  const dTransport = norm(policies.publicTransport);
  const dHousing = norm(policies.housing);
  const dDereg = norm(policies.deregulation);
  const dTechReg = norm(policies.techRegulation);
  const dWealthTax = norm(policies.wealthTax);
  const dAid = norm(policies.foreignAid);
  const dJustice = norm(policies.justice);
  const dConserv = norm(policies.conservation);
  const dSmallBiz = norm(policies.smallBizGrants);

  let currentGDP = baseline.gdp || 1000000000;
  let currentLifeExp = baseline.lifeExp || 70;
  let currentCo2 = baseline.co2 || 5;
  let currentPop = baseline.pop || 50000000;
  // Satisfy TS compiler
  currentPop = currentPop;
  
  // Baseline synthetic happiness if not provided
  const baseGdpCapita = currentGDP / currentPop;
  const hGdpComp = Math.max(0, Math.log10(baseGdpCapita || 1000) * 1.2);
  const hLifeComp = currentLifeExp / 25;
  let currentHappiness = baseline.happiness || Math.min(10, Math.max(2, hGdpComp + hLifeComp));
  
  const baseYear = baseline.year || 2022;

  projections.push({
    yearOffset: 0,
    year: baseYear,
    gdp: currentGDP,
    pop: currentPop,
    lifeExp: currentLifeExp,
    co2: currentCo2,
    happiness: currentHappiness,
  });

  for (let y = 1; y <= yearsToProject; y++) {
    // 1. GDP Model: Base growth + 25 policy impacts
    // We remove the default baseGrowth so that at 0 policy deviation, growth is strictly 0%.
    const growthMod = 
      (dInfra * 0.015) + 
      (dRnd * 0.02) + 
      (dTrade * 0.01) + 
      (dGov * 0.01) - 
      (dTax * 0.015) - 
      (dRegs * 0.005) +
      (dDereg * 0.01) +
      (dImmig * 0.005) - // Immigrants expand labor pool
      (dDefense * 0.005) + // Defense is sunk cost long term
      (dSpace * 0.002) + // Space yields tech dividends
      (dSmallBiz * 0.008) -
      (dWealthTax * 0.01) + // Wealth tax slows capital investment
      (dUbi * 0.005) + // UBI boosts consumer velocity initially
      (dMinWage * 0.002) + // Higher wages increase velocity
      (dAid * 0.001) - // Negligible drag on total GDP
      (dTechReg * 0.003); // Tech regulation slows monopoly growth but increases competition
      
    currentGDP *= (1 + growthMod);

    // 2. HDI/Life Expectancy Model
    const lifeExpGrowth = 
      (dHealth * 0.15) + 
      (dEdu * 0.05) + 
      (dHousing * 0.05) + 
      (dTransport * 0.02) + 
      (dJustice * 0.01) + 
      (dUbi * 0.05) + 
      ((currentGDP / (baseline.gdp || 1) - 1) * 0.05);

    currentLifeExp = Math.min(88, currentLifeExp + lifeExpGrowth);

    // 3. Environmental Model
    const econScale = (currentGDP / (baseline.gdp || 1)) - 1; 
    const co2Reduction = 
      (dRenewable * 0.15) + 
      (dCarbonTax * 0.1) + 
      (dRegs * 0.05) +
      (dTransport * 0.05) +
      (dConserv * 0.08) -
      (dAgri * 0.02) - // High agri means methane/land clearing
      (dDereg * 0.05); // Deregulation increases emissions
    
    currentCo2 = currentCo2 * (1 + (econScale * 0.05)) * (1 - co2Reduction * 0.1);
    currentCo2 = Math.max(0.1, currentCo2); // Floor
    
    // 5. Happiness Model
    const gdppCapita = currentGDP / currentPop;
    const gdpHap = Math.max(0, Math.log10(gdppCapita || 1000) * 1.2);
    const lifeExpHap = currentLifeExp / 25;
    
    // Policy specific happiness levers
    const policyHap = 
      (dUbi * 0.8) + 
      (dMinWage * 0.5) + 
      (dHealth * 0.5) + 
      (dHousing * 0.4) + 
      (dEdu * 0.3) +
      (dConserv * 0.2) - 
      (dTax * 0.3) - 
      (dWealthTax * 0.1); // minor anger from the ultra-rich
      
    currentHappiness = Math.min(10, Math.max(0, gdpHap + lifeExpHap + policyHap));

    projections.push({
      yearOffset: y,
      year: baseYear + y,
      gdp: currentGDP,
      pop: currentPop,
      lifeExp: currentLifeExp,
      co2: currentCo2,
      happiness: currentHappiness,
    });
  }

  return projections;
};
