import { SRPClient } from '../src/srp';
import { getHasher, getTestVectors, hexExpect } from './test-utils';

const testVectors = getTestVectors();

describe('SRPClientTest', () => {
  test.each(testVectors)('testing with input: $H:$size', async (data) => {
    const client = SRPClient.create(
      data.N,
      data.g,
      data.k
    );
    client.setSize(data.size);

    client.setHasher(await getHasher(data.H));

    const salt = BigInt(`0x${data.s}`);
    const identity = data.I;
    const password = data.P;

    // Test [x]
    const x = await client.generatePasswordHash(salt, identity, password);
    hexExpect(x.toString(16), data.x);

    // Test [v]
    const v = await client.generateVerifier(x);
    hexExpect(v.toString(16), data.v);

    const a = BigInt(`0x${data.a}`);
    const B = BigInt(`0x${data.B}`);
    const A = await client.generatePublic(a);
    const u = await client.generateCommonSecret(A, B);
    const S = await client.generatePreMasterSecret(a, B, x, u);
    const K = await client.hash(S);
    const M1 = await client.generateClientSessionProof(identity, salt, A, B, K);
    const M2 = await client.generateServerSessionProof(A, M1, K);

    // Test [A]
    hexExpect(A.toString(16), data.A);

    // Test [u]
    hexExpect(u.toString(16), data.u);

    // Test [S]
    hexExpect(S.toString(16), data.S);

    // Test [K]
    hexExpect(K.toString(16), data.K);

    // Test [M1]
    hexExpect(M1.toString(16), data.M1);

    // Test [M2]
    hexExpect(M2.toString(16), data.M2);
  });
});
