import { blake2bHex, blake2s } from 'blakejs';
import { trimStart } from 'lodash';
import testData from '../../test/data/test-vectors.json';
import { HasherFunction } from '../src/types';

export function hexExpect(a: string, b: string) {
  return expect(trimStart(a, '0')).toBe(trimStart(b, '0'));
}

const allowHashes = ['sha1'];
const allowSizes = [1024];

export function getTestVectors() {
  return testData.testVectors.filter((item: any) => {
    // Uncomment if you need control test cases
    // if (!allowHashes.includes(item.H)) {
    //   return false;
    // }
    //
    // if (!allowSizes.includes(item.size)) {
    //   return false;
    // }

    return true;
  });
}

export async function getHasher(H: string): Promise<string | HasherFunction> {
  switch (H) {
    case 'sha1':
    case 'sha256':
    case 'sha384':
    case 'sha512':
      return H;
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
