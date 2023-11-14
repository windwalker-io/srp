export const DEFAULT_PRIME = BigInt('21766174458617435773191008891802753781907668374255538511144643224689886235383840957210909013086056401571399717235807266581649606472148410291413364152197364477180887395655483738115072677402235101762521901569820740293149529620419333266262073471054548368736039519702486226506248861060256971802984953561121442680157668000761429988222457090413873973970171927093992114751765168063614761119615476233422096442783117971236371647333871414335895773474667308967050807005509320424799678417036867928316761272274230314067548291133582479583061439577559347101961771406173684378522703483495337037655006751328447510550299250924469288819');
export const DEFAULT_GENERATOR = BigInt('2');
export const DEFAULT_KEY = bigInteger('5b9e8ef059c6b32ea59fc1d322d37f04aa30bae5aa9003b8321e21ddb04e300', 16);

export function randomBytes(size: number) {
  if (typeof process === 'object' && process.versions && process.versions.node) {
    const crypto = require('crypto');
    return crypto.randomBytes(size);
  } else if (typeof window === 'object' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(size);
    window.crypto.getRandomValues(array);
    return array;
  } else {
    throw new Error('Secure random bytes generation is not supported in this environment.');
  }
}

export function bigInteger(num: string | bigint, from: number = 10): bigint {
  if (typeof num === 'bigint') {
    return num;
  }

  if (from === 10) {
    return BigInt(num);
  } else if (from === 16) {
    return BigInt(`0x${num}`);
  } else {
    let decimalValue = 0n;
    for (let i = 0; i < num.length; i++) {
      const digit = parseInt(num[i], from);
      if (isNaN(digit)) {
        throw new Error('Invalid character for base: ' + from);
      }
      decimalValue = decimalValue * BigInt(from) + BigInt(digit);
    }
    return decimalValue;
  }
}

export function hexPadZero(hex: string): string {
  if (hex.length % 2 === 0) {
    return hex;
  }

  return '0' + hex;
}

export function bt2hex(num: bigint) {
  return hexPadZero(num.toString(16));
}

export function hex2buffer(hexString: string) {
  let bytes;

  if (typeof window === 'undefined') {
    bytes = Buffer.from(hexString, 'hex');
  } else {
    // bytes = new Uint8Array(hexString.length / 2);
    // for (let i = 0; i < bytes.length; i++) {
    //   bytes[i] = parseInt(hexString.substr(i * 2, 2), 16);
    // }
  }

  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

export function str2buffer(str: string) {
  let bytes;

  if (typeof window === 'undefined') {
    bytes = Buffer.from(str, 'utf-8');
  } else {
    const encoder = new TextEncoder();
    bytes = encoder.encode(str);
  }

  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

export function concatArrayBuffers(...buffers: ArrayBufferLike[]) {
  let totalLength = buffers.reduce((acc, value) => acc + value.byteLength, 0);

  let result = new Uint8Array(totalLength);

  let length = 0;
  for (let buffer of buffers) {
    result.set(new Uint8Array(buffer), length);
    length += buffer.byteLength;
  }

  return result.buffer;
}

// export function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
//   if (exp === 0n) {
//     return 1n;
//   }
//
//   if (exp % 2n === 0n){
//     return modPow( base, (exp / 2n), mod) ** 2n % mod;
//   }
//   else {
//     return (base * modPow( base, (exp - 1n), mod)) % mod;
//   }
// }

// function modPow(base, exponent, modulus) {
//   base = BigInt(base);
//   exponent = BigInt(exponent);
//   modulus = BigInt(modulus);
//   if (modulus === BigInt(1)) return BigInt(0);
//   let result = BigInt(1);
//   base = base % modulus;
//   while (exponent > 0) {
//     if (exponent % BigInt(2) === BigInt(1)) {
//       result = (result * base) % modulus;
//     }
//     exponent = exponent / BigInt(2);
//     base = (base * base) % modulus;
//   }
//   return result;
// }
