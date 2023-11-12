<?php

declare(strict_types=1);

namespace Windwalker\SRP\Test;

use Brick\Math\BigInteger;
use PHPUnit\Framework\TestCase;
use Windwalker\SRP\SRPClient;
use Windwalker\SRP\SRPServer;

class SRPTest extends TestCase
{
    /**
     * @return  void
     *
     * @dataProvider vectorsProvider
     */
    public function testVectors(array $data)
    {
        /*
        [H] => sha256
        [size] => 1024
        [N] => eeaf0ab9adb38dd69c33f80afa8fc5e86072618775ff3c0b9ea2314c9c256576d674df7496ea81d3383b4813d692c6e0e0d5d8e250b98be48e495c1d6089dad15dc7d7b46154d6b6ce8ef4ad69b15d4982559b297bcf1885c529f566660e57ec68edbc3c05726cc02fd4cbf4976eaa9afd5138fe8376435b9fc61d2fc0eb06e3
        [g] => 02
        [I] => alice
        [P] => password123
        [s] => beb25379d1a8581eb5a727673a2441ee
        [k] => 1a1a4c140cde70ae360c1ec33a33155b1022df951732a476a862eb3ab8206a5c
        [x] => 65ac38dff8bc34ae0f259e91fbd0f4ca2fa43081c9050cec7cac20d015f303
        [v] => 27e2855ac715f625981dba238667955db341a3bdd919868943bc049736c7804cd8e0507dfefbf5b8573f5aae7bac19b257034254119ab520e1f7cf3f45d01b159016847201d14c8dc95ec34e8b26ee255bc4cb28d4f97e0db97b65bdd196c4d2951cd84f493afd7b34b90984357988601a3643358b81689dfd0cb0d21e21cf6e
        [a] => 60975527035cf2ad1989806f0407210bc81edc04e2762a56afd529ddda2d4393
        [b] => e487cb59d31ac550471e81f00f6928e01dda08e974a004f49e61f5d105284d20
        [A] => 61d5e490f6f1b79547b0704c436f523dd0e560f0c64115bb72557ec44352e8903211c04692272d8b2d1a5358a2cf1b6e0bfcf99f921530ec8e39356179eae45e42ba92aeaced825171e1e8b9af6d9c03e1327f44be087ef06530e69f66615261eef54073ca11cf5858f0edfdfe15efeab349ef5d76988a3672fac47b0769447b
        [B] => 439b7630ec82c94d3bbd466a068d663a40b8d5b1d9b006ba43f5d715498088cca8547bbe3de6406c79f15ffa7356bc93580e478322daf8b2d014347859234f01555c457ab8b7f214875224fc9bfd07a68f37bad4d74bc8467ce10ea39301d3604e91fff5f881d52c558187e68fac3268df2897307da5c58a8c667e0fa8dc837e
        [u] => c557af6030c3df27b4704462df2eceaeaed5d16b4c7d87fdf992e282f985293e
        [S] => 7094d74b440ea4bffa2752694f19600268d61893ad55cac759a18378dce55020742df26f9696515482626372af87d44788d931e60ba0d4d8b31984b30ba285d5db443753ade4504ae124eb63d16db568e6850adf953b353c1255e8ec230e59a904f3784002845a31d12d8f448dd6d1bc3ecded0bba328046b907546f9e3b338c
        [K] => febac740e997507c1c7df7690bac49a97f84ecda99ceb047c575b58e160c477b
        [M1] => 51d0af1793f2921cfc4a41bc5134605a7bf89a3497aed7c29ed6c56ae709037f
        [M2] => 2f6b44340bf8dc05148b6b3ae1d70b6a896588ba6b2c16d8aec619d2cc57653f
         */

        $client = SRPClient::create(
            $data['N'],
            $data['g'],
            $data['k']
        );

        $server = SRPServer::create(
            $data['N'],
            $data['g'],
            $data['k']
        );
        $server->setSize($data['size']);

        $rand = $server->generateRandomPrivate();

        self::assertEquals(
            strlen($data['B']),
            strlen($rand->toBase(16)),
            'The private key length not equals'
        );

        $v = BigInteger::fromBase($data['v'], 16);

        $a = BigInteger::fromBase($data['a'], 16);
        $A = $client->generatePublic($a, $v);

        self::assertEquals($data['A'], $A->toBase(16), 'The A not expected');

        // $b = $server->generateRandomPrivate($data['size']);
        $b = BigInteger::fromBase($data['b'], 16);
        $B = $server->generatePublic($b, $v);

        self::assertEquals($data['B'], $B->toBase(16), 'The B not expected');

        self::assertEquals($data['B'], $B->toBase(16), 'The B not expected');
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
