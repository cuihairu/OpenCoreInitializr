import type { VersionInfo, KextInfo, CompatibilityInfo } from '@/types';

/**
 * OpenCore version information
 */
export const OPENCORE_VERSIONS: VersionInfo[] = [
  {
    name: 'OpenCore',
    version: '1.0.2',
    releaseDate: '2024-12-09',
    downloadUrl: 'https://github.com/acidanthera/OpenCorePkg/releases/download/1.0.2/OpenCore-1.0.2-RELEASE.zip',
    changelog: 'Latest stable release with improved compatibility and bug fixes',
    prerelease: false,
    assets: [
      {
        name: 'OpenCore-1.0.2-RELEASE.zip',
        url: 'https://github.com/acidanthera/OpenCorePkg/releases/download/1.0.2/OpenCore-1.0.2-RELEASE.zip',
        size: 15728640, // ~15MB
        contentType: 'application/zip',
      },
      {
        name: 'OpenCore-1.0.2-DEBUG.zip',
        url: 'https://github.com/acidanthera/OpenCorePkg/releases/download/1.0.2/OpenCore-1.0.2-DEBUG.zip',
        size: 18874368, // ~18MB
        contentType: 'application/zip',
      },
    ],
  },
  {
    name: 'OpenCore',
    version: '1.0.1',
    releaseDate: '2024-11-04',
    downloadUrl: 'https://github.com/acidanthera/OpenCorePkg/releases/download/1.0.1/OpenCore-1.0.1-RELEASE.zip',
    changelog: 'Previous stable release',
    prerelease: false,
    assets: [
      {
        name: 'OpenCore-1.0.1-RELEASE.zip',
        url: 'https://github.com/acidanthera/OpenCorePkg/releases/download/1.0.1/OpenCore-1.0.1-RELEASE.zip',
        size: 15663104, // ~15MB
        contentType: 'application/zip',
      },
    ],
  },
  {
    name: 'OpenCore',
    version: '1.0.3-DEV',
    releaseDate: '2024-12-15',
    downloadUrl: 'https://github.com/acidanthera/OpenCorePkg/releases/download/1.0.3-DEV/OpenCore-1.0.3-DEV.zip',
    changelog: 'Development build with latest features (use at your own risk)',
    prerelease: true,
    assets: [
      {
        name: 'OpenCore-1.0.3-DEV.zip',
        url: 'https://github.com/acidanthera/OpenCorePkg/releases/download/1.0.3-DEV/OpenCore-1.0.3-DEV.zip',
        size: 16777216, // ~16MB
        contentType: 'application/zip',
      },
    ],
  },
];

/**
 * Essential kexts information
 */
export const ESSENTIAL_KEXTS: KextInfo[] = [
  {
    identifier: 'as.vit9696.Lilu',
    name: 'Lilu',
    description: 'Arbitrary kext and process patching on macOS',
    category: 'essential',
    author: 'vit9696',
    repository: 'https://github.com/acidanthera/Lilu',
    latestVersion: {
      name: 'Lilu',
      version: '1.6.8',
      releaseDate: '2024-11-04',
      downloadUrl: 'https://github.com/acidanthera/Lilu/releases/download/1.6.8/Lilu-1.6.8-RELEASE.zip',
      prerelease: false,
      assets: [
        {
          name: 'Lilu-1.6.8-RELEASE.zip',
          url: 'https://github.com/acidanthera/Lilu/releases/download/1.6.8/Lilu-1.6.8-RELEASE.zip',
          size: 1048576, // ~1MB
          contentType: 'application/zip',
        },
      ],
    },
    compatibility: {
      macOSVersions: ['10.8', '10.9', '10.10', '10.11', '10.12', '10.13', '10.14', '10.15', '11.0', '12.0', '13.0', '14.0', '15.0'],
      openCoreVersions: ['0.6.0', '0.7.0', '0.8.0', '0.9.0', '1.0.0', '1.0.1', '1.0.2'],
      hardwareSupport: {
        intel: true,
        amd: true,
        appleSilicon: false,
      },
    },
    dependencies: [],
    conflicts: [],
  },
  {
    identifier: 'as.vit9696.VirtualSMC',
    name: 'VirtualSMC',
    description: 'Advanced Apple SMC emulator in the kernel',
    category: 'essential',
    author: 'vit9696',
    repository: 'https://github.com/acidanthera/VirtualSMC',
    latestVersion: {
      name: 'VirtualSMC',
      version: '1.3.3',
      releaseDate: '2024-11-04',
      downloadUrl: 'https://github.com/acidanthera/VirtualSMC/releases/download/1.3.3/VirtualSMC-1.3.3-RELEASE.zip',
      prerelease: false,
      assets: [
        {
          name: 'VirtualSMC-1.3.3-RELEASE.zip',
          url: 'https://github.com/acidanthera/VirtualSMC/releases/download/1.3.3/VirtualSMC-1.3.3-RELEASE.zip',
          size: 2097152, // ~2MB
          contentType: 'application/zip',
        },
      ],
    },
    compatibility: {
      macOSVersions: ['10.6', '10.7', '10.8', '10.9', '10.10', '10.11', '10.12', '10.13', '10.14', '10.15', '11.0', '12.0', '13.0', '14.0', '15.0'],
      openCoreVersions: ['0.6.0', '0.7.0', '0.8.0', '0.9.0', '1.0.0', '1.0.1', '1.0.2'],
      hardwareSupport: {
        intel: true,
        amd: true,
        appleSilicon: false,
      },
    },
    dependencies: [],
    conflicts: ['FakeSMC'],
  },
];

