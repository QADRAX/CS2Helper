import type { AsyncUseCase } from "@cs2helper/shared";
import type { DedicatedStatusPublicJson } from "../../domain/dedicatedStatusPublicJson";
import { snapshotSteamProgress } from "../../domain/steamProgress";
import type { ReadyProbeConfig } from "../../domain/probeConfig";
import type { DedicatedStatusStatePort } from "../ports/DedicatedStatusStatePort";
import type { GameChildRunnerPort } from "../ports/GameChildRunnerPort";
import type { TcpProbePort } from "../ports/TcpProbePort";

/**
 * `GET /` JSON body (CS dedicated state only).
 *
 * Ports tuple order: `[state, game, tcp]`.
 */
export const buildStatusResponse: AsyncUseCase<
  [DedicatedStatusStatePort, GameChildRunnerPort, TcpProbePort],
  [config: ReadyProbeConfig],
  DedicatedStatusPublicJson
> = async ([state, game, tcp], { gamePort, tcpProbe }) => {
  const s = state.snapshot();
  const tcpOk =
    !tcpProbe || (await tcp.probe("127.0.0.1", gamePort, 400));
  return {
    phase: s.phase,
    updating: s.phase === "updating",
    operationInProgress: s.opsLocked,
    ready: s.phase === "running" && game.isAlive() && tcpOk,
    lastUpdateError: s.lastUpdateError,
    childPid: game.getPid(),
    updateProgress: snapshotSteamProgress(s.updateProgress),
  };
};
