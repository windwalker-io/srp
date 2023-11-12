<?php

declare(strict_types=1);

namespace Windwalker\SRP;

use Brick\Math\BigInteger;
use Brick\Math\Exception\DivisionByZeroException;
use Brick\Math\Exception\MathException;
use Brick\Math\Exception\NegativeNumberException;
use Brick\Math\Exception\NumberFormatException;

class SRPServer extends AbstractSRPHandler
{
    protected string $identity;

    protected BigInteger $verifier;

    protected BigInteger $salt;

    /**
     * Server private key
     *
     * @var BigInteger
     */
    protected BigInteger $b;

    /**
     * Server public key
     *
     * @var BigInteger
     */
    protected BigInteger $B;

    /**
     * Constant computed by the server.
     *
     * @var BigInteger
     */
    protected BigInteger $k;

    /**
     * Shared secret key
     *
     * @var BigInteger
     */
    protected BigInteger $K;

    /**
     * Shared secret hashed form
     *
     * @var string
     */
    protected string $S;

    protected int $step = 1;

    /**
     * @throws DivisionByZeroException
     * @throws NegativeNumberException
     * @throws MathException
     * @throws NumberFormatException
     */
    public function step1(string $identity, BigInteger $salt, BigInteger $verifier): BigInteger
    {
        static::checkNotEmpty($identity, 'identity');
        static::checkNotEmpty($salt, 'salt');
        static::checkNotEmpty($verifier, 'verifier');

        $this->identity = $identity;
        $this->verifier = $verifier;
        $this->salt = $salt;

        $b = $this->generateRandomPrivate($this->getLength());
        $B = $this->generatePublic($b, $verifier);

        $this->step = 1;

        return $B;
    }

    public function step2(
        string $identity,
        BigInteger $salt,
        BigInteger $verifier,
        BigInteger $A,
        BigInteger $b,
        BigInteger $M1
    ) {
        static::checkNotEmpty($A, 'A');
        static::checkNotEmpty($M1, 'M1');

        $B = $this->generatePublic($b, $verifier);

        $u = $this->generateCommonSecret($A, $B);

        $S = $this->generatePreMasterSecret($A, $b, $verifier, $u);

        // K = H(S)
        $K = $this->hash($S);

        // M = H(H(N) xor H(g), H(I), s, A, B, K)
        $M2 = $this->generateClientSessionProof($identity, $salt, $A, $B, $K);

        if (!hash_equals((string) $M2, (string) $M1)) {
            throw new \InvalidArgumentException('Invalid client session proof', 401);
        }

        $proof = $this->hash($A, $M2, $K);
        $key = $K;

        return compact('key', 'proof');
    }

    /**
     * Generate public [B]
     *
     * ((k*v + g^b) % N)
     *
     * @param  BigInteger  $private  (b)
     *
     * @return  BigInteger [B]
     *
     * @throws \Brick\Math\Exception\DivisionByZeroException
     * @throws \Brick\Math\Exception\MathException
     * @throws \Brick\Math\Exception\NegativeNumberException
     */
    public function generatePublic(BigInteger $private, BigInteger $verifier): BigInteger
    {
        return $this->getKey()
            ->multipliedBy($verifier)
            ->plus($this->getGenerator()->modPow($private, $this->getPrime()))
            ->mod($this->getPrime());
    }

    /**
     * @throws DivisionByZeroException
     * @throws NegativeNumberException
     * @throws MathException
     */
    public function generatePreMasterSecret(
        BigInteger $A,
        BigInteger $b,
        BigInteger $verifier,
        BigInteger $u
    ): BigInteger {
        return $verifier->modPow($u, $this->getPrime())
            ->multipliedBy($A)
            ->modPow($b, $this->getPrime());
    }
}
