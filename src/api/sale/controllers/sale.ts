import { factories } from "@strapi/strapi";

type SummaryRow = {
  count: string;
  total_sales: string;
  total_tax: string;
  total_discount: string;
  total_revenue: string;
};

type SummaryData = {
  period: string;
  startDate: string;
  endDate: string;
  count: number;
  totalSales: number;
  totalTax: number;
  totalDiscount: number;
  totalRevenue: number;
};

export default factories.createCoreController(
  "api::sale.sale",
  ({ strapi }) => ({
    async getSummary(ctx) {
      try {
        const period = ctx.params.period;
        const now = new Date();

        let startDate: Date | undefined;
        let endDate: Date | undefined;

        switch (period) {
          case "last-month":
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), 0);
            break;
          case "month":
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            break;
          case "two-weeks":
            startDate = new Date();
            startDate.setDate(now.getDate() - 15);
            endDate = new Date();
            break;
          case "week":
            startDate = new Date();
            startDate.setDate(now.getDate() - 7);
            endDate = new Date();
            break;
          default:
            return ctx.badRequest("Invalid period specified");
        }

        if (!startDate || !endDate) {
          return ctx.badRequest("Unable to determine date range");
        }

        const formattedStartDate = startDate.toISOString();
        const formattedEndDate = endDate.toISOString();

        const salesModel = "api::sale.sale";
        const tableInfo = strapi.db.metadata.get(salesModel);

        if (!tableInfo) {
          return ctx.notFound("Sale table not found");
        }

        const tableName = tableInfo.tableName;
        const rawResults = await strapi.db
          .connection(tableName)
          .whereBetween("date", [formattedStartDate, formattedEndDate])
          .select(
            strapi.db.connection.raw("COUNT(*) as count"),
            strapi.db.connection.raw("SUM(subtotal) as total_sales"),
            strapi.db.connection.raw("SUM(tax_amount) as total_tax"),
            strapi.db.connection.raw("SUM(discount_amount) as total_discount"),
            strapi.db.connection.raw("SUM(total) as total_revenue")
          )
          .first();

        const results = rawResults
          ? (rawResults as unknown as SummaryRow)
          : undefined;

        const summary: SummaryData = {
          period,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          count: parseInt(results?.count ?? "0", 10),
          totalSales: parseFloat(results?.total_sales ?? "0"),
          totalTax: parseFloat(results?.total_tax ?? "0"),
          totalDiscount: parseFloat(results?.total_discount ?? "0"),
          totalRevenue: parseFloat(results?.total_revenue ?? "0"),
        };

        return { data: summary };
      } catch (error) {
        strapi.log.error("Error in getSummary controller", error);
        return ctx.throw(
          500,
          "An error occurred while fetching the sales summary"
        );
      }
    },
    async getAllSummaries(ctx) {
      // define the periods we want
      const periods = ["last-month", "month", "two-weeks", "week"];

      const summaries = {};

      for (const period of periods) {
        // reuse the context with modified params
        const periodCtx = { ...ctx, params: { period } };
        const result = await this.getSummary(periodCtx);
        summaries[period] = result.data;
      }

      return { data: summaries };
    },
    async getChartsData(ctx) {
      try {
        const now = new Date();
        // Get the first day of the current month
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        // Get the last day of the current month
        const endOfMonth = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );

        const sales = await strapi.documents("api::sale.sale").findMany({
          filters: {
            date: {
              $gte: startOfMonth.toISOString(),
              $lte: endOfMonth.toISOString(),
            },
          },
          fields: ["date", "total"],
          pagination: { limit: -1 }, // limit: -1 disables pagination
          sort: ["date:asc"],
        });

        ctx.body = sales;
      } catch (error) {
        console.error("Error in getSummary:", error);
        return ctx.throw(500, "An error occurred while fetching sales data");
      }
    },
  })
);
