import axios, { AxiosProgressEvent } from 'axios';

export interface DownloadableFile {
  name: string;
  url: string;
}

export interface DownloadResult {
  name: string;
  content: ArrayBuffer;
}

export type ProgressCallback = (progress: { file: string; loaded: number; total: number | null }) => void;

/**
 * Downloads an array of files from their URLs using axios.
 * Uses a CORS proxy for GitHub releases to bypass CORS restrictions.
 * 
 * @param files An array of files to download.
 * @param onProgress Optional callback to report download progress.
 * @returns A promise that resolves to an array of downloaded file results.
 */
export const downloadFiles = async (
  files: DownloadableFile[], 
  onProgress?: ProgressCallback
): Promise<DownloadResult[]> => {
  const downloadPromises = files.map(async (file) => {
    try {
      let downloadUrl = file.url;
      
      // Use Vite proxy for GitHub releases to bypass CORS and network restrictions
      if (file.url.includes('github.com') && file.url.includes('/releases/download/')) {
        try {
          const urlObj = new URL(file.url);
          downloadUrl = `/api/github-download${urlObj.pathname}`;
          console.log(`Using Vite proxy for GitHub release: ${downloadUrl}`);
        } catch {
          console.warn('Failed to parse URL for proxy:', file.url);
        }
      } else if (file.url.includes('web.archive.org')) {
        // Use Vite proxy for Wayback Machine
        try {
          const urlObj = new URL(file.url);
          downloadUrl = `/api/wayback-download${urlObj.pathname}${urlObj.search}`;
          console.log(`Using Vite proxy for Wayback Machine: ${downloadUrl}`);
        } catch {
           console.warn('Failed to parse URL for proxy:', file.url);
        }
      }
      
      console.log(`Downloading ${file.name} from ${downloadUrl}`);
      
      const response = await axios.get(downloadUrl, {
        responseType: 'arraybuffer',
        timeout: 120000, // 120 second timeout for large files
        onDownloadProgress: (progressEvent: AxiosProgressEvent) => {
          if (onProgress) {
            const total = progressEvent.total || null;
            const loaded = progressEvent.loaded;
            onProgress({ file: file.name, loaded, total });
          }
        },
        headers: {
          'Accept': 'application/octet-stream, application/zip, */*',
        },
        validateStatus: (status) => status === 200,
      });

      const content = response.data as ArrayBuffer;
      
      console.log(`Successfully downloaded ${file.name}: ${content.byteLength} bytes`);
      
      // Verify it's actually a zip file
      const uint8Array = new Uint8Array(content);
      const isZip = uint8Array[0] === 0x50 && uint8Array[1] === 0x4b; // PK signature
      
      if (!isZip) {
        // Check for small error responses
        if (content.byteLength < 2000) {
           const text = new TextDecoder().decode(content);
           if (text.includes('<!DOCTYPE html>') || text.includes('<html')) {
             throw new Error(`Proxy returned HTML instead of ZIP: ${text.substring(0, 100)}...`);
           }
        }
        
        const firstBytes = Array.from(uint8Array.slice(0, 4)).map(b => '0x' + b.toString(16)).join(' ');
        throw new Error(`Downloaded file ${file.name} is not a valid ZIP file. First bytes: ${firstBytes}. Size: ${content.byteLength} bytes`);
      }
      
      return { name: file.name, content };

    } catch (error) {
      console.error(`Failed to download ${file.name}:`, error);
      if (axios.isAxiosError(error)) {
        console.error(`  Status: ${error.response?.status}`);
        if (error.response?.data instanceof ArrayBuffer) {
           const data = error.response.data;
           if (data.byteLength < 1000) {
              console.error(`  Data content:`, new TextDecoder().decode(data));
           }
        }
      }
      throw error;
    }
  });

  const results = await Promise.allSettled(downloadPromises);

  const successfulDownloads: DownloadResult[] = [];
  results.forEach(result => {
    if (result.status === 'fulfilled') {
      successfulDownloads.push(result.value);
    } else {
      console.error('A file download failed:', result.reason);
    }
  });

  if (successfulDownloads.length !== files.length) {
      throw new Error('One or more files failed to download.');
  }

  return successfulDownloads;
};
