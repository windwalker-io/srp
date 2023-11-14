import { mod, modPow } from '../math';
import { bigInteger, DEFAULT_GENERATOR, DEFAULT_KEY, DEFAULT_PRIME } from '../utils';
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
      bigInteger(prime, 16),
      bigInteger(generator, 16),
      bigInteger(key, 16),
    );
  }

  public generatePublic(b: bigint, verifier: bigint): bigint {
    const N: bigint = this.getPrime();

    // ((k*v + g^b) % N)
    return mod((this.getKey() * verifier) + (modPow(this.getGenerator(), b, N)), N);
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
  public generatePreMasterSecret(
    A: bigint,
    b: bigint,
    verifier: bigint,
    u: bigint
  ): bigint {
    const N: bigint = this.getPrime();

    return modPow(modPow(verifier, u, N) * A, b, N);
  }
}
