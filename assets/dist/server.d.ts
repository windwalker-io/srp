type HasherFunction = (data: Uint8Array, length: number) => Promise<string|Uint8Array>;

declare abstract class AbstractSRPHandler {
    protected prime: bigint;
    protected generator: bigint;
    protected key: bigint;
    protected length: number;
    protected hasher: string | HasherFunction;
    protected padEnabled: boolean;
    constructor(prime: bigint, generator: bigint, key: bigint);
    setHasher(handler: string | HasherFunction): this;
    generateRandomSecret(): Promise<bigint>;
    getLength(): number;
    setLength(length: number): this;
    setSize(size: number): this;
    generateCommonSecret(A: bigint, B: bigint): Promise<bigint>;
    generateClientSessionProof(identity: string, salt: bigint, A: bigint, B: bigint, K: bigint): Promise<bigint>;
    generateServerSessionProof(A: bigint, M: bigint, K: bigint): Promise<bigint>;
    getPrime(): bigint;
    getGenerator(): bigint;
    getKey(): bigint;
    hash(...args: (string | bigint)[]): Promise<bigint>;
    protected hashToString(buffer: Uint8Array): Promise<string>;
    private getHasherByName;
    protected checkNotEmpty(num: any, name: string): void;
    protected pad(val: bigint): bigint;
    private intToBytes;
    protected timingSafeEquals(a: string, b: string): any;
    isPadEnabled(): boolean;
    enablePad(enable?: boolean): this;
}

declare class SRPServer extends AbstractSRPHandler {
    static create(prime?: bigint | string | undefined, generator?: bigint | string | undefined, key?: bigint | string | undefined): SRPServer;
    step1(identity: string, salt: bigint, verifier: bigint): Promise<{
        secret: bigint;
        public: bigint;
    }>;
    step2(identity: string, salt: bigint, verifier: bigint, A: bigint, b: bigint, B: bigint, clientM1: bigint): Promise<{
        key: bigint;
        proof: bigint;
        preMasterSecret: bigint;
    }>;
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

export { SRPServer as default };
