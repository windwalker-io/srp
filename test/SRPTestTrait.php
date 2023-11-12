<?php

declare(strict_types=1);

namespace Windwalker\SRP\Test;

use Brick\Math\BigInteger;
use Windwalker\SRP\SRPUtils;

trait SRPTestTrait
{
    public static function assertHexEquals(string $exp, string|BigInteger $actual, string $msg = ''): void
    {
        if ($actual instanceof BigInteger) {
            $actual = $actual->toBase(16);
        }

        self::assertEquals(ltrim($exp, '0'), $actual, $msg);
    }

    public static function vectorsProvider(): array
    {
        $vectors = json_decode(
            file_get_contents(__DIR__ . '/data/test-vectors.json'),
            true,
            512,
            JSON_THROW_ON_ERROR
        );

        $testVectors = $vectors['testVectors'];
        $items = [];

        $ignoreAlgos = [
            'blake2s-256'
        ];

        $allowSizes = [
            1024
        ];

        foreach ($testVectors as $testVector) {
            if (in_array($testVector['H'], $ignoreAlgos, true)) {
                continue;
            }

            // if (!in_array($testVector['size'], $allowSizes, true)) {
            //     continue;
            // }

            $items[$testVector['H'] . ':' . $testVector['size']] = [
                $testVector
            ];
        }

        return $items;
    }
}
