import type { HardwareConfig, OpenCoreConfig, KextInfo } from '@/types';
import { generateUUID, generateMacAddress, generateSerialNumber } from '@/lib/utils';

/**
 * Default OpenCore configuration template
 */
export const DEFAULT_OPENCORE_CONFIG: OpenCoreConfig = {
  version: '1.0.2',
  ACPI: {
    Add: [],
    Delete: [],
    Patch: [],
    Quirks: {
      FadtEnableReset: false,
      NormalizeHeaders: false,
      RebaseRegions: false,
      ResetHwSig: false,
      ResetLogoStatus: false,
      SyncTableIds: false,
    },
  },
  Booter: {
    MmioWhitelist: [],
    Patch: [],
     Quirks: {
      AllowRelocationBlock: false,
      AvoidRuntimeDefrag: true,
      DevirtualiseMmio: false,
      DisableSingleUser: false,
      DisableVariableWrite: false,
      DiscardHibernateMap: false,
      EnableSafeModeSlide: true,
      EnableWriteUnprotector: true,
      ForceBooterSignature: false,
      ForceExitBootServices: false,
      ProtectMemoryRegions: false,
      ProtectSecureBoot: false,
      ProtectUefiServices: false,
      ProvideCustomSlide: true,
      ProvideMaxSlide: 0,
      RebuildAppleMemoryMap: false,
      ResizeAppleGpuBars: -1,
      SetupVirtualMap: true,
      SignalAppleOS: false,
      SyncRuntimePermissions: true,
    },
  },
  DeviceProperties: {
    Add: {},
    Delete: {},
  },
  Kernel: {
    Add: [],
    Block: [],
     Emulate: {
      Cpuid1Data: '',
      Cpuid1Mask: '',
      DummyPowerManagement: false,
      MaxKernel: '',
      MinKernel: '',
    },
    Force: [],
     Patch: [],
     Quirks: {
      AppleCpuPmCfgLock: false,
      AppleXcpmCfgLock: false,
      AppleXcpmExtraMsrs: false,
      AppleXcpmForceBoost: false,
      CustomPciSerialDevice: false,
      CustomSMBIOSGuid: false,
      DisableIoMapper: false,
      DisableIoMapperMapping: false,
      DisableLinkeditJettison: true,
      DisableRtcChecksum: false,
      ExtendBTFeatureFlags: false,
      ExternalDiskIcons: false,
      ForceAquantiaEthernet: false,
      ForceSecureBootScheme: false,
      IncreasePciBarSize: false,
      LapicKernelPanic: false,
      LegacyCommpage: false,
      PanicNoKextDump: true,
      PowerTimeoutKernelPanic: true,
      ProvideCurrentCpuInfo: false,
      SetApfsTrimTimeout: -1,
      ThirdPartyDrives: false,
      XhciPortLimit: false,
    },
    Scheme: {
      FuzzyMatch: true,
      KernelArch: 'Auto',
      KernelCache: 'Auto',
    },
  },
  Misc: {
    BlessOverride: [],
    Boot: {
      ConsoleAttributes: 0,
      HibernateMode: 'None',
      HibernateSkipsPicker: false,
      HideAuxiliary: true,
      LauncherOption: 'Disabled',
      LauncherPath: 'Default',
      PickerAttributes: 0,
      PickerAudioAssist: false,
      PickerMode: 'Builtin',
      PickerVariant: 'Default',
      PollAppleHotKeys: false,
      ShowPicker: true,
      TakeoffDelay: 0,
      Timeout: 5,
    },
    Debug: {
      AppleDebug: false,
      ApplePanic: false,
      DisableWatchDog: false,
      DisplayDelay: 0,
      DisplayLevel: 2147483650,
      LogModules: '*',
      SerialInit: false,
      SysReport: false,
      Target: 3,
    },
    Entries: [],
    Security: {
      AllowSetDefault: true,
      ApECID: 0,
      AuthRestart: false,
      BlacklistAppleUpdate: true,
      DmgLoading: 'Signed',
      EnablePassword: false,
      ExposeSensitiveData: 6,
      HaltLevel: 2147483648,
      PasswordHash: '',
      PasswordSalt: '',
      ScanPolicy: 0,
      SecureBootModel: 'Default',
      Vault: 'Optional',
    },
    Serial: {
      Custom: {
        BaudRate: 115200,
        ClockRate: 1843200,
        DetectCable: false,
        FifoControl: 0,
        LineControl: 0,
        PciDeviceInfo: '',
        RegisterAccessWidth: 8,
        RegisterBase: 0,
        RegisterStride: 1,
        UseHardwareFlowControl: false,
        UseMmio: false,
      },
      Init: false,
      Override: false,
    },
    Tools: [],
  },
  NVRAM: {
    Add: {
      '7C436110-AB2A-4BBB-A880-FE41995C9F82': {
        'boot-args': '',
        'csr-active-config': new Uint8Array([0x00, 0x00, 0x00, 0x00]),
        'prev-lang:kbd': new Uint8Array([0x65, 0x6e, 0x2d, 0x55, 0x53, 0x3a, 0x30, 0x00]),
      },
    },
    Delete: {
      '7C436110-AB2A-4BBB-A880-FE41995C9F82': [
        'UIScale',
        'DefaultBackgroundColor',
      ],
    },
    LegacyEnable: false,
     LegacyOverwrite: false,
     WriteFlash: true,
  },
  PlatformInfo: {
    Automatic: true,
    CustomMemory: false,
    Generic: {
      AdviseFeatures: false,
      MaxBIOSVersion: false,
      MLB: '',
      ProcessorType: 0,
      ROM: '',
      SpoofVendor: true,
      SystemMemoryStatus: 'Auto',
      SystemProductName: '',
      SystemSerialNumber: '',
      SystemUUID: '',
    },
    Memory: {
       DataWidth: 64,
       Devices: [],
       ErrorCorrection: 6,
       FormFactor: 13,
       MaxCapacity: 0,
       TotalWidth: 64,
       Type: 24,
       TypeDetail: 2,
     },
    SMBIOS: {
      BIOSReleaseDate: '',
      BIOSVendor: '',
      BIOSVersion: '',
      BoardAssetTag: '',
      BoardLocationInChassis: '',
      BoardManufacturer: '',
      BoardProduct: '',
      BoardSerialNumber: '',
      BoardType: 10,
      BoardVersion: '',
      ChassisAssetTag: '',
      ChassisManufacturer: '',
      ChassisSerialNumber: '',
      ChassisType: 9,
      ChassisVersion: '',
      FirmwareFeatures: '',
      FirmwareFeaturesMask: '',
      MemoryFormFactor: 13,
      PlatformFeature: 0,
      ProcessorType: 0,
      SmcVersion: '',
      SystemFamily: '',
      SystemManufacturer: '',
      SystemProductName: '',
      SystemSKUNumber: '',
      SystemSerialNumber: '',
      SystemUUID: '',
      SystemVersion: '',
    },
    UpdateDataHub: true,
     UpdateNVRAM: true,
     UpdateSMBIOS: true,
     UpdateSMBIOSMode: 'Create',
  },
  UEFI: {
    APFS: {
      EnableJumpstart: true,
      GlobalConnect: false,
      HideVerbose: true,
      JumpstartHotPlug: false,
      MinDate: 0,
      MinVersion: 0,
    },
    Audio: {
      AudioCodec: 0,
      AudioDevice: '',
      AudioOut: 0,
      AudioSupport: false,
      DisconnectHda: false,
      MaximumGain: -15,
      MinimumAssistGain: -30,
      MinimumAudibleGain: -55,
      PlayChime: 'Auto',
      ResetTrafficClass: false,
      SetupDelay: 0,
    },
    ConnectDrivers: true,
    Drivers: [],
    Input: {
      KeyFiltering: false,
      KeyForgetThreshold: 5,
      KeyMergeThreshold: 2,
      KeySupport: true,
      KeySupportMode: 'Auto',
      KeySwap: false,
      PointerSupport: false,
      PointerSupportMode: '',
      TimerResolution: 50000,
    },
    Output: {
      ClearScreenOnModeSwitch: false,
      ConsoleMode: '',
      DirectGopRendering: false,
      ForceResolution: false,
      GopBurstMode: false,
      GopPassThrough: 'Disabled',
      IgnoreTextInGraphics: false,
      InitialMode: 'Auto',
      ReconnectGraphicsOnConnect: false,
      ReconnectOnResChange: false,
      ReplaceTabWithSpace: false,
      Resolution: 'Max',
      SanitiseClearScreen: true,
      TextRenderer: 'BuiltinGraphics',
      UgaPassThrough: false,
    },
    ProtocolOverrides: {
      AppleAudio: false,
      AppleBootPolicy: false,
      AppleDebugLog: false,
      AppleEg2Info: false,
      AppleFramebufferInfo: false,
      AppleImageConversion: false,
      AppleImg4Verification: false,
      AppleKeyMap: false,
      AppleRtcRam: false,
      AppleSecureBoot: false,
      AppleSmcIo: false,
      AppleUserInterfaceTheme: false,
      DataHub: false,
      DeviceProperties: false,
      FirmwareVolume: false,
      HashServices: false,
      OSInfo: false,
      PciIo: false,
      UnicodeCollation: false,
    },
    Quirks: {
       ActivateHpetSupport: false,
       DisableSecurityPolicy: false,
       EnableVectorAcceleration: false,
       EnableVmx: false,
       ExitBootServicesDelay: 0,
       ForceOcWriteFlash: false,
       ForgeUefiSupport: false,
       IgnoreInvalidFlexRatio: false,
       ReleaseUsbOwnership: false,
       ReloadOptionRoms: false,
       RequestBootVarRouting: true,
       ResizeGpuBars: -1,
       TscSyncTimeout: 0,
       UnblockFsConnect: false,
     },
     ReservedMemory: [],
  },
};

