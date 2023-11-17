<?php

declare(strict_types=1);

namespace Windwalker\SRP\Step;

use Brick\Math\BigInteger;

class ProofResult
{
    public function __construct(
        public readonly BigInteger $key,
        public readonly BigInteger $proof,
        public readonly BigInteger $preMasterSecret,
    ) {
    }
}
