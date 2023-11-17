/**
 * Return an absolute value of bigint.
 */
function abs(num) {
    if (num < 0n) {
        num *= -1n;
    }
    return num;
}

/**
 * Calculates the extended greatest common divisor (eGCD) of two BigInt numbers.
 *
 * This function computes the eGCD of two BigInt numbers 'a' and 'b', and returns an object
 * containing the GCD ('gcd') and coefficients 'x' and 'y' such that 'ax + by = gcd'.
 *
 * ```ts
 * const result = eGcd(16n, 10n);
 * result.g === 2n;
 * result.x === -3n;
 * result.y === 5n;
 * ```
 */
function eGcd(a, b) {
    if (a === 0n) {
        return {
            g: b,
            x: 0n,
            y: 1n,
        };
    }
    else {
        let { g, x, y } = eGcd(b % a, a);
        return {
            g,
            x: y - (b / a) * x,
            y: x,
        };
    }
}

/**
 * Finds the smallest positive element that is congruent to a in modulo m.
 */
function toZn(a, m) {
    if (m <= 0n) {
        throw new Error('m must be > 0');
    }
    const aZm = a % m;
    return (aZm < 0n) ? aZm + m : aZm;
}
/**
 * An alias of toZn()
 */
function mod(a, m) {
    return toZn(a, m);
}

/**
 * Calculates the modular multiplicative inverse of a BigInt 'a' modulo 'm'.
 *
 * This function computes the value 'x' such that '(a * x) % m === 1' where 'a' and 'm' are BigInt numbers.
 */
function modInv(a, m) {
    const egcd = eGcd(toZn(a, m), m);
    if (egcd.g !== 1n) {
        throw new Error('Modular inverse does not exist');
    }
    return toZn(egcd.x, m);
}

/**
 * Check a bigint is odd.
 */
function isOdd(n) {
    return (n % 2n) === 1n;
}

/**
 * Calculates the modular exponentiation of a BigInt 'base' to the power of a BigInt 'exponent' modulo 'm'.
 *
 * This function computes the result of `base^exp % m` where 'base', 'exponent', and 'm' are BigInt numbers.
 */
function modPow(base, exp, m) {
    if (m === 0n) {
        throw new Error('Cannot modPow with modulus 0');
    }
    if (exp === 0n) {
        return 1n;
    }
    base = toZn(base, m);
    if (exp < 0n) {
        return modInv(modPow(base, abs(exp), m), m);
    }
    let r = 1n;
    while (exp > 0n) {
        if (base === 0n) {
            return 0n;
        }
        if (isOdd(exp)) {
            r = r * base % m;
        }
        exp = exp / 2n;
        base = base * base % m;
    }
    return r;
}

/**
 * Generates cryptographically strong pseudorandom data, it will return
 * an Uint8Array object. This function use `crypto.randomBytes()` in node.js
 * and `window.crypto.getRandomValues()` in Web browser.
 *
 * You can convert it to hex by `uint8Array2Hex()` or use some base64
 * library to convert it to string.
 */
function randomBytes(bufferSize) {
    // This checks if the code is running in a Node.js environment
    if (typeof process === 'object' && typeof require === 'function') {
        const { randomBytes: rb } = require('crypto');
        return new Uint8Array(rb(bufferSize));
    }
    else {
        // For web environments, use the Web Crypto API
        const buffer = new Uint8Array(bufferSize);
        window.crypto.getRandomValues(buffer);
        return buffer;
    }
}

/**
 * Pad `0` to start if hex string length is odd.
 */
function hexPadZero(hex) {
    if (hex.length % 2 !== 0) {
        hex = '0' + hex;
    }
    return hex;
}

/**
 * Bigint to hex conversion.
 *
 * The second argument `padZero = true` will pad a `0` on start if return length is odd.
 */
function bigintToHex$1(num, padZero = false) {
    let hexString = num.toString(16);
    if (!padZero) {
        return hexString;
    }
    return hexPadZero(hexString);
}

