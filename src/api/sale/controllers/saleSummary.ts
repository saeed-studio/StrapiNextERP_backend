import { factories } from "@strapi/strapi";

type SummaryRow = {
  count: string;
  total_sales: string;
  total_tax: string;
  total_discount: string;
  total_revenue: string;
};

type summaryData = {
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

        let startDate, endDate;

        switch (period) {
          case "last-month":
            //last month
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), 0);
            break;
          case "month":
            //current month
            startDate = new Date(now.getFullYear(), now.getMonth(), 0);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            break;
          case "two-weeks":
            //last 15 days
            startDate = new Date();
            startDate.setDate(now.getDate() - 15);
            endDate = new Date();
            break;
          case "week":
            //last 7 days
            startDate = new Date();
            startDate.setDate(now.getDate() - 7);
            endDate = new Date();
            break;

          default:
            ctx.badRequest("Invalid period specified");
        }

        const startTimeStamp = startDate.getTime();
        const formattedStartDate = startDate.toISOString();
        const endTimeStamp = endDate.getTime();
        const formattedEndDate = endDate.toISOString();

        // get a reference to strapi dataBase instance
        const db = strapi.db;

        //find the model UID for the sale content type
        const salesModel = "api::sale.sale";

        // get the actual table name from the model metadata
        const tableInfo = db.metadata.get(salesModel);
        if (!tableInfo) {
          return ctx.notFound("Sale Table not found");
        }

        const tableName = tableInfo.tableName;
        const rawResults = await db
          .connection(tableName)
          .whereBetween("date", [startTimeStamp, endTimeStamp])
          .select(
            db.connection.raw("COUNT(*) as count"),
            db.connection.raw(`SUM(subtotal) as total_sales`),
            db.connection.raw(`SUM(tax_amount) as total_tax`),
            db.connection.raw(`SUM(discount_amount) as total_discount`),
            db.connection.raw(`SUM(total) as total_revenue`)
          )
          .first();
        const results = rawResults
          ? (rawResults as unknown as SummaryRow)
          : undefined;

        // Format summary data
        const summary: summaryData = {
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
        console.log("error in getting summary", error);
        return ctx.throw(500, "An error occured while fetching the sales data");
      }
    },
  })
);
