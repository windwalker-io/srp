export type HasherFunction = (buffer: Uint8Array, length: number) => Promise<string|Uint8Array>;