/**
 * Graphics kexts information
 */
export const GRAPHICS_KEXTS: KextInfo[] = [
  {
    identifier: 'as.vit9696.WhateverGreen',
    name: 'WhateverGreen',
    description: 'Various patches necessary for certain ATI/AMD/Intel/Nvidia GPUs',
    category: 'graphics',
    author: 'vit9696',
    repository: 'https://github.com/acidanthera/WhateverGreen',
    latestVersion: {
      name: 'WhateverGreen',
      version: '1.6.7',
      releaseDate: '2024-11-04',
      downloadUrl: 'https://github.com/acidanthera/WhateverGreen/releases/download/1.6.7/WhateverGreen-1.6.7-RELEASE.zip',
      prerelease: false,
      assets: [
        {
          name: 'WhateverGreen-1.6.7-RELEASE.zip',
          url: 'https://github.com/acidanthera/WhateverGreen/releases/download/1.6.7/WhateverGreen-1.6.7-RELEASE.zip',
          size: 1572864, // ~1.5MB
          contentType: 'application/zip',
        },
      ],
    },
    compatibility: {
      macOSVersions: ['10.8', '10.9', '10.10', '10.11', '10.12', '10.13', '10.14', '10.15', '11.0', '12.0', '13.0', '14.0', '15.0'],
      openCoreVersions: ['0.6.0', '0.7.0', '0.8.0', '0.9.0', '1.0.0', '1.0.1', '1.0.2'],
      hardwareSupport: {
        intel: true,
        amd: true,
        appleSilicon: false,
      },
    },
    dependencies: ['Lilu'],
    conflicts: [],
  },
];

/**
 * Audio kexts information
 */
export const AUDIO_KEXTS: KextInfo[] = [
  {
    identifier: 'as.vit9696.AppleALC',
    name: 'AppleALC',
    description: 'Native macOS HD audio for not officially supported codecs',
    category: 'audio',
    author: 'vit9696',
    repository: 'https://github.com/acidanthera/AppleALC',
    latestVersion: {
      name: 'AppleALC',
      version: '1.9.1',
      releaseDate: '2024-11-04',
      downloadUrl: 'https://github.com/acidanthera/AppleALC/releases/download/1.9.1/AppleALC-1.9.1-RELEASE.zip',
      prerelease: false,
      assets: [
        {
          name: 'AppleALC-1.9.1-RELEASE.zip',
          url: 'https://github.com/acidanthera/AppleALC/releases/download/1.9.1/AppleALC-1.9.1-RELEASE.zip',
          size: 3145728, // ~3MB
          contentType: 'application/zip',
        },
      ],
    },
    compatibility: {
      macOSVersions: ['10.8', '10.9', '10.10', '10.11', '10.12', '10.13', '10.14', '10.15', '11.0', '12.0', '13.0', '14.0', '15.0'],
      openCoreVersions: ['0.6.0', '0.7.0', '0.8.0', '0.9.0', '1.0.0', '1.0.1', '1.0.2'],
      hardwareSupport: {
        intel: true,
        amd: true,
        appleSilicon: false,
      },
    },
    dependencies: ['Lilu'],
    conflicts: [],
  },
];

/**
 * Ethernet kexts information
 */
