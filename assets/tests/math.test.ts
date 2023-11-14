import { modPow } from '../src/math';

describe('Math', () => {
  test('Test small modPow', () => {
    expect(modPow(19n, 6n, 26n)).toBe(25n);
    expect(modPow(11n, 49n, 17n)).toBe(11n);
    expect(modPow(62n, 19n, 9n)).toBe(8n);
  });

  test('Test big modPow', () => {
    expect(modPow(245542268581n, 238476n, 271116623n)).toBe(124659241n);
  });
});