/**
 * SMBIOS model mappings for different hardware configurations
 */
export const SMBIOS_MODELS = {
  intel: {
    desktop: {
      '6th-gen': 'iMac17,1',
      '7th-gen': 'iMac18,3',
      '8th-gen': 'iMac19,1',
      '9th-gen': 'iMac20,1',
      '10th-gen': 'iMac20,2',
      '11th-gen': 'iMac21,1',
      '12th-gen': 'iMac21,2',
      '13th-gen': 'Mac14,2',
      default: 'iMac19,1',
    },
    laptop: {
      '6th-gen': 'MacBookPro13,1',
      '7th-gen': 'MacBookPro14,1',
      '8th-gen': 'MacBookPro15,2',
      '9th-gen': 'MacBookPro16,1',
      '10th-gen': 'MacBookPro17,1',
      '11th-gen': 'MacBookPro18,1',
      '12th-gen': 'MacBookPro18,2',
      '13th-gen': 'Mac14,7',
      default: 'MacBookPro15,2',
    },
  },
  amd: {
    desktop: {
      'zen': 'iMacPro1,1',
      'zen+': 'iMacPro1,1',
      'zen2': 'iMacPro1,1',
      'zen3': 'iMacPro1,1',
      'zen4': 'Mac13,1',
      default: 'iMacPro1,1',
    },
    laptop: {
      'zen': 'MacBookPro15,1',
      'zen+': 'MacBookPro15,1',
      'zen2': 'MacBookPro16,1',
      'zen3': 'MacBookPro16,4',
      'zen4': 'MacBookPro18,3',
      default: 'MacBookPro15,1',
    },
  },
};

