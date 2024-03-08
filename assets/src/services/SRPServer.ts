import { mod, modPow, toBigint } from 'bigint-toolkit';
import InvalidSessionProofError from '../error/InvalidSessionProofError';
import { DEFAULT_GENERATOR, DEFAULT_KEY, DEFAULT_PRIME } from '../utils';
import AbstractSRPHandler from './AbstractSRPHandler';

export default class SRPServer extends AbstractSRPHandler {
  public static create(
    prime?: bigint | string,
    generator?: bigint | string,
    key?: bigint | string
  ) {
    prime ??= DEFAULT_PRIME;
    generator ??= DEFAULT_GENERATOR;
    key ??= DEFAULT_KEY;

    return new this(
      toBigint(prime, 16),
      toBigint(generator, 16),
      toBigint(key, 16),
    );
  }

  async step1(identity: string, salt: bigint, verifier: bigint) {
    this.checkNotEmpty(identity, 'identity');
    this.checkNotEmpty(salt, 'salt');
    this.checkNotEmpty(verifier, 'verifier');

    const b = await this.generateRandomSecret();

    const B = await this.generatePublic(b, verifier);

    return { secret: b, public: B };
  }

  async step2(
    identity: string,
    salt: bigint,
    verifier: bigint,
    A: bigint,
    b: bigint,
    B: bigint,
    clientM1: bigint,
  ) {
    this.checkNotEmpty(A, 'A');
    this.checkNotEmpty(clientM1, 'M1');

    const u = await this.generateCommonSecret(A, B);

    const S = await this.generatePreMasterSecret(A, b, verifier, u);

    const K = await this.hash(S);

    const M1 = await this.generateClientSessionProof(identity, salt, A, B, K);

    if (!this.timingSafeEquals(M1.toString(), clientM1.toString())) {
      throw new InvalidSessionProofError('Invalid client session proof.');
    }

    // M2
    const proof = await this.generateServerSessionProof(A, M1, K);

    return {
      key: K,
      proof,
      preMasterSecret: S
    };
  }

  public generatePublic(secret: bigint, verifier: bigint): bigint {
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
