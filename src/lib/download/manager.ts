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
 * Downloads an array of files from their URLs.
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
      const response = await fetch(file.url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} for ${file.name}`);
      }

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : null;
      let loaded = 0;

      // Create a new response body that allows us to track progress
      const trackingStream = new ReadableStream({
        async start(controller) {
          if (!response.body) {
            controller.close();
            return;
          }
          const reader = response.body.getReader();

          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              break;
            }
            loaded += value.length;
            if (onProgress) {
              onProgress({ file: file.name, loaded, total });
            }
            controller.enqueue(value);
          }
          controller.close();
        },
      });

      const trackingResponse = new Response(trackingStream, {
        headers: response.headers,
      });

      const content = await trackingResponse.arrayBuffer();
      
      return { name: file.name, content };
    } catch (error) {
      console.error(`Failed to download ${file.name}:`, error);
      throw error; // Re-throw to be caught by Promise.allSettled
    }
  });

  const results = await Promise.allSettled(downloadPromises);

  const successfulDownloads: DownloadResult[] = [];
  results.forEach(result => {
    if (result.status === 'fulfilled') {
      successfulDownloads.push(result.value);
    } else {
      // Optionally handle failed downloads more gracefully here
      console.error('A file download failed:', result.reason);
    }
  });

  if (successfulDownloads.length !== files.length) {
      throw new Error('One or more files failed to download.');
  }

  return successfulDownloads;
};