/**
 * Generate OpenCore configuration based on hardware configuration
 */
export function generateOpenCoreConfig(
  hardwareConfig: HardwareConfig,
  selectedKexts: string[] = [],
  selectedTools: string[] = [],
  selectedDrivers: string[] = [],
  customOptions: Partial<OpenCoreConfig> = {}
): OpenCoreConfig {
  // Start with default configuration
  const config: OpenCoreConfig = JSON.parse(JSON.stringify(DEFAULT_OPENCORE_CONFIG));

  // Apply hardware-specific configurations
  applyHardwareSpecificConfig(config, hardwareConfig);

  // Configure SMBIOS
  configureSMBIOS(config, hardwareConfig);

  // Add kexts
  addKextsToConfig(config, selectedKexts);

  // Add tools
  addToolsToConfig(config, selectedTools);

  // Add drivers
  addDriversToConfig(config, selectedDrivers);

  // Apply custom options
  if (customOptions) {
    mergeConfigurations(config, customOptions);
  }

  return config;
}

/**
 * Apply hardware-specific configuration settings
 */
function applyHardwareSpecificConfig(config: OpenCoreConfig, hardware: HardwareConfig): void {
  // CPU-specific configurations
  if (hardware.cpu.brand === 'AMD') {
    // AMD-specific settings
  config.Kernel.Emulate.DummyPowerManagement = true;
  config.Kernel.Quirks.AppleCpuPmCfgLock = true;
  config.Kernel.Quirks.AppleXcpmCfgLock = true;
  config.Kernel.Quirks.ProvideCurrentCpuInfo = true;
  
  // Add AMD CPU patches if needed
  if (hardware.cpu.generation?.includes('zen')) {
    config.Booter.Quirks.SetupVirtualMap = false;
  }
} else {
  // Intel-specific settings
  config.Kernel.Quirks.AppleCpuPmCfgLock = false;
  config.Kernel.Quirks.AppleXcpmCfgLock = false;
}

  // GPU-specific configurations
  if (hardware.gpu.discrete) {
    if (hardware.gpu.discrete.brand === 'NVIDIA') {
      // NVIDIA-specific settings
    config.NVRAM.Add['7C436110-AB2A-4BBB-A880-FE41995C9F82']['boot-args'] += ' nvda_drv=1';
    } else if (hardware.gpu.discrete.brand === 'AMD') {
      // AMD GPU-specific settings
    config.DeviceProperties.Add['PciRoot(0x0)/Pci(0x1,0x0)/Pci(0x0,0x0)'] = {
        'AAPL,slot-name': 'Internal@0,1,0/0,0',
        'device_type': 'VGA compatible controller',
        'model': hardware.gpu.discrete.model,
      };
    }
  }

  // Audio-specific configurations
  if (hardware.audio.codec) {
    config.DeviceProperties.Add['PciRoot(0x0)/Pci(0x1f,0x3)'] = {
      'layout-id': hardware.audio.layout || 1,
    };
  }

  // Network-specific configurations
  if (hardware.network.ethernet) {
    // Ethernet-specific device properties can be added here
  }

  // Storage-specific configurations
  if (hardware.storage.type === 'NVMe') {
    config.Kernel.Quirks.ThirdPartyDrives = true;
  }

  // Memory-specific configurations
  if (hardware.memory.size >= 32) {
    // High memory configurations
    config.Booter.Quirks.DevirtualiseMmio = true;
  }
}

