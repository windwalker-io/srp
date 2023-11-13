import testData from '../../test/data/test-vectors.json';
import { SRPClient } from '../src/srp';
import type { HasherFunction } from '../src/types';

const allowHashes = ['sha1'];
const allowSizes = [1024];

const testVectors = handleTestVectors(testData.testVectors);

describe('SRPClientTest', () => {
  test.each(testVectors)('testing with input: $H:$size', async (data) => {
    const client = SRPClient.create();
    client.setSize(data.size);

    client.setHasher(await getHasher(data.H));

    const salt = BigInt(`0x${data.s}`);
    const identity = data.I;
    const password = data.P;

    // Test [x]
    const x = await client.generatePasswordHash(salt, identity, password);
    expect(x.toString(16)).toBe(data.x);

    // Test [v]
    const v = await client.generateVerifier(x);
    expect(v.toString(16)).toBe(data.v);

    const a = BigInt(`0x${data.a}`);
    const B = BigInt(`0x${data.B}`);
    const A = await client.generatePublic(a);
    const u = await client.generateCommonSecret(A, B);
    const S = await client.generatePreMasterSecret(a, B, x, u);
    const K = await client.hash(S);
    const M1 = await client.generateClientSessionProof(identity, salt, A, B, K);
    const M2 = await client.generateServerSessionProof(A, M1, K);

    // Test [A]
    expect(A.toString(16)).toBe(data.A);

    // Test [u]
    expect(u.toString(16)).toBe(data.u);

    // Test [S]
    expect(S.toString(16)).toBe(data.S);

    // Test [K]
    expect(K.toString(16)).toBe(data.K);

    // Test [M1]
    expect(M1.toString(16)).toBe(data.M1);

    // Test [M2]
    expect(M2.toString(16)).toBe(data.M2);
  });
});

function handleTestVectors(testVectors: typeof testData.testVectors) {
  return testVectors.filter((item) => {
    if (!allowHashes.includes(item.H)) {
      return false;
    }

    if (!allowSizes.includes(item.size)) {
      return false;
    }

    return true;
  });
}

async function getHasher(H: string): Promise<HasherFunction> {
  const {
    sha1,
    sha256,
    sha384,
    sha512
  } = await import('crypto-hash');

  switch (H) {
    case 'sha1':
      return async (str: ArrayBufferLike) => sha1(str);
    case 'sha256':
      return async (str: ArrayBufferLike) => sha256(str);
    case 'sha384':
      return async (str: ArrayBufferLike) => sha384(str);
    case 'sha512':
      return async (str: ArrayBufferLike) => sha512(str);
  }
}


