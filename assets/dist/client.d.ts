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

declare class SRPClient extends AbstractSRPHandler {
    static create(prime?: bigint | string, generator?: bigint | string, key?: bigint | string): SRPClient;
    register(identity: string, password: string): Promise<{
        salt: bigint;
        verifier: bigint;
    }>;
    step1(identity: string, password: string, salt: bigint): Promise<{
        secret: bigint;
        public: bigint;
        hash: bigint;
    }>;
    step2(identity: string, salt: bigint, A: bigint, a: bigint, B: bigint, x: bigint): Promise<{
        key: bigint;
        proof: bigint;
        preMasterSecret: bigint;
    }>;
    step3(A: bigint, K: bigint, M1: bigint, serverM2: bigint): Promise<void>;
    verifyServerSession(A: bigint, K: bigint, M1: bigint, serverM2: bigint): Promise<any>;
    generateSalt(): Promise<bigint>;
    generatePasswordHash(salt: bigint, identity: string, password: string): Promise<bigint>;
    generatePreMasterSecret(a: bigint, B: bigint, x: bigint, u: bigint): Promise<bigint>;
    generateVerifier(x: bigint): Promise<bigint>;
    generatePublic(secret: bigint): Promise<bigint>;
}

export { SRPClient as default };
