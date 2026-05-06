import { createGsiGatewayService } from "@cs2helper/gsi-gateway";
import type { CliGatewayContext } from "../../../domain/cli/contracts.js";
import type { StartGatewayUseCase } from "../../../domain/cli/useCases.js";

export function createStartGatewayUseCase(context: CliGatewayContext): StartGatewayUseCase {
  return {
    execute: async () => {
      const config = await context.configStore.getConfig();
      
      if (!config.port) {
        throw new Error("Configuration is missing or incomplete. Please set port first.");
      }

      // Stop existing gateway if any
      const existingGateway = context.gatewayManager.getGateway();
      if (existingGateway) {
        await existingGateway.stop();
      }

      const gateway = createGsiGatewayService({
        port: config.port,
      });

      context.gatewayManager.setGateway(gateway);
      
      return await gateway.start();
    },
  };
}