/**
 * Configure SMBIOS based on hardware
 */
function configureSMBIOS(config: OpenCoreConfig, hardware: HardwareConfig): void {
  const isLaptop = false; // This should be determined from hardware config
  const formFactor = isLaptop ? 'laptop' : 'desktop';
  
  let model: string;
  
  if (hardware.cpu.brand === 'AMD') {
    const generation = hardware.cpu.generation?.toLowerCase() || 'default';
    const amdModels = SMBIOS_MODELS.amd[formFactor] as Record<string, string>;
    model = amdModels[generation] || amdModels.default;
  } else {
    const generation = hardware.cpu.generation?.toLowerCase() || 'default';
    const intelModels = SMBIOS_MODELS.intel[formFactor] as Record<string, string>;
    model = intelModels[generation] || intelModels.default;
  }

  // Set SMBIOS model
  config.PlatformInfo.Generic.SystemProductName = model;
  
  // Generate unique identifiers
  config.PlatformInfo.Generic.SystemSerialNumber = generateSerialNumber(model);
  config.PlatformInfo.Generic.SystemUUID = generateUUID();
  config.PlatformInfo.Generic.MLB = generateSerialNumber(model) + 'A1B2C3';
  config.PlatformInfo.Generic.ROM = generateMacAddress();

  // Set processor type based on CPU
  if (hardware.cpu.brand === 'Intel') {
    config.PlatformInfo.Generic.ProcessorType = 1537; // Intel
  } else {
    config.PlatformInfo.Generic.ProcessorType = 0; // Auto
  }
}

/**
 * Add kexts to configuration
 */
