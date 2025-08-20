// Hardware Configuration Types
export interface HardwareConfig {
  cpu: {
    brand: 'Intel' | 'AMD';
    generation?: string;
    model?: string;
    architecture: 'x86_64' | 'arm64';
  };
  gpu: {
    integrated?: {
      brand: 'Intel' | 'AMD';
      model: string;
    };
    discrete?: {
      brand: 'NVIDIA' | 'AMD';
      model: string;
    };
  };
  motherboard: {
    brand: string;
    model: string;
    chipset?: string;
  };
  memory: {
    size: number; // in GB
    type: 'DDR3' | 'DDR4' | 'DDR5';
    speed?: number;
  };
  storage: {
    type: 'SATA' | 'NVMe' | 'Mixed';
    drives: Array<{
      type: 'SSD' | 'HDD' | 'NVMe';
      size: number; // in GB
      model?: string;
    }>;
  };
  network: {
    ethernet?: {
      brand: string;
      model: string;
    };
    wifi?: {
      brand: string;
      model: string;
    };
    bluetooth?: {
      version: string;
    };
  };
  audio: {
    codec: string;
    layout?: number;
  };
}

// Driver Information
export interface DriverInfo {
  Arguments: string;
  Comment: string;
  Enabled: boolean;
  LoadEarly: boolean;
  Path: string;
}

// Tool Information
export interface ToolInfo {
  Arguments: string;
  Comment: string;
  Enabled: boolean;
  Flavour: string;
  FullNvramAccess: boolean;
  Name: string;
  Path: string;
  RealPath: boolean;
  TextMode: boolean;
}

