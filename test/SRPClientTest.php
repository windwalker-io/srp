<?php

declare(strict_types=1);

namespace Windwalker\SRP\Test;

use Brick\Math\BigInteger;
use Brick\Math\Exception\DivisionByZeroException;
use Brick\Math\Exception\MathException;
use Brick\Math\Exception\NegativeNumberException;
use Brick\Math\Exception\NumberFormatException;
use Brick\Math\Internal\Calculator;
use PHPUnit\Framework\TestCase;
use Windwalker\SRP\SRPClient;
use Windwalker\SRP\SRPServer;
use Windwalker\SRP\SRPUtils;

class SRPClientTest extends TestCase
{
    use SRPTestTrait;

    /**
     * @param  array  $data
     *
     * @return  void
     *
     * @throws DivisionByZeroException
     * @throws MathException
     * @throws NegativeNumberException
     * @throws NumberFormatException
     * @dataProvider vectorsProvider
     */
    public function testVectors(array $data): void
    {
        $client = SRPClient::create(
            $data['N'],
            $data['g'],
            $data['k']
        );
        $client->setSize($data['size']);
        $client->setAlgo($data['H']);

        $salt = BigInteger::fromBase($data['s'], 16);
        $identity = $data['I'];
        $password = $data['P'];

        // Test [x]
        $x = $client->generatePasswordHash($salt, $identity, $password);

        self::assertHexEquals($data['x'], $x->toBase(16), 'The [x] not equals');

        // Test [v]
        $v = $client->generateVerifier($x);

        self::assertHexEquals($data['v'], $v->toBase(16), 'The [v] not equals');

        $v = BigInteger::fromBase($data['v'], 16);
        $a = BigInteger::fromBase($data['a'], 16);
        $B = BigInteger::fromBase($data['B'], 16);
        $A = $client->generatePublic($a);
        $u = $client->generateCommonSecret($A, $B);
        $S = $client->generatePreMasterSecret($a, $B, $x, $u);
        $K = $client->hash($S);
        $M1 = $client->generateClientSessionProof($identity, $salt, $A, $B, $K);
        $M2 = $client->generateServerSessionProof($A, $M1, $K);

        // Test [A]
        self::assertHexEquals($data['A'], $A->toBase(16), 'The [A] not expected');

        // Test [u]
        self::assertHexEquals($data['u'], $u->toBase(16), 'The [u] not expected');

        // Test [S]
        self::assertHexEquals($data['S'], $S->toBase(16), 'The [S] not expected');

        // Test [K]
        self::assertHexEquals($data['K'], $K->toBase(16), 'The [K] not expected');

        // Test [M1]
        self::assertHexEquals($data['M1'], $M1->toBase(16), 'The [M1] not expected');

        // Test [M2]
        self::assertHexEquals($data['M2'], $M2->toBase(16), 'The [M2] not expected');
    }
}
