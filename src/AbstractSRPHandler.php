<?php

declare(strict_types=1);

namespace Windwalker\SRP;

use Brick\Math\BigInteger;
use Brick\Math\BigNumber;
use Brick\Math\Exception\NumberFormatException;

abstract class AbstractSRPHandler
{
    public const SECRET_128BIT = 16;
    public const SECRET_192BIT = 24;
    public const SECRET_256BIT = 32;

    protected const DEFAULT_PRIME = '217661744586174357731910088918027537819076683742555385111446432246898862353838409572109' .
    '090130860564015713997172358072665816496064721484102914133641521973644771808873956554837381150726774022351017625' .
    '219015698207402931495296204193332662620734710545483687360395197024862265062488610602569718029849535611214426801' .
    '576680007614299882224570904138739739701719270939921147517651680636147611196154762334220964427831179712363716473' .
    '338714143358957734746673089670508070055093204247996784170368679283167612722742303140675482911335824795830614395' .
    '77559347101961771406173684378522703483495337037655006751328447510550299250924469288819';

    protected const DEFAULT_GENERATOR = '2';

    protected const DEFAULT_KEY = '5b9e8ef059c6b32ea59fc1d322d37f04aa30bae5aa9003b8321e21ddb04e300';

    protected string $algo = 'sha256';

    protected int $length = self::SECRET_256BIT;

    public static function bigInteger(string|BigInteger $num, int $from = 10): BigInteger
    {
        if ($num instanceof BigInteger) {
            return $num;
        }

        return BigInteger::fromBase($num, $from);
    }

    public static function createFromConfig(array $config): static {
        return static::create(
            $config['prime'] ?? null,
            $config['generator'] ?? null,
            $config['key'] ?? null,
        );
    }

    public static function create(
        BigInteger|string $prime = null,
        BigInteger|string $generator = null,
        BigInteger|string $key = null
    ): static {
        $prime ??= static::DEFAULT_PRIME;
        $generator ??= static::DEFAULT_GENERATOR;
        $key ??= static::DEFAULT_KEY;

        return new static(
            static::bigInteger($prime, 16),
            static::bigInteger($generator, 16),
            static::bigInteger($key, 16),
        );
    }

    public function __construct(
        protected BigInteger $prime,
        protected BigInteger $generator,
        protected BigInteger $key
    ) {
        //
    }

    /**
     * Generate random [a] or [b]
     *
     * (a or b = random())
     *
     * @return  BigInteger [a] or [b]
     *
     * @throws NumberFormatException
     * @throws \Exception
     */
    public function generateRandomPrivate(): BigInteger
    {
        $hex = bin2hex(random_bytes($this->getLength()));

        return BigInteger::fromBase($hex, 16);
    }

    public function getAlgo(): string
    {
        return $this->algo;
    }

    public function setAlgo(string $algo): static
    {
        $this->algo = $algo;

        return $this;
    }

    public function getLength(): int
    {
        return $this->length;
    }

    public function setLength(int $length): static
    {
        $this->length = $length;

        return $this;
    }

    public function setSize(int $length): static
    {
        return $this->setLength((int) ($length / 8));
    }

    /**
     * [u] = HASH(PAD(A) | PAD(B))
     *
     * @param  BigInteger  $A
     * @param  BigInteger  $B
     *
     * @return  BigInteger
     * @throws NumberFormatException
     */
    protected function computeU(BigInteger $A, BigInteger $B): BigInteger
    {
        static::checkNotEmpty($A, 'A');
        static::checkNotEmpty($B, 'B');

        return BigInteger::fromBase(
            $this->hashToString($this->pad($A) . $this->pad($B)),
            16
        );
    }

    /**
     * [N].
     *
     * @return  BigInteger
     */
    public function getPrime(): BigInteger
    {
        return $this->prime;
    }

    /**
     * [g].
     *
     * @return  BigInteger
     */
    public function getGenerator(): BigInteger
    {
        return $this->generator;
    }

    /**
     * [k].
     *
     * @return BigInteger
     */
    public function getKey(): BigInteger
    {
        return $this->key;
    }

    protected function hash(\Stringable|string ...$args): BigInteger
    {
        return static::bigInteger($this->hashToString(implode('', $args)), 16);
    }

    protected function hashToString(\Stringable|string $str): string
    {
        return hash($this->getAlgo(), (string) $str);
    }

    protected static function checkNotEmpty(mixed $num, string $name): void
    {
        if (!$num) {
            throw new \UnexpectedValueException("Value: `$name` should not be empty.");
        }

        if ($num instanceof BigNumber && $num->isZero()) {
            throw new \UnexpectedValueException("Value: `$name` should not be zero.");
        }
    }

    protected static function intToBytes(BigInteger $val): string
    {
        $hexStr = $val->toBase(16);

        $hexStr = strlen($hexStr) % 2 ? '0' . $hexStr : $hexStr;

        return pack('H*', $hexStr);
    }

    protected function pad(BigInteger $val): string
    {
        $length = strlen(static::intToBytes($this->getPrime()));

        return str_pad((string) $val, $length, '0');
    }
}
