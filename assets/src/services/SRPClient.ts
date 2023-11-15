import { abs, mod, modPow, toBigInt } from 'bigint-toolkit';
import { DEFAULT_GENERATOR, DEFAULT_KEY, DEFAULT_PRIME } from '../utils';
import AbstractSRPHandler from './AbstractSRPHandler';

export default class SRPClient extends AbstractSRPHandler {
  public static create(
    prime: bigint | string | undefined = undefined,
    generator: bigint | string | undefined = undefined,
    key: bigint | string | undefined = undefined
  ) {
    prime ??= DEFAULT_PRIME;
    generator ??= DEFAULT_GENERATOR;
    key ??= DEFAULT_KEY;

    return new this(
      toBigInt(prime, 16),
      toBigInt(generator, 16),
      toBigInt(key, 16),
    );
  }

  public async generatePasswordHash(salt: bigint, identity: string, password: string): Promise<bigint> {
    return await this.hash(
      salt,
      await this.hash(identity + ':' + password)
    );
  }

  public async generatePreMasterSecret(a: bigint, B: bigint, x: bigint, u: bigint): Promise<bigint> {
    const N = this.getPrime();
    const g = this.getGenerator();
    const k = this.getKey();

    let B2 = B - (k * (modPow(g, x, N)));;

    if (B2 < 0n) {
      B2 = N - abs(B2);

      B2 = mod(B2, N);
    }

    return modPow(B2, (a + (u * x)), N);
  }

  public async generateVerifier(x: bigint): Promise<bigint> {
    return modPow(this.getGenerator(), x, this.getPrime());
  }

  public async generatePublic(secret: bigint): Promise<bigint> {
    return modPow(this.getGenerator(), secret, this.getPrime());
  }
}
