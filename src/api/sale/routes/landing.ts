module.exports = {
  routes: [
    {
      method: "GET",
      path: "/sales/landing",
      handler: "landing.getLanding",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
