import type { AsyncUseCase } from "@cs2helper/shared";
import { snapshotSteamProgress } from "../../domain/steamProgress";
import type { DedicatedStatusStatePort } from "../ports/DedicatedStatusStatePort";
import type { GameChildRunnerPort } from "../ports/GameChildRunnerPort";
import type { TcpProbePort } from "../ports/TcpProbePort";
import type { ReadyProbeConfig } from "../../domain/probeConfig";

/**
 * GET /ready: HTTP status + JSON body.
 *
 * Ports tuple order: `[state, game, tcp]`.
 */
export const evaluateReady: AsyncUseCase<
  [DedicatedStatusStatePort, GameChildRunnerPort, TcpProbePort],
  [config: ReadyProbeConfig],
  { statusCode: number; body: Record<string, unknown> }
> = async ([state, game, tcp], { gamePort, tcpProbe }) => {
  const s = state.snapshot();
  if (s.phase === "updating") {
    return {
      statusCode: 503,
      body: {
        ready: false,
        reason: "updating",
        updating: true,
        updateProgress: snapshotSteamProgress(s.updateProgress),
      },
    };
  }
  if (s.phase === "error") {
    return {
      statusCode: 503,
      body: { ready: false, reason: "error", error: s.lastUpdateError },
    };
  }
  if (!game.isAlive()) {
    return {
      statusCode: 503,
      body: { ready: false, reason: "process_down", phase: s.phase },
    };
  }
  if (tcpProbe) {
    const ok = await tcp.probe("127.0.0.1", gamePort, 400);
    return {
      statusCode: ok ? 200 : 503,
      body: {
        ready: ok,
        reason: ok ? "ok" : "tcp_probe_failed",
        gamePort,
      },
    };
  }
  return {
    statusCode: 200,
    body: { ready: true, reason: "process_up", tcpProbe: false, phase: s.phase },
  };
};
