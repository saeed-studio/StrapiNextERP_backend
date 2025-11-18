import { factories } from "@strapi/strapi";

type CTA = {
  label: string;
  href: string;
};

type Stat = {
  label: string;
  value: string;
};

type HeroSection = {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCta: CTA;
  secondaryCta: CTA;
  stats: Stat[];
};

type DemoSection = {
  title: string;
  description: string;
  highlights: string[];
  media: string;
};

type FeatureCard = {
  title: string;
  description: string;
  icon: string;
  detail: string;
};

type WhyUsSection = {
  title: string;
  description: string;
  bullets: { title: string; text: string }[];
  metrics: Stat[];
};

type PricingPlan = {
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  ctaLabel: string;
  ctaHref: string;
};

type PricingSection = {
  title: string;
  description: string;
  plans: PricingPlan[];
  note: string;
};

type FaqSection = {
  title: string;
  description: string;
  items: { question: string; answer: string; category: string }[];
};

type LandingContent = {
  hero: HeroSection;
  demo: DemoSection;
  features: FeatureCard[];
  whyUs: WhyUsSection;
  pricing: PricingSection;
  faq: FaqSection;
};

const landingContent: LandingContent = {
  hero: {
    eyebrow: "ERP Cloud Platform",
    title: "Orchestrate every workflow from a single command center.",
    subtitle:
      "Modern finance, inventory, HR, and operations that speak the same language. Designed for regional regulations, delivered with enterprise polish.",
    primaryCta: {
      label: "شروع رایگان",
      href: "/register",
    },
    secondaryCta: {
      label: "تماشای دمو",
      href: "#demo",
    },
    stats: [
      { label: "شرکت فعال", value: "120+" },
      { label: "زمان استقرار", value: "< 12 روز" },
      { label: "رضایت مدیران", value: "9.6 / 10" },
    ],
  },
  demo: {
    title: "یک نمایه زنده از عملکرد سازمان",
    description:
      "داشبورد لحظه‌ای، ماژول‌های ما کمک می‌کنند جریان فروش، خرید، تولید و منابع انسانی را در همان لحظه مشاهده کنید.",
    highlights: [
      "رابط کاربری واکنش‌گرا و چندزبانه",
      "گزارش‌گیری زنده و قابل اشتراک",
      "یکپارچگی کامل با سیستم‌های مالی موجود",
    ],
    media: "/product.jpg",
  },
  features: [
    {
      title: "برنامه‌ریزی مالی پیشرفته",
      description: "اتوماسیون حسابداری و مدیریت نقدینگی در لحظه.",
      icon: "LineChart",
      detail:
        "همگام‌سازی با بانک و ایجاد گزارش‌های قانونی بدون نیاز به فایل اکسل.",
    },
    {
      title: "انبارداری مبتنی بر هوش",
      description: "ردگیری خودکار سری ساخت، موجودی و هشدار کمبود کالا.",
      icon: "Boxes",
      detail:
        "پیشنهاد هوشمند سفارش مجدد و انبارگردانی با اسکنر یا موبایل.",
    },
    {
      title: "اتاق کار فروش",
      description: "CRM داخلی، مدیریت قرارداد و کمیسیون تیم فروش.",
      icon: "Handshake",
      detail:
        "قیف فروش تعاملی، امتیازدهی لیدها و ارتباط مستقیم با واتساپ/ایمیل.",
    },
    {
      title: "منابع انسانی چابک",
      description: "حضور و غیاب، حقوق و مزایا و پرتال کارمندان.",
      icon: "Users",
      detail:
        "ثبت درخواست‌ها، ارزیابی عملکرد و جریان‌های تایید بدون ایمیل‌های رفت و برگشت.",
    },
    {
      title: "موتور اتوماسیون",
      description: "گردش‌کار بصری برای تمام سناریوهای سازمانی.",
      icon: "Workflow",
      detail:
        "با چند کلیک SLA، هشدار، وبهوک و هماهنگی با سرویس‌های بیرونی را بسازید.",
    },
    {
      title: "امنیت و انطباق",
      description: "سطوح دسترسی دقیق و گزارش‌های ممیزی آماده.",
      icon: "ShieldCheck",
      detail:
        "ورود دو مرحله‌ای، رمزنگاری داده و تاریخچه کامل برای ISO و مقررات محلی.",
    },
  ],
  whyUs: {
    title: "چرا سازمان‌ها مارا انتخاب می‌کنند؟",
    description:
      "تیم متخصص پیاده‌سازی، زیرساخت ابری بومی و کتابخانه‌ای از الگوهای آماده باعث می‌شود در کمترین زمان به ارزش برسید.",
    bullets: [
      {
        title: "انطباق با فرآیندهای محلی",
        text: "ماژول‌های مالی و منابع انسانی با قوانین مالیاتی و کار مطابقت کامل دارند.",
      },
      {
        title: "مدل توسعه‌پذیر",
        text: "SDK باز و API مستند تضمین می‌کند که بتوانید هر ماژول سفارشی را اضافه کنید.",
      },
      {
        title: "موفقیت مشتری اختصاصی",
        text: "از تحلیل فرایند تا آموزش تیم، یک اسکواد کامل کنار شماست.",
      },
    ],
    metrics: [
      { label: "بازگشت سرمایه", value: "۳٫۴ برابر" },
      { label: "بهبود بهره‌وری", value: "۵۸٪" },
    ],
  },
  pricing: {
    title: "طرح‌های شناور برای هر مقیاس",
    description:
      "هزینه‌ها به‌صورت شفاف و بر اساس هر کاربر فعال محاسبه می‌شود. هر پلن شامل پشتیبانی و به‌روزرسانی رایگان است.",
    note: "برای بیش از 250 کاربر، با تیم فروش جهت پیشنهاد سفارشی صحبت کنید.",
    plans: [
      {
        name: "Start",
        price: 0,
        period: "ماهانه",
        description: "بهترین گزینه برای تیم‌های تازه‌کار.",
        features: [
          "۵ کاربر فعال",
          "ماژول‌های فروش، انبار و مالی پایه",
          "پشتیبانی از طریق ایمیل",
        ],
        ctaLabel: "شروع رایگان",
        ctaHref: "/register",
      },
      {
        name: "Growth",
        price: 39,
        period: "هر کاربر / ماه",
        description: "اتوماسیون پیشرفته و گزارش‌های تحلیلی.",
        features: [
          "کاربران نامحدود",
          "اتوماسیون جریان‌کار و API باز",
          "پشتیبانی چت 24/7",
        ],
        highlighted: true,
        badge: "محبوب‌ترین",
        ctaLabel: "درخواست دمو",
        ctaHref: "/login",
      },
      {
        name: "Enterprise",
        price: 89,
        period: "هر کاربر / ماه",
        description: "انطباق، SLA اختصاصی و SSO.",
        features: [
          "امنیت پیشرفته و SOC 2",
          "مدیر موفقیت اختصاصی",
          "مراکز داده چندگانه",
        ],
        ctaLabel: "گفتگو با فروش",
        ctaHref: "/contact",
      },
    ],
  },
  faq: {
    title: "سوالات پرتکرار",
    description:
      "اگر پاسخ موردنظر را پیدا نکردید، تیم ما تنها یک کلیک فاصله دارد.",
    items: [
      {
        category: "راه‌اندازی",
        question: "فرایند استقرار چقدر طول می‌کشد؟",
        answer:
          "بیشتر مشتریان در کمتر از دو هفته به محیط عملیاتی می‌رسند. تیم موفقیت ما از تحلیل تا آموزش همراه شماست.",
      },
      {
        category: "هزینه",
        question: "آیا هزینه مخفی وجود دارد؟",
        answer:
          "خیر، تمام هزینه‌ها در پلن انتخابی شما مشخص است. تنها در صورت نیاز به ماژول‌های سفارشی، پیشنهاد جداگانه ارائه می‌شود.",
      },
      {
        category: "امنیت",
        question: "چگونه از داده‌های ما محافظت می‌کنید؟",
        answer:
          "داده‌ها با استانداردهای رمزنگاری روز ذخیره می‌شوند، نسخه پشتیبان روزانه داریم و می‌توانیم به طور اختصاصی در دیتاسنتر شما مستقر شویم.",
      },
      {
        category: "یکپارچگی",
        question: "آیا می‌توانیم با نرم‌افزارهای موجود ارتباط برقرار کنیم؟",
        answer:
          "بله. API باز، وبهوک و اتصال از پیش‌ساخته با سرویس‌های حسابداری، پرداخت و اتوماسیون فراهم است.",
      },
    ],
  },
};

export default factories.createCoreController("api::sale.sale", () => ({
  async getLanding() {
    return { data: landingContent };
  },
}));
