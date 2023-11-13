import { AbstractSRPHandler } from './lib';

export default class SRPClient extends AbstractSRPHandler{
  public generatePasswordHash(salt: bigint, identity: string, password: string): bigint {
    return this.hash(
      salt,
      this.hash(BigInt(Buffer.from(identity + ':' + password).toString('hex')))
    );
  }

  public generatePreMasterSecret(a: bigint, B: bigint, x: bigint, u: bigint): bigint {
    const N = this.getPrime();
    const g = this.getGenerator();
    const k = this.getKey();

    let B2 = B - (k * (g ** x % N));

    if (B2 < 0n) {
      B2 = N - BigInt(Math.abs(Number(B2)));
      B2 = B2 % N;
    }

    return (B2 ** (a + (u * x))) % N;
  }

  public generateVerifier(x: bigint): bigint {
    return (this.getGenerator() ** x) % this.getPrime();
  }

  public generatePublic(privateKey: bigint): bigint {
    return (this.getGenerator() ** privateKey) % this.getPrime();
  }
}
