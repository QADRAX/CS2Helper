import type { AsyncUseCase } from "@cs2helper/shared";
import type { BashScriptRunnerPort } from "../ports/BashScriptRunnerPort";

/**
 * Ports tuple order: `[bash]`.
 */
export const runBashScript: AsyncUseCase<[BashScriptRunnerPort], [scriptPath: string], void> = async (
  [bash],
  scriptPath
) => {
  await bash.run(scriptPath);
};
