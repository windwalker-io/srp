import { toBigint } from 'bigint-toolkit';

export const DEFAULT_PRIME = 21766174458617435773191008891802753781907668374255538511144643224689886235383840957210909013086056401571399717235807266581649606472148410291413364152197364477180887395655483738115072677402235101762521901569820740293149529620419333266262073471054548368736039519702486226506248861060256971802984953561121442680157668000761429988222457090413873973970171927093992114751765168063614761119615476233422096442783117971236371647333871414335895773474667308967050807005509320424799678417036867928316761272274230314067548291133582479583061439577559347101961771406173684378522703483495337037655006751328447510550299250924469288819n;
export const DEFAULT_GENERATOR = 2n;
export const DEFAULT_KEY = toBigint('5b9e8ef059c6b32ea59fc1d322d37f04aa30bae5aa9003b8321e21ddb04e300', 16);

// export function hexPadZero(hex: string): string {
//   if (hex.length % 2 === 0) {
//     return hex;
//   }
//
//   return '0' + hex;
// }
//
// export function bt2hex(num: bigint) {
//   return hexPadZero(num.toString(16));
// }

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
