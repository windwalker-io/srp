// import CryptoJS from 'crypto-js';
import * as Sha1 from 'crypto-js/hmac-sha1.js';

console.log(Sha1);

function randomBytes(size: number) {
  if (typeof process === 'object' && process.versions && process.versions.node) {
    const crypto = require('crypto');
    return crypto.randomBytes(size);
  } else if (typeof window === 'object' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(size);
    window.crypto.getRandomValues(array);
    return array;
  } else {
    throw new Error('Secure random bytes generation is not supported in this environment.');
  }
}

export abstract class AbstractSRPHandler {
  protected algo: string = 'sha256';
  protected length: number = 256 / 8;

  public bigInteger(num: string | bigint, from: number = 10): bigint {
    if (typeof num === 'bigint') {
      return num;
    }

    return BigInt(`0x${num}`);
  }

  // public static createFromConfig(config: any): SRPClient {
  //   return SRPClient.create(
  //     config.prime ?? null,
  //     config.generator ?? null,
  //     config.key ?? null,
  //   );
  // }
  //
  // public static create(
  //   prime: bigint | string = null,
  //   generator: bigint | string = null,
  //   key: bigint | string = null
  // ): this {
  //   prime ??= SRPClient.DEFAULT_PRIME;
  //   generator ??= SRPClient.DEFAULT_GENERATOR;
  //   key ??= SRPClient.DEFAULT_KEY;
  //
  //   return new SRPClient(
  //     SRPClient.bigInteger(prime, 16),
  //     SRPClient.bigInteger(generator, 16),
  //     SRPClient.bigInteger(key, 16),
  //   );
  // }

  constructor(
    protected prime: bigint,
    protected generator: bigint,
    protected key: bigint
  ) {
    // ...
  }

  public generateRandomPrivate(): bigint {
    const hex = randomBytes(this.getLength()).toString('hex');
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

  public hash(...args: (string | bigint)[]): bigint {
    const binaryArgs = args.map(arg => {
      if (typeof arg === 'bigint') {
        return this.bigIntToHex(arg);
      }
      return arg;
    });

    const hashString = this.hashToString(binaryArgs.join(''));
    return this.bigInteger(hashString, 16);
  }

  protected hashToString(str: string): string {
    const algo = this.getAlgo().toLowerCase();

    switch (algo) {
      case 'sha1':
        return CryptoJS.SHA1(str).toString(CryptoJS.enc.Hex);
      case 'sha256':
        return CryptoJS.SHA256(str).toString(CryptoJS.enc.Hex);
      case 'sha384':
        return CryptoJS.SHA384(str).toString(CryptoJS.enc.Hex);
      case 'sha512':
        return CryptoJS.SHA512(str).toString(CryptoJS.enc.Hex);
      case 'blake2s-256':
        return this.blake(str, 'blake2s', 256);
      case 'blake2b-224':
        return this.blake(str, 'blake2b', 224);
      case 'blake2b-256':
        return this.blake(str, 'blake2b', 256);
      case 'blake2b-384':
        return this.blake(str, 'blake2b', 384);
      case 'blake2b-512':
        return this.blake(str, 'blake2b', 512);
      default:
        throw new Error(`Unsupported hash algorithm: ${algo}`);
    }
  }

  protected blake(str: string, algo: string, size: number): string {
    // 这里需要实现 Blake2 算法的逻辑，或者使用现有的库
    // 例如，使用 Node.js 的 crypto 模块或第三方库
    return ''; // 伪代码
  }

  private bigIntToHex(bigInt: bigint): string {
    return bigInt.toString(16);
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
    const primeLength = this.intToBytes(this.getPrime()).length;

    const valStr = val.toString(16);

    const paddedStr = valStr.padStart(primeLength, '0');

    return BigInt('0x' + paddedStr);
  }

  private intToBytes(val: bigint): string {
    let hexStr = val.toString(16);
    hexStr = hexStr.length % 2 ? '0' + hexStr : hexStr;
    return Buffer.from(hexStr, 'hex').toString();
  }
}
