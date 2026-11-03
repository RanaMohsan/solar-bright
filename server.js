const path = require("path");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;
const SITE_URL = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public"), {
  maxAge: process.env.NODE_ENV === "production" ? "7d" : 0,
  setHeaders(res, filePath) {
    if (filePath.endsWith(".xml") || filePath.endsWith(".txt")) {
      res.setHeader("Cache-Control", "public, max-age=3600");
    }
  },
}));
app.use(express.urlencoded({ extended: true }));

const brand = {
  name: "Solar Bright",
  legalName: "Solar Bright Solar Panel Cleaning",
  tagline: "Clear the Dust. Boost the Power",
  email: "chusman20172017@gmail.com",
  phone: "+92 315 8140250",
  phoneTel: "+923158140250",
  whatsapp: "923158140250",
  whatsappDisplay: "+92 315 8140250",
  streetAddress: "PIA Main Road",
  addressLocality: "Lahore",
  addressRegion: "Punjab",
  addressCountry: "PK",
  postalCode: "54000",
  fullAddress: "PIA Main Road, Lahore, Punjab, Pakistan",
  geo: { latitude: 31.5204, longitude: 74.3587 },
  areaServed: [
    "Lahore",
    "PIA Road Lahore",
    "Johar Town",
    "DHA Lahore",
    "Model Town",
    "Gulberg",
    "Bahria Town Lahore",
    "Cantt Lahore",
    "Allama Iqbal Town",
    "Valencia",
    "Wapda Town",
  ],
  openingHours: ["Mo-Sa 09:00-19:00"],
  priceRange: "$$",
};

brand.whatsappUrl = `https://wa.me/${brand.whatsapp}`;
brand.whatsappQuoteUrl = `${brand.whatsappUrl}?text=${encodeURIComponent(
  "Assalam o Alaikum Solar Bright! I need solar panel washing in Lahore. Please share package details."
)}`;

const pages = {
  home: {
    title: "Home",
    path: "/",
    nav: "Home",
    seoTitle: "Solar Panel Cleaning Lahore | Solar Wash Near Me | Solar Bright PIA Road",
    seoDescription:
      "Solar Bright — best solar panel cleaning & solar wash in Lahore on PIA Main Road. Solar wash near me, rooftop cleaning for homes & businesses. Call/WhatsApp +92 315 8140250.",
    seoKeywords:
      "solar wash Lahore, solar panel cleaning Lahore, solar wash near me, best solar wash Lahore, solar panel washing PIA Road, solar cleaning Pakistan, solar dust cleaning Lahore",
  },
  about: {
    title: "About",
    path: "/about",
    nav: "About",
    seoTitle: "About Solar Bright | Solar Panel Wash Experts in Lahore",
    seoDescription:
      "Meet Solar Bright — Lahore’s solar panel cleaning team on PIA Main Road. Soft-brush solar wash that boosts power output across Lahore.",
    seoKeywords: "Solar Bright Lahore, solar cleaning company Lahore, PIA Road solar wash",
  },
  services: {
    title: "Services",
    path: "/services",
    nav: "Services",
    seoTitle: "Solar Wash Services Lahore | Residential & Commercial Panel Cleaning",
    seoDescription:
      "Book solar wash services in Lahore: residential arrays, commercial rooftops, seasonal maintenance. Soft brush cleaning on PIA Main Road service area.",
    seoKeywords:
      "solar wash services Lahore, commercial solar cleaning Lahore, residential solar panel wash",
  },
  work: {
    title: "Results",
    path: "/work",
    nav: "Results",
    seoTitle: "Solar Panel Cleaning Results Lahore | Before & After Solar Wash",
    seoDescription:
      "See Solar Bright before & after solar panel cleaning in Lahore — dusty to deep blue panels, real wash videos and rooftop results.",
    seoKeywords: "solar panel before after Lahore, solar cleaning results, dusty solar panels Lahore",
  },
  contact: {
    title: "Contact",
    path: "/contact",
    nav: "Contact",
    seoTitle: "Contact Solar Bright Lahore | WhatsApp Solar Wash PIA Main Road",
    seoDescription:
      "Contact Solar Bright on PIA Main Road, Lahore. WhatsApp +92 315 8140250 for solar wash near me quotes across Lahore.",
    seoKeywords: "solar wash contact Lahore, WhatsApp solar cleaning Lahore, PIA Main Road solar",
  },
};

const mediaReel = [
  {
    type: "video",
    src: "/media/clean-demo-1.mp4",
    label: "Live clean · Lahore rooftop",
    alt: "Solar panel cleaning video in Lahore by Solar Bright",
  },
  {
    type: "video",
    src: "/media/clean-demo-2.mp4",
    label: "Brush pass · panel detail",
    alt: "Close-up solar wash brush cleaning dusty panels in Lahore",
  },
  {
    type: "image",
    src: "/media/cleaning-closeup.png",
    label: "Foam wash · close-up",
    alt: "Technician washing dirty solar panel with soft brush and foam in Lahore",
  },
  {
    type: "image",
    src: "/media/before-after-roof.png",
    label: "Before & after · array",
    alt: "Before and after solar panel cleaning on a Lahore rooftop array",
  },
];

const reviews = [
  {
    author: "Ahmed Raza",
    area: "DHA Lahore",
    rating: 5,
    body: "Best solar wash near me in Lahore. Panels looked brand new and our daytime units went up the next day.",
  },
  {
    author: "Sana Malik",
    area: "Johar Town",
    rating: 5,
    body: "Solar Bright on PIA Road is professional and quick. Highly recommend for dusty rooftop panels.",
  },
  {
    author: "Usman Farooq",
    area: "Gulberg",
    rating: 5,
    body: "Booked solar panel cleaning via WhatsApp. Soft brush wash, no scratches, clear before/after photos.",
  },
  {
    author: "Hina Shah",
    area: "Bahria Town Lahore",
    rating: 5,
    body: "We searched ‘solar wash Lahore’ and found Solar Bright. Fair price, on-time team, great results.",
  },
];

