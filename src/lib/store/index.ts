import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  UserConfigState,
  GenerationState,
  GenerationStep,
  ConfigurationSummary,
  DownloadStatus,
  UIState,
  AppError,
  Notification,
  HardwareConfig,
  OpenCoreConfig,
} from '@/types';
import { OPENCORE_VERSIONS } from '@/lib/version';

// Main App Store
interface AppStore {
  // User Configuration
  userConfig: UserConfigState;
  setHardwareConfig: (config: Partial<HardwareConfig>) => void;
  setOpenCoreConfig: (config: Partial<OpenCoreConfig>) => void;
  setSelectedKexts: (kexts: string[]) => void;
  setSelectedTools: (tools: string[]) => void;
  setSelectedDrivers: (drivers: string[]) => void;
  setPreferences: (preferences: Partial<UserConfigState['preferences']>) => void;
  resetUserConfig: () => void;

  // Generation State
  generationState: GenerationState;
  generationSteps: GenerationStep[];
  configurationSummary: ConfigurationSummary | null;
  downloadStatus: Record<string, DownloadStatus>;
  downloadedFiles: Record<string, Uint8Array>;
  setGenerationState: (state: GenerationState) => void;
  setGenerationSteps: (steps: GenerationStep[]) => void;
  updateGenerationStep: (stepId: string, updates: Partial<GenerationStep>) => void;
  setConfigurationSummary: (summary: ConfigurationSummary | null) => void;
  updateDownloadStatus: (itemId: string, status: Partial<DownloadStatus>) => void;
  setDownloadedFile: (itemId: string, data: Uint8Array) => void;
  resetGeneration: () => void;

  // UI State
  ui: UIState;
  setSidebarOpen: (open: boolean) => void;
  setCurrentStep: (step: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: AppError | null) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  // Computed Properties
  getTotalDownloadProgress: () => number;
  getFailedDownloads: () => DownloadStatus[];
  getCompletedDownloads: () => DownloadStatus[];
  isGenerationInProgress: () => boolean;
  canProceedToNextStep: () => boolean;
}

const initialUserConfig: UserConfigState = {
  hardware: {},
  opencore: {},
  selectedKexts: [],
  selectedTools: [],
  selectedDrivers: [],
  preferences: {
    language: 'en',
    theme: 'system',
    advancedMode: false,
  },
};

const initialUIState: UIState = {
  sidebarOpen: true,
  currentStep: 0,
  loading: false,
  error: null,
  notifications: [],
};

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        // User Configuration
        userConfig: initialUserConfig,
        setHardwareConfig: (config: Partial<HardwareConfig>) =>
          set((state) => ({
            userConfig: {
              ...state.userConfig,
              hardware: { ...state.userConfig.hardware, ...config },
            },
          })),
        setOpenCoreConfig: (config: Partial<OpenCoreConfig>) =>
          set((state) => ({
            userConfig: {
              ...state.userConfig,
              opencore: { ...state.userConfig.opencore, ...config },
            },
          })),
        setSelectedKexts: (kexts: string[]) =>
          set((state) => ({
            userConfig: { ...state.userConfig, selectedKexts: kexts },
          })),
        setSelectedTools: (tools: string[]) =>
          set((state) => ({
            userConfig: { ...state.userConfig, selectedTools: tools },
          })),
        setSelectedDrivers: (drivers: string[]) =>
          set((state) => ({
            userConfig: { ...state.userConfig, selectedDrivers: drivers },
          })),
        setPreferences: (preferences: Partial<UserConfigState['preferences']>) =>
          set((state) => ({
            userConfig: {
              ...state.userConfig,
              preferences: { ...state.userConfig.preferences, ...preferences },
            },
          })),
        resetUserConfig: () => set({ userConfig: initialUserConfig }),

        // Generation State
        generationState: 'idle' as GenerationState,
        generationSteps: [],
        configurationSummary: null,
        downloadStatus: {},
        downloadedFiles: {},
        setGenerationState: (state: GenerationState) => set({ generationState: state }),
        setGenerationSteps: (steps: GenerationStep[]) => set({ generationSteps: steps }),
        updateGenerationStep: (stepId: string, updates: Partial<GenerationStep>) =>
          set((state) => ({
            generationSteps: state.generationSteps.map((step) =>
              step.id === stepId ? { ...step, ...updates } : step
            ),
          })),
        setConfigurationSummary: (summary: ConfigurationSummary | null) => set({ configurationSummary: summary }),
        updateDownloadStatus: (itemId: string, status: Partial<DownloadStatus>) =>
          set((state) => ({
            downloadStatus: {
              ...state.downloadStatus,
              [itemId]: { ...state.downloadStatus[itemId], ...status },
            },
          })),
        setDownloadedFile: (itemId: string, data: Uint8Array) =>
          set((state) => ({
            downloadedFiles: { ...state.downloadedFiles, [itemId]: data },
          })),
        resetGeneration: () =>
          set({
            generationState: 'idle' as GenerationState,
            generationSteps: [],
            configurationSummary: null,
            downloadStatus: {},
            downloadedFiles: {},
          }),

        // UI State
        ui: initialUIState,
        setSidebarOpen: (open: boolean) =>
          set((state) => ({ ui: { ...state.ui, sidebarOpen: open } })),
        setCurrentStep: (step: number) =>
          set((state) => ({ ui: { ...state.ui, currentStep: step } })),
        setLoading: (loading: boolean) =>
          set((state) => ({ ui: { ...state.ui, loading } })),
        setError: (error: AppError | null) =>
          set((state) => ({ ui: { ...state.ui, error } })),
        addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) =>
          set((state) => ({
            ui: {
              ...state.ui,
              notifications: [
                ...state.ui.notifications,
                {
                  ...notification,
                  id: Math.random().toString(36).substr(2, 9),
                  timestamp: Date.now(),
                },
              ],
            },
          })),
        removeNotification: (id: string) =>
          set((state) => ({
            ui: {
              ...state.ui,
              notifications: state.ui.notifications.filter((n) => n.id !== id),
            },
          })),
        clearNotifications: () =>
          set((state) => ({ ui: { ...state.ui, notifications: [] } })),

        // Computed Properties
        getTotalDownloadProgress: () => {
          const { downloadStatus } = get();
          const statuses = Object.values(downloadStatus);
          if (statuses.length === 0) return 0;
          
          const totalProgress = statuses.reduce((sum, status) => sum + status.progress, 0);
          return totalProgress / statuses.length;
        },
        getFailedDownloads: () => {
          const { downloadStatus } = get();
          return Object.values(downloadStatus).filter((status) => status.status === 'error');
        },
        getCompletedDownloads: () => {
          const { downloadStatus } = get();
          return Object.values(downloadStatus).filter((status) => status.status === 'completed');
        },
        isGenerationInProgress: () => {
          const { generationState } = get();
          return ['configuring', 'confirming', 'downloading', 'packaging'].includes(generationState);
        },
        canProceedToNextStep: () => {
          const { generationSteps } = get();
          const currentStep = generationSteps.find((step) => step.status === 'in_progress');
          if (!currentStep) return true;
          
          const currentIndex = generationSteps.findIndex((step) => step.id === currentStep.id);
          const previousSteps = generationSteps.slice(0, currentIndex);
          return previousSteps.every((step) => step.status === 'completed');
        },
      }),
      {
        name: 'opencore-initializr-store',
        partialize: (state) => ({
          userConfig: state.userConfig,
          ui: {
            sidebarOpen: state.ui.sidebarOpen,
            currentStep: state.ui.currentStep,
          },
        }),
      }
    ),
    {
      name: 'OpenCore Initializr Store',
    }
  )
);

