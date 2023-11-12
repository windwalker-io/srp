<?php

declare(strict_types=1);

namespace Windwalker\SRP;

use Brick\Math\BigInteger;

class SRPUtils
{
    public static function hexPadZero(string $hex): string
    {
        if (strlen($hex) % 2 === 0) {
            return $hex;
        }

        return '0' . $hex;
    }

    public static function bt2hex(BigInteger $bt): string
    {
        return static::hexPadZero($bt->toBase(16));
    }
}
