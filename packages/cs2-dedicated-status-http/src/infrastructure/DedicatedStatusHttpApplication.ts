import { withPorts, withPortsAsync } from "@cs2helper/shared";
import {
  buildStatusResponse,
  recordOperationalFailure,
  runBootstrap,
  runForcedUpdate,
} from "../application";
import type { BashScriptRunnerPort } from "../application/ports/BashScriptRunnerPort";
import type { ChildExitLogPort } from "../application/ports/ChildExitLogPort";
import type { DedicatedStatusStatePort } from "../application/ports/DedicatedStatusStatePort";
import type { GameChildRunnerPort } from "../application/ports/GameChildRunnerPort";
import type { InstallRunnerPort } from "../application/ports/InstallRunnerPort";
import type { ProcessLifecyclePort } from "../application/ports/ProcessLifecyclePort";
import type { TcpProbePort } from "../application/ports/TcpProbePort";
import type { DedicatedStatusPublicJson } from "../domain/dedicatedStatusPublicJson";
import type { DedicatedStatusPaths } from "../domain/dedicatedStatusPaths";
import type { ReadyProbeConfig } from "../domain/probeConfig";
import type { DedicatedStatusPhase } from "../domain/statusPhase";
import type { SteamInstallProgressHooks } from "../domain/steamInstallHooks";
import { ConsoleChildExitLog } from "./adapters/ConsoleChildExitLog";
import { InMemoryDedicatedStatusState } from "./adapters/InMemoryDedicatedStatusState";
import { NodeBashInheritRunner } from "./adapters/NodeBashInheritRunner";
import { NodeBashInstallRunner } from "./adapters/NodeBashInstallRunner";
import { NodeGameChildRunner } from "./adapters/NodeGameChildRunner";
import { NodeTcpProbe } from "./adapters/NodeTcpProbe";

const defaultInstallScript =
  "/usr/share/cs2helper/cs2-dedicated-server/install-cs2.sh";
const defaultWriteScript =
  "/usr/share/cs2helper/cs2-dedicated-server/write-cs2-exec.sh";
const defaultChildScript = "/run/cs2-exec.sh";

const resolvePaths = (env: NodeJS.ProcessEnv): DedicatedStatusPaths => ({
  installScript: env.CS2_INSTALL_SCRIPT ?? defaultInstallScript,
  writeScript: env.CS2_WRITE_LAUNCH_SCRIPT ?? defaultWriteScript,
  childScript: env.CS2_CHILD_SCRIPT ?? defaultChildScript,
});

const resolveProbe = (env: NodeJS.ProcessEnv): ReadyProbeConfig => ({
  gamePort: Number.parseInt(env.CS2_GAME_PORT ?? env.CS2_PORT ?? "27015", 10),
  tcpProbe: env.CS2_STATUS_TCP_PROBE === "1",
});

export type DedicatedStatusHttpApplicationOptions = {
  env?: NodeJS.ProcessEnv;
  lifecycle?: ProcessLifecyclePort;
};

/**
 * Composition root: builds Node adapters + wires use cases with {@link withPorts} / {@link withPortsAsync}
 * (cf. {@link GsiGatewayService}).
 */
export class DedicatedStatusHttpApplication {
  private readonly install: InstallRunnerPort;
  private readonly bash: BashScriptRunnerPort;
  private readonly game: GameChildRunnerPort;
  private readonly tcp: TcpProbePort;
  private readonly state: DedicatedStatusStatePort;
  private readonly lifecycle: ProcessLifecyclePort;
  private readonly log: ChildExitLogPort;
  private readonly paths: DedicatedStatusPaths;
  private readonly probe: ReadyProbeConfig;

  constructor(options: DedicatedStatusHttpApplicationOptions = {}) {
    const env = options.env ?? process.env;
    this.install = new NodeBashInstallRunner(env);
    this.bash = new NodeBashInheritRunner(env);
    this.game = new NodeGameChildRunner(env);
    this.tcp = new NodeTcpProbe();
    this.state = new InMemoryDedicatedStatusState();
    this.log = new ConsoleChildExitLog();
    this.lifecycle =
      options.lifecycle ??
      ({
        exitProcess(code: number): void {
          process.exit(code);
        },
      } satisfies ProcessLifecyclePort);
    this.paths = resolvePaths(env);
    this.probe = resolveProbe(env);
  }

  signalShutdownGame(): void {
    this.game.signalShutdownKill();
  }

  async getRootStatusJson(): Promise<DedicatedStatusPublicJson> {
    return withPortsAsync(buildStatusResponse, [this.state, this.game, this.tcp])(this.probe);
  }

  async runBootstrap(): Promise<void> {
    return withPortsAsync(runBootstrap, [
      this.install,
      this.bash,
      this.game,
      this.state,
      this.lifecycle,
      this.log,
    ])(this.paths);
  }

  async runForcedUpdate(hooks?: SteamInstallProgressHooks): Promise<void> {
    return withPortsAsync(runForcedUpdate, [
      this.install,
      this.bash,
      this.game,
      this.state,
      this.lifecycle,
      this.log,
    ])({
      ...this.paths,
      ...hooks,
    });
  }

  recordOperationalFailure(error: unknown): void {
    withPorts(recordOperationalFailure, [this.state])(error);
  }

  getPhase(): DedicatedStatusPhase {
    return this.state.snapshot().phase;
  }

  getLastUpdateError(): string | null {
    return this.state.snapshot().lastUpdateError;
  }

  isOpsLocked(): boolean {
    return this.state.snapshot().opsLocked;
  }

  lockOps(): void {
    this.state.setOpsLocked(true);
  }

  unlockOps(): void {
    this.state.setOpsLocked(false);
  }

  setPhaseBoot(): void {
    this.state.setPhase("boot");
  }
}
