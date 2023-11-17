<?php

declare(strict_types=1);

namespace Windwalker\SRP\Test;

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Windwalker\SRP\SRPClient;
use Windwalker\SRP\SRPServer;

class SRPStepsTest extends TestCase
{
    use SRPTestTrait;

    #[DataProvider('vectorsProvider')]
    public function testVectors(array $data): void
    {
        $this->expectNotToPerformAssertions();

        $server = SRPServer::create(
            $data['N'],
            $data['g'],
            $data['k']
        );
        $server->setHasher($data['H']);
        $server->setSize($data['size']);
        $client = SRPClient::create(
            $data['N'],
            $data['g'],
            $data['k']
        );
        $client->setHasher($data['H']);
        $client->setSize($data['size']);

        // Register
        $identity = $data['I'];
        $password = $data['P'];

        // Register: generate new salt & verifier
        // Assuming client->register returns an array with 'salt' and 'verifier'.
        $pf = $client->register($identity, $password);
        $salt = $pf->salt;
        $verifier = $pf->verifier;

        // Send to Server store

        // Login start
        // AJAX:challenge?{identity} - Server step (1)
        // salt & verifier has already stored on user data, server can get it from DB
        // b & B must remember on session, we will use it at following steps.
        $r = $server->step1($identity, $salt, $verifier);
        $b = $r->secret;
        $B = $r->public;

        // Server returns B & salt to client

        // Client step (1) & (2)
        $pr = $client->step1($identity, $password, $salt);
        $a = $pr->secret;
        $A = $pr->public;
        $x = $pr->hash;

        $pr = $client->step2($identity, $salt, $A, $a, $B, $x);
        $K = $pr->key;
        $M1 = $pr->proof;

        // AJAX:authenticate?{identity,A,M1} - Server step (2)
        // Send identity & A & M1 to server and compare it.
        // The salt & verifier stored on user data, get it from DB.
        // The b, B stored in session state, get and clear them.
        $pr = $server->step2($identity, $salt, $verifier, $A, $B, $b, $M1);
        $M2 = $pr->proof;

        // Server returns M2 to Client
        // Client step (3) (optional)
        $client->step3($A, $K, $M1, $M2);

        // If all passed, should not throw any exceptions.
    }
}
