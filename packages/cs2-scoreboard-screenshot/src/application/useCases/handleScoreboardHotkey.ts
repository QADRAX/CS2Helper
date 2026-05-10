import type { AsyncUseCase } from "@cs2helper/shared";
import type { CaptureGateFailureReason } from "../../domain/canCaptureScoreboardSnapshot";
import { buildSnapshotFileName } from "../../domain/buildSnapshotFileName";
import { canCaptureScoreboardSnapshot } from "../../domain/canCaptureScoreboardSnapshot";
import type { ScoreboardCapturePolicy } from "../../domain/scoreboardCapturePolicy";
import type {
  ClockPort,
  ForegroundPort,
  MatchSignalPort,
  SnapshotSinkPort,
  WindowCapturePort,
} from "../ports";

export type HandleHotkeyResult =
  | { outcome: "captured"; absolutePath: string }
  | { outcome: "skipped"; reason: CaptureGateFailureReason }
  | { outcome: "capture_failed"; error: string };

/**
 * Ports tuple order: `[matchSignal, foreground, windowCapture, snapshotSink, clock]`.
 */
export type HandleScoreboardHotkeyPorts = readonly [
  MatchSignalPort,
  ForegroundPort,
  WindowCapturePort,
  SnapshotSinkPort,
  ClockPort,
];

export const handleScoreboardHotkey: AsyncUseCase<
  HandleScoreboardHotkeyPorts,
  [policy: ScoreboardCapturePolicy],
  HandleHotkeyResult
> = async (ports, policy) => {
  const [matchSignal, foreground, windowCapture, snapshotSink, clock] = ports;
  const match = matchSignal.getMatchSignal();
  const fg = await foreground.isCs2Foreground();
  const gate = canCaptureScoreboardSnapshot(policy, match, fg);
  if (!gate.ok) {
    return { outcome: "skipped", reason: gate.reason };
  }

  try {
    const png = await windowCapture.captureCs2ClientPng();
    const filename = buildSnapshotFileName(clock.nowMs());
    const { absolutePath } = await snapshotSink.writeSnapshot(filename, png);
    return { outcome: "captured", absolutePath };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    return { outcome: "capture_failed", error };
  }
};
