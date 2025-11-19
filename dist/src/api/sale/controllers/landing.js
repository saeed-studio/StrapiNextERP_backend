"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
const FALLBACK_MEDIA = "/product.jpg";
const landingContent = {
    hero: {
        eyebrow: "Unified ERP Cloud",
        title: "Operate every department from a single source of truth.",
        subtitle: "Bring finance, inventory, people, and operations together on one secure, regional-ready platform.",
        primaryCta: {
            label: "Start Free",
            href: "/register",
        },
        secondaryCta: {
            label: "Watch Demo",
            href: "#demo",
        },
        stats: [
            { label: "Active businesses", value: "120+" },
            { label: "Average go-live time", value: "< 12 days" },
            { label: "Executive satisfaction", value: "9.6 / 10" },
        ],
    },
    demo: {
        title: "A live cockpit for your entire company",
        description: "View sales, purchasing, production, and workforce data in real time. Every module uses the same design language and permission model.",
        highlights: [
            "Responsive, bilingual UI with guided onboarding",
            "Live dashboards and shareable, export-ready reports",
            "Native integrations with accounting, banking, and HR systems",
        ],
        media: FALLBACK_MEDIA,
    },
    features: [
        {
            title: "Intelligent financial planning",
            description: "Automate ledger posting, forecasting, and cash visibility in minutes.",
            icon: "LineChart",
            detail: "Bank feeds, regulatory reports, and localized tax packs are generated without spreadsheets.",
        },
        {
            title: "AI-assisted inventory & fulfillment",
            description: "Track lots, locations, and reservations while preventing stockouts.",
            icon: "Boxes",
            detail: "Smart reorder suggestions and cycle counts work on handheld scanners or mobile devices.",
        },
        {
            title: "Revenue command center",
            description: "Built-in CRM, quoting, and commission tools keep sales and finance aligned.",
            icon: "Handshake",
            detail: "Manage funnels, automate approvals, and push updates to WhatsApp, Slack, or email with one click.",
        },
        {
            title: "Agile people operations",
            description: "Time tracking, payroll, and employee self-service in a modern workspace.",
            icon: "Users",
            detail: "Requests, reviews, and policy acknowledgements flow through fast approval paths without chasing emails.",
        },
        {
            title: "Visual automation engine",
            description: "Design workflows, alerts, and SLAs using a drag-and-drop builder.",
            icon: "Workflow",
            detail: "Trigger webhooks, send notifications, or sync with external systems with zero custom code.",
        },
        {
            title: "Enterprise-grade security & compliance",
            description: "Role-based access, audit trails, and encryption everywhere.",
            icon: "ShieldCheck",
            detail: "Multi-factor authentication, regional data residency, and SOC-ready logging are included by default.",
        },
    ],
    whyUs: {
        title: "Why operations teams trust our ERP",
        description: "From discovery to onboarding, a dedicated success squad and proven playbooks help you unlock value fast.",
        bullets: [
            {
                title: "Localized processes out-of-the-box",
                text: "Finance and HR modules match regional tax laws, labor codes, and reporting templates.",
            },
            {
                title: "Enterprise extensibility",
                text: "Use our documented SDK and API catalog to add custom modules without vendor lock-in.",
            },
            {
                title: "Shared ownership",
                text: "Solution architects, change managers, and support engineers stay with you after go-live.",
            },
        ],
        metrics: [
            { label: "Average ROI in year one", value: "3.4x" },
            { label: "Productivity lift", value: "58%" },
        ],
    },
    pricing: {
        title: "Flexible plans for every stage",
        description: "Licenses scale with active users and every plan ships with updates, hosting, and baseline support.",
        note: "Need more than 250 users or a private cloud region? Our sales team can craft a custom offer.",
        plans: [
            {
                name: "Start",
                price: 0,
                period: "per month",
                description: "Perfect for early teams testing modules together.",
                features: [
                    "Up to 5 active users",
                    "Sales, inventory, and core finance modules",
                    "Email support during business hours",
                ],
                ctaLabel: "Get Started",
                ctaHref: "/register",
            },
            {
                name: "Growth",
                price: 39,
                period: "per user / month",
                description: "Automation, analytics, and integration power for scaling orgs.",
                features: [
                    "Unlimited users with role-based access",
                    "Workflow automation builder & open API",
                    "24/7 chat support and onboarding concierge",
                ],
                highlighted: true,
                badge: "Most Popular",
                ctaLabel: "Book a Demo",
                ctaHref: "#demo",
            },
            {
                name: "Enterprise",
                price: 89,
                period: "per user / month",
                description: "Advanced governance, security, and performance guarantees.",
                features: [
                    "SSO, SCIM, and advanced compliance controls",
                    "Dedicated customer success squad",
                    "Multi-region deployments and premium SLA",
                ],
                ctaLabel: "Talk to Sales",
                ctaHref: "/contact",
            },
        ],
    },
    faq: {
        title: "Frequently Asked Questions",
        description: "Everything you need to evaluate implementation, security, and pricing.",
        items: [
            {
                category: "Implementation",
                question: "How long does deployment take?",
                answer: "Most teams launch their first modules in 10–12 days. We provide process discovery workshops, data migration support, and onsite or remote training.",
            },
            {
                category: "Pricing",
                question: "Are there any hidden fees?",
                answer: "No. Hosting, updates, and baseline support are included. Optional add-ons like custom training or private cloud regions are quoted upfront.",
            },
            {
                category: "Security",
                question: "How do you keep our data safe?",
                answer: "Data is encrypted in transit and at rest, we offer daily backups, and our security team monitors the platform 24/7. Enterprise plans add dedicated compliance tooling.",
            },
            {
                category: "Integrations",
                question: "Can we connect to existing systems?",
                answer: "Absolutely. Use REST and GraphQL APIs, webhooks, and pre-built connectors for accounting, payments, and HR providers.",
            },
        ],
    },
};
const getBaseUrl = (strapi, origin) => {
    const rawServerUrl = strapi.config.get("server.url");
    const candidates = [
        origin,
        typeof rawServerUrl === "string" ? rawServerUrl : undefined,
        process.env.NEXT_PUBLIC_STRAPI_URL,
        process.env.NEXT_PUBLIC_API_URL,
        process.env.STRAPI_PUBLIC_URL,
        process.env.PUBLIC_STRAPI_URL,
    ];
    return candidates.find((candidate) => typeof candidate === "string" && candidate.length > 0);
};
const toAbsoluteUrl = (strapi, url, origin) => {
    if (!url) {
        return undefined;
    }
    if (url.startsWith("http://") ||
        url.startsWith("https://") ||
        url.startsWith("//")) {
        return url;
    }
    const baseUrl = getBaseUrl(strapi, origin);
    if (!baseUrl) {
        return url;
    }
    const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const normalizedPath = url.startsWith("/") ? url : `/${url}`;
    return `${normalizedBase}${normalizedPath}`;
};
const extractUploadUrl = (image) => {
    if (!image) {
        return undefined;
    }
    if (Array.isArray(image)) {
        for (const node of image) {
            const resolved = extractUploadUrl(node);
            if (resolved) {
                return resolved;
            }
        }
        return undefined;
    }
    if (typeof image !== "object") {
        return undefined;
    }
    const objectImage = image;
    if (typeof objectImage.url === "string") {
        return objectImage.url;
    }
    if (objectImage.attributes && typeof objectImage.attributes === "object") {
        const attributes = objectImage.attributes;
        if (typeof attributes.url === "string") {
            return attributes.url;
        }
    }
    if (objectImage.data) {
        return extractUploadUrl(objectImage.data);
    }
    return undefined;
};
const resolveProductPreviewMedia = async (strapi, absoluteBaseUrl) => {
    try {
        const response = (await strapi.documents("api::product.product").findMany({
            populate: ["image", "category"],
            sort: { updatedAt: "desc" },
            page: 1,
            pageSize: 10,
            status: "published",
        }));
        const products = Array.isArray(response)
            ? response
            : Array.isArray(response === null || response === void 0 ? void 0 : response.results)
                ? response.results
                : [];
        for (const product of products) {
            if (!product) {
                continue;
            }
            const candidateUrl = extractUploadUrl(product.image);
            if (candidateUrl) {
                const absolute = toAbsoluteUrl(strapi, candidateUrl, absoluteBaseUrl);
                if (absolute) {
                    return absolute;
                }
            }
        }
    }
    catch (error) {
        strapi.log.warn("Unable to resolve product preview image", error);
    }
    return FALLBACK_MEDIA;
};
exports.default = strapi_1.factories.createCoreController("api::sale.sale", ({ strapi }) => ({
    async getLanding(ctx) {
        var _a, _b, _c, _d, _e, _f;
        const origin = ((_b = (_a = ctx.request) === null || _a === void 0 ? void 0 : _a.header) === null || _b === void 0 ? void 0 : _b.origin) ||
            ((_c = ctx.request) === null || _c === void 0 ? void 0 : _c.origin) ||
            ((_e = (_d = ctx.request) === null || _d === void 0 ? void 0 : _d.header) === null || _e === void 0 ? void 0 : _e.referer) ||
            undefined;
        const heroMedia = (_f = (await resolveProductPreviewMedia(strapi, origin))) !== null && _f !== void 0 ? _f : FALLBACK_MEDIA;
        return {
            data: {
                ...landingContent,
                demo: {
                    ...landingContent.demo,
                    media: heroMedia,
                },
            },
        };
    },
}));
