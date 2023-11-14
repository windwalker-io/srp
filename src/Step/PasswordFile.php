<?php

declare(strict_types=1);

namespace Windwalker\SRP\Step;

use Brick\Math\BigInteger;

class PasswordFile
{
    public function __construct(
        public readonly BigInteger $salt,
        public readonly BigInteger $verifier
    ) {
    }
}
