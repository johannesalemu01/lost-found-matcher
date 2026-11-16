import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { uploadDir } from "../config/env";
import { badRequest, notFound } from "../utils/errors";
import { IMAGE_EXTENSIONS, detectImageType, mimeForFile, type ImageMime } from "../utils/image";

/** Our own file names only: <uuid>.<ext>. Anything else is never read or deleted. */
const FILE_NAME = /^[0-9a-f-]{36}\.(jpg|png|webp)$/;

/** Reject anything that is not really a JPEG, PNG or WebP. */
export function assertImage(buffer: Buffer): ImageMime {
  const mime = detectImageType(buffer);
  if (!mime) {
    const message = "The photo must be a JPEG, PNG or WebP image.";
    throw badRequest(message, { photo: message });
  }
  return mime;
}

/** Store a staff-only photo and return its generated file name. */
export async function savePhoto(buffer: Buffer): Promise<string> {
  const mime = assertImage(buffer);
  const fileName = `${randomUUID()}.${IMAGE_EXTENSIONS[mime]}`;
  await mkdir(uploadDir(), { recursive: true });
  await writeFile(join(uploadDir(), fileName), buffer);
  return fileName;
}

export async function readPhoto(fileName: string): Promise<{ buffer: Buffer; mime: ImageMime }> {
  const mime = mimeForFile(fileName);
  if (!FILE_NAME.test(fileName) || !mime) throw notFound("Photo not found.");
  try {
    return { buffer: await readFile(join(uploadDir(), fileName)), mime };
  } catch {
    throw notFound("Photo not found.");
  }
}

/** Best-effort cleanup (e.g. when saving the report failed after the photo was written). */
export async function deletePhoto(fileName: string): Promise<void> {
  if (!FILE_NAME.test(fileName)) return;
  await unlink(join(uploadDir(), fileName)).catch(() => {});
}
