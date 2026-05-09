import type { AsyncUseCase } from "@cs2helper/shared";
import type {
  PresentMonBootstrapOptions,
  PresentMonBootstrapPort,
} from "../ports/PresentMonBootstrapPort";

/**
 * Downloads or updates the managed PresentMon executable when applicable.
 *
 * Ports tuple order: `[bootstrap]`.
 * Args: optional {@link PresentMonBootstrapOptions} (e.g. `forceRemoteCheck` before gateway or PresentMon sessions).
 */
export const ensurePresentMonBootstrap: AsyncUseCase<
  [PresentMonBootstrapPort],
  [options?: PresentMonBootstrapOptions],
  void
> = async ([bootstrap], options) => bootstrap.ensureReady(options);