export const ETHERNET_KEXTS: KextInfo[] = [
  {
    identifier: 'as.lvs1974.IntelMausi',
    name: 'IntelMausi',
    description: 'Intel onboard LAN driver for macOS',
    category: 'ethernet',
    author: 'Mieze',
    repository: 'https://github.com/acidanthera/IntelMausi',
    latestVersion: {
      name: 'IntelMausi',
      version: '1.0.8',
      releaseDate: '2024-11-04',
      downloadUrl: 'https://github.com/acidanthera/IntelMausi/releases/download/1.0.8/IntelMausi-1.0.8-RELEASE.zip',
      prerelease: false,
      assets: [
        {
          name: 'IntelMausi-1.0.8-RELEASE.zip',
          url: 'https://github.com/acidanthera/IntelMausi/releases/download/1.0.8/IntelMausi-1.0.8-RELEASE.zip',
          size: 524288, // ~512KB
          contentType: 'application/zip',
        },
      ],
    },
    compatibility: {
      macOSVersions: ['10.9', '10.10', '10.11', '10.12', '10.13', '10.14', '10.15', '11.0', '12.0', '13.0', '14.0', '15.0'],
      openCoreVersions: ['0.6.0', '0.7.0', '0.8.0', '0.9.0', '1.0.0', '1.0.1', '1.0.2'],
      hardwareSupport: {
        intel: true,
        amd: true,
        appleSilicon: false,
      },
    },
    dependencies: [],
    conflicts: [],
  },
  {
    identifier: 'com.insanelymac.RealtekRTL8111',
    name: 'RealtekRTL8111',
    description: 'Realtek RTL8111/8168 B/C/D/E/F/G/H ethernet driver for macOS',
    category: 'ethernet',
    author: 'Mieze',
    repository: 'https://github.com/Mieze/RTL8111_driver_for_OS_X',
    latestVersion: {
      name: 'RealtekRTL8111',
      version: '2.4.2',
      releaseDate: '2024-01-15',
      downloadUrl: 'https://github.com/Mieze/RTL8111_driver_for_OS_X/releases/download/v2.4.2/RealtekRTL8111-V2.4.2.zip',
      prerelease: false,
      assets: [
        {
          name: 'RealtekRTL8111-V2.4.2.zip',
          url: 'https://github.com/Mieze/RTL8111_driver_for_OS_X/releases/download/v2.4.2/RealtekRTL8111-V2.4.2.zip',
          size: 262144, // ~256KB
          contentType: 'application/zip',
        },
      ],
    },
    compatibility: {
      macOSVersions: ['10.12', '10.13', '10.14', '10.15', '11.0', '12.0', '13.0', '14.0', '15.0'],
      openCoreVersions: ['0.6.0', '0.7.0', '0.8.0', '0.9.0', '1.0.0', '1.0.1', '1.0.2'],
      hardwareSupport: {
        intel: true,
        amd: true,
        appleSilicon: false,
      },
    },
    dependencies: [],
    conflicts: [],
  },
];

/**
 * USB kexts information
 */
export const USB_KEXTS: KextInfo[] = [
  {
    identifier: 'com.corpnewt.USBMap',
    name: 'USBMap',
    description: 'USB port mapping kext',
    category: 'usb',
    author: 'corpnewt',
    repository: 'https://github.com/corpnewt/USBMap',
    latestVersion: {
      name: 'USBMap',
      version: '1.0.0',
      releaseDate: '2024-01-01',
      downloadUrl: 'https://github.com/corpnewt/USBMap/archive/refs/heads/master.zip',
      prerelease: false,
      assets: [
        {
          name: 'USBMap-master.zip',
          url: 'https://github.com/corpnewt/USBMap/archive/refs/heads/master.zip',
          size: 131072, // ~128KB
          contentType: 'application/zip',
        },
      ],
    },
    compatibility: {
      macOSVersions: ['10.11', '10.12', '10.13', '10.14', '10.15', '11.0', '12.0', '13.0', '14.0', '15.0'],
      openCoreVersions: ['0.6.0', '0.7.0', '0.8.0', '0.9.0', '1.0.0', '1.0.1', '1.0.2'],
      hardwareSupport: {
        intel: true,
        amd: true,
        appleSilicon: false,
      },
    },
    dependencies: [],
    conflicts: [],
  },
];

/**
 * Get all available kexts
 */
export function getAllKexts(): KextInfo[] {
  return [
    ...ESSENTIAL_KEXTS,
    ...GRAPHICS_KEXTS,
    ...AUDIO_KEXTS,
    ...ETHERNET_KEXTS,
    ...USB_KEXTS,
  ];
}

/**
 * Get kexts by category
 */
