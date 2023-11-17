# PHP SRP (Secure Remote Password) [PHP/JS]

This is a modern PHP/JS package which provides an implementation
of SRP-6a ([RFC0504](https://datatracker.ietf.org/doc/html/rfc5054)).
The PHP / JS side both have server and client part to help developer use on any cases.

This package passed the srptools [Test Vectors](https://github.com/secure-remote-password/test-vectors/)
, it means that this package is fully implement the RFC5054 spec, and you can
use this package to work with any other packages which is also fully adheres the RFC spec.
The main difference is that this package will pad value to fit the length of `g` (prime) value before hash,
however, most of the SRP packages will probably not pad them before hashing.

We also provide a way to disable the padding behavior if you want to use this package with another package
that does not pad values before hashing.

## Installation

PHP

```shell
composer require windwalker/srp
```

JS

```shell
npm i @windwalker-io/srp --save

# OR

yarn add @windwalker-io/srp
```

See the JS package [documentation here](./assets/README.md).

## Getting Started

You must prepare a secure big prime, generator and a key, the prime and generator is base 10,
and the key is hex (base16) format.

```php
use Windwalker\SRP\SRPServer;
use Windwalker\SRP\SRPClient;

$server = new SRPServer(
    SRPServer::DEFAULT_PRIME, // 217661744586174357731910088918027537819...
    SRPServer::DEFAULT_GENERATOR, // 02
    SRPServer::DEFAULT_KEY, // 5b9e8ef059c6b32ea59fc1d322d37f04aa30bae5aa9003b8321e21ddb04e300
);
```

Can be BigInteger format, we use [brick/math](https://github.com/brick/math) as the BigInteger library.

```php
use Brick\Math\BigInteger;
use Windwalker\SRP\SRPServer;
use Windwalker\SRP\SRPClient;

$server = new SRPServer(
    BigInteger::of(SRPServer::DEFAULT_PRIME),
    BigInteger::of(SRPServer::DEFAULT_GENERATOR),
    BigInteger::fromBase(SRPServer::DEFAULT_KEY, 16),
);
```

Use `createFromConfig()` if you set the config in an array.

```php
use Windwalker\SRP\SRPServer;

$config = [
    'prime' => SRPServer::DEFAULT_PRIME, // 217661744586174357731910088918027537819...
    'generator' => SRPServer::DEFAULT_GENERATOR, // 02
    'key' => SRPServer::DEFAULT_KEY, // 5b9e8ef059c6b32ea59fc1d322d37f04aa30bae5aa9003b8321e21ddb04e300
];
```

Use `create()` to ignore all parameters, this package will use the prepared default secure config.

```php
use Windwalker\SRP\SRPServer;
use Windwalker\SRP\SRPClient;

$server = SRPServer::create();
$client = SRPClient::create();
```

There has some more configure options:

```php
use Windwalker\SRP\SRPServer;

// Set the secret size
$server->setSize(SRPServer::SECRET_512BIT); // or int(64)
// Same as
$server->setLength(64);


// Set Hash algo
$server->setHaser('sha1');
$server->setHaser('sha256');
$server->setHaser('sha384');
$server->setHaser('sha512');

// Blake2b will use sodium ext to hash it.
$server->setHaser('blake2b-256');
$server->setHaser('blake2b-224');
$server->setHaser('blake2b-384');
$server->setHaser('blake2b-512');

// Set custom hash logic
$server->setHaser(fn(string $str) => ...);


// Disable padding
$server->enablePad(false);
```

### Sample Code

Here we use both PHP server and client to run a sample SRP flow. You can replace the client part as JS.

The full description of this flow is under the next chapter.

```php
use Windwalker\SRP\SRPServer;
use Windwalker\SRP\SRPClient;

$server = SRPServer::create();
$client = SRPClient::create();

// Register page: User input identify and password.
$identity = '...';
$password = '...';

// Register: generate new salt & verifier
$pf = $client->register($identity, $password);
$salt = $pf->salt;
$verifier = $pf->verifier;

// Send to Server store

// Login start
// AJAX:hello?{identity} - Server step (1)
// salt & verifier has already stored on user data, server can get it from DB
// b & B must remember on session, we will use it at following steps.
$r = $server->step1($identity, $salt, $verifier);
$b = $r->secret;
$B = $r->public;

// Server hello: returns B & salt to client

// Client step (1) & (2)
$pr = $client->step1($identity, $password, $salt);
$a = $pr->secret;
$A = $pr->public;
$x = $pr->hash;

$pr = $client->step2($identity, $salt, $A, $a, $B, $x);
$K = $pr->key;
$M1 = $pr->proof;

// AJAX:authenticate?{identity,A,M1} - Server step (2)
// Send identity & A & M1 to server and compare it.
// The salt & verifier stored on user data, get it from DB.
// The b, B stored in session state, get and clear them.
$pr = $server->step2($identity, $salt, $verifier, $A, $B, $b, $M1);
$M2 = $pr->proof;

// Server returns M2 to Client
// Client step (3) (optional)
$client->step3($A, $K, $M1, $M2);

// If all passed, should not throw any exceptions.
```

## The SRP Flow

The definitions and processes of SRP-6a are dispersed in [RFC 2945](https://datatracker.ietf.org/doc/html/rfc2945) and [RFC 5054](https://datatracker.ietf.org/doc/html/rfc5054); this is an attempt to integrate them 
for an overview. Please follow strictly to the RFC-specified procedures without custom modification, and do not transmit any variables
unnecessarily to avoid security breaches.

## Definition

| Variable        | Name                       | Send   | Calc                                           | Description                                          |
|-----------------|----------------------------|--------|------------------------------------------------|------------------------------------------------------|
| `I`, `identity` | The main identity.         | C -> S |                                                | The username or email.                               |
| `N`             | The prime number           | X      |                                                | A large safe prime, All arithmetic is done modulo N. |
| `g`             | Generator                  | X      |                                                | A generator modulo N                                 |
| `k`             | Key                        | X      | `SHA1(N \| PAD(g))`                            | Multiplier parameter                                 |
| `s`             | Salt                       | C <- S | `random()`                                     | The user salt.                                       |
| `v`             | Verifier                   | X      | `g^x % N`                                      | Password verifier                                    |
| `x`             | Password Hash              | X      | `SHA1(s \| SHA1(I \| ":" \| P))`               | The hash of salt + identity + password.              |
| `a`, `b`        | Client & server secret key | X      | `random()`                                     |                                                      |
| `A`             | Client public key          | C -> S | `g^a % N`                                      |                                                      |
| `B`             | Server public key          | C <- S | `k*v + g^b % N`                                |                                                      |
| `u`             | Scrambling parameter       | X      | `H(PAD(A) \| PAD(B))`                          | Prevents attacker who learns a user's verifier       |
| `S` (client)    | Pre master secret          | X      | `(B - (k * g^x)) ^ (a + (u * x)) % N`          | The secure common session key.                       |
| `S` (server)    | Pre master secret          | X      | `(A * v^u) ^ b % N`                            | The secure common session key.                       |
| `K`             | Session hash               | X      | `H(S)`                                         | The session key hash for used to generate M.         |
| `M1`            | Evidence message 1         | C -> S | `H(H(N) XOR H(g) \| H(U) \| s \| A \| B \| K)` | To verify both side generated same session key.      |
| `M2`            | Evidence message 2         | C <- S | `H(A \| M \| K)`                               | To verify both side generated same session key.      |

## Registration

![Registration](https://github.com/windwalker-io/srp/assets/1639206/9cfe047e-6baa-4208-bfde-59cbe501303a)

## Login

![Login](https://github.com/windwalker-io/srp/assets/1639206/a01b4d82-2c28-4d95-8615-dca38408c2d5)

