<?php

declare(strict_types=1);

namespace Windwalker\SRP;

use Brick\Math\BigInteger;
use Brick\Math\Exception\DivisionByZeroException;
use Brick\Math\Exception\MathException;
use Brick\Math\Exception\NegativeNumberException;
use Windwalker\SRP\Exception\InvalidSessionProofException;
use Windwalker\SRP\Step\EphemeralResult;
use Windwalker\SRP\Step\PasswordFile;
use Windwalker\SRP\Step\ProofResult;

class SRPClient extends AbstractSRPHandler
{
    public function register(string $identity, string $password): PasswordFile
    {
        $salt = $this->generateSalt();

        // (SHA(s | SHA(I | `:` | P)))
        $x = $this->generatePasswordHash($salt, $identity, $password);

        // (g^x % N)
        $verifier = $this->generateVerifier($x);

        return new PasswordFile($salt, $verifier);
    }

    public function step1(
        string $identity,
        string $password,
        BigInteger $salt,
    ): ProofResult {
        $a = $this->generateRandomSecret();
        $A = $this->generatePublic($a);

        // (SHA(s | SHA(I | `:` | P)))
        $x = $this->generatePasswordHash($salt, $identity, $password);

        return new EphemeralResult($K, $M1, $x);
    }

    public function deriveSession(
        string $identity,
        BigInteger $salt,
        BigInteger $A,
        BigInteger $B,
        BigInteger $x,
    ): ProofResult {
        if ($B->mod($this->getPrime())->isZero()) {
            throw new \RuntimeException('Server may return a invalid public ephemeral.');
        }

        $u = $this->generateCommonSecret($A, $B);

        $S = $this->generatePreMasterSecret($a, $B, $x, $u);

        $K = $this->hash($S);

        $M1 = $this->generateClientSessionProof(
            $identity,
            $salt,
            $A,
            $B,
            $K
        );

        return new ProofResult($K, $M1);
    }

    public function step3(BigInteger $A, BigInteger $K, BigInteger $M1, BigInteger $serverM2): void
    {
        if (!$this->verifyServerSession($A, $K, $M1, $serverM2)) {
            throw new InvalidSessionProofException('Invalid server session proof');
        }
    }

    public function verifyServerSession(BigInteger $A, BigInteger $K, BigInteger $M1, BigInteger $serverM2): bool
    {
        // H(A | M | K)
        $M2 = $this->generateServerSessionProof($A, $M1, $K);

        // Check M2
        // Use hash_equals() to mitigate timing attack
        return hash_equals((string) $M2, (string) $serverM2);
    }

    public function generateSalt(): BigInteger
    {
        return BigInteger::fromBase(
            bin2hex(random_bytes(16)),
            16
        );
    }

    /**
     * [X]
     *
     * (SHA(s | SHA(I | `:` | P)))
     *
     * @param  BigInteger  $salt
     * @param  string      $identity
     * @param  string      $password
     *
     * @return  BigInteger
     */
    public function generatePasswordHash(BigInteger $salt, string $identity, string $password): BigInteger
    {
        return $this->hash(
            $salt,
            $this->hash($identity . ':' . $password)
        );
    }

    /**
     * Client [S]
     *
     * ((B - (k * g^x)) ^ (a + (u * x)) % N)
     *
     * @throws DivisionByZeroException
     * @throws NegativeNumberException
     * @throws MathException
     */
    public function generatePreMasterSecret(
        BigInteger $a,
        BigInteger $B,
        BigInteger $x,
        BigInteger $u,
    ): BigInteger {
        $N = $this->getPrime();
        $g = $this->getGenerator();
        $k = $this->getKey();

        $B2 = $B->minus($k->multipliedBy($g->modPow($x, $N)));

        // Handle negative
        if ($B2->isNegative()) {
            $B2 = $N->minus($B2->abs());
            $B2 = $B2->mod($N);
        }

        return $B2->modPow($a->plus($u->multipliedBy($x)), $N);
    }

    /**
     * [v]
     *
     * (g^x % N)
     *
     * @param  BigInteger  $x
     *
     * @return  BigInteger
     *
     * @throws DivisionByZeroException
     * @throws NegativeNumberException
     */
    public function generateVerifier(BigInteger $x): BigInteger
    {
        return $this->getGenerator()->modPow($x, $this->getPrime());
    }

    /**
     * Generate public [A]
     *
     * (g^a % N)
     *
     * @param  BigInteger  $secret  [a]
     *
     * @return  BigInteger [A]
     *
     * @throws \Brick\Math\Exception\DivisionByZeroException
     * @throws \Brick\Math\Exception\MathException
     * @throws \Brick\Math\Exception\NegativeNumberException
     */
    public function generatePublic(BigInteger $secret): BigInteger
    {
        return $this->getGenerator()->modPow($secret, $this->getPrime());
    }
}
