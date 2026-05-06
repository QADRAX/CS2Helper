import type { GatewayPort } from "../ports/GatewayPort";
import type { RecorderPort } from "../ports/RecorderPort";

export const startRecording = async (gatewayPort: GatewayPort, recorderPort: RecorderPort, filename: string) => {
  const gateway = gatewayPort.getGateway();
  if (!gateway) {
    throw new Error("Gateway must be started before recording.");
  }

  await recorderPort.start(filename);

  // 1. Capture the CURRENT state immediately to ensure the recording has full context from the start.
  const initialState = gateway.getState();
  if (initialState) {
    await recorderPort.write(JSON.stringify(initialState, null, 2)).catch(console.error);
  }

  // 2. Subscribe to subsequent full state snapshots (processed and merged by the Gateway).
  const unsubscribe = gateway.subscribeState((state) => {
    if (state) {
      recorderPort.write(JSON.stringify(state, null, 2)).catch(console.error);
    }
  });

  if (unsubscribe) {
    recorderPort.setCleanup(unsubscribe);
  }
};
