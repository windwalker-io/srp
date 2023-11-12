<?php

declare(strict_types=1);

namespace Windwalker\SRP\Test;

trait SRPTestTrait
{
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

        $allowAlgos = [
            'sha256'
        ];

        $allowSizes = [
            1024
        ];

        foreach ($testVectors as $testVector) {
            if (!in_array($testVector['H'], $allowAlgos, true)) {
                continue;
            }

            if (!in_array($testVector['size'], $allowSizes, true)) {
                continue;
            }

            $items[$testVector['H'] . ':' . $testVector['size']] = [
                $testVector
            ];
        }

        return $items;
    }
}
