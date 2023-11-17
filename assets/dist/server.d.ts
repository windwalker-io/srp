type HasherFunction = (data: Uint8Array, length: number) => Promise<string|Uint8Array>;

declare abstract class AbstractSRPHandler {
    protected prime: bigint;
    protected generator: bigint;
    protected key: bigint;
    protected length: number;
    protected hasher: string | HasherFunction;
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

declare const DEFAULT_PRIME = 21766174458617435773191008891802753781907668374255538511144643224689886235383840957210909013086056401571399717235807266581649606472148410291413364152197364477180887395655483738115072677402235101762521901569820740293149529620419333266262073471054548368736039519702486226506248861060256971802984953561121442680157668000761429988222457090413873973970171927093992114751765168063614761119615476233422096442783117971236371647333871414335895773474667308967050807005509320424799678417036867928316761272274230314067548291133582479583061439577559347101961771406173684378522703483495337037655006751328447510550299250924469288819n;
declare const DEFAULT_GENERATOR = 2n;
declare const DEFAULT_KEY: bigint;
declare function hexToBigint(hex: string): bigint;
declare function bigintToHex(num: bigint, padZero?: boolean): string;
declare function timingSafeEquals(a: string, b: string): any;

export { DEFAULT_GENERATOR, DEFAULT_KEY, DEFAULT_PRIME, bigintToHex, SRPServer as default, hexToBigint, timingSafeEquals };
