import { HardwareConfig, OpenCoreConfig, KextInfo, DriverInfo, ToolInfo } from '../../types';

/**
 * OpenCore配置生成器
 * 根据硬件配置生成对应的OpenCore配置文件
 */
export class OpenCoreConfigGenerator {
  private hardwareConfig: HardwareConfig;
  private openCoreVersion: string;

  constructor(hardwareConfig: HardwareConfig, openCoreVersion: string = '1.0.2') {
    this.hardwareConfig = hardwareConfig;
    this.openCoreVersion = openCoreVersion;
  }

  /**
   * 生成完整的OpenCore配置
   */
  generateConfig(): OpenCoreConfig {
    return {
      version: this.openCoreVersion,
      ACPI: this.generateACPIConfig(),
      Booter: this.generateBooterConfig(),
      DeviceProperties: this.generateDevicePropertiesConfig(),
      Kernel: this.generateKernelConfig(),
      Misc: this.generateMiscConfig(),
      NVRAM: this.generateNVRAMConfig(),
      PlatformInfo: this.generatePlatformInfoConfig(),
      UEFI: this.generateUEFIConfig()
    };
  }

  /**
   * 生成ACPI配置
   */
  private generateACPIConfig() {
    const patches: any[] = [];
    const add: any[] = [];

    // 根据CPU品牌添加相应的ACPI补丁
    if (this.hardwareConfig.cpu.brand.toLowerCase().includes('intel')) {
      // Intel CPU相关ACPI配置
      add.push({
        Comment: 'SSDT-PLUG',
        Enabled: true,
        Path: 'SSDT-PLUG.aml'
      });
    } else if (this.hardwareConfig.cpu.brand.toLowerCase().includes('amd')) {
      // AMD CPU相关ACPI配置
      add.push({
        Comment: 'SSDT-CPUR',
        Enabled: true,
        Path: 'SSDT-CPUR.aml'
      });
    }

    // 根据主板芯片组添加ACPI配置
    if (this.hardwareConfig.motherboard.chipset) {
      const chipset = this.hardwareConfig.motherboard.chipset.toLowerCase();
      if (chipset.includes('z690') || chipset.includes('z790')) {
        add.push({
          Comment: 'SSDT-RHUB',
          Enabled: true,
          Path: 'SSDT-RHUB.aml'
        });
      }
    }

    return {
      Add: add,
      Delete: [],
      Patch: patches,
      Quirks: {
        FadtEnableReset: false,
        NormalizeHeaders: false,
        RebaseRegions: false,
        ResetHwSig: false,
        ResetLogoStatus: false,
        SyncTableIds: false
      }
    };
  }

