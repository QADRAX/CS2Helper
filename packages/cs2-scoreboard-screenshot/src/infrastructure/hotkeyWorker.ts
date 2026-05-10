import { parentPort, workerData } from "node:worker_threads";

import type { HotKeyWorkerInit } from "../domain/hotkeyWorkerInit";
import { WM_HOTKEY } from "../domain/win32Messages";
import { getKoffi } from "./loadKoffiRuntime";

const koffi = getKoffi();

const user32 = koffi.load("user32.dll");

const GetMessageW = user32.func("__stdcall", "GetMessageW", "int32", [
  koffi.pointer("uint8"),
  "uintptr_t",
  "uint32",
  "uint32",
]);

const TranslateMessage = user32.func("__stdcall", "TranslateMessage", "bool", [koffi.pointer("uint8")]);
const DispatchMessageW = user32.func("__stdcall", "DispatchMessageW", "intptr_t", [koffi.pointer("uint8")]);
const RegisterHotKey = user32.func("__stdcall", "RegisterHotKey", "bool", [
  "uintptr_t",
  "int32",
  "uint32",
  "uint32",
]);
const UnregisterHotKey = user32.func("__stdcall", "UnregisterHotKey", "bool", ["uintptr_t", "int32"]);

function main(): void {
  const { vk, modifiers, hotKeyId } = workerData as HotKeyWorkerInit;

  const ok = RegisterHotKey(0, hotKeyId, modifiers >>> 0, vk >>> 0);
  if (!ok) {
    parentPort?.postMessage({ type: "error", code: "register_hotkey_failed" });
    return;
  }

  parentPort?.postMessage({ type: "ready" });

  const msgBuf = Buffer.alloc(48);
  while (true) {
    const r = GetMessageW(msgBuf, 0, 0, 0);
    if (r === 0) {
      break;
    }
    if (r === -1) {
      parentPort?.postMessage({ type: "error", code: "get_message_failed" });
      break;
    }

    const message = msgBuf.readUInt32LE(8);
    const wParam = Number(msgBuf.readBigUInt64LE(16));
    if (message === WM_HOTKEY && wParam === hotKeyId) {
      parentPort?.postMessage({ type: "hotkey" });
    }

    TranslateMessage(msgBuf);
    DispatchMessageW(msgBuf);
  }

  UnregisterHotKey(0, hotKeyId);
}

main();
