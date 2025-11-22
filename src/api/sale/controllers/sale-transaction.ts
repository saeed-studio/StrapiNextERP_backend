// Custom sale transaction controller using Document Service API (Strapi v5)

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::sale.sale', ({ strapi }) => ({
  async createSaleTransaction(ctx) {
    try {
      // 1. Extract `data` object from the incoming request body
      // Example result: { customer_name: "...", products: [...], subtotal: ..., total: ... }
      const { data } = ctx.request.body;

      // 2. Run all sale creation + product stock updates inside a database transaction
        const result = await strapi.db.transaction(async () => {
        // ================================
        // STEP 1 — CREATE SALE DOCUMENT
        // ================================
        const sale = await strapi.documents('api::sale.sale').create({
          data: {
            // Basic sale metadata
            customer_name: data.customer_name,
            invoice_number: data.invoice_number,
            customer_email: data.customer_email,
            customer_phone: data.customer_phone,
            date: data.date,
            notes: data.notes,

            // Map products to proper relational structure expected by Strapi
            // Each product item: { product: <documentId>, quantity, price }
            products: data.products.map((item: any) => ({
              product: item.product, // We assume frontend sends a valid documentId or relation ID
              quantity: item.quantity,
              price: item.price,
            })),

            // Pricing summary fields
            subtotal: data.subtotal,
            discount_amount: data.discount_amount,
            tax_amount: data.tax_amount,
            total: data.total,
          },

          // If using Draft & Publish mode, we can publish immediately:
          // status: "published",
        });

        // ================================
        // STEP 2 — UPDATE PRODUCT STOCKS
        // ================================
        for (const productItem of data.products) {
          // 2.1 Find the product document
          // If frontend sends numeric ID → we search by filters.id
          // (If frontend sends documentId, you would use: documentId: productItem.product)
          const product = await strapi.documents('api::product.product').findFirst({
            filters: { id: productItem.product },
          });

          // 2.2 Ensure product exists
          if (!product) {
            throw new Error(`Product with ID ${productItem.product} not found`);
          }

          // 2.2b Ensure stock is present (Strapi types mark it optional)
          if (product.stock == null) {
            throw new Error(`Stock is not set for product with ID ${productItem.product}`);
          }

          // 2.3 Calculate the new stock after sale
          const updatedStock = product.stock - productItem.quantity;

          // 2.4 Prevent negative stock (inventory protection)
          if (updatedStock < 0) {
            throw new Error(`Insufficient stock for product with ID ${productItem.product}`);
          }

          // 2.5 Update product stock
          // IMPORTANT: Document Service requires updating by documentId, not numeric id
          await strapi.documents('api::product.product').update({
            documentId: product.documentId,
            data: { stock: updatedStock },
          });
        }

        // 3. Return the created sale document after all operations succeed
        return sale;
      });

      // 4. Send success response back to client
      ctx.body = { data: result, meta: { success: true } };
    } catch (error: any) {
      // Log any error for debugging
      strapi.log.error('Transaction error:', error);

      // Send 500 server error to client with message
      ctx.throw(500, error.message);
    }
  },
}));
