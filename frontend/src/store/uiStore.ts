import { create } from 'zustand';

type ViewState = 'landing' | 'simulation' | 'analytics' | 'reference';

interface UIState {
  currentView: ViewState;
  selectedCountry: string | null;
  isSidebarOpen: boolean;
  setMode: (view: ViewState) => void;
  selectCountry: (countryCode: string | null) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentView: 'landing',
  selectedCountry: null,
  isSidebarOpen: true,
  setMode: (view) => {
    if (view === 'landing') {
      set({ currentView: view, selectedCountry: null });
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      set({ currentView: view });
    }
  },
  selectCountry: (code) => set({ selectedCountry: code }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
