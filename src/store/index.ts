import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  HardwareConfig,
  OpenCoreConfig,
  UserConfigState,
  GenerationState,
  GenerationStep,
  DownloadItem,
  AppError,
  Notification,
  UIState
} from '../types';
import { i18nUtils } from '../lib/i18n';

// Hardware Configuration Store
interface HardwareStore {
  config: Partial<HardwareConfig>;
  isValid: boolean;
  errors: Record<string, string>;
  
  // Actions
  updateConfig: (config: Partial<HardwareConfig>) => void;
  resetConfig: () => void;
  validateConfig: () => boolean;
  setError: (field: string, error: string) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
}

export const useHardwareStore = create<HardwareStore>()(immer((set, get) => ({
  config: {},
  isValid: false,
  errors: {},

  updateConfig: (newConfig) => set((state) => {
    state.config = { ...state.config, ...newConfig };
    // Auto-validate after update
    const isValid = get().validateConfig();
    state.isValid = isValid;
  }),

  resetConfig: () => set((state) => {
    state.config = {};
    state.isValid = false;
    state.errors = {};
  }),

  validateConfig: () => {
    const { config } = get();
    const errors: Record<string, string> = {};
    
    // Basic validation
    if (!config.cpu?.brand) {
      errors.cpu = 'CPU brand is required';
    }
    if (!config.motherboard?.brand || !config.motherboard?.model) {
      errors.motherboard = 'Motherboard information is required';
    }
    if (!config.memory?.size || config.memory.size <= 0) {
      errors.memory = 'Memory size is required';
    }
    
    set((state) => {
      state.errors = errors;
    });
    
    return Object.keys(errors).length === 0;
  },

  setError: (field, error) => set((state) => {
    state.errors[field] = error;
  }),

  clearError: (field) => set((state) => {
    delete state.errors[field];
  }),

  clearAllErrors: () => set((state) => {
    state.errors = {};
  })
})));

// OpenCore Configuration Store
interface OpenCoreStore {
  config: Partial<OpenCoreConfig>;
  selectedKexts: string[];
  selectedTools: string[];
  selectedDrivers: string[];
  isValid: boolean;
  
  // Actions
  updateConfig: (config: Partial<OpenCoreConfig>) => void;
  resetConfig: () => void;
  addKext: (kext: string) => void;
  removeKext: (kext: string) => void;
  toggleKext: (kext: string) => void;
  addTool: (tool: string) => void;
  removeTool: (tool: string) => void;
  toggleTool: (tool: string) => void;
  addDriver: (driver: string) => void;
  removeDriver: (driver: string) => void;
  toggleDriver: (driver: string) => void;
  validateConfig: () => boolean;
}

export const useOpenCoreStore = create<OpenCoreStore>()(immer((set, get) => ({
  config: {},
  selectedKexts: [],
  selectedTools: [],
  selectedDrivers: [],
  isValid: false,

  updateConfig: (newConfig) => set((state) => {
    state.config = { ...state.config, ...newConfig };
    state.isValid = get().validateConfig();
  }),

  resetConfig: () => set((state) => {
    state.config = {};
    state.selectedKexts = [];
    state.selectedTools = [];
    state.selectedDrivers = [];
    state.isValid = false;
  }),

  addKext: (kext) => set((state) => {
    if (!state.selectedKexts.includes(kext)) {
      state.selectedKexts.push(kext);
    }
  }),

  removeKext: (kext) => set((state) => {
    state.selectedKexts = state.selectedKexts.filter((k: string) => k !== kext);
  }),

  toggleKext: (kext) => set((state) => {
    if (state.selectedKexts.includes(kext)) {
      state.selectedKexts = state.selectedKexts.filter((k: string) => k !== kext);
    } else {
      state.selectedKexts.push(kext);
    }
  }),

  addTool: (tool) => set((state) => {
    if (!state.selectedTools.includes(tool)) {
      state.selectedTools.push(tool);
    }
  }),

  removeTool: (tool) => set((state) => {
    state.selectedTools = state.selectedTools.filter((t: string) => t !== tool);
  }),

  toggleTool: (tool) => set((state) => {
    if (state.selectedTools.includes(tool)) {
      state.selectedTools = state.selectedTools.filter((t: string) => t !== tool);
    } else {
      state.selectedTools.push(tool);
    }
  }),

  addDriver: (driver) => set((state) => {
    if (!state.selectedDrivers.includes(driver)) {
      state.selectedDrivers.push(driver);
    }
  }),

  removeDriver: (driver) => set((state) => {
    state.selectedDrivers = state.selectedDrivers.filter((d: string) => d !== driver);
  }),

  toggleDriver: (driver) => set((state) => {
    if (state.selectedDrivers.includes(driver)) {
      state.selectedDrivers = state.selectedDrivers.filter((d: string) => d !== driver);
    } else {
      state.selectedDrivers.push(driver);
    }
  }),

  validateConfig: () => {
    const { config } = get();
    // Basic validation - can be extended
    return !!config.version;
  }
})));

// Generation Process Store
interface GenerationStore {
  state: GenerationState;
  steps: GenerationStep[];
  currentStep: number;
  downloads: DownloadItem[];
  progress: number;
  error: AppError | null;
  
