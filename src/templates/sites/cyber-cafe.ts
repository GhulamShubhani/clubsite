import {
  beginTemplate,
  contactBlocks,
  galleryBlock,
  homePage,
  innerPage,
  nav,
  s,
  type TemplateDefinition,
} from "../builders";
import { getTheme } from "../themes";
import { STOCK } from "../stock-images";

export function cyberCafeTemplate(): TemplateDefinition {
  const theme = getTheme("cyber-cafe");
  beginTemplate(theme);
  const brand = "ByteBar Cafe";
  const links = nav(
    ["Home", "/"],
    ["Services", "/services"],
    ["Pricing", "/pricing"],
    ["Membership", "/membership"],
    ["Gallery", "/gallery"],
    ["About", "/about"],
    ["Contact", "/contact"],
  );

  return {
    key: "cyber-cafe",
    name: "Cyber Cafe",
    description:
      "Full internet cafe website — gaming & office services, pricing tiers, membership, gallery, and contact.",
    theme,
    navigation: links,
    pages: [
      homePage(
        brand,
        links,
        {
          heading: "Work. Play. Connect.",
          subheading:
            "Fast gaming PCs, office suites, printing, and 24/7 Wi‑Fi lounge — your downtown digital hub.",
          ctaLabel: "See pricing",
          ctaHref: "/pricing",
          imageUrl: STOCK.cyberHero,
        },
        [
          s("grid", {
            columns: 3,
            children: [
              s("card", {
                title: "Gaming PCs",
                body: "60 esports-ready stations with low-latency fiber.",
                imageUrl: STOCK.setup,
              }),
              s("card", {
                title: "Office suite",
                body: "Docs, spreadsheets, print, scan, and video calls.",
                imageUrl: STOCK.keyboard,
              }),
              s("card", {
                title: "Wi‑Fi lounge",
                body: "Bring your laptop — day passes from $8.",
                imageUrl: STOCK.cyberHero,
              }),
            ],
          }),
          galleryBlock("ByteBar life", [
            { imageUrl: STOCK.cyberHero, caption: "Main gaming floor" },
            { imageUrl: STOCK.cafeHero, caption: "Coffee bar" },
            { imageUrl: STOCK.crowd, caption: "Weekend tournament" },
          ]),
          s("sponsor-section", {
            heading: "Powered by",
            sponsors: [
              { name: "City Net ISP", tier: "Infrastructure" },
              { name: "PrintPro", tier: "Office partner" },
            ],
          }),
          s("registration-cta", {
            heading: "Membership from $29/month",
            body: "Priority seats, free printing quota, and weekend gaming discounts.",
            buttonLabel: "Join today",
            buttonHref: "/membership",
          }),
        ],
        "ByteBar Cafe — open 24/7.",
      ),
      innerPage("Services", "/services", brand, links, {
        heading: "Services",
        description: "Everything you need under one roof.",
      }, [
        s("grid", {
          columns: 2,
          children: [
            s("card", {
              title: "Gaming sessions",
              body: "Hourly, packs, and overnight. Top 50 titles pre-installed.",
              imageUrl: STOCK.setup,
            }),
            s("card", { title: "Print & copy", body: "Color and B&W · Binding · Lamination" }),
            s("card", { title: "Private booths", body: "Quiet work pods with dual monitors." }),
            s("card", { title: "Events", body: "Host mini-tournaments and watch parties." }),
            s("card", { title: "Scan & fax", body: "Secure document handling." }),
            s("card", { title: "Tech support", body: "Driver installs, backups, and basic repairs." }),
          ],
        }),
        s("game-information", {
          heading: "Gaming zone",
          game: "PC & Console",
          description: "Steam, Epic, Battle.net clients. Console corner with PS5 and Switch.",
          platform: "PC, PS5, Switch",
        }),
      ]),
      innerPage("Pricing", "/pricing", brand, links, {
        heading: "Pricing",
        description: "Transparent rates for gaming, office, and lounge access.",
      }, [
        s("grid", {
          columns: 3,
          children: [
            s("card", { title: "Standard gaming", body: "$4/hour · 1080p 144Hz rigs" }),
            s("card", { title: "Premium gaming", body: "$7/hour · 1440p 240Hz · RTX class" }),
            s("card", { title: "Day pass", body: "$25 · All zones · 12 hours" }),
          ],
        }),
        s("grid", {
          columns: 3,
          children: [
            s("card", { title: "Office pod", body: "$6/hour · Dual monitor · Quiet" }),
            s("card", { title: "Print B&W", body: "$0.10/page · $0.25 color" }),
            s("card", { title: "Wi‑Fi lounge", body: "$8/day · 100Mbps seat Wi‑Fi" }),
          ],
        }),
      ]),
      innerPage("Membership", "/membership", brand, links, {
        heading: "Membership plans",
        description: "Save more if you're a regular.",
      }, [
        s("grid", {
          columns: 3,
          children: [
            s("card", { title: "Basic", body: "$29/mo · 10 gaming hours · 50 print pages" }),
            s("card", { title: "Pro", body: "$49/mo · 25 hours · Priority booking · Free coffee" }),
            s("card", { title: "Team", body: "$99/mo · 5 seats · Private booth 4h/week" }),
          ],
        }),
        s("registration-cta", {
          heading: "Member perks",
          body: "Priority seats, free drinks on weekends, Discord role, and event discounts.",
          buttonLabel: "Sign up",
          buttonHref: "#join",
        }),
        s("contact-form", {
          heading: "Membership signup",
          description: "Name, email, and preferred plan.",
          submitLabel: "Join membership",
        }),
        s("discord-section", {
          heading: "Members Discord",
          inviteUrl: "https://discord.gg/bytebar",
          memberCount: "800+",
        }),
      ]),
      innerPage("Gallery", "/gallery", brand, links, {
        heading: "Photo gallery",
        description: "Our space, events, and community.",
      }, [
        s("gaming-gallery", {
          heading: "Venue photos",
          items: [
            { imageUrl: STOCK.cyberHero, caption: "Gaming floor" },
            { imageUrl: STOCK.cafeHero, caption: "Lounge area" },
            { imageUrl: STOCK.setup, caption: "Premium stations" },
            { imageUrl: STOCK.venue, caption: "Event night" },
          ],
        }),
      ]),
      innerPage("About", "/about", brand, links, {
        heading: "About ByteBar",
        description: "Serving the community since 2015.",
      }, [
        s("image", { imageUrl: STOCK.cyberHero, alt: "ByteBar interior", caption: "Open 24/7 since 2015." }),
        s("text", {
          text: "ByteBar started as a small print shop with six PCs. Today we're a full digital hub — gaming, remote work, and community events for students, freelancers, and esports fans.",
        }),
        s("player-statistics", {
          heading: "At a glance",
          items: [
            { label: "Stations", value: "60+" },
            { label: "Daily visitors", value: "200+" },
            { label: "Uptime", value: "99.9%" },
          ],
        }),
      ]),
      innerPage("Contact", "/contact", brand, links, {
        heading: "Contact & location",
        description: "456 Byte Street · Open 24/7 · Phone: (555) 010-BYTE",
      }, [
        s("text", { text: "Parking garage adjacent. Accessible entrance on south side." }),
        ...contactBlocks("Contact ByteBar"),
      ]),
    ],
  };
}
