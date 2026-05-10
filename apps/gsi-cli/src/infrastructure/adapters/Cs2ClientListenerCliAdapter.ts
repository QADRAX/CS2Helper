import type { Cs2ClientListenerService } from "@cs2helper/cs2-client-listener";
import type { Cs2ClientListenerCliPort } from "../../application/ports/Cs2ClientListenerCliPort";

/** Bridges {@link Cs2ClientListenerService} into gsi-cli application ports. */
export class Cs2ClientListenerCliAdapter implements Cs2ClientListenerCliPort {
  constructor(private readonly service: Cs2ClientListenerService) {}

  start: Cs2ClientListenerCliPort["start"] = (o) => this.service.start(o);
  stop: Cs2ClientListenerCliPort["stop"] = () => this.service.stop();
  isRunning: Cs2ClientListenerCliPort["isRunning"] = () => this.service.isRunning();
  getGatewayDiagnostics: Cs2ClientListenerCliPort["getGatewayDiagnostics"] = () =>
    this.service.getGatewayDiagnostics();
  getGsiProcessorState: Cs2ClientListenerCliPort["getGsiProcessorState"] = () =>
    this.service.getGsiProcessorState();
  subscribeTickFrames: Cs2ClientListenerCliPort["subscribeTickFrames"] = (l) =>
    this.service.subscribeTickFrames(l);
  startRecording: Cs2ClientListenerCliPort["startRecording"] = (p) => this.service.startRecording(p);
  stopRecording: Cs2ClientListenerCliPort["stopRecording"] = () => this.service.stopRecording();
  ensurePresentMonBootstrap: Cs2ClientListenerCliPort["ensurePresentMonBootstrap"] = (o) =>
    this.service.ensurePresentMonBootstrap(o);
  getCs2ProcessStatus: Cs2ClientListenerCliPort["getCs2ProcessStatus"] = () =>
    this.service.getCs2ProcessStatus();
}
