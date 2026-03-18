import { create } from 'zustand';

export interface PolicyState {
  taxRate: number;
  govSpending: number;
  education: number;
  healthcare: number;
  infrastructure: number;
  research: number;
  tradeOpenness: number;
  carbonTax: number;
  renewableInvestment: number;
  industrialRegulation: number;
  ubi: number;
  minimumWage: number;
  immigration: number;
  defense: number;
  spaceProgram: number;
  agriculture: number;
  publicTransport: number;
  housing: number;
  deregulation: number;
  techRegulation: number;
  wealthTax: number;
  foreignAid: number;
  justice: number;
  conservation: number;
  smallBizGrants: number;
}

interface SimulationState {
  policies: PolicyState;
  updatePolicy: (key: keyof PolicyState, value: number) => void;
  resetPolicies: () => void;
}

const defaultPolicies: PolicyState = {
  taxRate: 0,
  govSpending: 0,
  education: 0,
  healthcare: 0,
  infrastructure: 0,
  research: 0,
  tradeOpenness: 0,
  carbonTax: 0,
  renewableInvestment: 0,
  industrialRegulation: 0,
  ubi: 0,
  minimumWage: 0,
  immigration: 0,
  defense: 0,
  spaceProgram: 0,
  agriculture: 0,
  publicTransport: 0,
  housing: 0,
  deregulation: 0,
  techRegulation: 0,
  wealthTax: 0,
  foreignAid: 0,
  justice: 0,
  conservation: 0,
  smallBizGrants: 0,
};

export const useSimulationStore = create<SimulationState>((set) => ({
  policies: { ...defaultPolicies },
  updatePolicy: (key, value) => 
    set((state) => ({ policies: { ...state.policies, [key]: value } })),
  resetPolicies: () => set({ policies: { ...defaultPolicies } }),
}));
