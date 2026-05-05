/**
 * @packageDocumentation
 * Public entrypoint for the CS2 GSI processor library.
 */

export { createGsiProcessor } from "./infrastructure/gsiProcessor/createGsiProcessor";
export type { CreateGsiProcessorOptions } from "./infrastructure/gsiProcessor/createGsiProcessor";

export type * from "./domain/csgo";
export type * from "./domain/gsiProcessor";
export type * from "./domain/match";
