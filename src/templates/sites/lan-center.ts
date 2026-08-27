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

export function lanCenterTemplate(): TemplateDefinition {
  const theme = getTheme("lan-center");
  beginTemplate(theme);
  const brand = "LAN Forge";
  const links = nav(
    ["Home", "/"],
    ["Venue", "/venue"],
    ["Events", "/events"],
    ["Tournaments", "/tournaments"],
    ["BYOC", "/byoc"],
    ["FAQ", "/faq"],
    ["Contact", "/contact"],
  );

  return {
    key: "lan-center",
    name: "LAN Center",
    description:
      "Full LAN venue website — floor plans, BYOC guide, tournament weekends, seating, and registration.",
    theme,
    navigation: links,
    pages: [
      homePage(
        brand,
        links,
        {
          heading: "Bring your own PC. Leave with legends.",
          subheading:
            "120 powered seats, 10Gbps networking, overnight access, and weekend tournament circuits.",
          ctaLabel: "See events",
          ctaHref: "/events",
          imageUrl: STOCK.lanHero,
        },
        [
          s("event-countdown", {
            heading: "Next LAN weekend",
            eventName: "Forge Cup Spring",
            targetDate: "2026-09-20T10:00:00Z",
            description: "120-seat BYOC tournament. Registration open.",
          }),
          s("tournament-card", {
            name: "Forge Cup Spring",
            game: "Multi-title",
            prizePool: "$3,000 + gear",
            status: "Registration open",
          }),
          s("grid", {
            columns: 2,
            children: [
              s("card", {
                title: "120 seats",
                body: "Dedicated 20A circuits, gigabit+ switches, and labeled cabling.",
                imageUrl: STOCK.lanHero,
              }),
              s("card", {
                title: "Overnight ready",
                body: "Sleeping zone, showers, and 24/7 security on LAN weekends.",
                imageUrl: STOCK.venue,
              }),
            ],
          }),
          galleryBlock("LAN weekends", [
            { imageUrl: STOCK.lanHero, caption: "Main hall setup" },
            { imageUrl: STOCK.crowd, caption: "Forge Cup finals" },
            { imageUrl: STOCK.setup, caption: "BYOC row A" },
          ]),
          s("prize-pool", {
            heading: "Forge Cup prize pool",
            amount: "$3,000",
            description: "CS2, Valorant, and Rocket League brackets.",
            items: [
              { place: "1st", amount: "$1,500" },
              { place: "2nd", amount: "$900" },
              { place: "3rd", amount: "$600" },
            ],
          }),
          s("registration-cta", {
            heading: "Reserve your seat",
            body: "Early bird $35 until two weeks before event. Standard $45 at door if available.",
            buttonLabel: "Register for LAN",
            buttonHref: "/byoc",
          }),
        ],
        "LAN Forge — plug in and play.",
      ),
      innerPage("Venue", "/venue", brand, links, {
        heading: "The venue",
        description: "Climate-controlled hall with redundant uplink and on-site tech support.",
      }, [
        s("image", {
          imageUrl: STOCK.venue,
          alt: "LAN Forge main hall",
          caption: "Main hall — 120 seats, stage, and cast desk.",
        }),
        s("text", {
          text: "3,500 sq ft hall with raised stage, caster booth, vendor alley, and food court. Redundant 10Gbps fiber uplink with backup LTE.",
        }),
        s("card", {
          title: "Floor map",
          body: "Sections A–D (30 seats each) · VIP rows A1–A6 near stage · Vendor alley along north wall",
          imageUrl: STOCK.lanHero,
        }),
        s("grid", {
          columns: 3,
          children: [
            s("card", { title: "Power", body: "20A per table, surge protected" }),
            s("card", { title: "Network", body: "Dedicated VLAN per row, 1Gbps min" }),
            s("card", { title: "Amenities", body: "Showers, lockers, snack bar" }),
          ],
        }),
      ]),
      innerPage("Events", "/events", brand, links, {
        heading: "LAN weekends",
        description: "Monthly BYOC events and quarterly majors.",
      }, [
        s("match-schedule", {
          title: "Upcoming LANs",
          matches: [
            { title: "Forge Cup Spring", game: "Multi", startsAt: "Sep 20–21" },
            { title: "Retro LAN", game: "Classics", startsAt: "Oct 11" },
            { title: "Forge Cup Winter", game: "Multi", startsAt: "Dec 6–7" },
          ],
        }),
        s("event-countdown", {
          heading: "Days until Forge Cup",
          eventName: "Forge Cup Spring",
          targetDate: "2026-09-20T10:00:00Z",
        }),
      ]),
      innerPage("Tournaments", "/tournaments", brand, links, {
        heading: "Tournament info",
        description: "Brackets, rules, and prize splits for Forge Cup events.",
      }, [
        s("tournament-bracket", {
          heading: "CS2 bracket (preview)",
          description: "Double elimination — 32 teams",
          items: [
            { label: "QF1", teams: "Seed 1 vs Seed 8" },
            { label: "QF2", teams: "Seed 4 vs Seed 5" },
            { label: "SF1", teams: "TBD" },
            { label: "Final", teams: "TBD" },
          ],
        }),
        s("prize-pool", {
          heading: "Prize distribution",
          amount: "$3,000",
          items: [
            { place: "1st", amount: "$1,500" },
            { place: "2nd", amount: "$900" },
            { place: "3rd–4th", amount: "$300 each" },
          ],
        }),
        s("game-information", {
          heading: "Featured titles",
          game: "CS2, Valorant, Rocket League",
          description: "Separate brackets per title. Register one or all.",
          platform: "PC BYOC",
        }),
      ]),
      innerPage("BYOC", "/byoc", brand, links, {
        heading: "BYOC checklist",
        description: "Everything you need for a smooth LAN experience.",
      }, [
        s("text", {
          text: "Bring: PC, monitor, keyboard, mouse, headset, power strip, and 10ft+ Ethernet cable. We provide tables, chairs, ports, and tech support.",
        }),
        s("grid", {
          columns: 2,
          children: [
            s("card", { title: "Recommended", body: "Surge protector, cable ties, external SSD backup" }),
            s("card", { title: "Optional", body: "Monitor arm, LAN skin, team banner" }),
          ],
        }),
        s("registration-cta", {
          heading: "Reserve a seat",
          body: "Seats sell out 2 weeks before each event — book early.",
          buttonLabel: "Register",
          buttonHref: "#register",
        }),
        s("contact-form", {
          heading: "BYOC registration",
          description: "Team name, bracket choice, and seat preference.",
          submitLabel: "Submit registration",
        }),
      ]),
      innerPage("FAQ", "/faq", brand, links, {
        heading: "Frequently asked questions",
        description: "Parking, age limits, gear rules, and refunds.",
      }, [
        s("grid", {
          columns: 1,
          children: [
            s("card", { title: "Age limit?", body: "16+ unattended. 13–15 with guardian on-site." }),
            s("card", { title: "Parking?", body: "Free lot behind venue. Overflow street parking after 6pm." }),
            s("card", { title: "Refund policy?", body: "Full refund 7+ days before event. 50% within 7 days." }),
            s("card", { title: "Can I rent gear?", body: "Limited monitors and peripherals — reserve in registration form." }),
          ],
        }),
      ]),
      innerPage("Contact", "/contact", brand, links, {
        heading: "Contact LAN Forge",
        description: "Venue hire, sponsorship, and tech support.",
      }, contactBlocks()),
    ],
  };
}
