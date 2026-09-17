export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 20 * 1024 * 1024;

export function maxBytesForMime(mimeType: string) {
  if (mimeType.startsWith("video/")) return MAX_VIDEO_BYTES;
  return MAX_IMAGE_BYTES;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function fileSizeError(file: Pick<File, "size" | "type" | "name">) {
  const limit = maxBytesForMime(file.type || "image/jpeg");
  if (file.size <= 0) {
    return "Choose a file that is not empty.";
  }
  if (file.size > limit) {
    const kind = file.type.startsWith("video/") ? "Video" : "Image";
    return `${kind} files must be ${formatBytes(limit)} or smaller. “${file.name}” is ${formatBytes(file.size)}.`;
  }
  return null;
}
