import type { GatewayPort } from "../ports/GatewayPort";
import type { RecorderPort } from "../ports/RecorderPort";

export const startRecording = async (gatewayPort: GatewayPort, recorderPort: RecorderPort, filename: string) => {
  const gateway = gatewayPort.getGateway();
  if (!gateway) {
    throw new Error("Gateway must be started before recording.");
  }

  await recorderPort.start(filename);

  const unsubscribe = gatewayPort.subscribeRawTicks((raw) => {
    recorderPort.write(raw).catch(console.error);
  });

  if (unsubscribe) {
    recorderPort.setCleanup(unsubscribe);
  }
};
