import { Buffer } from "node:buffer";

import { PNG } from "pngjs";

import { buildBitmapInfoHeader, flipRgbRowsVertical, swapBgraToRgbaInPlace } from "../domain/bitmapRgb";
import { CS2_EXE_IMAGE_NAME } from "../domain/cs2ProcessName";
import { pickLargestClientRectByArea, type ClientRectEntry } from "../domain/pickLargestClientRect";
import {
  DIB_RGB_COLORS,
  PW_CLIENTONLY,
  PW_RENDERFULLCONTENT,
  SRCCOPY,
} from "../domain/win32GdiConstants";
import { queryWindowsTasklist } from "./windowsTasklistQuery";
import { getKoffi } from "./loadKoffiRuntime";

const EnumWindowsProcType = getKoffi().proto(
  "bool __stdcall EnumWindowsProc(uintptr_t hwnd, intptr_t lParam)"
);

function loadApis() {
  const koffi = getKoffi();
  const user32 = koffi.load("user32.dll");
  const gdi32 = koffi.load("gdi32.dll");

  const GetForegroundWindow = user32.func("__stdcall", "GetForegroundWindow", "uintptr_t", []);
  const EnumWindows = user32.func("__stdcall", "EnumWindows", "bool", [
    koffi.pointer(EnumWindowsProcType),
    "intptr_t",
  ]);
  const GetWindowThreadProcessId = user32.func("__stdcall", "GetWindowThreadProcessId", "uint32", [
    "uintptr_t",
    koffi.pointer("uint8"),
  ]);
  const IsWindowVisible = user32.func("__stdcall", "IsWindowVisible", "bool", ["uintptr_t"]);

  const RECT = koffi.struct("RECT", {
    left: "int32",
    top: "int32",
    right: "int32",
    bottom: "int32",
  });

  const GetClientRect = user32.func("__stdcall", "GetClientRect", "bool", [
    "uintptr_t",
    koffi.out(koffi.pointer(RECT)),
  ]);
  const PrintWindow = user32.func("__stdcall", "PrintWindow", "bool", ["uintptr_t", "uintptr_t", "uint32"]);
  const GetDC = user32.func("__stdcall", "GetDC", "uintptr_t", ["uintptr_t"]);
  const ReleaseDC = user32.func("__stdcall", "ReleaseDC", "int32", ["uintptr_t", "uintptr_t"]);

  const CreateCompatibleDC = gdi32.func("__stdcall", "CreateCompatibleDC", "uintptr_t", ["uintptr_t"]);
  const CreateCompatibleBitmap = gdi32.func("__stdcall", "CreateCompatibleBitmap", "uintptr_t", [
    "uintptr_t",
    "int32",
    "int32",
  ]);
  const SelectObject = gdi32.func("__stdcall", "SelectObject", "uintptr_t", ["uintptr_t", "uintptr_t"]);
  const DeleteObject = gdi32.func("__stdcall", "DeleteObject", "bool", ["uintptr_t"]);
  const DeleteDC = gdi32.func("__stdcall", "DeleteDC", "bool", ["uintptr_t"]);
  const BitBlt = gdi32.func("__stdcall", "BitBlt", "bool", [
    "uintptr_t",
    "int32",
    "int32",
    "int32",
    "int32",
    "uintptr_t",
    "int32",
    "int32",
    "uint32",
  ]);
  const GetDIBits = gdi32.func("__stdcall", "GetDIBits", "int32", [
    "uintptr_t",
    "uintptr_t",
    "uint32",
    "uint32",
    koffi.pointer("uint8"),
    koffi.pointer("uint8"),
    "uint32",
  ]);

  return {
    GetForegroundWindow,
    EnumWindows,
    GetWindowThreadProcessId,
    IsWindowVisible,
    GetClientRect,
    PrintWindow,
    GetDC,
    ReleaseDC,
    CreateCompatibleDC,
    CreateCompatibleBitmap,
    SelectObject,
    DeleteObject,
    DeleteDC,
    BitBlt,
    GetDIBits,
  };
}

const apis = process.platform === "win32" ? loadApis() : null;

let enumTargetPid = 0;
const enumScratch: bigint[] = [];
const pidBufScratch = Buffer.alloc(4);

const enumWindowsCallback =
  apis !== null
    ? getKoffi().register(
        (hwnd: number, lParam: bigint) => {
          void lParam;
          apis!.GetWindowThreadProcessId(hwnd, pidBufScratch);
          const pid = pidBufScratch.readUInt32LE(0);
          if (pid !== enumTargetPid) {
            return true;
          }
          if (!apis!.IsWindowVisible(hwnd)) {
            return true;
          }
          enumScratch.push(BigInt(hwnd));
          return true;
        },
        getKoffi().pointer(EnumWindowsProcType)
      )
    : null;