// Version Store
interface VersionStore {
  versions: Record<string, any>;
  lastUpdated: number;
  loading: boolean;
  error: string | null;
  fetchVersions: () => Promise<void>;
  getLatestVersion: (name: string) => string | null;
  isOutdated: () => boolean;
}

export const useVersionStore = create<VersionStore>()(
  devtools(
    persist(
      (set, get) => ({
        versions: {},
        lastUpdated: 0,
        loading: false,
        error: null,
        fetchVersions: async () => {
          set({ loading: true, error: null });
          try {
            // Use static data for now
            const versionsMap: Record<string, any> = {};
            // Assuming the first one is the latest stable
            const latestOpenCore = OPENCORE_VERSIONS.find(v => !v.prerelease) || OPENCORE_VERSIONS[0];
            if (latestOpenCore) {
                versionsMap['OpenCore'] = latestOpenCore;
            }
            
            set({ versions: versionsMap, lastUpdated: Date.now(), loading: false });
          } catch (error) {
            set({ error: (error as Error).message, loading: false });
          }
        },

        getLatestVersion: (name: string) => {
          const { versions } = get();
          return versions[name]?.version || null;
        },
        isOutdated: () => {
          const { lastUpdated } = get();
          const oneHour = 60 * 60 * 1000;
          return Date.now() - lastUpdated > oneHour;
        },
      }),
      {
        name: 'opencore-versions-store',
        partialize: (state) => ({
          versions: state.versions,
          lastUpdated: state.lastUpdated,
        }),
      }
    ),
    {
      name: 'OpenCore Versions Store',
    }
  )
);

// Theme Store
interface ThemeStore {
  theme: 'light' | 'dark' | 'system';
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  devtools(
    persist(
      (set, get) => ({
        theme: 'system' as const,
        resolvedTheme: 'light' as const,
        setTheme: (theme: 'light' | 'dark' | 'system') => {
          set({ theme });
          // Update resolved theme based on system preference
          if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
              ? 'dark'
              : 'light';
            set({ resolvedTheme: systemTheme });
          } else {
            set({ resolvedTheme: theme });
          }
        },
        toggleTheme: () => {
          const { theme } = get();
          const newTheme = theme === 'light' ? 'dark' : 'light';
          get().setTheme(newTheme);
        },
      }),
      {
        name: 'opencore-theme-store',
      }
    ),
    {
      name: 'OpenCore Theme Store',
    }
  )
);