function addKextsToConfig(config: OpenCoreConfig, kexts: string[]): void {
  const kextConfigs = {
    'Lilu': {
      enabled: true,
      bundlePath: 'Lilu.kext',
      executablePath: 'Contents/MacOS/Lilu',
      plistPath: 'Contents/Info.plist',
      arch: 'Any',
      minKernel: '12.0.0',
      maxKernel: '',
      comment: 'Arbitrary kext and process patching on macOS',
    },
    'VirtualSMC': {
      enabled: true,
      bundlePath: 'VirtualSMC.kext',
      executablePath: 'Contents/MacOS/VirtualSMC',
      plistPath: 'Contents/Info.plist',
      arch: 'Any',
      minKernel: '12.0.0',
      maxKernel: '',
      comment: 'Advanced Apple SMC emulator in the kernel',
    },
    'WhateverGreen': {
      enabled: true,
      bundlePath: 'WhateverGreen.kext',
      executablePath: 'Contents/MacOS/WhateverGreen',
      plistPath: 'Contents/Info.plist',
      arch: 'Any',
      minKernel: '12.0.0',
      maxKernel: '',
      comment: 'Various patches necessary for certain ATI/AMD/Intel/Nvidia GPUs',
    },
    'AppleALC': {
      enabled: true,
      bundlePath: 'AppleALC.kext',
      executablePath: 'Contents/MacOS/AppleALC',
      plistPath: 'Contents/Info.plist',
      arch: 'Any',
      minKernel: '12.0.0',
      maxKernel: '',
      comment: 'Native macOS HD audio for not officially supported codecs',
    },
    'IntelMausi': {
      enabled: true,
      bundlePath: 'IntelMausi.kext',
      executablePath: 'Contents/MacOS/IntelMausi',
      plistPath: 'Contents/Info.plist',
      arch: 'Any',
      minKernel: '12.0.0',
      maxKernel: '',
      comment: 'Intel onboard LAN driver for macOS',
    },
  };

  config.Kernel.Add = [];
  
  for (const kext of kexts) {
    const kextConfig = (kextConfigs as Record<string, any>)[kext];
    if (kextConfig) {
      config.Kernel.Add.push(kextConfig);
    }
  }
}

/**
 * Add tools to configuration
 */
function addToolsToConfig(config: OpenCoreConfig, tools: string[]): void {
  const toolConfigs = {
    'OpenShell': {
      enabled: true,
      name: 'UEFI Shell',
      path: 'OpenShell.efi',
      arguments: '',
      auxiliary: true,
      comment: 'UEFI Shell for debugging',
    },
    'CleanNvram': {
      enabled: true,
      name: 'Clean NVRAM',
      path: 'CleanNvram.efi',
      arguments: '',
      auxiliary: true,
      comment: 'Clean NVRAM tool',
    },
    'ResetSystem': {
      enabled: true,
      name: 'Reset System',
      path: 'ResetSystem.efi',
      arguments: '',
      auxiliary: true,
      comment: 'System reset tool',
    },
  };

  config.Misc.Tools = [];
  
  for (const tool of tools) {
    const toolConfig = (toolConfigs as Record<string, any>)[tool];
    if (toolConfig) {
      config.Misc.Tools.push(toolConfig);
    }
  }
}

/**
 * Add drivers to configuration
 */
function addDriversToConfig(config: OpenCoreConfig, drivers: string[]): void {
  const driverConfigs = {
    'OpenRuntime': {
      enabled: true,
      path: 'OpenRuntime.efi',
      loadEarly: false,
      arguments: '',
      comment: 'OC_FIRMWARE_RUNTIME protocol implementation',
    },
    'OpenCanopy': {
      enabled: true,
      path: 'OpenCanopy.efi',
      loadEarly: false,
      arguments: '',
      comment: 'Graphical OpenCore user interface',
    },
    'AudioDxe': {
      enabled: true,
      path: 'AudioDxe.efi',
      loadEarly: false,
      arguments: '',
      comment: 'HDA driver to play boot chime and voice over',
    },
    'ResetNvramEntry': {
      enabled: true,
      path: 'ResetNvramEntry.efi',
      loadEarly: false,
      arguments: '',
      comment: 'Tool to reset NVRAM and exit',
    },
  };

  config.UEFI.Drivers = [];
  
  for (const driver of drivers) {
    const driverConfig = (driverConfigs as Record<string, any>)[driver];
    if (driverConfig) {
      config.UEFI.Drivers.push(driverConfig);
    }
  }
}