/**
 * Bigint to hex conversion and pad a `0` on start if return length is odd.
 */
function bigintToHexPadZero(num) {
    return bigintToHex$1(num, true);
}

/**
 * Convert hex string to Uint8Array.
 */
function hexToUint8(hex) {
    // Calculate the number of bytes needed
    const numBytes = hex.length / 2;
    const byteArray = new Uint8Array(numBytes);
    // Parse each byte in the hex string and add it to the Uint8Array
    for (let i = 0, j = 0; i < numBytes; i++, j += 2) {
        byteArray[i] = parseInt(hex.slice(j, j + 2), 16);
    }
    return byteArray;
}

/**
 * Bigint to Uint8Array conversion.
 *
 * By default, this function unable to handle negative bigint, and will throw an Error.
 * If you want to convert a negative bigint to Uint8Array, set second argument as TRUE,
 * that this functions will try making 2's complement on the bigint to make it
 * positive.
 *
 * NOTE: If you convert a negative bigint to Uint8Array, you must use
 *
 * - `uint8ToBigint(num, true)`
 * - `uint8ToBigintWithNegative(num)`
 *
 * to inverse the Uint8Array so you can get negative bigint back.
 */
function bigintToUint8(num, handleNegative = false) {
    if (num < 0n) {
        if (handleNegative) {
            // Do a Bit complement to convert negative bigint to positive bigint
            const bits = (BigInt(num.toString(2).length) / 8n + 1n) * 8n;
            const prefix1 = 1n << bits;
            num += prefix1;
        }
        else {
            throw new Error('BigInt should larger than 0 to convert to Uint8Array');
        }
    }
    return hexToUint8(bigintToHexPadZero(num));
}

/**
 * Convert hex to bigint and add `-` sign if origin bigint is negative.
 */
function hexToBigint$1(hex) {
    const isNegative = hex.startsWith('-');
    if (isNegative) {
        hex = hex.substring(1);
    }
    let result = BigInt('0x' + hex);
    return isNegative ? -result : result;
}

/**
 * Convert any base of numbers to bigint.
 *
 * ```
 * toBigInt(123456789)
 * toBigInt('75bcd15', 16)
 * toBigInt('111010110111100110100010101', 2)
 * ```
 *
 * This function will auto add negative to hex string if input value less than 0.
 */
