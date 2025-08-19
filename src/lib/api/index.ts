import type { 
  ApiResponse, 
  VersionInfo, 
  KextInfo, 
  HardwareConfig, 
  OpenCoreConfig,
  GeneratedFile,
  DownloadItem 
} from '@/types';
import { sleep } from '@/lib/utils';

/**
 * API configuration
 */
const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.opencoreinitiator.com',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};

/**
 * API error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * HTTP client with retry logic
 */
class HttpClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string, timeout: number = 30000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code,
          errorData.details
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError('Request timeout', 408, 'TIMEOUT');
        }
        throw new ApiError(error.message, undefined, 'NETWORK_ERROR');
      }
      
      throw new ApiError('Unknown error occurred', 500, 'UNKNOWN_ERROR');
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

/**
 * API client instance
 */
const apiClient = new HttpClient(API_CONFIG.baseUrl, API_CONFIG.timeout);

/**
 * Version API
 */
export const versionApi = {
  /**
   * Get latest OpenCore versions
   */
  async getOpenCoreVersions(): Promise<VersionInfo[]> {
    const response = await apiClient.get<VersionInfo[]>('/versions/opencore');
    return response.data!;
  },

  /**
   * Get specific OpenCore version
   */
  async getOpenCoreVersion(version: string): Promise<VersionInfo> {
    const response = await apiClient.get<VersionInfo>(`/versions/opencore/${version}`);
    return response.data!;
  },

  /**
   * Check for updates
   */
  async checkForUpdates(currentVersion: string): Promise<{
    hasUpdate: boolean;
    latestVersion?: VersionInfo;
  }> {
    const response = await apiClient.get<{
      hasUpdate: boolean;
      latestVersion?: VersionInfo;
    }>(`/versions/check-updates?current=${currentVersion}`);
    return response.data!;
  },
};

/**
 * Kext API
 */
export const kextApi = {
  /**
   * Get all available kexts
   */
  async getAllKexts(): Promise<KextInfo[]> {
    const response = await apiClient.get<KextInfo[]>('/kexts');
    return response.data!;
  },

  /**
   * Get kexts by category
   */
  async getKextsByCategory(category: string): Promise<KextInfo[]> {
    const response = await apiClient.get<KextInfo[]>(`/kexts/category/${category}`);
    return response.data!;
  },

  /**
   * Get recommended kexts for hardware
   */
  async getRecommendedKexts(hardware: HardwareConfig): Promise<KextInfo[]> {
    const response = await apiClient.post<KextInfo[]>('/kexts/recommend', hardware);
    return response.data!;
  },

  /**
   * Search kexts
   */
  async searchKexts(query: string): Promise<KextInfo[]> {
    const response = await apiClient.get<KextInfo[]>(`/kexts/search?q=${encodeURIComponent(query)}`);
    return response.data!;
  },
};

/**
 * Configuration API
 */
export const configApi = {
  /**
   * Generate OpenCore configuration
   */
  async generateConfig(hardware: HardwareConfig): Promise<{
    config: OpenCoreConfig;
    files: GeneratedFile[];
  }> {
    const response = await apiClient.post<{
      config: OpenCoreConfig;
      files: GeneratedFile[];
    }>('/config/generate', hardware);
    return response.data!;
  },

  /**
   * Validate configuration
   */
  async validateConfig(config: OpenCoreConfig): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const response = await apiClient.post<{
      isValid: boolean;
      errors: string[];
      warnings: string[];
    }>('/config/validate', config);
    return response.data!;
  },

  /**
   * Get configuration template
   */
  async getConfigTemplate(type: string): Promise<OpenCoreConfig> {
    const response = await apiClient.get<OpenCoreConfig>(`/config/template/${type}`);
    return response.data!;
  },
};

/**
 * Download API
 */
