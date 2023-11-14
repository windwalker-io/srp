/**
 * This mod function make sure result is positive.
 */
export function mod(a: bigint, b: bigint) {
  return ((a % b) + b) % b;
}

/**
 * To implement a mod-pow logic to handle cases that may create
 * a huge number which over JS memory.
 */
export function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  if (mod === 0n) {
    throw new Error('Cannot modPow with modulus 0');
  }

  if (exp === 0n) {
    return 1n;
  }

  let r = 1n;
  base = base % mod;
  
  if (exp < 0n) {
    exp = abs(exp);
    base = modInv(mod);
  }

  while (exp > 0n) {
    if (base === 0n) {
      return 0n;
    }

    if (isOdd(exp)) {
      r = r * base % mod;
    }

    exp = exp / 2n;

    base = base * base % mod;
  }

  return r;
}

/**
 * Simple odd detector.
 */
function isOdd(n: bigint) {
  return (n % 2n) === 1n;
}

/**
 * Is abs one.
 */
function isUnit(n: bigint) {
  return abs(n) === 1n;
}

/**
 * Calc the modular inverse.
 */
function modInv(n: bigint) {
  let r: bigint = n;
  let t: bigint = 0n;
  let newT: bigint = 1n;
  let newR: bigint = abs(r);
  let q: bigint;
  let lastT: bigint;
  let lastR: bigint;

  while (newR !== 0n) {
    q = r / newR;
    lastT = t;
    lastR = r;
    t = newT;
    r = newR;
    newT = lastT - (q * newT);
    newR = lastR - (q * newR);
  }

  if (!isUnit(r)) {
    throw new Error(`${r} and ${n} are not co-prime`);
  }

  if (t < 0) {
    t += n;
  }

  return r < 0n ? -t : t;
}

export function abs(num: bigint) {
  if (num < 0n) {
    num *= -1n;
  }

  return num;
}

