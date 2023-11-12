<?php

declare(strict_types=1);

namespace Windwalker\SRP;

use Brick\Math\BigInteger;

class SRPClient extends AbstractSRPHandler
{
    public function generateX(BigInteger $salt, string $identity, string $password): BigInteger
    {
        return $this->hash(
            $salt,
            $this->hash($identity . ':' . $password)
        );
    }

    public function generateVerifier()
    {
        // $this->getGenerator()
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
