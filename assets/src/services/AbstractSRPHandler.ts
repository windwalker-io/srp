import {
  bigintToUint8,
  randomBytes, toBigint, uint8ToBigint, uint8ToHex
} from 'bigint-toolkit';
import { HasherFunction } from '../types';
import { concatArrayBuffers, str2buffer } from '../utils';

export default abstract class AbstractSRPHandler {
  protected length: number = 256 / 8;
  protected hasher: HasherFunction;

  constructor(
    protected prime: bigint,
    protected generator: bigint,
    protected key: bigint
  ) {
    // ...
  }

  setHasher(handler: HasherFunction) {
    this.hasher = handler;
    return this;
  }

  public async generateRandomSecret(): Promise<bigint> {
    return uint8ToBigint(randomBytes(this.getLength()));
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

  public async generateCommonSecret(A: bigint, B: bigint): Promise<bigint> {
    this.checkNotEmpty(A, 'A');
    this.checkNotEmpty(B, 'B');

    return this.hash(this.pad(A), this.pad(B));
  }

  public async generateClientSessionProof(
    identity: string,
    salt: bigint,
    A: bigint,
    B: bigint,
    K: bigint
  ): Promise<bigint> {
    return await this.hash(
      await this.hash(this.getPrime()) ^ await this.hash(this.getGenerator()),
      await this.hash(identity),
      salt, // s
      A,
      B,
      K
    );
  }

  public async generateServerSessionProof(
    A: bigint,
    M: bigint,
    K: bigint
  ): Promise<bigint> {
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

  public async hash(...args: (string | bigint)[]): Promise<bigint> {
    const binaryArgs = args.map(arg => {
      if (typeof arg === 'bigint') {
        return bigintToUint8(arg);
      }
      return str2buffer(arg);
    });

    const hashString = await this.hashToString(concatArrayBuffers(...binaryArgs));

    return toBigint(hashString, 16);
  }

  protected async hashToString(buffer: Uint8Array): Promise<string> {
    let hash = await this.hasher(buffer, this.getLength());

    if (hash instanceof Uint8Array) {
      hash = uint8ToHex(hash);
    }

    return hash;
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