  // Actions
  setState: (state: GenerationState) => void;
  setSteps: (steps: GenerationStep[]) => void;
  updateStep: (stepId: string, updates: Partial<GenerationStep>) => void;
  nextStep: () => void;
  previousStep: () => void;
  setCurrentStep: (step: number) => void;
  addDownload: (download: DownloadItem) => void;
  updateDownload: (id: string, updates: Partial<DownloadItem>) => void;
  removeDownload: (id: string) => void;
  setProgress: (progress: number) => void;
  setError: (error: AppError | null) => void;
  reset: () => void;
}

export const useGenerationStore = create<GenerationStore>()(immer((set, get) => ({
  state: 'idle',
  steps: [],
  currentStep: 0,
  downloads: [],
  progress: 0,
  error: null,

  setState: (newState) => set((state) => {
    state.state = newState;
  }),

  setSteps: (steps) => set((state) => {
    state.steps = steps;
  }),

  updateStep: (stepId, updates) => set((state) => {
    const stepIndex = state.steps.findIndex((s: GenerationStep) => s.id === stepId);
    if (stepIndex !== -1) {
      state.steps[stepIndex] = { ...state.steps[stepIndex], ...updates };
    }
  }),

  nextStep: () => set((state) => {
    if (state.currentStep < state.steps.length - 1) {
      state.currentStep += 1;
    }
  }),

  previousStep: () => set((state) => {
    if (state.currentStep > 0) {
      state.currentStep -= 1;
    }
  }),

  setCurrentStep: (step) => set((state) => {
    state.currentStep = Math.max(0, Math.min(step, state.steps.length - 1));
  }),

  addDownload: (download) => set((state) => {
    state.downloads.push(download);
  }),

  updateDownload: (id, updates) => set((state) => {
    const downloadIndex = state.downloads.findIndex((d: DownloadItem) => d.id === id);
    if (downloadIndex !== -1) {
      state.downloads[downloadIndex] = { ...state.downloads[downloadIndex], ...updates };
    }
  }),

  removeDownload: (id) => set((state) => {
    state.downloads = state.downloads.filter((d: DownloadItem) => d.id !== id);
  }),

  setProgress: (progress) => set((state) => {
    state.progress = Math.max(0, Math.min(100, progress));
  }),

  setError: (error) => set((state) => {
    state.error = error;
  }),

  reset: () => set((state) => {
    state.state = 'idle';
    state.steps = [];
    state.currentStep = 0;
    state.downloads = [];
    state.progress = 0;
    state.error = null;
  })
})));

// UI State Store
interface UIStore extends UIState {
  // Actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setCurrentStep: (step: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: AppError | null) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIStore>()(immer((set, get) => ({
  sidebarOpen: true,
  currentStep: 0,
  loading: false,
  error: null,
  notifications: [],

  setSidebarOpen: (open) => set((state) => {
    state.sidebarOpen = open;
  }),

  toggleSidebar: () => set((state) => {
    state.sidebarOpen = !state.sidebarOpen;
  }),

  setCurrentStep: (step) => set((state) => {
    state.currentStep = step;
  }),

  setLoading: (loading) => set((state) => {
    state.loading = loading;
  }),

  setError: (error) => set((state) => {
    state.error = error;
  }),

  addNotification: (notification) => set((state) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random()}`,
      timestamp: Date.now()
    };
    state.notifications.push(newNotification);
    
    // Auto-remove notification after duration
    if (notification.autoClose !== false) {
      const duration = notification.duration || 5000;
      setTimeout(() => {
        get().removeNotification(newNotification.id);
      }, duration);
    }
  }),

  removeNotification: (id) => set((state) => {
    state.notifications = state.notifications.filter((n: Notification) => n.id !== id);
  }),

  clearNotifications: () => set((state) => {
    state.notifications = [];
  })
})));

// User Preferences Store (with persistence)
interface PreferencesStore {
  language: string;
  theme: 'light' | 'dark' | 'system';
  advancedMode: boolean;
  autoSave: boolean;
  
  // Actions
  setLanguage: (language: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setAdvancedMode: (advanced: boolean) => void;
  setAutoSave: (autoSave: boolean) => void;
  reset: () => void;
}

export const usePreferencesStore = create<PreferencesStore>()(persist(
  immer((set) => ({
    language: i18nUtils.getBrowserLanguage(),
    theme: 'system',
    advancedMode: false,
    autoSave: true,

    setLanguage: (language) => set((state) => {
      state.language = language;
      // Also update i18n
      i18nUtils.changeLanguage(language as any);
    }),

    setTheme: (theme) => set((state) => {
      state.theme = theme;
    }),

    setAdvancedMode: (advanced) => set((state) => {
      state.advancedMode = advanced;
    }),

    setAutoSave: (autoSave) => set((state) => {
      state.autoSave = autoSave;
    }),

    reset: () => set((state) => {
      state.language = i18nUtils.getBrowserLanguage();
      state.theme = 'system';
      state.advancedMode = false;
      state.autoSave = true;
    })
  })),
  {
    name: 'opencore-preferences',
    storage: createJSONStorage(() => localStorage),
  }
));

// Combined store hook for convenience
export const useAppStore = () => {
  const hardware = useHardwareStore();
  const opencore = useOpenCoreStore();
  const generation = useGenerationStore();
  const ui = useUIStore();
  const preferences = usePreferencesStore();

  return {
    hardware,
    opencore,
    generation,
    ui,
    preferences
  };
};

// Export individual stores
export {
  useHardwareStore as hardware,
  useOpenCoreStore as opencore,
  useGenerationStore as generation,
  useUIStore as ui,
  usePreferencesStore as preferences
};