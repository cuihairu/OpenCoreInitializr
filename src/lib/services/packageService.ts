// Temporarily disabled due to build errors
// This service is not used in the current wizard flow

import type { HardwareConfig, PackageOptions } from '../../types';

export class PackageService {
  async generatePackage(): Promise<Uint8Array> {
    throw new Error('Service temporarily disabled');
  }

  async getPackagePreview(hardwareConfig: HardwareConfig, packageOptions: PackageOptions) {
    throw new Error('Service temporarily disabled');
  }

  validateHardwareConfig() {
    return { isValid: false, errors: ['Service disabled'], warnings: [] };
  }

  getSupportedHardware() {
    return {
      cpus: [],
      chipsets: [],
      gpus: { integrated: [], discrete: [] },
      audioCodecs: [],
      ethernetControllers: []
    };
  }
}

export const packageService = new PackageService();