function collectCs2WindowHandles(targetPid: number): bigint[] {
  if (!apis || !enumWindowsCallback) return [];

  enumTargetPid = targetPid;
  enumScratch.length = 0;
  apis.EnumWindows(enumWindowsCallback, 0);
  return enumScratch.slice();
}

function collectClientRectEntries(handles: bigint[]): ClientRectEntry[] {
  if (!apis) return [];

  const entries: ClientRectEntry[] = [];
  for (const hwnd of handles) {
    const rect: Record<string, unknown> = {};
    const ok = apis.GetClientRect(Number(hwnd), rect);
    if (!ok) continue;
    const r = rect as { left: number; top: number; right: number; bottom: number };
    const width = r.right - r.left;
    const height = r.bottom - r.top;
    entries.push({ hwnd, width, height });
  }
  return entries;
}

function encodeRgbaToPng(width: number, height: number, rgbaTopDown: Uint8Array): Uint8Array {
  const png = new PNG({ width, height });
  Buffer.from(rgbaTopDown).copy(png.data);
  const buf = PNG.sync.write(png);
  return Uint8Array.from(buf);
}

/**
 * Captures the largest visible CS2 (`cs2.exe`) client rectangle as PNG bytes.
 *
 * Uses `PrintWindow` with `PW_RENDERFULLCONTENT`; falls back to `BitBlt` from the window DC.
 * May fail for some exclusive-fullscreen modes (document in README).
 */
export async function captureCs2ClientPng(): Promise<Uint8Array> {
  if (!apis) {
    throw new Error("captureCs2ClientPng is only supported on Windows.");
  }

  const status = await queryWindowsTasklist(CS2_EXE_IMAGE_NAME);
  if (!status.running || status.pid === undefined) {
    throw new Error("cs2.exe is not running.");
  }

  const handles = collectCs2WindowHandles(status.pid);
  const picked = pickLargestClientRectByArea(collectClientRectEntries(handles));
  if (!picked) {
    throw new Error("No CS2 window handle found.");
  }

  const hwnd = Number(picked.hwnd);
  const { width, height } = picked;

  const hdcScreen = apis.GetDC(hwnd);
  if (!hdcScreen) {
    throw new Error("GetDC failed.");
  }

  const hdcMem = apis.CreateCompatibleDC(hdcScreen);
  const hbm = apis.CreateCompatibleBitmap(hdcScreen, width, height);
  const old = apis.SelectObject(hdcMem, hbm);

  const pwFlags = PW_CLIENTONLY | PW_RENDERFULLCONTENT;
  let copied = apis.PrintWindow(hwnd, hdcMem, pwFlags);
  if (!copied) {
    copied = apis.BitBlt(hdcMem, 0, 0, width, height, hdcScreen, 0, 0, SRCCOPY);
  }

  apis.SelectObject(hdcMem, old);

  if (!copied) {
    apis.DeleteObject(hbm);
    apis.DeleteDC(hdcMem);
    apis.ReleaseDC(hwnd, hdcScreen);
    throw new Error("PrintWindow and BitBlt both failed.");
  }

  const bmpInfo = buildBitmapInfoHeader(width, height);
  const pixels = Buffer.alloc(width * height * 4);
  const bmpBuf = Buffer.from(bmpInfo);
  const lines = apis.GetDIBits(hdcMem, hbm, 0, height, pixels, bmpBuf, DIB_RGB_COLORS);

  apis.DeleteObject(hbm);
  apis.DeleteDC(hdcMem);
  apis.ReleaseDC(hwnd, hdcScreen);

  if (lines === 0) {
    throw new Error("GetDIBits failed.");
  }

  const rgbaTopDown = flipRgbRowsVertical(new Uint8Array(pixels), width, height);
  swapBgraToRgbaInPlace(rgbaTopDown);
  return encodeRgbaToPng(width, height, rgbaTopDown);
}

/** Returns true when the foreground HWND belongs to `cs2.exe`. */
export async function isCs2ForegroundWindow(): Promise<boolean> {
  if (!apis) return false;

  const status = await queryWindowsTasklist(CS2_EXE_IMAGE_NAME);
  if (!status.running || status.pid === undefined) {
    return false;
  }

  const fg = apis.GetForegroundWindow();
  if (!fg) return false;

  const pidBuf = Buffer.alloc(4);
  apis.GetWindowThreadProcessId(fg, pidBuf);
  const pid = pidBuf.readUInt32LE(0);
  return pid === status.pid;
}
