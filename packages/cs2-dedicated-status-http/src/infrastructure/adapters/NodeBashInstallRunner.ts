import { spawn } from "node:child_process";
import type { InstallRunnerPort } from "../../application/ports/InstallRunnerPort";

export class NodeBashInstallRunner implements InstallRunnerPort {
  constructor(private readonly env: NodeJS.ProcessEnv) {}

  run(scriptPath: string, onChunk: (chunk: Buffer) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      const p = spawn("/bin/bash", [scriptPath], {
        stdio: ["ignore", "pipe", "pipe"],
        env: this.env,
      });

      const consume = (chunk: Buffer): void => {
        process.stderr.write(chunk);
        onChunk(chunk);
      };

      p.stdout.on("data", consume);
      p.stderr.on("data", consume);
      p.on("error", reject);
      p.on("exit", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`${scriptPath} exited with code ${code}`));
      });
    });
  }
}
