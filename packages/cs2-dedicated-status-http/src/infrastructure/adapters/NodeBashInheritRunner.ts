import { spawn } from "node:child_process";
import type { BashScriptRunnerPort } from "../../application/ports/BashScriptRunnerPort";

export class NodeBashInheritRunner implements BashScriptRunnerPort {
  constructor(private readonly env: NodeJS.ProcessEnv) {}

  run(scriptPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const p = spawn("/bin/bash", [scriptPath], {
        stdio: "inherit",
        env: this.env,
      });
      p.on("error", reject);
      p.on("exit", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`${scriptPath} exited with code ${code}`));
      });
    });
  }
}