export function getKextsByCategory(category: KextInfo['category']): KextInfo[] {
  return getAllKexts().filter(kext => kext.category === category);
}

/**
 * Get latest OpenCore version
 */
export function getLatestOpenCoreVersion(): VersionInfo {
  return OPENCORE_VERSIONS.filter(v => !v.prerelease)[0];
}

/**
 * Get OpenCore version by version string
 */
export function getOpenCoreVersion(version: string): VersionInfo | undefined {
  return OPENCORE_VERSIONS.find(v => v.version === version);
}

/**
 * Check if a kext is compatible with given macOS and OpenCore versions
 */
export function isKextCompatible(
  kext: KextInfo,
  macOSVersion: string,
  openCoreVersion: string
): boolean {
  const macOSCompatible = kext.compatibility.macOSVersions.some(v => 
    macOSVersion.startsWith(v)
  );
  
  const openCoreCompatible = kext.compatibility.openCoreVersions.some(v => 
    openCoreVersion.startsWith(v)
  );
  
  return macOSCompatible && openCoreCompatible;
}

/**
 * Get recommended kexts based on hardware configuration
 */
export function getRecommendedKexts(hardware: any): KextInfo[] {
  const recommended: KextInfo[] = [];
  
  // Always include essential kexts
  recommended.push(...ESSENTIAL_KEXTS);
  
  // Add graphics kext if discrete GPU is present
  if (hardware.gpu?.discrete) {
    recommended.push(...GRAPHICS_KEXTS);
  }
  
  // Add audio kext if audio codec is specified
  if (hardware.audio?.codec) {
    recommended.push(...AUDIO_KEXTS);
  }
  
  // Add ethernet kext based on network hardware
  if (hardware.network?.ethernet) {
    const brand = hardware.network.ethernet.brand?.toLowerCase();
    if (brand?.includes('intel')) {
      recommended.push(ETHERNET_KEXTS.find(k => k.name === 'IntelMausi')!);
    } else if (brand?.includes('realtek')) {
      recommended.push(ETHERNET_KEXTS.find(k => k.name === 'RealtekRTL8111')!);
    }
  }
  
  return recommended.filter(Boolean);
}

/**
 * Check for kext conflicts
 */
export function checkKextConflicts(selectedKexts: string[]): string[] {
  const conflicts: string[] = [];
  const allKexts = getAllKexts();
  
  for (const kextName of selectedKexts) {
    const kext = allKexts.find(k => k.name === kextName);
    if (kext) {
      for (const conflict of kext.conflicts) {
        if (selectedKexts.includes(conflict)) {
          conflicts.push(`${kextName} conflicts with ${conflict}`);
        }
      }
    }
  }
  
  return conflicts;
}

/**
 * Get missing dependencies for selected kexts
 */
export function getMissingDependencies(selectedKexts: string[]): string[] {
  const missing: string[] = [];
  const allKexts = getAllKexts();
  
  for (const kextName of selectedKexts) {
    const kext = allKexts.find(k => k.name === kextName);
    if (kext) {
      for (const dependency of kext.dependencies) {
        if (!selectedKexts.includes(dependency)) {
          missing.push(dependency);
        }
      }
    }
  }
  
  return [...new Set(missing)];
}

/**
 * Get version changelog
 */
export function getVersionChangelog(version: string): string | undefined {
  const versionInfo = OPENCORE_VERSIONS.find(v => v.version === version);
  return versionInfo?.changelog;
}

/**
 * Compare version strings
 */
export function compareVersions(a: string, b: string): number {
  const parseVersion = (version: string) => {
    return version.split(/[.-]/).map(part => {
      const num = parseInt(part, 10);
      return isNaN(num) ? part : num;
    });
  };
  
  const aParts = parseVersion(a);
  const bParts = parseVersion(b);
  const maxLength = Math.max(aParts.length, bParts.length);
  
  for (let i = 0; i < maxLength; i++) {
    const aPart = aParts[i] || 0;
    const bPart = bParts[i] || 0;
    
    if (typeof aPart === 'number' && typeof bPart === 'number') {
      if (aPart !== bPart) {
        return aPart - bPart;
      }
    } else {
      const aStr = String(aPart);
      const bStr = String(bPart);
      if (aStr !== bStr) {
        return aStr.localeCompare(bStr);
      }
    }
  }
  
  return 0;
}

/**
 * Check if version is newer
 */
export function isNewerVersion(current: string, target: string): boolean {
  return compareVersions(target, current) > 0;
}