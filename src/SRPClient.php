<?php

declare(strict_types=1);

namespace Windwalker\SRP;

use Brick\Math\BigInteger;
use Brick\Math\Exception\DivisionByZeroException;
use Brick\Math\Exception\MathException;
use Brick\Math\Exception\NegativeNumberException;

class SRPClient extends AbstractSRPHandler
{
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

        if ($B2->isLessThan(0)) {
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
     * @param  BigInteger  $private  (a)
     *
     * @return  BigInteger [A]
     *
     * @throws \Brick\Math\Exception\DivisionByZeroException
     * @throws \Brick\Math\Exception\MathException
     * @throws \Brick\Math\Exception\NegativeNumberException
     */
    public function generatePublic(BigInteger $private): BigInteger
    {
        return $this->getGenerator()->modPow($private, $this->getPrime());
    }
}
