import { HardwareSelection } from '@/types';
import { DriverSupportInfo } from '@/types/driver-support';

export const getRecommendedKexts = (hardware: HardwareSelection, allKexts: DriverSupportInfo[]): string[] => {
  const recommendations = new Set<string>();

  // Essential kexts that are almost always needed.
  recommendations.add('Lilu');
  recommendations.add('VirtualSMC');

  // Graphics kexts.
  if (hardware.gpuBrand?.toLowerCase() === 'amd' || hardware.gpuBrand?.toLowerCase() === 'intel') {
    recommendations.add('WhateverGreen');
  }

  // Audio kexts.
  recommendations.add('AppleALC');

  // Ethernet kexts. This is a simplified logic.
  // A more robust solution would involve a mapping from chipset to network interface.
  const isIntelPlatform = hardware.cpuGeneration?.toLowerCase().includes('intel') ||
                         hardware.cpuModel?.toLowerCase().includes('intel') ||
                         !hardware.cpuGeneration?.toLowerCase().includes('amd');

  if (isIntelPlatform) {
    recommendations.add('IntelMausi'); // Common for Intel platforms
  } else {
    recommendations.add('RealtekRTL8111'); // Common for AMD platforms
  }

  // USB kexts.
  recommendations.add('XHCI-unsupported');

  // Filter recommendations to ensure they exist in the driver database.
  const availableKextIds = new Set(allKexts.map(k => k.id));
  return Array.from(recommendations).filter(id => availableKextIds.has(id));
};