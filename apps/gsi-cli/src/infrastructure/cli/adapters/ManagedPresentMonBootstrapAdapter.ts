import type {
  PresentMonBootstrapOptions,
  PresentMonBootstrapPort,
} from "../../../application/cli/ports/PresentMonBootstrapPort";
import { ensureManagedPresentMon } from "../presentMon/ensureManagedPresentMon";

export class ManagedPresentMonBootstrapAdapter implements PresentMonBootstrapPort {
  ensureReady(options?: PresentMonBootstrapOptions): Promise<void> {
    return ensureManagedPresentMon(options);
  }
}
