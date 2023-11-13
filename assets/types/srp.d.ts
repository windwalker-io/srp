declare abstract class AbstractSRPHandler {
    protected prime: bigint;
    protected generator: bigint;
    protected key: bigint;
    protected algo: string;
    protected length: number;
    bigInteger(num: string | bigint, from?: number): bigint;
    constructor(prime: bigint, generator: bigint, key: bigint);
    generateRandomPrivate(): bigint;
    getAlgo(): string;
    setAlgo(algo: string): this;
    getLength(): number;
    setLength(length: number): this;
    setSize(length: number): this;
    generateCommonSecret(A: bigint, B: bigint): bigint;
    generateClientSessionProof(identity: string, salt: bigint, A: bigint, B: bigint, K: bigint): bigint;
    generateServerSessionProof(A: bigint, M: bigint, K: bigint): bigint;
    getPrime(): bigint;
    getGenerator(): bigint;
    getKey(): bigint;
    hash(...args: (string | bigint)[]): bigint;
    protected hashToString(str: string): string;
    protected blake(str: string, algo: string, size: number): string;
    private bigIntToHex;
    protected checkNotEmpty(num: any, name: string): void;
    protected pad(val: bigint): bigint;
    private intToBytes;
}

declare class SRPClient extends AbstractSRPHandler {
    generatePasswordHash(salt: bigint, identity: string, password: string): bigint;
    generatePreMasterSecret(a: bigint, B: bigint, x: bigint, u: bigint): bigint;
    generateVerifier(x: bigint): bigint;
    generatePublic(privateKey: bigint): bigint;
}

declare class SRPServer {
}

export { SRPClient, SRPServer };
