import type { AsyncUseCase } from "@cs2helper/shared";
import { snapshotSteamProgress } from "../../domain/steamProgress";
import type { DedicatedStatusStatePort } from "../ports/DedicatedStatusStatePort";
import type { GameChildRunnerPort } from "../ports/GameChildRunnerPort";
import type { TcpProbePort } from "../ports/TcpProbePort";
import type { ReadyProbeConfig } from "../../domain/probeConfig";

/**
 * GET /status (and /) JSON body.
 *
 * Ports tuple order: `[state, game, tcp]`.
 */
export const buildStatusResponse: AsyncUseCase<
  [DedicatedStatusStatePort, GameChildRunnerPort, TcpProbePort],
  [config: ReadyProbeConfig],
  Record<string, unknown>
> = async ([state, game, tcp], { gamePort, tcpProbe }) => {
  const s = state.snapshot();
  const tcpOk =
    !tcpProbe || (await tcp.probe("127.0.0.1", gamePort, 400));
  return {
    service: "cs2-dedicated-status-http",
    phase: s.phase,
    updating: s.phase === "updating",
    operationInProgress: s.opsLocked,
    ready: s.phase === "running" && game.isAlive() && tcpOk,
    lastUpdateError: s.lastUpdateError,
    childPid: game.getPid(),
    updateProgress: snapshotSteamProgress(s.updateProgress),
    endpoints: {
      health: "GET /health",
      ready: "GET /ready",
      status: "GET /status",
      update: "POST /update",
    },
  };
};
