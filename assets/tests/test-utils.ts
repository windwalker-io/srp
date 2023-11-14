import { blake2bHex, blake2s } from 'blakejs';
import { trimStart } from 'lodash';
import { HasherFunction } from '../src/types';
import testData from '../../test/data/test-vectors.json';

export function hexExpect(a: string, b: string) {
  return expect(trimStart(a, '0')).toBe(trimStart(b, '0'));
}

// const allowHashes = ['sha1', 'sha256', 'sha512', 'blake2s-256'];
// const allowSizes = [1024];

export function getTestVectors() {
  return testData.testVectors.filter((item: any) => {
    // Uncomment if you need control test cases
    // if (!allowHashes.includes(item.H)) {
    //   return false;
    // }

    // if (!allowSizes.includes(item.size)) {
    //   return false;
    // }

    return true;
  });
}

export async function getHasher(H: string): Promise<HasherFunction> {
  const {
    sha1,
    sha256,
    sha384,
    sha512
  } = await import('crypto-hash');

  switch (H) {
    case 'sha1':
      return async (buffer: Uint8Array) => sha1(buffer);
    case 'sha256':
      return async (buffer: Uint8Array) => sha256(buffer);
    case 'sha384':
      return async (buffer: Uint8Array) => sha384(buffer);
    case 'sha512':
      return async (buffer: Uint8Array) => sha512(buffer);
    case 'blake2s-256':
      return async (buffer: Uint8Array) => blake2s(buffer, undefined, 256 / 8);
    case 'blake2b-224':
      return async (buffer: Uint8Array) => blake2bHex(buffer, undefined, 224 / 8);
    case 'blake2b-256':
      return async (buffer: Uint8Array) => blake2bHex(buffer, undefined, 256 / 8);
    case 'blake2b-384':
      return async (buffer: Uint8Array) => blake2bHex(buffer, undefined, 384 / 8);
    case 'blake2b-512':
      return async (buffer: Uint8Array) => blake2bHex(buffer, undefined, 512 / 8);
  }
}