// OpenCore Configuration Types
export interface OpenCoreConfig {
  version: string;
  ACPI: {
    Add: Array<{
      Enabled: boolean;
      Path: string;
      Comment: string;
    }>;
    Delete: Array<{
      Enabled: boolean;
      TableSignature: string;
      Comment: string;
    }>;
    Patch: Array<{
      Enabled: boolean;
      Comment: string;
      Find: string;
      Replace: string;
    }>;
    Quirks: {
      FadtEnableReset: boolean;
      NormalizeHeaders: boolean;
      RebaseRegions: boolean;
      ResetHwSig: boolean;
      ResetLogoStatus: boolean;
      SyncTableIds: boolean;
    };
  };
  Booter: {
    MmioWhitelist: Array<{
      Enabled: boolean;
      Address: string;
      Comment: string;
    }>;
    Patch: Array<{
      Enabled: boolean;
      Arch: string;
      Identifier: string;
      Find: string;
      Replace: string;
      Comment: string;
    }>;
    Quirks: {
      AllowRelocationBlock: boolean;
      AvoidRuntimeDefrag: boolean;
      DevirtualiseMmio: boolean;
      DisableSingleUser: boolean;
      DisableVariableWrite: boolean;
      DiscardHibernateMap: boolean;
      EnableSafeModeSlide: boolean;
      EnableWriteUnprotector: boolean;
      ForceBooterSignature: boolean;
      ForceExitBootServices: boolean;
      ProtectMemoryRegions: boolean;
      ProtectSecureBoot: boolean;
      ProtectUefiServices: boolean;
      ProvideCustomSlide: boolean;
      ProvideMaxSlide: number;
      RebuildAppleMemoryMap: boolean;
      ResizeAppleGpuBars: number;
      SetupVirtualMap: boolean;
      SignalAppleOS: boolean;
      SyncRuntimePermissions: boolean;
    };
  };
  DeviceProperties: {
    Add: Record<string, Record<string, any>>;
    Delete: Record<string, string[]>;
  };
  Kernel: {
    Add: Array<{
      Enabled: boolean;
      BundlePath: string;
      ExecutablePath: string;
      PlistPath: string;
      Arch: string;
      MinKernel: string;
      MaxKernel: string;
      Comment: string;
    }>;
    Block: Array<{
      Enabled: boolean;
      Arch: string;
      Identifier: string;
      MinKernel: string;
      MaxKernel: string;
      Comment: string;
    }>;
    Emulate: {
      Cpuid1Data: string;
      Cpuid1Mask: string;
      DummyPowerManagement: boolean;
      MaxKernel: string;
      MinKernel: string;
    };
    Force: Array<{
      Enabled: boolean;
      Arch: string;
      BundlePath: string;
      ExecutablePath: string;
      PlistPath: string;
      Identifier: string;
      MinKernel: string;
      MaxKernel: string;
      Comment: string;
    }>;
    Patch: Array<{
      Enabled: boolean;
      Arch: string;
      Identifier: string;
      Find: string;
      Replace: string;
      Mask: string;
      MinKernel: string;
      MaxKernel: string;
      Comment: string;
    }>;
    Quirks: {
      AppleCpuPmCfgLock: boolean;
      AppleXcpmCfgLock: boolean;
      AppleXcpmExtraMsrs: boolean;
      AppleXcpmForceBoost: boolean;
      CustomPciSerialDevice: boolean;
      CustomSMBIOSGuid: boolean;
      DisableIoMapper: boolean;
      DisableIoMapperMapping: boolean;
      DisableLinkeditJettison: boolean;
      DisableRtcChecksum: boolean;
      ExtendBTFeatureFlags: boolean;
      ExternalDiskIcons: boolean;
      ForceAquantiaEthernet: boolean;
      ForceSecureBootScheme: boolean;
      IncreasePciBarSize: boolean;
      LapicKernelPanic: boolean;
      LegacyCommpage: boolean;
      PanicNoKextDump: boolean;
      PowerTimeoutKernelPanic: boolean;
      ProvideCurrentCpuInfo: boolean;
      SetApfsTrimTimeout: number;
      ThirdPartyDrives: boolean;
      XhciPortLimit: boolean;
    };
    Scheme: {
      FuzzyMatch: boolean;
      KernelArch: string;
      KernelCache: string;
    };
  };
  Misc: {
    BlessOverride: string[];
    Boot: {
      ConsoleAttributes: number;
      HibernateMode: string;
      HibernateSkipsPicker: boolean;
      HideAuxiliary: boolean;
      LauncherOption: string;
      LauncherPath: string;
      PickerAttributes: number;
      PickerAudioAssist: boolean;
      PickerMode: string;
      PickerVariant: string;
      PollAppleHotKeys: boolean;
      ShowPicker: boolean;
      TakeoffDelay: number;
      Timeout: number;
    };
    Debug: {
      AppleDebug: boolean;
      ApplePanic: boolean;
      DisableWatchDog: boolean;
      DisplayDelay: number;
      DisplayLevel: number;
      LogModules: string;
      SerialInit: boolean;
      SysReport: boolean;
      Target: number;
    };
    Entries: Array<{
      Enabled: boolean;
      Name: string;
      Path: string;
      Arguments: string;
      Auxiliary: boolean;
      Comment: string;
    }>;
    Security: {
      AllowSetDefault: boolean;
      ApECID: number;
      AuthRestart: boolean;
      BlacklistAppleUpdate: boolean;
      DmgLoading: string;
      EnablePassword: boolean;
      ExposeSensitiveData: number;
      HaltLevel: number;
      PasswordHash: string;
      PasswordSalt: string;
      ScanPolicy: number;
      SecureBootModel: string;
      Vault: string;
    };
    Serial: {
      Custom: {
        BaudRate: number;
        ClockRate: number;
        DetectCable: boolean;
        FifoControl: number;
        LineControl: number;
        PciDeviceInfo: string;
        RegisterAccessWidth: number;
        RegisterBase: number;
        RegisterStride: number;
        UseHardwareFlowControl: boolean;
        UseMmio: boolean;
      };
      Init: boolean;
      Override: boolean;
    };
    Tools: ToolInfo[];
  };
  NVRAM: {
    Add: Record<string, Record<string, any>>;
    Delete: Record<string, string[]>;
    LegacyEnable: boolean;
    LegacyOverwrite: boolean;
    WriteFlash: boolean;
  };
  PlatformInfo: {
    Automatic: boolean;
    CustomMemory: boolean;
    Generic: {
      AdviseFeatures: boolean;
      MaxBIOSVersion: boolean;
      MLB: string;
      ProcessorType: number;
      ROM: string;
      SpoofVendor: boolean;
      SystemMemoryStatus: string;
      SystemProductName: string;
      SystemSerialNumber: string;
      SystemUUID: string;
    };
    Memory: {
      DataWidth: number;
      Devices: Array<{
        AssetTag: string;
        BankLocator: string;
        DeviceLocator: string;
        Manufacturer: string;
        PartNumber: string;
        SerialNumber: string;
        Size: number;
        Speed: number;
      }>;
      ErrorCorrection: number;
      FormFactor: number;
      MaxCapacity: number;
      TotalWidth: number;
      Type: number;
      TypeDetail: number;
    };
    SMBIOS: {
      BIOSReleaseDate: string;
      BIOSVendor: string;
      BIOSVersion: string;
      BoardAssetTag: string;
      BoardLocationInChassis: string;
      BoardManufacturer: string;
      BoardProduct: string;
      BoardSerialNumber: string;
      BoardType: number;
      BoardVersion: string;
      ChassisAssetTag: string;
      ChassisManufacturer: string;
      ChassisSerialNumber: string;
      ChassisType: number;
      ChassisVersion: string;
      FirmwareFeatures: string;
      FirmwareFeaturesMask: string;
      MemoryFormFactor: number;
      PlatformFeature: number;
      ProcessorType: number;
      SmcVersion: string;
      SystemFamily: string;
      SystemManufacturer: string;
      SystemProductName: string;
      SystemSKUNumber: string;
      SystemSerialNumber: string;
      SystemUUID: string;
      SystemVersion: string;
    };
    UpdateDataHub: boolean;
    UpdateNVRAM: boolean;
    UpdateSMBIOS: boolean;
    UpdateSMBIOSMode: string;
  };
  UEFI: {
    APFS: {
      EnableJumpstart: boolean;
      GlobalConnect: boolean;
      HideVerbose: boolean;
      JumpstartHotPlug: boolean;
      MinDate: number;
      MinVersion: number;
    };
    Audio: {
      AudioCodec: number;
      AudioDevice: string;
      AudioOut: number;
      AudioSupport: boolean;
      DisconnectHda: boolean;
      MaximumGain: number;
      MinimumAssistGain: number;
      MinimumAudibleGain: number;
      PlayChime: string;
      ResetTrafficClass: boolean;
      SetupDelay: number;
    };
    ConnectDrivers: boolean;
    Drivers: DriverInfo[];
    Input: {
      KeyFiltering: boolean;
      KeyForgetThreshold: number;
      KeyMergeThreshold: number;
      KeySupport: boolean;
      KeySupportMode: string;
      KeySwap: boolean;
      PointerSupport: boolean;
      PointerSupportMode: string;
      TimerResolution: number;
    };
    Output: {
      ClearScreenOnModeSwitch: boolean;
      ConsoleMode: string;
      DirectGopRendering: boolean;
      ForceResolution: boolean;
      GopBurstMode: boolean;
      GopPassThrough: string;
      IgnoreTextInGraphics: boolean;
      InitialMode: string;
      ReconnectGraphicsOnConnect: boolean;
      ReconnectOnResChange: boolean;
      ReplaceTabWithSpace: boolean;
      Resolution: string;
      SanitiseClearScreen: boolean;
      TextRenderer: string;
      UgaPassThrough: boolean;
    };
    ProtocolOverrides: {
      AppleAudio: boolean;
      AppleBootPolicy: boolean;
      AppleDebugLog: boolean;
      AppleEg2Info: boolean;
      AppleFramebufferInfo: boolean;
      AppleImageConversion: boolean;
      AppleImg4Verification: boolean;
      AppleKeyMap: boolean;
      AppleRtcRam: boolean;
      AppleSecureBoot: boolean;
      AppleSmcIo: boolean;
      AppleUserInterfaceTheme: boolean;
      DataHub: boolean;
      DeviceProperties: boolean;
      FirmwareVolume: boolean;
      HashServices: boolean;
      OSInfo: boolean;
      PciIo: boolean;
      UnicodeCollation: boolean;
    };
    Quirks: {
      ActivateHpetSupport: boolean;
      DisableSecurityPolicy: boolean;
      EnableVectorAcceleration: boolean;
      EnableVmx: boolean;
      ExitBootServicesDelay: number;
      ForceOcWriteFlash: boolean;
      ForgeUefiSupport: boolean;
      IgnoreInvalidFlexRatio: boolean;
      ReleaseUsbOwnership: boolean;
      ReloadOptionRoms: boolean;
      RequestBootVarRouting: boolean;
      ResizeGpuBars: number;
      TscSyncTimeout: number;
      UnblockFsConnect: boolean;
    };
    ReservedMemory: Array<{
      Enabled: boolean;
      Address: string;
      Size: string;
      Type: string;
      Comment: string;
    }>;
  };
}

