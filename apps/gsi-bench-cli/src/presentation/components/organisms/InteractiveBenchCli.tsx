import { useEffect, useState } from "react";
import { Box, Text, useApp, useInput } from "ink";
import {
  GsiProcessorStatusBox,
  type GsiProcessorStatusLabels,
} from "@cs2helper/gsi-processor-ink";
import type { BenchCliApp } from "../../../infrastructure/bench";
import type { GsiRecordFile, ReplayPlaybackSession, ReplayResult } from "../../../domain/bench";
import { MenuOptionLine } from "../atoms";

type ScreenMode = "list" | "loading" | "player" | "analysis";

interface InteractiveBenchCliProps {
  benchApp: BenchCliApp;
}

const labels: GsiProcessorStatusLabels = {
  title: "GSI processor demo",
  warningPrefix: "Warning:",
  spinner: (frame) => `${frame} Waiting for replay data...`,
  tabProcessing: "Processing",
  tabGameState: "Game state",
  tabSwitchHint: "7 = Processing tab | 8 = Game state tab",
  streamState: "Stream state:",
  ticksReceived: "Ticks processed:",
  lastTickAt: "Last tick at:",
  httpRequests: "Record frames:",
  httpRejected: "Parse errors:",
  lastRejectReason: "Last parse error:",
  watcherMode: "Watcher mode:",
  lastGameState: "Last game state:",
  payloadKindClientLocal: "Client",
  payloadKindSpectatorHltv: "Spectator / HLTV",
  payloadKindDedicatedServer: "Dedicated server",
  valueAvailable: "available",
  valueNull: "null",
  valueNone: "none",
  providerHeading: "Game client (GSI provider)",
  providerGame: "Game",
  providerGsiTime: "GSI clock",
  matchSummary: "Match",
  matchScore: "Score",
  playerHudControl: "HUD control",
  playerHudControlLocal: "Your pawn",
  playerHudControlSpectate: "Teammate (spectating)",
  playerHudPov: "HUD player",
};

export function InteractiveBenchCli({ benchApp }: InteractiveBenchCliProps) {
  const { exit } = useApp();
  const [records, setRecords] = useState<readonly GsiRecordFile[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mode, setMode] = useState<ScreenMode>("list");
  const [result, setResult] = useState<ReplayResult | null>(null);
  const [session, setSession] = useState<ReplayPlaybackSession | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [seekInput, setSeekInput] = useState("");
  const [isSeekInputActive, setIsSeekInputActive] = useState(false);

  const loadRecords = async (): Promise<void> => {
    setErrorMessage(null);
    try {
      const nextRecords = await benchApp.listRecords();
      setRecords(nextRecords);
      setSelectedIndex((current) => Math.min(current, Math.max(nextRecords.length - 1, 0)));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to list records");
    }
  };

  const runReplay = async (): Promise<void> => {
    const record = benchApp.selectRecord(records, selectedIndex);
    if (!record) return;

    setMode("loading");
    setErrorMessage(null);
    try {
      const replayResult = await benchApp.analyzeRecordReplay(record);
      setResult(replayResult);
      setSession(benchApp.createPlaybackSession(replayResult));
      setMode("player");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to replay record");
      setMode("list");
    }
  };

  useEffect(() => {
    void loadRecords();
  }, []);

  useEffect(() => {
    if (mode !== "player" || !session?.isPlaying) return;

    const timer = setInterval(() => {
      setSession((current) => {
        if (!current) return current;
        return benchApp.advancePlayback(current, 250);
      });
    }, 250);

    return () => clearInterval(timer);
  }, [benchApp, mode, session?.isPlaying]);

  useInput((input, key) => {
    if (input === "q") {
      exit();
      return;
    }

    if (isSeekInputActive) {
      if (key.escape) {
        setIsSeekInputActive(false);
        setSeekInput("");
        return;
      }
      if (key.return) {
        const value = Number.parseInt(seekInput, 10);
        if (session && Number.isFinite(value)) {
          setSession(benchApp.seekPlaybackToSecond(session, value));
        }
        setIsSeekInputActive(false);
        setSeekInput("");
        return;
      }
      if (key.backspace || key.delete) {
        setSeekInput((current) => current.slice(0, -1));
        return;
      }
      if (/^[0-9]$/.test(input)) {
        setSeekInput((current) => `${current}${input}`.slice(0, 6));
      }
      return;
    }

    if (mode === "list") {
      if (input === "r") {
        void loadRecords();
        return;
      }
      if (key.upArrow) {
        setSelectedIndex((current) => Math.max(current - 1, 0));
        return;
      }
      if (key.downArrow) {
        setSelectedIndex((current) => Math.min(current + 1, records.length - 1));
        return;
      }
      if (key.return) {
        void runReplay();
      }
      return;
    }

    if (mode === "player" || mode === "analysis") {
      if (input === "a" || key.tab) {
        setMode((current) => (current === "player" ? "analysis" : "player"));
        return;
      }

      if (session && mode === "player") {
        if (input === " ") {
          setSession(benchApp.togglePlayback(session));
          return;
        }
        if (input === "1") {
          setSession(benchApp.setPlaybackSpeed(session, 1));
          return;
        }
        if (input === "2") {
          setSession(benchApp.setPlaybackSpeed(session, 2));
          return;
        }
        if (input === "m") {
          setSession(benchApp.toggleSeekMode(session));
          return;
        }
        if (key.leftArrow) {
          setSession(benchApp.seekPlaybackToSecond(session, session.currentSecond - 1));
          return;
        }
        if (key.rightArrow) {
          setSession(benchApp.seekPlaybackToSecond(session, session.currentSecond + 1));
          return;
        }
        if (input === "s") {
          setSeekInput(`${session.currentSecond}`);
          setIsSeekInputActive(true);
          return;
        }
      }

      if (input === "b") {
        setMode("list");
        setSession(null);
        setResult(null);
        return;
      }
      if (key.escape || input === "b") {
        setMode("list");
        setSession(null);
        setResult(null);
      }
    }
  });

  return (
    <Box flexDirection="column" width="100%">
      <Text bold color="cyan">
        CS2Helper GSI Bench CLI
      </Text>
      <Text dimColor>
        Up/down select | enter replay | space play/pause | 1/2 speed | arrows seek | s seek sec | m seek mode | 7/8
        dashboard tabs | a/tab analysis | b back | r refresh | q quit
      </Text>
      {errorMessage ? <Text color="red">Error: {errorMessage}</Text> : null}
      {mode === "list" ? (
        <RecordList records={records} selectedIndex={selectedIndex} />
      ) : null}
      {mode === "loading" ? <Text color="yellow">Loading replay timeline...</Text> : null}
      {result && session && mode === "player" ? (
        <ReplayPlayer result={result} session={session} isSeekInputActive={isSeekInputActive} seekInput={seekInput} />
      ) : null}
      {result && mode === "analysis" ? <ReplayAnalysis result={result} /> : null}
    </Box>
  );
}

