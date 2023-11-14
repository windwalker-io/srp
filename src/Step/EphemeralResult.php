<?php

declare(strict_types=1);

namespace Windwalker\SRP\Step;

use Brick\Math\BigInteger;

class EphemeralResult
{
    public function __construct(
        public readonly BigInteger $secret,
        public readonly BigInteger $public
    ) {
    }
}
