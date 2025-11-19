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
        {
            method: "GET",
            path: "/sales/summary/",
            handler: "api::sale.sale.getAllSummaries",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "GET",
            path: "/sales/chartdata/",
            handler: "api::sale.sale.getChartsData",
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};