export const downloadApi = {
  /**
   * Create download package
   */
  async createPackage(config: {
    hardware: HardwareConfig;
    opencore: OpenCoreConfig;
    selectedKexts: string[];
    packageType: 'zip' | 'iso';
  }): Promise<{
    downloadId: string;
    downloadUrl: string;
    expiresAt: string;
  }> {
    const response = await apiClient.post<{
      downloadId: string;
      downloadUrl: string;
      expiresAt: string;
    }>('/download/create', config);
    return response.data!;
  },

  /**
   * Get download status
   */
  async getDownloadStatus(downloadId: string): Promise<DownloadItem> {
    const response = await apiClient.get<DownloadItem>(`/download/status/${downloadId}`);
    return response.data!;
  },

  /**
   * Download file with progress tracking
   */
  async downloadFile(
    url: string,
    onProgress?: (progress: number) => void
  ): Promise<Blob> {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new ApiError(
        `Download failed: ${response.statusText}`,
        response.status,
        'DOWNLOAD_ERROR'
      );
    }

    const contentLength = response.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    
    if (!response.body) {
      throw new ApiError('No response body', 500, 'NO_RESPONSE_BODY');
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let loaded = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        loaded += value.length;
        
        if (onProgress && total > 0) {
          onProgress((loaded / total) * 100);
        }
      }
    } finally {
      reader.releaseLock();
    }

    return new Blob(chunks);
  },
};

/**
 * Hardware detection API
 */
export const hardwareApi = {
  /**
   * Detect hardware automatically (if supported)
   */
  async detectHardware(): Promise<Partial<HardwareConfig>> {
    try {
      const response = await apiClient.get<Partial<HardwareConfig>>('/hardware/detect');
      return response.data!;
    } catch (error) {
      // Hardware detection is optional, return empty config if it fails
      console.warn('Hardware detection failed:', error);
      return {};
    }
  },

  /**
   * Get hardware database
   */
  async getHardwareDatabase(): Promise<{
    cpus: Array<{ model: string; brand: string; generation: string }>;
    gpus: Array<{ model: string; brand: string; type: 'integrated' | 'discrete' }>;
    motherboards: Array<{ model: string; brand: string; chipset: string }>;
  }> {
    const response = await apiClient.get<{
      cpus: Array<{ model: string; brand: string; generation: string }>;
      gpus: Array<{ model: string; brand: string; type: 'integrated' | 'discrete' }>;
      motherboards: Array<{ model: string; brand: string; chipset: string }>;
    }>('/hardware/database');
    return response.data!;
  },
};

/**
 * Analytics API (optional)
 */
export const analyticsApi = {
  /**
   * Track configuration generation
   */
  async trackGeneration(data: {
    hardwareType: string;
    openCoreVersion: string;
    selectedKexts: string[];
    success: boolean;
  }): Promise<void> {
    try {
      await apiClient.post('/analytics/track', {
        event: 'config_generation',
        ...data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      // Analytics failures should not affect user experience
      console.warn('Analytics tracking failed:', error);
    }
  },

  /**
   * Track download
   */
  async trackDownload(data: {
    packageType: string;
    fileSize: number;
    success: boolean;
  }): Promise<void> {
    try {
      await apiClient.post('/analytics/track', {
        event: 'package_download',
        ...data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  },
};

/**
 * Health check API
 */
export const healthApi = {
  /**
   * Check API health
   */
  async checkHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    version: string;
    uptime: number;
    services: Record<string, 'up' | 'down'>;
  }> {
    const response = await apiClient.get<{
      status: 'healthy' | 'degraded' | 'unhealthy';
      version: string;
      uptime: number;
      services: Record<string, 'up' | 'down'>;
    }>('/health');
    return response.data!;
  },
};

/**
 * Export all APIs
 */
export const api = {
  version: versionApi,
  kext: kextApi,
  config: configApi,
  download: downloadApi,
  hardware: hardwareApi,
  analytics: analyticsApi,
  health: healthApi,
};

export default api;

/**
 * API utilities
 */
export const apiUtils = {
  /**
   * Check if error is a network error
   */
  isNetworkError(error: unknown): boolean {
    return error instanceof ApiError && error.code === 'NETWORK_ERROR';
  },

  /**
   * Check if error is a timeout error
   */
  isTimeoutError(error: unknown): boolean {
    return error instanceof ApiError && error.code === 'TIMEOUT';
  },

  /**
   * Check if error is a server error
   */
  isServerError(error: unknown): boolean {
    return error instanceof ApiError && 
           error.status !== undefined && 
           error.status >= 500;
  },

  /**
   * Get user-friendly error message
   */
  getErrorMessage(error: unknown): string {
    if (error instanceof ApiError) {
      switch (error.code) {
        case 'NETWORK_ERROR':
          return 'Network connection failed. Please check your internet connection.';
        case 'TIMEOUT':
          return 'Request timed out. Please try again.';
        case 'DOWNLOAD_ERROR':
          return 'Download failed. Please try again later.';
        default:
          return error.message;
      }
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    return 'An unknown error occurred.';
  },
};