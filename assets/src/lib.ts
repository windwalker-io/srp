
export abstract class AbstractSRPHandler {
  protected algo: string = 'sha256';
  protected length: number = SRPClient.SECRET_256BIT; // 假设 SECRET_256BIT 是一个静态属性

  public static bigInteger(num: string | bigint, from: number = 10): bigint {
    if (typeof num === 'bigint') {
      return num;
    }

    return BigInt(`0x${num}`);
  }

  public static createFromConfig(config: any): SRPClient {
    return SRPClient.create(
      config.prime ?? null,
      config.generator ?? null,
      config.key ?? null,
    );
  }

  public static create(
    prime: bigint | string = null,
    generator: bigint | string = null,
    key: bigint | string = null
  ): this {
    prime ??= SRPClient.DEFAULT_PRIME;
    generator ??= SRPClient.DEFAULT_GENERATOR;
    key ??= SRPClient.DEFAULT_KEY;

    return new SRPClient(
      SRPClient.bigInteger(prime, 16),
      SRPClient.bigInteger(generator, 16),
      SRPClient.bigInteger(key, 16),
    );
  }

  constructor(
    protected prime: bigint,
    protected generator: bigint,
    protected key: bigint
  ) {
    // ...
  }

  public generateRandomPrivate(): bigint {
    const hex = crypto.randomBytes(this.getLength()).toString('hex');
    return BigInt(`0x${hex}`);
  }

  public getAlgo(): string {
    return this.algo;
  }

  public setAlgo(algo: string): this {
    this.algo = algo;
    return this;
  }

  public getLength(): number {
    return this.length;
  }

  public setLength(length: number): this {
    this.length = length;
    return this;
  }

  public setSize(length: number): this {
    return this.setLength(Math.floor(length / 8));
  }

  public generateCommonSecret(A: bigint, B: bigint): bigint {
    this.checkNotEmpty(A, 'A');
    this.checkNotEmpty(B, 'B');

    return this.hash(this.pad(A), this.pad(B));
  }

  public generateClientSessionProof(
    identity: string,
    salt: bigint,
    A: bigint,
    B: bigint,
    K: bigint
  ): bigint {
    return this.hash(
      this.hash(this.getPrime()) ^ this.hash(this.getGenerator()),
      this.hash(identity),
      salt, // s
      A,
      B,
      K
    );
  }

  public generateServerSessionProof(
    A: bigint,
    M: bigint,
    K: bigint
  ): bigint {
    return this.hash(A, M, K);
  }

  public getPrime(): bigint {
    return this.prime;
  }

  public getGenerator(): bigint {
    return this.generator;
  }

  public getKey(): bigint {
    return this.key;
  }

  protected hash(...args: (string | bigint)[]): bigint {
    // 实现 hash 函数，这里需要根据你的具体需求来实现
    // 注意：BigInt 和哈希算法的结合可能需要特别处理
    return BigInt(/* ... */);
  }

  protected checkNotEmpty(num: any, name: string): void {
    if (!num) {
      throw new Error(`Value: \`${name}\` should not be empty.`);
    }

    if (typeof num === 'bigint' && num === 0n) {
      throw new Error(`Value: \`${name}\` should not be zero.`);
    }
  }

  protected pad(val: bigint): bigint {
    // 实现 pad 函数，这里需要根据你的具体需求来实现
    return BigInt(/* ... */);
  }
}
