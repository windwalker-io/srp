import { SRPClient, SRPServer } from '../src/srp';
import { getHasher, getTestVectors, hexExpect } from './test-utils';

const testVectors = getTestVectors();

describe('SRPStpesTest', () => {
  test.each(testVectors)('testing steps: $H:$size', async (data) => {
    const server = SRPServer.create(
      data.N,
      data.g,
      data.k
    );
    server.setSize(data.size);
    server.setHasher(await getHasher(data.H));

    const client = SRPClient.create(
      data.N,
      data.g,
      data.k
    );
    client.setSize(data.size);
    client.setHasher(await getHasher(data.H));

    // Register
    const identity = data.I;
    const password = data.P;

    // Register: generate new salt & verifier
    const { salt, verifier } = await client.register(identity, password);

    // Send to Server store

    // Login start
    // AJAX:challenge?{identity} - Server step (1)
    // salt & verifier has already stored on user data, server can get it from DB
    // b & B must remember on session, we will use it at following steps.
    const { secret: b, public: B } = await server.step1(identity, salt, verifier);

    // Server returns B & salt to client

    // Client step (1) & (2)
    const { secret: a, public: A, hash: x } = await client.step1(identity, password, salt);
    const { key: K, proof: M1 } = await client.step2(identity, salt, A, a, B, x);

    // AJAX:authenticate?{identity,A,M1} - Server step (2)
    // Send identity & A & M1 to server and compare it.
    // The salt & verifier stored on user data, get it from DB.
    // The b, B stored in session state, get and clear them.
    const { proof: M2 } = await server.step2(identity, salt, verifier, A, b, B, M1);

    // Server returns M2 to Client
    // Client step (3) (optional)
    await client.step3(A, K, M1, M2);

    // If all passed, should not throw any exceptions.
  });
});
