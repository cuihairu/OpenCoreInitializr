import type { HardwareConfig, OpenCoreConfig } from '@/types';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Field validation result
 */
export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validation rules
 */
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

/**
 * Validate a single field
 */
export function validateField(value: any, rules: ValidationRule): FieldValidationResult {
  // Check required
  if (rules.required && (value === null || value === undefined || value === '')) {
    return { isValid: false, error: 'This field is required' };
  }

  // Skip other validations if value is empty and not required
  if (!rules.required && (value === null || value === undefined || value === '')) {
    return { isValid: true };
  }

  const stringValue = String(value);

  // Check minimum length
  if (rules.minLength && stringValue.length < rules.minLength) {
    return { isValid: false, error: `Minimum length is ${rules.minLength}` };
  }

  // Check maximum length
  if (rules.maxLength && stringValue.length > rules.maxLength) {
    return { isValid: false, error: `Maximum length is ${rules.maxLength}` };
  }

  // Check pattern
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    return { isValid: false, error: 'Invalid format' };
  }

  // Check custom validation
  if (rules.custom) {
    const customResult = rules.custom(value);
    if (typeof customResult === 'string') {
      return { isValid: false, error: customResult };
    }
    if (!customResult) {
      return { isValid: false, error: 'Invalid value' };
    }
  }

  return { isValid: true };
}

/**
 * Validate hardware configuration
 */
