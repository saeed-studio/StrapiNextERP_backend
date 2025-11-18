module.exports = {
  routes: [
    {
      method: "GET",
      path: "/sales/summary/:period", // :for dynamic routes
      handler: "saleSummary.getSummary",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