// User Configuration State
export interface UserConfigState {
  hardware: Partial<HardwareConfig>;
  opencore: Partial<OpenCoreConfig>;
  selectedKexts: string[];
  selectedTools: string[];
  selectedDrivers: string[];
  preferences: {
    language: string;
    theme: 'light' | 'dark' | 'system';
    advancedMode: boolean;
  };
}

// Generation State
export type GenerationState = 
  | 'idle'
  | 'configuring'
  | 'confirming'
  | 'downloading'
  | 'packaging'
  | 'completed'
  | 'error';

export interface GenerationStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  progress?: number;
  error?: string;
}

// Configuration Summary
export interface ConfigurationSummary {
  hardware: {
    cpu: string;
    gpu: string[];
    motherboard: string;
    memory: string;
    storage: string[];
  };
  opencore: {
    version: string;
    bootloader: string;
    kexts: string[];
    tools: string[];
    drivers: string[];
  };
  downloadList: DownloadItem[];
  estimatedSize: number; // in MB
  warnings: string[];
  recommendations: string[];
}

// Download Item
export interface DownloadItem {
  id: string;
  name: string;
  version: string;
  type: 'opencore' | 'kext' | 'tool' | 'driver' | 'acpi';
  url: string;
  size: number; // in bytes
  checksum?: string;
  description: string;
  required: boolean;
  category: string;
  // Download progress tracking
  progress?: number; // 0-100
  downloadedSize?: number; // in bytes
  speed?: number; // bytes per second
  eta?: number; // estimated time remaining in seconds
  status?: 'pending' | 'downloading' | 'completed' | 'error';
  completedAt?: number; // timestamp
  failedAt?: number; // timestamp
  error?: string;
}

