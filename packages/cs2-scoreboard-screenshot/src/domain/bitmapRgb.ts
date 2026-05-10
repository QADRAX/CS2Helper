import { BI_RGB } from "./win32GdiConstants";

/**
 * Builds a 40-byte `BITMAPINFOHEADER` for 32 BPP uncompressed top-down DIB reads.
 */
export function buildBitmapInfoHeader(width: number, height: number): Uint8Array {
  const buf = new Uint8Array(40);
  const dv = new DataView(buf.buffer);
  dv.setUint32(0, 40, true);
  dv.setInt32(4, width, true);
  dv.setInt32(8, height, true);
  dv.setUint16(12, 1, true);
  dv.setUint16(14, 32, true);
  dv.setUint32(16, BI_RGB, true);
  return buf;
}

/** Flip rows so row 0 is top (GDI DIB is typically bottom-up). */
export function flipRgbRowsVertical(srcBottomUp: Uint8Array, width: number, height: number): Uint8Array {
  const stride = width * 4;
  const dst = new Uint8Array(srcBottomUp.length);
  for (let y = 0; y < height; y++) {
    const srcOff = (height - 1 - y) * stride;
    dst.set(srcBottomUp.subarray(srcOff, srcOff + stride), y * stride);
  }
  return dst;
}

/** Windows 32bpp DIB is BGRA; PNG expects RGBA channel order. */
export function swapBgraToRgbaInPlace(buf: Uint8Array): void {
  for (let i = 0; i < buf.length; i += 4) {
    const b = buf[i]!;
    buf[i] = buf[i + 2]!;
    buf[i + 2] = b;
  }
}