  /**
   * 生成Booter配置
   */
  private generateBooterConfig() {
    return {
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
        SyncRuntimePermissions: true
      }
    };
  }

  /**
   * 生成DeviceProperties配置
   */
  private generateDevicePropertiesConfig() {
    const add: { [key: string]: any } = {};

    // 集成显卡配置
    if (this.hardwareConfig.gpu.integrated.model) {
      const igpuModel = this.hardwareConfig.gpu.integrated.model.toLowerCase();
      
      if (igpuModel.includes('uhd') || igpuModel.includes('iris')) {
        // Intel集成显卡配置
        add['PciRoot(0x0)/Pci(0x2,0x0)'] = {
          'AAPL,ig-platform-id': this.getIntelIGPUPlatformId(igpuModel),
          'device-id': this.getIntelIGPUDeviceId(igpuModel),
          'framebuffer-patch-enable': 1,
          'framebuffer-stolenmem': 0x00003001
        };
      }
    }

    // 独立显卡配置
    if (this.hardwareConfig.gpu.discrete.brand && this.hardwareConfig.gpu.discrete.model) {
      const dgpuBrand = this.hardwareConfig.gpu.discrete.brand.toLowerCase();
      
      if (dgpuBrand.includes('amd') || dgpuBrand.includes('radeon')) {
        // AMD独立显卡配置
        add['PciRoot(0x0)/Pci(0x1,0x0)/Pci(0x0,0x0)'] = {
          'agdpmod': 'pikera'
        };
      }
    }

    // 音频配置
    if (this.hardwareConfig.audio.codec) {
      const layoutId = this.hardwareConfig.audio.layout || this.getAudioLayoutId(this.hardwareConfig.audio.codec);
      add['PciRoot(0x0)/Pci(0x1f,0x3)'] = {
        'layout-id': layoutId
      };
    }

    return {
      Add: add,
      Delete: {}
    };
  }

  /**
   * 生成Kernel配置
   */
  private generateKernelConfig() {
    const add: KextInfo[] = [];
    const block: any[] = [];
    const patch: any[] = [];

    // 基础必需的Kext
    add.push(
      {
        BundlePath: 'Lilu.kext',
        Comment: 'Lilu - Arbitrary kext and process patching on macOS',
        Enabled: true,
        ExecutablePath: 'Contents/MacOS/Lilu',
        Arch: 'Any',
        MaxKernel: '',
        MinKernel: '',
        PlistPath: 'Contents/Info.plist'
      },
      {
        BundlePath: 'VirtualSMC.kext',
        Comment: 'VirtualSMC - Advanced Apple SMC emulator in the kernel',
        Enabled: true,
        ExecutablePath: 'Contents/MacOS/VirtualSMC',
        Arch: 'Any',
        MaxKernel: '',
        MinKernel: '',
        PlistPath: 'Contents/Info.plist'
      }
    );

    // 根据硬件配置添加相应的Kext
    if (this.hardwareConfig.gpu.integrated.model) {
      const igpuModel = this.hardwareConfig.gpu.integrated.model.toLowerCase();
      if (igpuModel.includes('uhd') || igpuModel.includes('iris')) {
        add.push({
          Arch: 'Any',
          BundlePath: 'WhateverGreen.kext',
          Comment: 'WhateverGreen - Various patches necessary for certain ATI/AMD/Intel/Nvidia GPUs',
          Enabled: true,
          ExecutablePath: 'Contents/MacOS/WhateverGreen',
          MaxKernel: '',
          MinKernel: '',
          PlistPath: 'Contents/Info.plist'
        });
      }
    }

    // 音频Kext
    if (this.hardwareConfig.audio.codec) {
      add.push({
        Arch: 'Any',
        BundlePath: 'AppleALC.kext',
        Comment: 'AppleALC - Native macOS HD audio for not officially supported codecs',
        Enabled: true,
        ExecutablePath: 'Contents/MacOS/AppleALC',
        MaxKernel: '',
        MinKernel: '',
        PlistPath: 'Contents/Info.plist'
      });
    }

    // 网络Kext
    if (this.hardwareConfig.network.ethernet.model) {
      const ethernetModel = this.hardwareConfig.network.ethernet.model.toLowerCase();
      if (ethernetModel.includes('intel')) {
        add.push({
          Arch: 'Any',
          BundlePath: 'IntelMausi.kext',
          Comment: 'IntelMausi - Intel onboard LAN driver for macOS',
          Enabled: true,
          ExecutablePath: 'Contents/MacOS/IntelMausi',
          MaxKernel: '',
          MinKernel: '',
          PlistPath: 'Contents/Info.plist'
        });
      } else if (ethernetModel.includes('realtek')) {
        add.push({
          Arch: 'Any',
          BundlePath: 'RealtekRTL8111.kext',
          Comment: 'RealtekRTL8111 - Realtek RTL8111/8168 family ethernet driver for macOS',
          Enabled: true,
          ExecutablePath: 'Contents/MacOS/RealtekRTL8111',
          MaxKernel: '',
          MinKernel: '',
          PlistPath: 'Contents/Info.plist'
        });
      }
    }

    // USB相关Kext
    add.push({
      Arch: 'Any',
      BundlePath: 'USBMap.kext',
      Comment: 'USBMap - Custom USB port mapping',
      Enabled: true,
      ExecutablePath: '',
      MaxKernel: '',
      MinKernel: '',
      PlistPath: 'Contents/Info.plist'
    });

    return {
      Add: add,
      Block: block,
      Emulate: {
        Cpuid1Data: '0x00000000',
        Cpuid1Mask: '0x00000000',
        DummyPowerManagement: false,
        MaxKernel: '',
        MinKernel: ''
      },
      Force: [],
      Patch: patch,
      Quirks: {
        AppleCpuPmCfgLock: false,
        AppleXcpmCfgLock: false,
        AppleXcpmExtraMsrs: false,
        AppleXcpmForceBoost: false,
        CustomPciSerialDevice: false,
        CustomSMBIOSGuid: false,
        DisableIoMapper: true,
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
        XhciPortLimit: false
      },
      Scheme: {
        FuzzyMatch: true,
        KernelArch: 'x86_64',
        KernelCache: 'Auto'
      }
    };
  }

  /**
   * 生成Misc配置
   */
  private generateMiscConfig() {
    return {
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
        Timeout: 5
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
        Target: 3
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
        Vault: 'Optional'
      },
      Serial: {
        Custom: {
          BaudRate: 115200,
          ClockRate: 1843200,
          DetectCable: false,
          FifoControl: 0,
          LineControl: 0,
          PciDeviceInfo: '',
          RegisterAccessWidth: 0,
          RegisterBase: 0,
          RegisterStride: 0,
          UseHardwareFlowControl: false,
          UseMmio: false
        },
        Init: false,
        Override: false
      },
      Tools: []
    };
  }

  /**
   * 生成NVRAM配置
   */
  private generateNVRAMConfig() {
    return {
      Add: {
        '4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14': {
          'DefaultBackgroundColor': new Array(4).fill(0),
          'UIScale': new Array(1).fill(1)
        },
        '4D1FDA02-38C7-4A6A-9CC6-4BCCA8B30102': {
          'rtc-blacklist': new Array(0)
        },
        '7C436110-AB2A-4BBB-A880-FE41995C9F82': {
          'SystemAudioVolume': new Array(1).fill(70),
          'boot-args': this.generateBootArgs(),
          'csr-active-config': new Array(4).fill(0),
          'prev-lang:kbd': new Array(0),
          'run-efi-updater': 'No'
        }
      },
      Delete: {
        '4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14': [
          'DefaultBackgroundColor',
          'UIScale'
        ],
        '4D1FDA02-38C7-4A6A-9CC6-4BCCA8B30102': [
          'rtc-blacklist'
        ],
        '7C436110-AB2A-4BBB-A880-FE41995C9F82': [
          'boot-args'
        ]
      },
      LegacyEnable: false,
      LegacyOverwrite: false,
      LegacySchema: {
        '8BE4DF61-93CA-11D2-AA0D-00E098032B8C': {
          'Boot0080': true,
          'Boot0081': true,
          'Boot0082': true,
          'BootNext': true,
          'BootOrder': true
        }
      },
      WriteFlash: true
    };
  }

  /**
   * 生成PlatformInfo配置
   */
  private generatePlatformInfoConfig() {
    const smbios = this.getSMBIOSInfo();
    
    return {
      Automatic: true,
      CustomMemory: false,
      Generic: {
        AdviseFeatures: false,
        MaxBIOSVersion: false,
        MLB: smbios.mlb,
        ProcessorType: 0,
        ROM: smbios.rom,
        SpoofVendor: true,
        SystemMemoryStatus: 'Auto',
        SystemProductName: smbios.model,
        SystemSerialNumber: smbios.serial,
        SystemUUID: smbios.uuid
      },
      Memory: {
        DataWidth: 64,
        Devices: [],
        ErrorCorrection: 0,
        FormFactor: 13,
        MaxCapacity: 0,
        TotalWidth: 64,
        Type: 0,
        TypeDetail: 0
      },
      PlatformNVRAM: {},
      SMBIOS: {
        BIOSVendor: '',
        BIOSVersion: '',
        BIOSReleaseDate: '',
        SystemManufacturer: '',
        SystemProductName: '',
        SystemVersion: '',
        SystemSerialNumber: '',
        SystemUUID: '',
        SystemSKUNumber: '',
        SystemFamily: '',
        BoardManufacturer: '',
        BoardProduct: '',
        BoardVersion: '',
        BoardSerialNumber: '',
        BoardAssetTag: '',
        BoardType: 10,
        BoardLocationInChassis: '',
        ChassisManufacturer: '',
        ChassisType: 9,
        ChassisVersion: '',
        ChassisSerialNumber: '',
        ChassisAssetTag: '',
        PlatformFeature: 0,
        SmcVersion: '0x00000000',
        FirmwareFeatures: '0x00000000',
        FirmwareFeaturesMask: '0x00000000',
        ExtendedFirmwareFeatures: new Array(8).fill(0),
        ExtendedFirmwareFeaturesMask: new Array(8).fill(0),
        ProcessorType: 0,
        MemoryFormFactor: 13
      },
      UpdateDataHub: true,
      UpdateNVRAM: true,
      UpdateSMBIOS: true,
      UpdateSMBIOSMode: 'Create',
      UseRawUuidEncoding: false
    };
  }

  /**
   * 生成UEFI配置
   */
  private generateUEFIConfig() {
    const drivers: DriverInfo[] = [
      {
        Arguments: '',
        Comment: 'HfsPlus - HFS+ file system driver',
        Enabled: true,
        LoadEarly: false,
        Path: 'HfsPlus.efi'
      },
      {
        Arguments: '',
        Comment: 'OpenRuntime - Memory map manipulation',
        Enabled: true,
        LoadEarly: false,
        Path: 'OpenRuntime.efi'
      }
    ];

    return {
      APFS: {
        EnableJumpstart: true,
        GlobalConnect: false,
        HideVerbose: true,
        JumpstartHotPlug: false,
        MinDate: 0,
        MinVersion: 0
      },
      AppleInput: {
        AppleEvent: 'Builtin',
        CustomDelays: false,
        GraphicsInputMirroring: false,
        KeyInitialDelay: 2,
        KeySubsequentDelay: 5,
        PointerDwellClickTimeout: 0,
        PointerDwellDoubleClickTimeout: 0,
        PointerDwellRadius: 0,
        PointerPollMask: -1,
        PointerPollMax: 80,
        PointerPollMin: 10,
        PointerSpeedDiv: 1,
        PointerSpeedMul: 1
      },
      Audio: {
        AudioCodec: 0,
        AudioDevice: 'PciRoot(0x0)/Pci(0x1f,0x3)',
        AudioOut: 0,
        AudioSupport: false,
        DisconnectHda: false,
        MaximumGain: -15,
        MinimumAssistGain: -30,
        MinimumAudibleGain: -55,
        PlayChime: 'Auto',
        ResetTrafficClass: false,
        SetupDelay: 0
      },
      ConnectDrivers: true,
      Drivers: drivers,
      Input: {
        KeyFiltering: false,
        KeyForgetThreshold: 5,
        KeyMergeThreshold: 2,
        KeySupport: true,
        KeySupportMode: 'Auto',
        KeySwap: false,
        PointerSupport: false,
        PointerSupportMode: '',
        TimerResolution: 50000
      },
      Output: {
        ClearScreenOnModeSwitch: false,
        ConsoleFont: '',
        ConsoleMode: '',
        DirectGopRendering: false,
        ForceResolution: false,
        GopBurstMode: false,
        GopPassThrough: 'Disabled',
        IgnoreTextInGraphics: false,
        InitialMode: 'Text',
        ReconnectGraphicsOnConnect: false,
        ReconnectOnResChange: false,
        ReplaceTabWithSpace: false,
        Resolution: 'Max',
        SanitiseClearScreen: false,
        TextRenderer: 'BuiltinGraphics',
        UgaPassThrough: false
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
        UnicodeCollation: false
      },
      Quirks: {
        ActivateHpetSupport: false,
        DisableSecurityPolicy: false,
        EnableVectorAcceleration: true,
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
        UnblockFsConnect: false
      },
      ReservedMemory: []
    };
  }

  /**
   * 生成启动参数
   */
  private generateBootArgs(): string {
    const args: string[] = [];

    // 基础启动参数
    args.push('-v'); // 详细模式
    args.push('keepsyms=1'); // 保持内核符号
    args.push('debug=0x100'); // 调试模式
    args.push('alcid=' + (this.hardwareConfig.audio.layout || '1')); // 音频布局ID

    // 根据硬件配置添加特定参数
    if (this.hardwareConfig.gpu.discrete.brand?.toLowerCase().includes('amd')) {
      args.push('agdpmod=pikera'); // AMD显卡参数
    }

    if (this.hardwareConfig.gpu.integrated.model?.toLowerCase().includes('uhd')) {
      args.push('-igfxvesa'); // Intel集成显卡参数
    }

    return args.join(' ');
  }

  /**
   * 获取Intel集成显卡平台ID
   */
  private getIntelIGPUPlatformId(model: string): number[] {
    // 简化的平台ID映射
    if (model.includes('uhd 630')) {
      return [0x00, 0x00, 0x3E, 0x9B];
    } else if (model.includes('uhd 770')) {
      return [0x00, 0x00, 0x9B, 0x3E];
    }
    return [0x00, 0x00, 0x3E, 0x9B]; // 默认值
  }

  /**
   * 获取Intel集成显卡设备ID
   */
  private getIntelIGPUDeviceId(model: string): number[] {
    // 简化的设备ID映射
    if (model.includes('uhd 630')) {
      return [0x9B, 0x3E, 0x00, 0x00];
    } else if (model.includes('uhd 770')) {
      return [0x9B, 0x3E, 0x00, 0x00];
    }
    return [0x9B, 0x3E, 0x00, 0x00]; // 默认值
  }

  /**
   * 获取音频布局ID
   */
  private getAudioLayoutId(codec: string): number {
    const codecMap: { [key: string]: number } = {
      'alc887': 1,
      'alc892': 1,
      'alc897': 1,
      'alc1220': 1,
      'alc256': 56,
      'alc269': 32,
      'alc285': 61
    };

    const codecLower = codec.toLowerCase();
    for (const [key, value] of Object.entries(codecMap)) {
      if (codecLower.includes(key)) {
        return value;
      }
    }
    return 1; // 默认布局ID
  }

  /**
   * 获取SMBIOS信息
   */
  private getSMBIOSInfo() {
    // 根据硬件配置选择合适的SMBIOS
    let model = 'iMac19,1'; // 默认型号
    
    if (this.hardwareConfig.cpu.brand.toLowerCase().includes('intel')) {
      const cpuModel = this.hardwareConfig.cpu.model.toLowerCase();
      if (cpuModel.includes('i9') || cpuModel.includes('i7')) {
        model = 'iMac20,2';
      } else if (cpuModel.includes('i5')) {
        model = 'iMac20,1';
      }
    }

    // 生成随机序列号和UUID（实际应用中应该使用更复杂的生成逻辑）
    const serial = this.generateSerialNumber(model);
    const mlb = this.generateMLB(serial);
    const uuid = this.generateUUID();
    const rom = this.generateROM();

    return {
      model,
      serial,
      mlb,
      uuid,
      rom
    };
  }

  /**
   * 生成序列号
   */
  private generateSerialNumber(model: string): string {
    // 简化的序列号生成逻辑
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 生成MLB
   */
  private generateMLB(serial: string): string {
    // 简化的MLB生成逻辑
    return serial + '00000';
  }

  /**
   * 生成UUID
   */
  private generateUUID(): string {
    // 简化的UUID生成逻辑
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * 生成ROM
   */
  private generateROM(): string {
    // 简化的ROM生成逻辑
    const rom = [];
    for (let i = 0; i < 6; i++) {
      rom.push(Math.floor(Math.random() * 256).toString(16).padStart(2, '0'));
    }
    return rom.join(':').toUpperCase();
  }
}

/**
 * 配置生成工具函数
 */
export const configUtils = {
  /**
   * 生成OpenCore配置
   */
  generateOpenCoreConfig: (hardwareConfig: HardwareConfig, version?: string): OpenCoreConfig => {
    const generator = new OpenCoreConfigGenerator(hardwareConfig, version);
    return generator.generateConfig();
  },

  /**
   * 验证配置完整性
   */
  validateConfig: (config: OpenCoreConfig): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // 检查必需的配置项
    if (!config.Kernel?.Add?.length) {
      errors.push('缺少必需的Kext配置');
    }

    if (!config.UEFI?.Drivers?.length) {
      errors.push('缺少必需的UEFI驱动');
    }

    if (!config.PlatformInfo?.Generic?.SystemProductName) {
      errors.push('缺少SMBIOS配置');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * 导出配置为JSON字符串
   */
  exportConfig: (config: OpenCoreConfig): string => {
    return JSON.stringify(config, null, 2);
  },

  /**
   * 从JSON字符串导入配置
   */
  importConfig: (jsonString: string): OpenCoreConfig => {
    try {
      return JSON.parse(jsonString) as OpenCoreConfig;
    } catch (error) {
      throw new Error('无效的配置文件格式');
    }
  }
};