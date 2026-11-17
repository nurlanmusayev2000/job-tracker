/**
 * Lets the user save `text` as a file. The browser shows its normal
 * download, with `fileName` as the suggested name.
 */
export function downloadTextFile(
  fileName: string,
  text: string,
  type: string,
): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  // Free the memory once the browser has started the download.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
