/**
 * Lightweight, dependency-free image dimension reader.
 *
 * Parses the binary headers of JPEG, PNG, GIF and WebP files to extract
 * width & height WITHOUT a full image-decode library (no `sharp`/`image-size`
 * dependency). This is the same header-parsing approach used by `image-size`.
 *
 * Used to enforce "square image only" for profile avatars on both the
 * server (Buffer) and (in principle) the client.
 *
 * Returns `null` for unsupported/unparseable formats so callers can decide
 * whether to reject or fall back.
 */
export function getImageDimensions(
  input: Uint8Array | ArrayBuffer | Buffer
): { width: number; height: number } | null {
  const bytes =
    input instanceof Uint8Array
      ? input
      : input instanceof ArrayBuffer
      ? new Uint8Array(input)
      : new Uint8Array(input);

  if (bytes.length < 12) return null;

  // PNG: 89 50 4E 47 0D 0A 1A 0A ... IHDR at offset 16
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    const width = readUInt32BE(bytes, 16);
    const height = readUInt32BE(bytes, 20);
    if (width && height) return { width, height };
    return null;
  }

  // GIF: 47 49 46 38 (GIF8) — logical screen size at offset 6 (little-endian)
  if (
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38
  ) {
    const width = readUInt16LE(bytes, 6);
    const height = readUInt16LE(bytes, 8);
    if (width && height) return { width, height };
    return null;
  }

  // JPEG: FF D8 — scan the segment markers for SOFn (0xFFC0–0xFFCF, excluding 4/8/C)
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    let i = 2;
    while (i < bytes.length) {
      if (bytes[i] !== 0xff) {
        i += 1;
        continue;
      }
      // Skip padding 0xFF bytes
      while (i < bytes.length && bytes[i] === 0xff) i += 1;
      if (i >= bytes.length) break;
      const marker = bytes[i];
      const segLen = readUInt16BE(bytes, i + 1);

      // SOFn markers carry width/height
      const isSOF =
        (marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb) ||
        (marker >= 0xcd && marker <= 0xcf);

      if (isSOF) {
        // height = bytes at i+4 (2), width = bytes at i+6 (2) — both BE
        const height = readUInt16BE(bytes, i + 4);
        const width = readUInt16BE(bytes, i + 6);
        if (width && height) return { width, height };
        return null;
      }
      // Move past this segment: 2 (marker byte already consumed) handled by segLen
      i += 1 + segLen;
    }
    return null;
  }

  // WebP: RIFF....WEBP
  if (
    bytes[0] === 0x52 && // R
    bytes[1] === 0x49 && // I
    bytes[2] === 0x46 && // F
    bytes[3] === 0x46 && // F
    bytes[8] === 0x57 && // W
    bytes[9] === 0x45 && // E
    bytes[10] === 0x42 && // B
    bytes[11] === 0x50 // P
  ) {
    const fourcc =
      String.fromCharCode(bytes[12]) +
      String.fromCharCode(bytes[13]) +
      String.fromCharCode(bytes[14]) +
      String.fromCharCode(bytes[15]);

    if (fourcc === "VP8 ") {
      // VP8 (lossy): width/height little-endian at offset 26 & 28
      const width = readUInt16LE(bytes, 26) & 0x3fff;
      const height = readUInt16LE(bytes, 28) & 0x3fff;
      if (width && height) return { width, height };
      return null;
    }
    if (fourcc === "VP8L") {
      // VP8L (lossless): signature byte 0x2f at offset 20, then 14 bits each
      const b0 = bytes[21];
      const b1 = bytes[22];
      const b2 = bytes[23];
      const b3 = bytes[24];
      const width = 1 + (((b1 & 0x3f) << 8) | b0);
      const height = 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
      if (width && height) return { width, height };
      return null;
    }
    if (fourcc === "VP8X") {
      // VP8X (extended): canvas size little-endian 24-bit at offsets 24 & 27
      const width = 1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16));
      const height = 1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16));
      if (width && height) return { width, height };
      return null;
    }
    return null;
  }

  return null;
}

/** Returns true when the image is square within an optional tolerance. */
export function isSquareImage(
  input: Uint8Array | ArrayBuffer | Buffer,
  tolerancePx = 2
): boolean {
  const dims = getImageDimensions(input);
  if (!dims) return false;
  return Math.abs(dims.width - dims.height) <= tolerancePx;
}

// --- internal big/little-endian readers (safe for short buffers) ---------
function readUInt16BE(bytes: Uint8Array, offset: number): number {
  if (offset + 1 >= bytes.length) return 0;
  return (bytes[offset] << 8) | bytes[offset + 1];
}
function readUInt16LE(bytes: Uint8Array, offset: number): number {
  if (offset + 1 >= bytes.length) return 0;
  return bytes[offset] | (bytes[offset + 1] << 8);
}
function readUInt32BE(bytes: Uint8Array, offset: number): number {
  if (offset + 3 >= bytes.length) return 0;
  return (
    (bytes[offset] << 24) |
    (bytes[offset + 1] << 16) |
    (bytes[offset + 2] << 8) |
    bytes[offset + 3]
  );
}