export function validateHardwareConfig(config: Partial<HardwareConfig>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // CPU validation
  if (!config.cpu?.brand) {
    errors.push('CPU brand is required');
  }
  if (!config.cpu?.model) {
    warnings.push('CPU model is recommended for better compatibility');
  }

  // Motherboard validation
  if (!config.motherboard?.brand) {
    errors.push('Motherboard brand is required');
  }
  if (!config.motherboard?.chipset) {
    errors.push('Motherboard chipset is required');
  }

  // GPU validation
  if (config.gpu?.discrete && !config.gpu.discrete.brand) {
    errors.push('GPU brand is required when discrete GPU is configured');
  }
  if (config.gpu?.discrete && !config.gpu.discrete.model) {
    errors.push('GPU model is required when discrete GPU is configured');
  }
  if (config.gpu?.integrated && !config.gpu.integrated.model) {
    warnings.push('Integrated GPU model is recommended for better compatibility');
  }

  // Audio validation
  if (!config.audio?.codec) {
    warnings.push('Audio codec is recommended for audio functionality');
  }

  // Network validation
  if (config.network?.ethernet && !config.network.ethernet.brand) {
    warnings.push('Ethernet brand is recommended when ethernet is configured');
  }
  if (config.network?.wifi && !config.network.wifi.brand) {
    warnings.push('Wi-Fi brand is recommended when Wi-Fi is configured');
  }

  // Storage validation
  if (config.storage?.drives && config.storage.drives.length === 0) {
    warnings.push('At least one storage drive should be configured');
  }
  if (config.storage?.drives) {
    config.storage.drives.forEach((drive, index) => {
      if (drive.size <= 0) {
        errors.push(`Storage drive ${index + 1}: Size must be greater than 0`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate OpenCore configuration
 */
export function validateOpenCoreConfig(config: Partial<OpenCoreConfig>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Version validation
  if (!config.version) {
    errors.push('OpenCore version is required');
  }

  // Platform Info validation
  if (config.PlatformInfo) {
    if (!config.PlatformInfo.Generic?.SystemProductName) {
      errors.push('SMBIOS model (SystemProductName) is required');
    }
    
    if (config.PlatformInfo.Generic?.SystemSerialNumber) {
      if (!isValidSerialNumber(config.PlatformInfo.Generic.SystemSerialNumber)) {
        errors.push('Invalid serial number format');
      }
    }
    
    if (config.PlatformInfo.Generic?.SystemUUID) {
      if (!isValidUUID(config.PlatformInfo.Generic.SystemUUID)) {
        errors.push('Invalid system UUID format');
      }
    }
    
    if (config.PlatformInfo.Generic?.ROM) {
      if (!isValidMacAddress(config.PlatformInfo.Generic.ROM)) {
        errors.push('Invalid ROM (MAC address) format');
      }
    }
  }

  // Security validation
  if (config.Misc?.Security) {
    if (config.Misc.Security.Vault === 'Secure' && !config.Misc.Security.ScanPolicy) {
      warnings.push('Scan policy should be configured when using secure vault');
    }
  }

  // Misc validation
  if (config.Misc?.Boot) {
    if (config.Misc.Boot.Timeout && (config.Misc.Boot.Timeout < 0 || config.Misc.Boot.Timeout > 60)) {
      warnings.push('Boot timeout should be between 0 and 60 seconds');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate serial number format
 */
export function isValidSerialNumber(serial: string): boolean {
  // Apple serial numbers are typically 10-12 characters, alphanumeric
  const serialRegex = /^[A-Z0-9]{10,12}$/;
  return serialRegex.test(serial);
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate MAC address format
 */
export function isValidMacAddress(mac: string): boolean {
  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  return macRegex.test(mac);
}

/**
 * Validate boot arguments
 */
export function validateBootArgs(bootArgs: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!bootArgs.trim()) {
    return { isValid: true, errors, warnings };
  }

  const args = bootArgs.split(/\s+/).filter(arg => arg.length > 0);
  const dangerousArgs = ['npci=0x2000', 'npci=0x3000', 'slide=0'];
  const deprecatedArgs = ['-v', 'debug=0x100', 'keepsyms=1'];

  for (const arg of args) {
    // Check for dangerous arguments
    if (dangerousArgs.some(dangerous => arg.includes(dangerous))) {
      warnings.push(`Potentially dangerous boot argument: ${arg}`);
    }

    // Check for deprecated arguments
    if (deprecatedArgs.includes(arg)) {
      warnings.push(`Deprecated boot argument: ${arg}`);
    }

    // Check for malformed arguments
    if (arg.includes('=') && !arg.match(/^[a-zA-Z_][a-zA-Z0-9_]*=.+$/)) {
      errors.push(`Malformed boot argument: ${arg}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate kext selection
 */
export function validateKextSelection(selectedKexts: string[], hardwareConfig: Partial<HardwareConfig>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Essential kexts that should always be present
  const essentialKexts = ['Lilu', 'VirtualSMC'];
  
  for (const essential of essentialKexts) {
    if (!selectedKexts.includes(essential)) {
      errors.push(`Essential kext missing: ${essential}`);
    }
  }

  // Hardware-specific kext recommendations
  if (hardwareConfig.cpu?.brand === 'AMD' && !selectedKexts.includes('AMDRyzenCPUPowerManagement')) {
    warnings.push('AMDRyzenCPUPowerManagement is recommended for AMD CPUs');
  }

  if (hardwareConfig.gpu?.discrete?.brand === 'NVIDIA' && !selectedKexts.includes('NVDAEnabler')) {
    warnings.push('NVDAEnabler may be needed for NVIDIA GPUs');
  }

  if (hardwareConfig.audio?.codec && !selectedKexts.includes('AppleALC')) {
    warnings.push('AppleALC is recommended for audio functionality');
  }

  if (hardwareConfig.network?.ethernet) {
    const ethernetKexts = ['IntelMausi', 'RealtekRTL8111', 'AtherosE2200Ethernet'];
    const hasEthernetKext = ethernetKexts.some(kext => selectedKexts.includes(kext));
    if (!hasEthernetKext) {
      warnings.push('An ethernet kext is recommended for network connectivity');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate complete configuration
 */
export function validateCompleteConfig(
  hardwareConfig: Partial<HardwareConfig>,
  openCoreConfig: Partial<OpenCoreConfig>,
  selectedKexts: string[]
): ValidationResult {
  const hardwareValidation = validateHardwareConfig(hardwareConfig);
  const openCoreValidation = validateOpenCoreConfig(openCoreConfig);
  const kextValidation = validateKextSelection(selectedKexts, hardwareConfig);

  return {
    isValid: hardwareValidation.isValid && openCoreValidation.isValid && kextValidation.isValid,
    errors: [
      ...hardwareValidation.errors,
      ...openCoreValidation.errors,
      ...kextValidation.errors,
    ],
    warnings: [
      ...hardwareValidation.warnings,
      ...openCoreValidation.warnings,
      ...kextValidation.warnings,
    ],
  };
}

/**
 * Get validation summary
 */
export function getValidationSummary(validation: ValidationResult): string {
  if (validation.isValid) {
    if (validation.warnings.length > 0) {
      return `Configuration is valid with ${validation.warnings.length} warning(s)`;
    }
    return 'Configuration is valid';
  }
  
  return `Configuration has ${validation.errors.length} error(s) and ${validation.warnings.length} warning(s)`;
}