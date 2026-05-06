export * from "./ConfigPort";
export * from "./GatewayPort";
export * from "./RecorderPort";

export interface Ports {
  config: import("./ConfigPort").ConfigPort;
  gateway: import("./GatewayPort").GatewayPort;
  recorder: import("./RecorderPort").RecorderPort;
}
