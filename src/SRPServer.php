<?php

declare(strict_types=1);

namespace Windwalker\SRP;

use Brick\Math\BigInteger;
use Brick\Math\Exception\DivisionByZeroException;
use Brick\Math\Exception\MathException;
use Brick\Math\Exception\NegativeNumberException;
use Brick\Math\Exception\NumberFormatException;
use Windwalker\SRP\Exception\InvalidSessionProofException;
use Windwalker\SRP\Step\EphemeralResult;
use Windwalker\SRP\Step\ProofResult;

class SRPServer extends AbstractSRPHandler
{
    /**
     * @throws DivisionByZeroException
     * @throws NegativeNumberException
     * @throws MathException
     * @throws NumberFormatException
     */
    public function step1(string $identity, BigInteger $salt, BigInteger $verifier): EphemeralResult
    {
        static::checkNotEmpty($identity, 'identity');
        static::checkNotEmpty($salt, 'salt');
        static::checkNotEmpty($verifier, 'verifier');

        // random()
        $b = $this->generateRandomSecret();

        // ((k*v + g^b) % N)
        $B = $this->generatePublic($b, $verifier);

        return new EphemeralResult($b, $B);
    }

    /**
     * @throws DivisionByZeroException
     * @throws NegativeNumberException
     * @throws MathException
     */
    public function step2(
        string $identity,
        BigInteger $salt,
        BigInteger $verifier,
        BigInteger $A,
        BigInteger $B,
        BigInteger $b,
        BigInteger $clientM1
    ): ProofResult {
        static::checkNotEmpty($A, 'A');
        static::checkNotEmpty($clientM1, 'M1');

        // H(PAD(A) | PAD(B))
        $u = $this->generateCommonSecret($A, $B);

        // ((A * v^u) ^ b % N)
        $S = $this->generatePreMasterSecret($A, $b, $verifier, $u);

        // K = H(S)
        $K = $this->hash($S);

        // M = H(H(N) xor H(g), H(I), s, A, B, K)
        $M1 = $this->generateClientSessionProof($identity, $salt, $A, $B, $K);

        // Check M1
        // Use hash_equals() to mitigate timing attack
        if (!hash_equals((string) $M1, (string) $clientM1)) {
            throw new InvalidSessionProofException('Invalid client session proof', 401);
        }

        // H(A | M | K)
        $proof = $this->generateServerSessionProof($A, $M1, $K);

        return new ProofResult($K, $proof);
    }

    /**
     * Generate public [B]
     *
     * ((k*v + g^b) % N)
     *
     * @param  BigInteger  $secret  [b]
     *
     * @return  BigInteger [B]
     *
     * @throws \Brick\Math\Exception\DivisionByZeroException
     * @throws \Brick\Math\Exception\MathException
     * @throws \Brick\Math\Exception\NegativeNumberException
     */
    public function generatePublic(BigInteger $secret, BigInteger $verifier): BigInteger
    {
        return $this->getKey()
            ->multipliedBy($verifier)
            ->plus($this->getGenerator()->modPow($secret, $this->getPrime()))
            ->mod($this->getPrime());
    }

    /**
     * PreMaster Secret [S]
     *
     * ((A * v^u) ^ b % N)
     *
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