const faqs = [
  {
    q: "Where can I find solar wash near me in Lahore?",
    a: "Solar Bright offers solar panel cleaning across Lahore from our office on PIA Main Road. WhatsApp +92 315 8140250 to book a solar wash near you.",
  },
  {
    q: "Do you clean residential and commercial solar panels in Lahore?",
    a: "Yes. We provide soft-brush solar wash for homes, societies, and commercial rooftops throughout Lahore including DHA, Johar Town, Gulberg, Bahria Town, and Cantt.",
  },
  {
    q: "How do I book the best solar panel cleaning in Lahore?",
    a: "Message us on WhatsApp at +92 315 8140250 with your location and system size. We reply with timing and a simple quote.",
  },
  {
    q: "Where is Solar Bright’s office?",
    a: "Our office is on PIA Main Road, Lahore, Punjab, Pakistan. We travel for on-site solar panel washing citywide.",
  },
];

function absoluteUrl(pathname = "/") {
  return `${SITE_URL}${pathname}`;
}

function buildJsonLd(pageKey) {
  const page = pages[pageKey] || pages.home;
  const avg =
    reviews.reduce((sum, r) => sum + r.rating, 0) / Math.max(reviews.length, 1);

  const localBusiness = {
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#business`,
    name: brand.legalName,
    alternateName: brand.name,
    description: page.seoDescription,
    url: SITE_URL,
    telephone: brand.phoneTel,
    email: brand.email,
    image: absoluteUrl("/media/logo.png"),
    logo: absoluteUrl("/media/logo.png"),
    priceRange: brand.priceRange,
    address: {
      "@type": "PostalAddress",
      streetAddress: brand.streetAddress,
      addressLocality: brand.addressLocality,
      addressRegion: brand.addressRegion,
      postalCode: brand.postalCode,
      addressCountry: brand.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: brand.geo.latitude,
      longitude: brand.geo.longitude,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "19:00",
      },
    ],
    areaServed: brand.areaServed.map((name) => ({
      "@type": "Place",
      name,
    })),
    sameAs: [brand.whatsappUrl],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: brand.phoneTel,
      contactType: "customer service",
      areaServed: "PK",
      availableLanguage: ["English", "Urdu"],
      contactOption: "TollFree",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: avg.toFixed(1),
      reviewCount: String(reviews.length),
      bestRating: "5",
      worstRating: "1",
    },
    review: reviews.map((r) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: String(r.rating),
        bestRating: "5",
      },
      author: { "@type": "Person", name: r.author },
      reviewBody: r.body,
    })),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Solar wash services Lahore",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Residential solar panel cleaning Lahore",
            areaServed: "Lahore",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Commercial rooftop solar wash Lahore",
            areaServed: "Lahore",
          },
        },
      ],
    },
  };

  const website = {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: brand.name,
    description: brand.tagline,
    publisher: { "@id": `${SITE_URL}/#business` },
    inLanguage: "en-PK",
  };

  const webpage = {
    "@type": "WebPage",
    "@id": absoluteUrl(page.path) + "#webpage",
    url: absoluteUrl(page.path),
    name: page.seoTitle,
    description: page.seoDescription,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#business` },
    inLanguage: "en-PK",
  };

  const faqPage = {
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  const graph = [localBusiness, website, webpage];
  if (pageKey === "home" || pageKey === "services" || pageKey === "contact") {
    graph.push(faqPage);
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

function render(res, view, extras = {}) {
  const page = pages[view] || pages.home;
  res.render(view, {
    pages,
    current: view,
    brand,
    mediaReel,
    reviews,
    faqs,
    seo: {
      title: page.seoTitle,
      description: page.seoDescription,
      keywords: page.seoKeywords,
      canonical: absoluteUrl(page.path),
      ogImage: absoluteUrl("/media/before-after-roof.png"),
      siteUrl: SITE_URL,
    },
    jsonLd: buildJsonLd(view),
    year: new Date().getFullYear(),
    ...extras,
  });
}

app.get("/", (req, res) => render(res, "home"));
app.get("/about", (req, res) => render(res, "about"));
app.get("/services", (req, res) => render(res, "services"));
app.get("/work", (req, res) => render(res, "work"));
app.get("/contact", (req, res) => render(res, "contact"));

app.post("/contact", (req, res) => {
  const { name = "", email = "", message = "" } = req.body;
  const text = [
    "Assalam o Alaikum Solar Bright!",
    `Name: ${name}`,
    email ? `Email: ${email}` : null,
    "Need solar wash in Lahore.",
    message,
  ]
    .filter(Boolean)
    .join("\n");
  res.redirect(`https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(text)}`);
});

app.get("/robots.txt", (req, res) => {
  res.type("text/plain").send(
    [
      "User-agent: *",
      "Allow: /",
      `Sitemap: ${absoluteUrl("/sitemap.xml")}`,
      "",
    ].join("\n")
  );
});

app.get("/sitemap.xml", (req, res) => {
  const urls = Object.values(pages)
    .map(
      (page) => `  <url>
    <loc>${absoluteUrl(page.path)}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page.path === "/" ? "1.0" : "0.8"}</priority>
  </url>`
    )
    .join("\n");

  res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`);
});

app.use((req, res) => {
  res.status(404);
  render(res, "home");
});

app.listen(PORT, () => {
  console.log(`Solar Bright running at http://localhost:${PORT}`);
});
