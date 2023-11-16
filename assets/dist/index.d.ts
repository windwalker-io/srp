type HasherFunction = (buffer: Uint8Array, length: number) => Promise<string|Uint8Array>;

declare abstract class AbstractSRPHandler {
    protected prime: bigint;
    protected generator: bigint;
    protected key: bigint;
    protected length: number;
    protected hasher: HasherFunction;
    constructor(prime: bigint, generator: bigint, key: bigint);
    setHasher(handler: HasherFunction): this;
    generateRandomSecret(): Promise<bigint>;
    getLength(): number;
    setLength(length: number): this;
    setSize(length: number): this;
    generateCommonSecret(A: bigint, B: bigint): Promise<bigint>;
    generateClientSessionProof(identity: string, salt: bigint, A: bigint, B: bigint, K: bigint): Promise<bigint>;
    generateServerSessionProof(A: bigint, M: bigint, K: bigint): Promise<bigint>;
    getPrime(): bigint;
    getGenerator(): bigint;
    getKey(): bigint;
    hash(...args: (string | bigint)[]): Promise<bigint>;
    protected hashToString(buffer: Uint8Array): Promise<string>;
    protected checkNotEmpty(num: any, name: string): void;
    protected pad(val: bigint): bigint;
    private intToBytes;
}

declare class SRPClient extends AbstractSRPHandler {
    static create(prime?: bigint | string | undefined, generator?: bigint | string | undefined, key?: bigint | string | undefined): SRPClient;
    register(identity: string, password: string): Promise<{
        salt: bigint;
        verifier: bigint;
    }>;
    generateSalt(): Promise<bigint>;
    generatePasswordHash(salt: bigint, identity: string, password: string): Promise<bigint>;
    generatePreMasterSecret(a: bigint, B: bigint, x: bigint, u: bigint): Promise<bigint>;
    generateVerifier(x: bigint): Promise<bigint>;
    generatePublic(secret: bigint): Promise<bigint>;
}

declare class SRPServer extends AbstractSRPHandler {
    static create(prime?: bigint | string | undefined, generator?: bigint | string | undefined, key?: bigint | string | undefined): SRPServer;
    generatePublic(secret: bigint, verifier: bigint): bigint;
    /**
     * Generate Pre Master Secret
     *
     * @param A - bigint
     * @param b - bigint
     * @param verifier - bigint
     * @param u - bigint
     * @returns bigint
     */
    generatePreMasterSecret(A: bigint, b: bigint, verifier: bigint, u: bigint): bigint;
}

export { SRPClient, SRPServer };
