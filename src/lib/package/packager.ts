import JSZip from "jszip";
import { saveAs } from "file-saver";
import { WizardState } from "../../types";
import { downloadAndCustomizeConfigPlist } from "@/lib/config";
import { downloadFiles, DownloadableFile } from "@/lib/download/manager";
import { DriverSupportService } from "@/lib/services/driver-support";

export type ProgressCallback = (message: string, percentage: number) => void;

export interface FileProgressInfo {
  name: string;
  loaded: number;
  total: number | null;
  status: "pending" | "downloading" | "completed" | "error";
  error?: string;
}

export type DetailedProgressCallback = (
  files: FileProgressInfo[],
  overallMessage: string,
  overallPercentage: number
) => void;

/**
 * Creates the complete EFI package as a ZIP file.
 *
 * @param state The final state from the wizard.
 * @param onProgress Optional callback to report overall progress.
 * @param onDetailedProgress Optional callback to report detailed file progress.
 */
export const createEfiPackage = async (
  state: WizardState,
  onProgress?: ProgressCallback,
  onDetailedProgress?: DetailedProgressCallback
) => {
  if (!state.kexts) {
    throw new Error("Kext selection is missing.");
  }

  const zip = new JSZip();
  const efiFolder = zip.folder("EFI");
  const ocFolder = efiFolder!.folder("OC");

  // --- Step 1: Generate and download config.plist ---
  onProgress?.("正在从 OpenCore 官方仓库下载配置模板...", 10);

  // Download and customize the official Sample.plist based on wizard state
  const configPlistContent = await downloadAndCustomizeConfigPlist(state);
  ocFolder!.file("config.plist", configPlistContent);

  // --- Step 2: Determine files to download ---
  onProgress?.("正在准备下载文件...", 25);
  const filesToDownload: DownloadableFile[] = [];
  const driverSupportService = DriverSupportService.getInstance();
  const allKexts = driverSupportService.searchDrivers({}).drivers;

  console.log('=== DEBUG: Starting kext download preparation ===');
  console.log('Selected kexts:', state.kexts);
  console.log('Total available drivers:', allKexts.length);

  state.kexts.forEach((kextId) => {
    console.log(`\n--- Processing kext: ${kextId} ---`);
    const kextData = allKexts.find((k) => k.id === kextId);
    
    if (!kextData) {
      console.error(`❌ Kext not found in database: ${kextId}`);
      return;
    }
    
    console.log(`✓ Found kext data:`, {
      id: kextData.id,
      name: kextData.name,
      version: kextData.version?.version,
      hasDownloadUrl: !!kextData.version?.downloadUrl
    });
    
    const downloadUrl = kextData.version?.downloadUrl;
    
    if (!downloadUrl) {
      console.warn(`⚠️ No downloadUrl for ${kextId}`);
      return;
    }
    
    console.log(`📥 Download URL: ${downloadUrl}`);
    filesToDownload.push({ name: `${kextData.id}.zip`, url: downloadUrl });
  });

  console.log('\n=== Files prepared for download ===');
  console.log(`Total files: ${filesToDownload.length}`);
  filesToDownload.forEach(f => {
    console.log(`  - ${f.name}: ${f.url}`);
  });
  console.log('===================================\n');


  // TODO: Add ACPI files from motherboard_data.json to the download list.

  // --- Step 3: Download files ---
  onProgress?.("正在下载驱动文件...", 40);

  if (filesToDownload.length === 0) {
    console.warn("No files to download. Proceeding with config-only package.");
  } else {
    console.log(
      `Attempting to download ${filesToDownload.length} files:`,
      filesToDownload.map((f) => f.name)
    );
  }

  let downloadedFiles: any[] = [];

  // Initialize file progress tracking
  const fileProgressMap = new Map<string, FileProgressInfo>();
  filesToDownload.forEach((file) => {
    fileProgressMap.set(file.name, {
      name: file.name,
      loaded: 0,
      total: null,
      status: "pending",
    });
  });

  const updateDetailedProgress = (message: string, percentage: number) => {
    if (onDetailedProgress) {
      const fileProgressArray = Array.from(fileProgressMap.values());
      onDetailedProgress(fileProgressArray, message, percentage);
    }
  };

  // Initial progress update
  updateDetailedProgress("正在准备下载...", 40);

  try {
    downloadedFiles = await downloadFiles(filesToDownload, (progress) => {
      // Update individual file progress
      const fileProgress = fileProgressMap.get(progress.file);
      if (fileProgress) {
        fileProgress.loaded = progress.loaded;
        fileProgress.total = progress.total;
        fileProgress.status = "downloading";
        fileProgressMap.set(progress.file, fileProgress);

        // Calculate overall download progress
        const completedFiles = Array.from(fileProgressMap.values()).filter(
          (f) => f.status === "completed"
        ).length;
        const downloadingFiles = Array.from(fileProgressMap.values()).filter(
          (f) => f.status === "downloading"
        ).length;
        const totalFiles = filesToDownload.length;

        let overallProgress = 40; // Base progress
        if (totalFiles > 0) {
          const fileProgress =
            (completedFiles + downloadingFiles * 0.5) / totalFiles;
          overallProgress = 40 + fileProgress * 35; // 40-75% range for downloads
        }

        onProgress?.(`正在下载 ${progress.file}...`, overallProgress);
        updateDetailedProgress(`正在下载 ${progress.file}...`, overallProgress);
      }
    });

    // Mark all files as completed
    filesToDownload.forEach((file) => {
      const fileProgress = fileProgressMap.get(file.name);
      if (fileProgress) {
        fileProgress.status = "completed";
        fileProgressMap.set(file.name, fileProgress);
      }
    });

    updateDetailedProgress("下载完成", 75);
  } catch (error) {
    console.error("Download failed:", error);

    // Mark failed files
    filesToDownload.forEach((file) => {
      const fileProgress = fileProgressMap.get(file.name);
      if (fileProgress && fileProgress.status !== "completed") {
        fileProgress.status = "error";
        fileProgress.error =
          error instanceof Error ? error.message : "Download failed";
        fileProgressMap.set(file.name, fileProgress);
      }
    });

    updateDetailedProgress("部分下载失败，继续创建配置包...", 75);

    // For now, continue with config-only package if downloads fail
    console.warn(
      "Continuing with config-only package due to download failures."
    );
    downloadedFiles = [];
  }

  // --- Step 4: Add downloaded files to ZIP ---
  onProgress?.("正在打包文件...", 75);
  const kextsFolder = ocFolder!.folder("Kexts");

  if (downloadedFiles.length > 0) {
    // Extract kexts from downloaded zip files
    for (const file of downloadedFiles) {
      try {
        const loadedZip = await JSZip.loadAsync(file.content);
        const zipFiles = Object.keys(loadedZip.files);

        let kextFound = false;

        for (const zipPath of zipFiles) {
          const zipEntry = loadedZip.files[zipPath];
          if (zipEntry.dir) continue;

          // Look for .kext in the path
          // We want to extract everything inside any .kext folder found
          const kextIndex = zipPath.indexOf(".kext/");
          if (kextIndex !== -1) {
            kextFound = true;
            // Extract the part of the path starting from the kext name
            // Find the start of the kext name.
            // It's the last slash before .kext, or the beginning of the string
            const prefix = zipPath.substring(0, kextIndex + 5); // ".../Name.kext"
            const kextNameStart = prefix.lastIndexOf("/");
            const cleanPath = zipPath.substring(kextNameStart + 1); // "Name.kext/Contents/..."

            const content = await zipEntry.async("arraybuffer");
            kextsFolder!.file(cleanPath, content);
          }
        }

        if (kextFound) {
          console.log(`Extracted kexts from ${file.name}`);
        } else {
          console.warn(`No .kext folders found in ${file.name}`);
          // Fallback: add the original zip if no kext found, so user at least has the file
          kextsFolder!.file(file.name, file.content);
        }
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        kextsFolder!.file(
          `${file.name}.error.txt`,
          `Failed to extract: ${error}`
        );
        // Fallback: add the original zip
        kextsFolder!.file(file.name, file.content);
      }
    }
    console.log(`Processed ${downloadedFiles.length} downloaded files.`);
  } else {
    // Add a README file explaining that kexts need to be downloaded manually
    kextsFolder!.file(
      "README.txt",
      "Kext files could not be downloaded automatically.\n" +
        "Please download the required kexts manually and place them in this folder.\n\n" +
        "Required kexts for your configuration:\n" +
        filesToDownload.map((f) => `- ${f.name}: ${f.url}`).join("\n")
    );
    console.log("Added README with manual download instructions.");
  }

  // TODO: Add ACPI files to an ACPI folder.

  // --- Step 5: Generate final ZIP and trigger download ---
  onProgress?.("正在完成...", 95);
  const zipBlob = await zip.generateAsync({ type: "blob" });

  const packageType = downloadedFiles.length > 0 ? "完整" : "配置";
  onProgress?.(`${packageType}包创建完成！`, 100);

  const filename =
    downloadedFiles.length > 0
      ? "OpenCore-EFI-Complete.zip"
      : "OpenCore-EFI-Config.zip";
  saveAs(zipBlob, filename);

  if (downloadedFiles.length === 0) {
    console.log(
      "Package created with config only. Kexts need to be downloaded manually."
    );
  }
};