function toBigint(num, from = 10) {
    if (typeof num === 'bigint') {
        return num;
    }
    if (typeof num === 'number') {
        return BigInt(num);
    }
    if (from === 10) {
        return BigInt(num);
    }
    else if (from === 16) {
        return hexToBigint$1(num);
    }
    else {
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

/**
 * Convert Uint8Array back to bigint.
 *
 * If an Uint8Array has 2's complement (Mostly converted from a negative number),
 * set second argument as TRUE to inverse it.
 */
function uint8ToBigint(bytes, handleNegative = false) {
    let result = 0n;
    // Check if the most significant bit of the first byte is set (indicating a negative number)
    const isNegative = handleNegative && (bytes[0] & 0x80) !== 0;
    if (isNegative) {
        // For negative numbers, perform two's complement inversion
        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = ~bytes[i] & 0xff;
        }
        // Add one to complete the two's complement
        let carry = 1;
        for (let i = bytes.length - 1; i >= 0 && carry > 0; i--) {
            const value = bytes[i] + carry;
            bytes[i] = value & 0xff;
            carry = value >> 8;
        }
    }
    // Iterate over the Uint8Array from the beginning and shift left (<<) by 8 bits for each byte
    for (let i = 0; i < bytes.length; i++) {
        result = (result << 8n) + BigInt(bytes[i]);
    }
    return isNegative ? -result : result;
}

/**
 * Convert Uint8Array to hex string.
 *
 * If an Uint8Array has 2's complement (Mostly converted from a negative number),
 * set second argument as TRUE to inverse it.
 */
function uint8ToHex(bytes, handleNegative = false) {
    return bigintToHex$1(uint8ToBigint(bytes, handleNegative));
}

const DEFAULT_PRIME = 21766174458617435773191008891802753781907668374255538511144643224689886235383840957210909013086056401571399717235807266581649606472148410291413364152197364477180887395655483738115072677402235101762521901569820740293149529620419333266262073471054548368736039519702486226506248861060256971802984953561121442680157668000761429988222457090413873973970171927093992114751765168063614761119615476233422096442783117971236371647333871414335895773474667308967050807005509320424799678417036867928316761272274230314067548291133582479583061439577559347101961771406173684378522703483495337037655006751328447510550299250924469288819n;
const DEFAULT_GENERATOR = 2n;
const DEFAULT_KEY = toBigint('5b9e8ef059c6b32ea59fc1d322d37f04aa30bae5aa9003b8321e21ddb04e300', 16);
function hexToBigint(hex) {
    return hexToBigint$1(hex);
}
function bigintToHex(num, padZero = false) {
    return bigintToHex$1(num, padZero);
}
function timingSafeEquals(a, b) {
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
function isNode() {
    return typeof window === 'undefined';
}
function str2buffer(str) {
    let bytes;
    if (typeof window === 'undefined') {
        bytes = Buffer.from(str, 'utf-8');
    }
    else {
        const encoder = new TextEncoder();
        bytes = encoder.encode(str);
    }
    return bytes;
}
function concatArrayBuffers(...buffers) {
    let totalLength = buffers.reduce((acc, value) => acc + value.byteLength, 0);
    let result = new Uint8Array(totalLength);
    let length = 0;
    for (let buffer of buffers) {
        result.set(new Uint8Array(buffer), length);
        length += buffer.byteLength;
    }
    return result;
}

class AbstractSRPHandler {
    constructor(prime, generator, key) {
        this.prime = prime;
        this.generator = generator;
        this.key = key;
        this.length = 256 / 8;
        // ...
    }
    setHasher(handler) {
        this.hasher = handler;
        return this;
    }
    async generateRandomSecret() {
        return uint8ToBigint(randomBytes(this.getLength()));
    }
    getLength() {
        return this.length;
    }
    setLength(length) {
        this.length = length;
        return this;
    }
    setSize(size) {
        return this.setLength(Math.floor(size / 8));
    }
    async generateCommonSecret(A, B) {
        this.checkNotEmpty(A, 'A');
        this.checkNotEmpty(B, 'B');
        return this.hash(this.pad(A), this.pad(B));
    }
    async generateClientSessionProof(identity, salt, A, B, K) {
        return await this.hash(await this.hash(this.getPrime()) ^ await this.hash(this.getGenerator()), await this.hash(identity), salt, // s
        A, B, K);
    }
    async generateServerSessionProof(A, M, K) {
        return this.hash(A, M, K);
    }
    getPrime() {
        return this.prime;
    }
    getGenerator() {
        return this.generator;
    }
    getKey() {
        return this.key;
    }
    async hash(...args) {
        const binaryArgs = args.map(arg => {
            if (typeof arg === 'bigint') {
                return bigintToUint8(arg);
            }
            return str2buffer(arg);
        });
        const hashString = await this.hashToString(concatArrayBuffers(...binaryArgs));
        return toBigint(hashString, 16);
    }
    async hashToString(buffer) {
        let func = this.hasher;
        if (typeof func === 'string') {
            func = this.getHasherByName(func);
        }
        let hash = await func(buffer, this.getLength());
        if (hash instanceof Uint8Array) {
            hash = uint8ToHex(hash);
        }
        return hash;
    }
    getHasherByName(hasher) {
        hasher = hasher.toLowerCase();
        return async (buffer) => {
            if (isNode()) {
                const { createHash } = require('crypto');
                return new Uint8Array(Buffer.from(createHash(hasher).update(Buffer.from(buffer)).digest('hex'), 'hex'));
            }
            switch (hasher) {
                case 'sha1':
                    return new Uint8Array(await crypto.subtle.digest("SHA-1", buffer));
                case 'sha256':
                    return new Uint8Array(await crypto.subtle.digest("SHA-256", buffer));
                case 'sha384':
                    return new Uint8Array(await crypto.subtle.digest("SHA-384", buffer));
                case 'sha512':
                    return new Uint8Array(await crypto.subtle.digest("SHA-512", buffer));
            }
            throw new Error('Available hasher not found.');
        };
    }
    checkNotEmpty(num, name) {
        if (!num) {
            throw new Error(`Value: \`${name}\` should not be empty.`);
        }
        if (typeof num === 'bigint' && num === 0n) {
            throw new Error(`Value: \`${name}\` should not be zero.`);
        }
    }
    pad(val) {
        const primeLength = this.intToBytes(this.getPrime()).length;
        const valStr = val.toString(16);
        const paddedStr = valStr.padStart(primeLength, '0');
        return BigInt('0x' + paddedStr);
    }
    intToBytes(val) {
        const decoder = new TextDecoder();
        return decoder.decode(bigintToUint8(val));
    }
    timingSafeEquals(a, b) {
        return timingSafeEquals(a, b);
    }
}

class SRPClient extends AbstractSRPHandler {
    static create(prime = undefined, generator = undefined, key = undefined) {
        prime ?? (prime = DEFAULT_PRIME);
        generator ?? (generator = DEFAULT_GENERATOR);
        key ?? (key = DEFAULT_KEY);
        return new this(toBigint(prime, 16), toBigint(generator, 16), toBigint(key, 16));
    }
    async register(identity, password) {
        const salt = await this.generateSalt();
        const x = await this.generatePasswordHash(salt, identity, password);
        const verifier = await this.generateVerifier(x);
        return { salt, verifier };
    }
    async step1(identity, password, salt) {
        // Step 1
        const a = await this.generateRandomSecret();
        const A = await this.generatePublic(a);
        const x = await this.generatePasswordHash(salt, identity, password);
        return {
            secret: a,
            public: A,
            hash: x,
        };
    }
    async step2(identity, salt, A, a, B, x) {
        if (B % this.getPrime() === 0n) {
            throw new Error('Server may return a invalid public ephemeral.');
        }
        // Step 2
        const u = await this.generateCommonSecret(A, B);
        const S = await this.generatePreMasterSecret(a, B, x, u);
        const K = await this.hash(S);
        const M1 = await this.generateClientSessionProof(identity, salt, A, B, K);
        return {
            key: K,
            proof: M1
        };
    }
    async step3(A, K, M1, serverM2) {
        if (!await this.verifyServerSession(A, K, M1, serverM2)) {
            throw new Error('Invalid server session proof.');
        }
    }
    async verifyServerSession(A, K, M1, serverM2) {
        const M2 = await this.generateServerSessionProof(A, M1, K);
        return this.timingSafeEquals(M2.toString(), serverM2.toString());
    }
    async generateSalt() {
        return uint8ToBigint(randomBytes(16));
    }
    async generatePasswordHash(salt, identity, password) {
        return await this.hash(salt, await this.hash(identity + ':' + password));
    }
    async generatePreMasterSecret(a, B, x, u) {
        const N = this.getPrime();
        const g = this.getGenerator();
        const k = this.getKey();
        let B2 = B - (k * (modPow(g, x, N)));
        if (B2 < 0n) {
            B2 = N - abs(B2);
            B2 = mod(B2, N);
        }
        return modPow(B2, (a + (u * x)), N);
    }
    async generateVerifier(x) {
        return modPow(this.getGenerator(), x, this.getPrime());
    }
    async generatePublic(secret) {
        return modPow(this.getGenerator(), secret, this.getPrime());
    }
}

export { DEFAULT_GENERATOR, DEFAULT_KEY, DEFAULT_PRIME, bigintToHex, SRPClient as default, hexToBigint, timingSafeEquals };
//# sourceMappingURL=client.es.js.map
