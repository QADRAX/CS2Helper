/**
 * Runs install script with piped stdio; forwards chunks for steamcmd line parsing.
 */
export interface InstallRunnerPort {
  run(scriptPath: string, onChunk: (chunk: Buffer) => void): Promise<void>;
}
