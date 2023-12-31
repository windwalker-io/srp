import { hexToBigint as hex2bi, bigintToHex as bi2hex, toBigint } from 'bigint-toolkit';

export const DEFAULT_PRIME = 21766174458617435773191008891802753781907668374255538511144643224689886235383840957210909013086056401571399717235807266581649606472148410291413364152197364477180887395655483738115072677402235101762521901569820740293149529620419333266262073471054548368736039519702486226506248861060256971802984953561121442680157668000761429988222457090413873973970171927093992114751765168063614761119615476233422096442783117971236371647333871414335895773474667308967050807005509320424799678417036867928316761272274230314067548291133582479583061439577559347101961771406173684378522703483495337037655006751328447510550299250924469288819n;
export const DEFAULT_GENERATOR = 2n;
export const DEFAULT_KEY = toBigint('5b9e8ef059c6b32ea59fc1d322d37f04aa30bae5aa9003b8321e21ddb04e300', 16);

export function hexToBigint(hex: string) {
  return hex2bi(hex);
}

export function bigintToHex(num: bigint, padZero: boolean = false) {
  return bi2hex(num, padZero);
}

export function timingSafeEquals(a: string, b: string) {
  if (isNode()) {
    const { timingSafeEqual } = require('crypto');

    return timingSafeEqual(str2buffer(a), str2buffer(b));
  }

  const strA = String(a);
  let strB = String(b);
  const lenA = strA.length;
  let result = 0;

  if (lenA !== strB.length) {
    strB = strA;
    result = 1;
  }

  for (let i = 0; i < lenA; i++) {
    result |= strA.charCodeAt(i) ^ strB.charCodeAt(i);
  }

  return result === 0;
}

export function isNode() {
  return typeof window === 'undefined';
}

export function str2buffer(str: string): Uint8Array {
  let bytes: Uint8Array;

  if (typeof window === 'undefined') {
    bytes = Buffer.from(str, 'utf-8');
  } else {
    const encoder = new TextEncoder();
    bytes = encoder.encode(str);
  }

  return bytes;
}

export function concatArrayBuffers(...buffers: Uint8Array[]) {
  let totalLength = buffers.reduce((acc, value) => acc + value.byteLength, 0);

  let result = new Uint8Array(totalLength);

  let length = 0;
  for (let buffer of buffers) {
    result.set(new Uint8Array(buffer), length);
    length += buffer.byteLength;
  }

  return result;
}
