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

export function gamingCafeTemplate(): TemplateDefinition {
  const theme = getTheme("gaming-cafe");
  beginTemplate(theme);
  const brand = "Neon Cafe";
  const links = nav(
    ["Home", "/"],
    ["Rates", "/rates"],
    ["PCs", "/pcs"],
    ["Menu", "/menu"],
    ["Events", "/events"],
    ["Book", "/book"],
    ["Contact", "/contact"],
  );

  return {
    key: "gaming-cafe",
    name: "Gaming Cafe",
    description:
      "Complete PC cafe site — pricing, specs, food menu, tournaments, online booking, and gallery.",
    theme,
    navigation: links,
    pages: [
      homePage(
        brand,
        links,
        {
          heading: "High refresh. Low ping. Great coffee.",
          subheading:
            "40 premium gaming stations, private team rooms, and nightly tournaments in the heart of downtown.",
          ctaLabel: "Book a seat",
          ctaHref: "/book",
          imageUrl: STOCK.cafeHero,
        },
        [
          s("grid", {
            columns: 3,
            children: [
              s("card", {
                title: "240Hz rigs",
                body: "RTX 4070–4090, mechanical keyboards, and pro headsets at every station.",
                imageUrl: STOCK.setup,
              }),
              s("card", {
                title: "Food & drinks",
                body: "Burgers, boba, energy drinks, and barista coffee until 2am.",
                imageUrl: STOCK.cafeHero,
              }),
              s("card", {
                title: "Private rooms",
                body: "Team booths with 5 PCs, whiteboards, and VOD review screens.",
                imageUrl: STOCK.venue,
              }),
            ],
          }),
          galleryBlock("Inside Neon Cafe", [
            { imageUrl: STOCK.cafeHero, caption: "Main floor" },
            { imageUrl: STOCK.setup, caption: "VIP stations" },
            { imageUrl: STOCK.crowd, caption: "Friday night tourney" },
          ]),
          s("tournament-card", {
            name: "Friday Night Fights",
            game: "Multi-title",
            prizePool: "Free hours + merch",
            status: "Every Friday 8pm",
          }),
          s("registration-cta", {
            heading: "First hour free on signup",
            body: "New members get a welcome session and 10% off food.",
            buttonLabel: "Claim offer",
            buttonHref: "/book",
          }),
          s("social-links", {
            heading: "Follow Neon Cafe",
            items: [
              { label: "Instagram", href: "https://instagram.com" },
              { label: "Discord", href: "https://discord.gg/neoncafe" },
              { label: "Twitch", href: "https://twitch.tv/neoncafe" },
            ],
          }),
        ],
        "Neon Cafe — open late every day.",
      ),
      innerPage("Rates", "/rates", brand, links, {
        heading: "Hourly & membership rates",
        description: "Walk-in, packs, and monthly memberships for regulars.",
      }, [
        s("grid", {
          columns: 3,
          children: [
            s("card", {
              title: "Walk-in",
              body: "$6/hour · Standard station · Peak hours +$1",
            }),
            s("card", {
              title: "Night pack",
              body: "$20 / 4 hours · Valid after 6pm · Includes one drink",
            }),
            s("card", {
              title: "Member",
              body: "$40/month · 20% off hours · Priority booking · Free locker",
            }),
          ],
        }),
        s("grid", {
          columns: 2,
          children: [
            s("card", { title: "VIP booth", body: "$12/hour · RTX 4090 · 360Hz · Solo or duo" }),
            s("card", { title: "Team room", body: "$45/hour · 5 seats · Private LAN switch" }),
          ],
        }),
        s("text", { text: "Student discount 15% with valid ID. Group bookings of 8+ get 10% off." }),
      ]),
      innerPage("PCs", "/pcs", brand, links, {
        heading: "Our setups",
        description: "Competitive specs across 40 stations plus 6 VIP booths.",
      }, [
        s("text", {
          text: "All machines run clean Windows installs, updated drivers, and popular titles pre-installed. Peripherals sanitized between sessions.",
        }),
        s("grid", {
          columns: 2,
          children: [
            s("card", {
              title: "Standard (32 stations)",
              body: "Ryzen 7 · RTX 4070 · 32GB RAM · 1440p 240Hz · Logitech G Pro",
              imageUrl: STOCK.setup,
            }),
            s("card", {
              title: "VIP (6 booths)",
              body: "Ryzen 9 · RTX 4090 · 64GB RAM · 4K 360Hz · Custom keycaps",
              imageUrl: STOCK.keyboard,
            }),
          ],
        }),
        s("game-information", {
          heading: "Pre-installed titles",
          game: "Top 50 Steam + Epic",
          description: "Valorant, CS2, LoL, Fortnite, Apex, and more. Request installs via front desk.",
          platform: "PC",
        }),
      ]),
      innerPage("Menu", "/menu", brand, links, {
        heading: "Food & drinks",
        description: "Order at the counter or via our in-seat tablet menu.",
      }, [
        s("grid", {
          columns: 3,
          children: [
            s("card", { title: "Neon Burger", body: "$9 · Double patty, secret sauce" }),
            s("card", { title: "Loaded fries", body: "$6 · Cheese, bacon, jalapeños" }),
            s("card", { title: "Boba tea", body: "$5 · Taro, matcha, brown sugar" }),
            s("card", { title: "Energy combo", body: "$7 · Drink + snack of choice" }),
            s("card", { title: "Espresso", body: "$3 · Single or double shot" }),
            s("card", { title: "Member meal deal", body: "$12 · Burger + drink (members only)" }),
          ],
        }),
      ]),
      innerPage("Events", "/events", brand, links, {
        heading: "Cafe events",
        description: "Weekly tournaments, launch parties, and private bookings.",
      }, [
        s("match-schedule", {
          title: "Weekly schedule",
          matches: [
            { title: "Friday Night Fights", game: "Fighting games", startsAt: "Fri 8pm" },
            { title: "Valorant 5v5", game: "Valorant", startsAt: "Sat 3pm" },
            { title: "Indie game night", game: "Variety", startsAt: "Thu 7pm" },
          ],
        }),
        s("registration-cta", {
          heading: "Host your event",
          body: "Birthday parties, team bootcamps, and mini-tournaments. Full venue buyout available.",
          buttonLabel: "Inquire",
          buttonHref: "/contact",
        }),
      ]),
      innerPage("Book", "/book", brand, links, {
        heading: "Reserve your station",
        description: "Pick a time slot and walk in ready to play. Members get priority windows.",
      }, [
        s("registration-cta", {
          heading: "Online booking",
          body: "Select date, time, and station type. Pay deposit online or at arrival.",
          buttonLabel: "Book now",
          buttonHref: "#booking",
        }),
        s("contact-form", {
          heading: "Booking request",
          description: "Date, time, number of seats, and station preference.",
          submitLabel: "Submit booking",
        }),
        s("text", { text: "Cancellations within 2 hours may forfeit deposit. No-shows lose priority booking for 30 days." }),
      ]),
      innerPage("Contact", "/contact", brand, links, {
        heading: "Visit us",
        description: "123 Neon Street, Downtown · Open 10am–2am daily.",
      }, [
        s("image", { imageUrl: STOCK.venue, alt: "Neon Cafe exterior", caption: "Find us on Neon Street." }),
        ...contactBlocks("Contact Neon Cafe"),
      ]),
    ],
  };
}
