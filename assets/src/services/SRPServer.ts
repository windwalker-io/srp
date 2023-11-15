import { mod, modPow, toBigInt } from 'bigint-toolkit';
import { DEFAULT_GENERATOR, DEFAULT_KEY, DEFAULT_PRIME } from '../utils';
import AbstractSRPHandler from './AbstractSRPHandler';

export default class SRPServer extends AbstractSRPHandler {
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

  public async generatePublic(secret: bigint, verifier: bigint): Promise<bigint> {
    const N: bigint = this.getPrime();

    // ((k*v + g^b) % N)
    return mod((this.getKey() * verifier) + (modPow(this.getGenerator(), secret, N)), N);
  }

  /**
   * Generate Pre Master Secret
   *
   * @param A - bigint
   * @param b - bigint
   * @param verifier - bigint
   * @param u - bigint
   * @returns bigint
   */
  public async generatePreMasterSecret(
    A: bigint,
    b: bigint,
    verifier: bigint,
    u: bigint
  ): Promise<bigint> {
    const N: bigint = this.getPrime();

    return modPow(modPow(verifier, u, N) * A, b, N);
  }
}