/**
 * Merge custom configuration options
 */
function mergeConfigurations(target: OpenCoreConfig, source: Partial<OpenCoreConfig>): void {
  function deepMerge(target: any, source: any): any {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {};
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }

  deepMerge(target, source);
}

/**
 * Generate config.plist content
 */
export function generateConfigPlist(config: OpenCoreConfig): string {
  // Convert the configuration to plist format
  // This is a simplified version - in a real implementation,
  // you would use a proper plist library
  
  const plistHeader = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">`;
  const plistFooter = `</plist>`;
  
  function objectToPlist(obj: any, indent = 0): string {
    const spaces = '  '.repeat(indent);
    
    if (obj === null || obj === undefined) {
      return `${spaces}<string></string>`;
    }
    
    if (typeof obj === 'boolean') {
      return `${spaces}<${obj.toString()}/>`;
    }
    
    if (typeof obj === 'number') {
      return `${spaces}<integer>${obj}</integer>`;
    }
    
    if (typeof obj === 'string') {
      return `${spaces}<string>${obj}</string>`;
    }
    
    if (obj instanceof Uint8Array) {
      const base64 = btoa(String.fromCharCode(...obj));
      return `${spaces}<data>${base64}</data>`;
    }
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) {
        return `${spaces}<array/>`;
      }
      
      let result = `${spaces}<array>\n`;
      for (const item of obj) {
        result += objectToPlist(item, indent + 1) + '\n';
      }
      result += `${spaces}</array>`;
      return result;
    }
    
    if (typeof obj === 'object') {
      const keys = Object.keys(obj);
      if (keys.length === 0) {
        return `${spaces}<dict/>`;
      }
      
      let result = `${spaces}<dict>\n`;
      for (const key of keys) {
        result += `${spaces}  <key>${key}</key>\n`;
        result += objectToPlist(obj[key], indent + 1) + '\n';
      }
      result += `${spaces}</dict>`;
      return result;
    }
    
    return `${spaces}<string>${String(obj)}</string>`;
  }
  
  const plistBody = objectToPlist(config);
  
  return `${plistHeader}\n${plistBody}\n${plistFooter}`;
}

/**
 * Validate generated configuration
 */
export function validateGeneratedConfig(config: OpenCoreConfig): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  if (!config.PlatformInfo.Generic.SystemProductName) {
    errors.push('SystemProductName is required');
  }
  
  if (!config.PlatformInfo.Generic.SystemSerialNumber) {
    errors.push('SystemSerialNumber is required');
  }
  
  if (!config.PlatformInfo.Generic.SystemUUID) {
    errors.push('SystemUUID is required');
  }

  // Check essential kexts
  const hasLilu = config.Kernel.Add.some(kext => kext.BundlePath.includes('Lilu'));
  const hasVirtualSMC = config.Kernel.Add.some(kext => kext.BundlePath.includes('VirtualSMC'));
  
  if (!hasLilu) {
    errors.push('Lilu.kext is required');
  }
  
  if (!hasVirtualSMC) {
    errors.push('VirtualSMC.kext is required');
  }

  // Check driver requirements
  const hasOpenRuntime = config.UEFI.Drivers.some(driver => driver.Path.includes('OpenRuntime'));
  if (!hasOpenRuntime) {
    warnings.push('OpenRuntime.efi is recommended');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get recommended boot arguments based on hardware
 */
export function getRecommendedBootArgs(hardware: HardwareConfig): string[] {
  const bootArgs: string[] = [];

  // Debug arguments (can be removed for production)
  bootArgs.push('-v'); // Verbose mode
  bootArgs.push('debug=0x100'); // Debug info
  bootArgs.push('keepsyms=1'); // Keep symbols

  // CPU-specific arguments
  if (hardware.cpu.brand === 'AMD') {
    bootArgs.push('npci=0x2000'); // AMD-specific
  }

  // GPU-specific arguments
  if (hardware.gpu.discrete?.brand === 'NVIDIA') {
    bootArgs.push('nvda_drv=1'); // NVIDIA web drivers
  }

  // Audio-specific arguments
  if (hardware.audio.layout) {
    bootArgs.push(`alcid=${hardware.audio.layout}`);
  }

  return bootArgs;
}