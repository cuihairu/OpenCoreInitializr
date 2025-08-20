import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { WizardState } from '../../types';
import { generateConfigPlist } from '@/lib/config/generator';
import { downloadFiles, DownloadableFile } from '@/lib/download/manager';

// Import Kexts data to find asset URLs
import systemKexts from '@/data/kexts/system.json';
import audioKexts from '@/data/kexts/audio.json';
import networkKexts from '@/data/kexts/network.json';
import usbKexts from '@/data/kexts/usb.json';

const allKexts = [
  ...systemKexts.kexts,
  ...audioKexts.kexts,
  ...networkKexts.kexts,
  ...usbKexts.kexts,
];

export type ProgressCallback = (message: string, percentage: number) => void;

/**
 * Creates the complete EFI package as a ZIP file.
 * 
 * @param state The final state from the wizard.
 * @param onProgress Optional callback to report overall progress.
 */
export const createEfiPackage = async (state: WizardState, onProgress?: ProgressCallback) => {
  if (!state.kexts) {
    throw new Error('Kext selection is missing.');
  }

  const zip = new JSZip();
  const efiFolder = zip.folder('EFI');
  const ocFolder = efiFolder!.folder('OC');

  // --- Step 1: Generate config.plist ---
  onProgress?.('正在生成 config.plist...', 10);
  const plistObject = generateConfigPlist(state);
  // For now, we save it as a JSON file. A real implementation would convert this to XML plist format.
  ocFolder!.file('config.plist', JSON.stringify(plistObject, null, 2));

  // --- Step 2: Determine files to download ---
  onProgress?.('正在准备下载文件...', 25);
  const filesToDownload: DownloadableFile[] = [];
  state.kexts.forEach(kextName => {
    const kextData = allKexts.find(k => k.name === kextName) as any;
    // We are prioritizing the new assetUrl field.
    if (kextData && kextData.assetUrl) {
      filesToDownload.push({ name: `${kextName}.zip`, url: kextData.assetUrl });
    } else {
        console.warn(`No direct assetUrl found for ${kextName}. Skipping.`);
    }
  });
  
  // TODO: Add ACPI files from motherboard_data.json to the download list.

  // --- Step 3: Download files ---
  onProgress?.('正在下载驱动文件...', 40);
  // A more complex implementation would use the onProgress callback of downloadFiles
  // to provide more granular progress updates.
  const downloadedFiles = await downloadFiles(filesToDownload);

  // --- Step 4: Add downloaded files to ZIP ---
  onProgress?.('正在打包文件...', 75);
  const kextsFolder = ocFolder!.folder('Kexts');
  
  // SIMPLIFICATION: We are currently adding the downloaded ZIPs directly.
  // A full implementation would unzip these in memory and place the .kext directory.
  downloadedFiles.forEach(file => {
    kextsFolder!.file(file.name, file.content);
  });

  // TODO: Add ACPI files to an ACPI folder.

  // --- Step 5: Generate final ZIP and trigger download ---
  onProgress?.('正在完成...', 95);
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  
  onProgress?.('完成！', 100);
  saveAs(zipBlob, 'OpenCore-EFI.zip');
};
