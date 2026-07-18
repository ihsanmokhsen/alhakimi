export const SITE_URL = "https://works.ihsanmokhsen.com";
export const SITE_NAME = "Ihsan Mokhsen — Works";
export const PERSON_NAME = "Muhammad Ihsanul Hakim Mokhsen";
export const PERSON_ALTERNATE_NAME = "Ihsan Mokhsen";
export const SITE_DESCRIPTION =
  "Portfolio Muhammad Ihsanul Hakim Mokhsen, praktisi TI pemerintahan dan peneliti Digital Forensics & Information Security yang membangun aplikasi, riset, dan pengalaman digital.";

export const PRIMARY_PAGES = [
  {
    name: "Works",
    description: "Kumpulan aplikasi, produk digital, dan proyek pilihan Ihsan Mokhsen.",
    path: "/works"
  },
  {
    name: "Stories",
    description: "Catatan, refleksi, dan cerita dari Ihsan Mokhsen.",
    path: "/journal"
  },
  {
    name: "POV",
    description: "Dokumentasi video singkat tentang keseharian dan proses kreatif.",
    path: "/pov"
  },
  {
    name: "About",
    description: "Profil, riset, publikasi, dan fokus profesional Ihsan Mokhsen.",
    path: "/about"
  }
] as const;

export const PERSON_JSON_LD = {
  "@type": "Person",
  "@id": `${SITE_URL}/#person`,
  name: PERSON_NAME,
  alternateName: [PERSON_ALTERNATE_NAME, "alhakimi", "M. I. H. Mokhsen"],
  url: "https://www.ihsanmokhsen.com/",
  jobTitle: "Pranata Komputer dan Peneliti Keamanan Informasi",
  description:
    "Praktisi TI pemerintahan dan peneliti Digital Forensics & Information Security yang berfokus pada kesadaran keamanan informasi, HAIS-Q, AI, dan perlindungan data.",
  worksFor: {
    "@type": "GovernmentOrganization",
    name: "Badan Pendapatan dan Aset Daerah Provinsi Nusa Tenggara Timur"
  },
  knowsAbout: [
    "Digital Forensics",
    "Information Security",
    "Cybersecurity Awareness",
    "HAIS-Q",
    "Artificial Intelligence",
    "Data Protection",
    "Web Development"
  ],
  sameAs: [
    "https://www.ihsanmokhsen.com/",
    "https://www.linkedin.com/in/ihsanmokhsen/",
    "https://github.com/ihsanmokhsen",
    "https://www.instagram.com/rex.orange777/"
  ]
};

export const WEBSITE_JSON_LD = {
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  alternateName: ["works", "Works by Ihsan Mokhsen"],
  description: SITE_DESCRIPTION,
  inLanguage: "id-ID",
  publisher: { "@id": `${SITE_URL}/#person` },
  hasPart: PRIMARY_PAGES.map((page) => ({
    "@type": "WebPage",
    name: page.name,
    description: page.description,
    url: `${SITE_URL}${page.path}`
  }))
};

export const SITE_NAVIGATION_JSON_LD = {
  "@type": "ItemList",
  "@id": `${SITE_URL}/#navigation`,
  name: "Navigasi utama",
  itemListElement: PRIMARY_PAGES.map((page, index) => ({
    "@type": "SiteNavigationElement",
    position: index + 1,
    name: page.name,
    description: page.description,
    url: `${SITE_URL}${page.path}`
  }))
};

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path)
    }))
  };
}
