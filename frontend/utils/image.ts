/** Accepted photo types – the server checks the real file signature again. */
export const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

const MAX_SIDE = 1600;
const QUALITY = 0.85;

/**
 * Shrink a phone photo before upload (a 4–8 MB photo becomes ~200–400 KB).
 * Re-encoding to JPEG also drops EXIF metadata such as GPS location.
 */
export async function resizePhoto(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not read this image"))), "image/jpeg", QUALITY),
  );
}
