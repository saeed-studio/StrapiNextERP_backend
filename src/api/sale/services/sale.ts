/**
 * sale service
 */

import { factories } from '@strapi/strapi';

type ProductLike = {
  stock?: number | null;
};

/**
 * Validate available stock for a product and calculate the new stock value.
 * Throws when the product is missing, stock is unset, or the sale would create negative stock.
 */
export const validateProductStock = (
  product: ProductLike | null | undefined,
  productId: number | string,
  quantity: number
): number => {
  if (!product) {
    throw new Error(`Product with ID ${productId} not found`);
  }

  if (product.stock == null) {
    throw new Error(`Stock is not set for product with ID ${productId}`);
  }

  const updatedStock = product.stock - quantity;

  if (updatedStock < 0) {
    throw new Error(`Insufficient stock for product with ID ${productId}`);
  }

  return updatedStock;
};

export default factories.createCoreService('api::sale.sale');
