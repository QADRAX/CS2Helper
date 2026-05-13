/**
 * Runs a bash script with stdout/stderr inherited (e.g. write launch script).
 */
export interface BashScriptRunnerPort {
  run(scriptPath: string): Promise<void>;
}