function RecordList({
  records,
  selectedIndex,
}: {
  records: readonly GsiRecordFile[];
  selectedIndex: number;
}) {
  if (records.length === 0) {
    return (
      <Box marginTop={1}>
        <Text color="yellow">No .ndjson records found in the gsi-cli recordings folder.</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" marginTop={1}>
      {records.slice(0, 12).map((record, index) => (
        <MenuOptionLine
          key={record.id}
          focused={index === selectedIndex}
          label={`${record.name} (${formatBytes(record.sizeBytes)}, ${formatDate(record.modifiedAt)})`}
        />
      ))}
      {records.length > 12 ? <Text dimColor>... {records.length - 12} more records</Text> : null}
    </Box>
  );
}

function ReplayPlayer({
  result,
  session,
  isSeekInputActive,
  seekInput,
}: {
  result: ReplayResult;
  session: ReplayPlaybackSession;
  isSeekInputActive: boolean;
  seekInput: string;
}) {
  const visibleSteps =
    session.currentTickIndex < 0 ? [] : result.steps.slice(0, session.currentTickIndex + 1);
  const visibleEvents = visibleSteps.flatMap((step) => step.events);
  const lastParseError = result.parseErrors.at(-1);
  const progress = result.timeline.durationSeconds === 0
    ? 100
    : Math.round((session.currentSecond / result.timeline.durationSeconds) * 100);

  return (
    <Box flexDirection="column" marginTop={1}>
      <Text bold>{result.record.name}</Text>
      <Text>
        {session.isPlaying ? "Playing" : "Paused"} | t={session.currentSecond}s /{" "}
        {result.timeline.durationSeconds}s | speed x{session.speed} | seek {session.seekMode} |{" "}
        {progress}%
      </Text>
      {isSeekInputActive ? (
        <Text color="yellow">Seek second (enter confirm, esc cancel): {seekInput || "_"}</Text>
      ) : null}
      <GsiProcessorStatusBox
        gsiState={session.state}
        gatewayDiagnostics={{
          receivedRequests: visibleSteps.length,
          rejectedRequests: result.parseErrors.length,
          lastRejectReason: lastParseError?.message,
        }}
        cs2Running
        labels={labels}
        formatTimestamp={(timestamp) => `${timestamp}ms`}
      />
      <Text dimColor>Events emitted: {visibleEvents.length}</Text>
    </Box>
  );
}

function ReplayAnalysis({ result }: { result: ReplayResult }) {
  const interestingSteps = result.steps.filter(
    (step) =>
      step.events.length > 0 ||
      step.before.streamState !== step.after.streamState ||
      step.before.mapRound !== step.after.mapRound ||
      step.before.roundPhase !== step.after.roundPhase
  );
  const visibleSteps = interestingSteps.slice(-15);

  return (
    <Box flexDirection="column" marginTop={1}>
      <Text bold>{result.record.name} analysis</Text>
      <Text>
        Ticks: {result.processedTicks} | Events: {result.events.length} | Parse errors:{" "}
        {result.parseErrors.length}
      </Text>
      {visibleSteps.length === 0 ? (
        <Text dimColor>No notable transitions found in this replay.</Text>
      ) : (
        visibleSteps.map((step) => (
          <Text key={`${step.tickIndex}:${step.lineNumber}`}>
            #{step.tickIndex} line {step.lineNumber} {step.before.streamState} -&gt;{" "}
            {step.after.streamState} round {step.before.mapRound ?? "-"} -&gt;{" "}
            {step.after.mapRound ?? "-"} events {formatEvents(step.events)}
          </Text>
        ))
      )}
    </Box>
  );
}

function formatEvents(events: ReplayResult["events"]): string {
  if (events.length === 0) return "-";
  return events.map((event) => event.type).join(", ");
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}
