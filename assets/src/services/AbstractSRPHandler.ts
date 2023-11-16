import {
  bigintToUint8,
  randomBytes, toBigint, uint8ToBigint, uint8ToHex
} from 'bigint-toolkit';
import { createHash } from 'crypto';
import { HasherFunction } from '../types';
import { concatArrayBuffers, isNode, str2buffer } from '../utils';

export default abstract class AbstractSRPHandler {
  protected length: number = 256 / 8;
  protected hasher: string|HasherFunction;

  constructor(
    protected prime: bigint,
    protected generator: bigint,
    protected key: bigint
  ) {
    // ...
  }

  setHasher(handler: string|HasherFunction) {
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

  public setSize(size: number): this {
    return this.setLength(Math.floor(size / 8));
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
    let func = this.hasher;

    if (typeof func === 'string') {
      func = this.getHasherByName(func);
    }
    
    let hash = await func(buffer, this.getLength());

    if (hash instanceof Uint8Array) {
      hash = uint8ToHex(hash);
    }

    return hash;
  }

  private getHasherByName(hasher: string): HasherFunction {
    hasher = hasher.toLowerCase();

    return async (buffer) => {
      if (isNode()) {
        const { createHash } = require('crypto');

        return new Uint8Array(
          Buffer.from(
            createHash(hasher).update(Buffer.from(buffer)).digest('hex'),
            'hex'
          )
        );
      }

      switch (hasher) {
        case 'sha1':
          return new Uint8Array(await crypto.subtle.digest("SHA-1", buffer));
        case 'sha256':
          return new Uint8Array(await crypto.subtle.digest("SHA-256", buffer));
        case 'sha384':
          return new Uint8Array(await crypto.subtle.digest("SHA-384", buffer));
        case 'sha512':
          return new Uint8Array(await crypto.subtle.digest("SHA-512", buffer));
      }

      throw new Error('Available hasher not found.');
    };
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
    const decoder = new TextDecoder();
    return decoder.decode(bigintToUint8(val));
  }
}
