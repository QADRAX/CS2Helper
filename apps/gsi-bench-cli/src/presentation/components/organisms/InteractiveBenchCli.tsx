import { useEffect, useState } from "react";
import { Box, Text, useApp, useInput } from "ink";
import {
  GsiProcessorStatusBox,
  type GsiProcessorStatusLabels,
} from "@cs2helper/gsi-processor-ink";
import type { BenchCliApp } from "../../../infrastructure/bench";
import type { GsiRecordFile, ReplayResult } from "../../../domain/bench";
import { MenuOptionLine } from "../atoms";

type ScreenMode = "list" | "replaying" | "demo" | "analysis";

interface InteractiveBenchCliProps {
  benchApp: BenchCliApp;
}

const labels: GsiProcessorStatusLabels = {
  title: "GSI processor demo",
  warningPrefix: "Warning:",
  spinner: (frame) => `${frame} Waiting for replay data...`,
  streamState: "Stream state:",
  ticksReceived: "Ticks processed:",
  lastTickAt: "Last tick at:",
  httpRequests: "Record frames:",
  httpRejected: "Parse errors:",
  lastRejectReason: "Last parse error:",
  watcherMode: "Watcher mode:",
  lastGameState: "Last game state:",
  player: "Player:",
  allplayers: "All players:",
  valueAvailable: "available",
  valueNull: "null",
  valueNone: "none",
};

export function InteractiveBenchCli({ benchApp }: InteractiveBenchCliProps) {
  const { exit } = useApp();
  const [records, setRecords] = useState<readonly GsiRecordFile[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mode, setMode] = useState<ScreenMode>("list");
  const [result, setResult] = useState<ReplayResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

    setMode("replaying");
    setErrorMessage(null);
    try {
      const replayResult = await benchApp.analyzeRecordReplay(record);
      setResult(replayResult);
      setMode("demo");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to replay record");
      setMode("list");
    }
  };

  useEffect(() => {
    void loadRecords();
  }, []);

  useInput((input, key) => {
    if (input === "q") {
      exit();
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

    if (mode === "demo" || mode === "analysis") {
      if (input === "a" || key.tab) {
        setMode((current) => (current === "demo" ? "analysis" : "demo"));
        return;
      }
      if (key.escape || input === "b") {
        setMode("list");
      }
    }
  });

  return (
    <Box flexDirection="column" width="100%">
      <Text bold color="cyan">
        CS2Helper GSI Bench CLI
      </Text>
      <Text dimColor>
        Up/down select | enter replay | a/tab analysis | b back | r refresh | q quit
      </Text>
      {errorMessage ? <Text color="red">Error: {errorMessage}</Text> : null}
      {mode === "list" ? (
        <RecordList records={records} selectedIndex={selectedIndex} />
      ) : null}
      {mode === "replaying" ? <Text color="yellow">Replaying selected record...</Text> : null}
      {result && mode === "demo" ? <ReplayDemo result={result} /> : null}
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

function ReplayDemo({ result }: { result: ReplayResult }) {
  const lastParseError = result.parseErrors.at(-1);

  return (
    <Box flexDirection="column" marginTop={1}>
      <Text bold>{result.record.name}</Text>
      <GsiProcessorStatusBox
        gsiState={result.finalState}
        gatewayDiagnostics={{
          receivedRequests: result.processedTicks,
          rejectedRequests: result.parseErrors.length,
          lastRejectReason: lastParseError?.message,
        }}
        cs2Running
        labels={labels}
        formatTimestamp={(timestamp) => `${timestamp}ms`}
      />
      <Text dimColor>Events emitted: {result.events.length}</Text>
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
