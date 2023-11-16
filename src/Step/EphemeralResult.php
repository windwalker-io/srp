<?php

declare(strict_types=1);

namespace Windwalker\SRP\Step;

use Brick\Math\BigInteger;

class EphemeralResult
{
    public function __construct(
        public readonly BigInteger $secret,
        public readonly BigInteger $public,
        public readonly ?BigInteger $hash = null,
    ) {
    }

    public function raw(): array
    {
        $secret = $this->secret->toBase(16);
        $public = $this->public->toBase(16);

        return compact('secret', 'public');
    }

    public function json(): string
    {
        return json_encode($this->raw());
    }

    public static function fromJson(string $json): static
    {
        $data = json_decode($json, true);

        return new static(
            BigInteger::fromBase($data['secret'], 16),
            BigInteger::fromBase($data['public'], 16)
        );
    }
}
