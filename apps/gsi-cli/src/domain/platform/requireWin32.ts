export function requireWin32(context: string): void {
  if (process.platform !== "win32") {
    throw new Error(`${context}: requires Windows (win32).`);
  }
}

export function assertPositiveIntegerPid(pid: number): void {
  if (!Number.isInteger(pid) || pid <= 0) {
    throw new TypeError(`Invalid process id: ${pid}`);
  }
}
