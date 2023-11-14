import { trimStart } from 'lodash';
import { HasherFunction } from '../src/types';
import testData from '../../test/data/test-vectors.json';

export function hexExpect(a: string, b: string) {
  return expect(trimStart(a, '0')).toBe(trimStart(b, '0'));
}

const allowHashes = ['sha1', 'sha256', 'sha512'];
const allowSizes = [1024];

export function getTestVectors() {
  return testData.testVectors.filter((item: any) => {
    if (!allowHashes.includes(item.H)) {
      return false;
    }

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
      return async (str: ArrayBufferLike) => sha1(str);
    case 'sha256':
      return async (str: ArrayBufferLike) => sha256(str);
    case 'sha384':
      return async (str: ArrayBufferLike) => sha384(str);
    case 'sha512':
      return async (str: ArrayBufferLike) => sha512(str);
  }
}
