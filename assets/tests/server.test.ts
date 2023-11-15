import { SRPServer } from '../src/srp';
import { getHasher, getTestVectors, hexExpect } from './test-utils';

const testVectors = getTestVectors();

describe('SRPServerTest', () => {
  test.each(testVectors)('testing with input: $H:$size', async (data) => {
    const server = SRPServer.create(
      data.N,
      data.g,
      data.k
    );
    server.setSize(data.size);
    server.setHasher(await getHasher(data.H));

    const salt = BigInt(`0x${data.s}`);
    const identity = data.I;

    const v = BigInt('0x' + data.v);
    const A = BigInt('0x' + data.A);
    const u = BigInt('0x' + data.u);
    const b = BigInt('0x' + data.b);

    // Assuming server.generatePublic, server.generatePreMasterSecret, and server.hash are defined and updated to use bigint
    const B = await server.generatePublic(b, v);
    const S = await server.generatePreMasterSecret(A, b, v, u);
    const K = await server.hash(S);
    const M1 = await server.generateClientSessionProof(identity, salt, A, B, K);
    const M2 = await server.generateServerSessionProof(A, M1, K);

    // Test B
    hexExpect(B.toString(16), data.B);

    // Test S
    hexExpect(S.toString(16), data.S);

    // Test K
    hexExpect(K.toString(16), data.K);

    // Test M1
    hexExpect(M1.toString(16), data.M1);

    // Test M2
    hexExpect(M2.toString(16), data.M2);
  });
});
