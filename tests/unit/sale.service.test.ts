import { validateProductStock } from '../../src/api/sale/services/sale';

describe('CRITICAL: Sale service stock validation', () => {
  it('returns updated stock when quantity is available', () => {
    const product = { stock: 15 };

    const result = validateProductStock(product, 42, 5);

    expect(result).toBe(10);
  });

  it('throws when product is missing', () => {
    expect(() => validateProductStock(undefined, 123, 1)).toThrow(
      'Product with ID 123 not found'
    );
  });

  it('throws when stock is not set', () => {
    const product = { stock: null };

    expect(() => validateProductStock(product, 7, 1)).toThrow(
      'Stock is not set for product with ID 7'
    );
  });

  it('throws when sale would make stock negative', () => {
    const product = { stock: 2 };

    expect(() => validateProductStock(product, 'ABC', 3)).toThrow(
      'Insufficient stock for product with ID ABC'
    );
  });
});