// Download Status
export interface DownloadStatus {
  itemId: string;
  status: 'pending' | 'downloading' | 'completed' | 'error';
  progress: number; // 0-100
  downloadedBytes: number;
  totalBytes: number;
  speed?: number; // bytes per second
  error?: string;
  startTime?: number;
  endTime?: number;
}

// Version Information
export interface VersionInfo {
  name: string;
  version: string;
  releaseDate: string;
  downloadUrl: string;
  changelog?: string;
  prerelease: boolean;
  assets: Array<{
    name: string;
    url: string;
    size: number;
    contentType: string;
  }>;
}

// Compatibility Information
export interface CompatibilityInfo {
  macOSVersions: string[];
  openCoreVersions: string[];
  hardwareSupport: {
    intel: boolean;
    amd: boolean;
    appleSilicon: boolean;
  };
  notes?: string[];
  warnings?: string[];
}

// Kext Information
export interface KextInfo {
  BundlePath: string;
  Comment: string;
  Enabled: boolean;
  ExecutablePath: string;
  MaxKernel: string;
  MinKernel: string;
  PlistPath: string;
  Arch: string;
  name?: string;
  dependencies?: string[];
  conflicts?: string[];
  identifier?: string;
  category?: 'essential' | 'audio' | 'ethernet' | 'wifi' | 'bluetooth' | 'usb' | 'graphics' | 'misc';
  compatibility?: CompatibilityInfo;
  description?: string;
  author?: string;
  repository?: string;
  latestVersion?: VersionInfo;
}

export interface KextMetadata {
  identifier: string;
  name: string;
  description: string;
  category: 'essential' | 'audio' | 'ethernet' | 'wifi' | 'bluetooth' | 'usb' | 'graphics' | 'misc';
  author: string;
  repository: string;
  latestVersion: VersionInfo;
  compatibility: CompatibilityInfo;
  dependencies: string[];
  conflicts: string[];
  configuration?: Record<string, any>;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
  context?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: AppError;
  timestamp: number;
}

// File Types
export interface GeneratedFile {
  path: string;
  content: string | Uint8Array;
  type: 'text' | 'binary';
  encoding?: 'utf-8' | 'base64';
}

export interface PackageOptions {
  format: 'zip' | 'iso';
  includeDocumentation: boolean;
  includeTools: boolean;
  customName?: string;
}

// UI State Types
export interface UIState {
  sidebarOpen: boolean;
  currentStep: number;
  loading: boolean;
  error: AppError | null;
  notifications: Notification[];
}

export interface NotificationAction {
  label: string;
  handler: () => void;
  style?: 'primary' | 'secondary';
  closeOnClick?: boolean;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  timestamp: number;
  autoClose?: boolean;
  duration?: number;
  actions?: NotificationAction[];
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'radio' | 'textarea';
  required: boolean;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: any) => string | null;
  };
  description?: string;
  placeholder?: string;
  defaultValue?: any;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  conditional?: {
    field: string;
    value: any;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  };
}

// Theme Types
export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  fonts: {
    sans: string;
    mono: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

// --- Wizard Flow State ---

export interface HardwareSelection {
  cpuGeneration: string;
  cpuModel: string;
  chipset: string;
  gpuBrand: string;
  gpuSeries: string;
  gpuModel: string;
}

export type KextSelection = string[];

export interface WizardState {
  platform?: 'intel' | 'amd';
  hardware?: HardwareSelection;
  kexts?: KextSelection;
}
