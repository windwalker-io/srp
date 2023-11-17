<?php

declare(strict_types=1);

namespace Windwalker\SRP\Test;

use Brick\Math\BigInteger;
use Brick\Math\Exception\DivisionByZeroException;
use Brick\Math\Exception\MathException;
use Brick\Math\Exception\NegativeNumberException;
use Brick\Math\Exception\NumberFormatException;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Windwalker\SRP\SRPClient;
use Windwalker\SRP\SRPServer;
use Windwalker\SRP\SRPUtils;

class SRPServerTest extends TestCase
{
    use SRPTestTrait;

    #[DataProvider('vectorsProvider')]
    public function testVectors(array $data): void
    {
        $server = SRPServer::create(
            $data['N'],
            $data['g'],
            $data['k']
        );
        $server->setHasher($data['H']);
        $server->setSize($data['size']);

        $identity = $data['I'];
        $salt = BigInteger::fromBase($data['s'], 16);
        $v = BigInteger::fromBase($data['v'], 16);
        $A = BigInteger::fromBase($data['A'], 16);
        $u = BigInteger::fromBase($data['u'], 16);

        // $b = $server->generateRandomPrivate($data['size']);
        $b = BigInteger::fromBase($data['b'], 16);
        $B = $server->generatePublic($b, $v);
        $S = $server->generatePreMasterSecret($A, $b, $v, $u);
        $K = $server->hash($S);
        $M1 = $server->generateClientSessionProof($identity, $salt, $A, $B, $K);
        $M2 = $server->generateServerSessionProof($A, $M1, $K);

        // Test B
        self::assertHexEquals($data['B'], $B->toBase(16), 'The B not expected');

        // Test [S]
        self::assertHexEquals($data['S'], $S->toBase(16), 'The S not expected');

        // Test [K]
        self::assertHexEquals($data['K'], $K->toBase(16), 'The K not expected');

        // Test [M1]
        self::assertHexEquals($data['M1'], $M1->toBase(16), 'The M2 not expected');

        // Test [M2]
        self::assertHexEquals($data['M2'], $M2->toBase(16), 'The [M2] not expected');
    }
}
