import { create } from 'zustand';

type ViewState = 'landing' | 'simulation' | 'analytics' | 'reference' | 'donate';

interface UIState {
  currentView: ViewState;
  selectedCountry: string | null;
  isSidebarOpen: boolean;
  isPolicyPanelOpen: boolean;
  setMode: (view: ViewState) => void;
  selectCountry: (countryCode: string | null) => void;
  toggleSidebar: () => void;
  togglePolicyPanel: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentView: 'landing',
  selectedCountry: null,
  isSidebarOpen: true,
  isPolicyPanelOpen: false,
  setMode: (view) => {
    if (view === 'landing') {
      set({ currentView: view, selectedCountry: null, isPolicyPanelOpen: false });
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      set({ currentView: view });
    }
  },
  selectCountry: (code) => set({ selectedCountry: code }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  togglePolicyPanel: () => set((state) => ({ isPolicyPanelOpen: !state.isPolicyPanelOpen })),
}));
