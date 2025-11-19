module.exports = {
  routes: [
    {
      method: "GET",
      path: "/sales/summary/:period",
      handler: "api::sale.sale.getSummary",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
