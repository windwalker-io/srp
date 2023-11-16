export type HasherFunction = (data: Uint8Array, length: number) => Promise<string|Uint8Array>;
