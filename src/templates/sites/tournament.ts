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

export function tournamentTemplate(): TemplateDefinition {
  const theme = getTheme("tournament");
  beginTemplate(theme);
  const brand = "Crown Cup";
  const links = nav(
    ["Home", "/"],
    ["Bracket", "/bracket"],
    ["Rules", "/rules"],
    ["Prizes", "/prizes"],
    ["Schedule", "/schedule"],
    ["Register", "/register"],
    ["Contact", "/contact"],
  );

  return {
    key: "tournament",
    name: "Tournament",
    description:
      "Complete tournament microsite — bracket, rules, prize pool, countdown, stream, and team registration.",
    theme,
    navigation: links,
    pages: [
      homePage(
        brand,
        links,
        {
          heading: "Crown Cup 2026",
          subheading:
            "Open Valorant bracket · $10,000 prize pool · Streamed finals · September 12–14 downtown arena.",
          ctaLabel: "Register team",
          ctaHref: "/register",
          imageUrl: STOCK.tournamentHero,
        },
        [
          s("event-countdown", {
            heading: "Tournament starts in",
            eventName: "Crown Cup 2026",
            targetDate: "2026-09-12T10:00:00Z",
            description: "Check-in opens 8am day one.",
          }),
          s("tournament-card", {
            name: "Crown Cup 2026",
            game: "Valorant",
            prizePool: "$10,000",
            status: "Registration open",
            description: "32 teams · Double elimination · LAN finals",
          }),
          s("prize-pool", {
            heading: "Prize pool breakdown",
            amount: "$10,000",
            description: "Paid within 14 days to verified team captains.",
            items: [
              { place: "1st", amount: "$5,000" },
              { place: "2nd", amount: "$2,500" },
              { place: "3rd", amount: "$1,500" },
              { place: "4th", amount: "$1,000" },
            ],
          }),
          s("sponsor-section", {
            heading: "Presented by",
            sponsors: [
              { name: "Arena Energy", tier: "Presenting" },
              { name: "HyperGear", tier: "Official gear" },
            ],
          }),
          s("twitch-stream", {
            heading: "Official stream",
            channel: "crowncup",
            embedUrl: "https://twitch.tv/crowncup",
            description: "All playoff matches broadcast live with casters.",
          }),
          galleryBlock("Previous Crown Cups", [
            { imageUrl: STOCK.tournamentHero, caption: "2025 finals stage" },
            { imageUrl: STOCK.crowd, caption: "Arena crowd" },
            { imageUrl: STOCK.trophy, caption: "Champions 2025" },
          ]),
          s("registration-cta", {
            heading: "32 slots remaining: 18",
            body: "Entry fee $150/team. Captain must be 18+.",
            buttonLabel: "Register now",
            buttonHref: "/register",
          }),
        ],
        "Crown Cup — one weekend. One champion.",
      ),
      innerPage("Bracket", "/bracket", brand, links, {
        heading: "Tournament bracket",
        description: "Double elimination — updates live during event weekend.",
      }, [
        s("tournament-bracket", {
          heading: "Upper bracket — Round of 16",
          description: "Best of 3 · Patch 9.02",
          items: [
            { label: "UB QF1", teams: "Seed 1 vs Seed 16" },
            { label: "UB QF2", teams: "Seed 8 vs Seed 9" },
            { label: "UB QF3", teams: "Seed 4 vs Seed 5" },
            { label: "UB QF4", teams: "Seed 12 vs Seed 13" },
            { label: "UB SF1", teams: "TBD" },
            { label: "UB SF2", teams: "TBD" },
            { label: "Grand Final", teams: "TBD" },
          ],
        }),
        s("match-schedule", {
          title: "Round of 16 schedule",
          matches: [
            { title: "Seed 1 vs Seed 16", game: "Valorant", startsAt: "Sat 10am" },
            { title: "Seed 8 vs Seed 9", game: "Valorant", startsAt: "Sat 11:30am" },
            { title: "Seed 4 vs Seed 5", game: "Valorant", startsAt: "Sat 1pm" },
          ],
        }),
      ]),
      innerPage("Rules", "/rules", brand, links, {
        heading: "Rules & format",
        description: "Competitive integrity standards for all participants.",
      }, [
        s("text", {
          text: "Double elimination bracket. All matches Bo3 until grand final (Bo5). Standard competitive settings. Agent map vetoes follow official rulebook v3.2.",
        }),
        s("grid", {
          columns: 2,
          children: [
            s("card", {
              title: "Roster rules",
              body: "5 starters + 1 sub. Roster lock 24h before event. Substitutions require admin approval.",
            }),
            s("card", {
              title: "Check-in",
              body: "All players must check in 30 minutes before first match. No-show = forfeit.",
            }),
            s("card", {
              title: "Equipment",
              body: "BYOC or arena PCs available. No macros, scripts, or unauthorized software.",
            }),
            s("card", {
              title: "Code of conduct",
              body: "Toxicity, cheating, or match fixing = instant DQ and ban from future events.",
            }),
          ],
        }),
        s("button", { label: "Download full rulebook (PDF)", href: "/contact", variant: "primary" }),
      ]),
      innerPage("Prizes", "/prizes", brand, links, {
        heading: "Prizes & awards",
        description: "Cash prizes, MVP award, and sponsor gear.",
      }, [
        s("prize-pool", {
          heading: "Cash prizes",
          amount: "$10,000",
          items: [
            { place: "1st", amount: "$5,000" },
            { place: "2nd", amount: "$2,500" },
            { place: "3rd", amount: "$1,500" },
            { place: "4th", amount: "$1,000" },
          ],
        }),
        s("grid", {
          columns: 2,
          children: [
            s("card", { title: "MVP award", body: "HyperGear keyboard + $250 · Voted by casters" }),
            s("card", { title: "All-star match", body: "Top 10 players by ACS in showcase match" }),
          ],
        }),
      ]),
      innerPage("Schedule", "/schedule", brand, links, {
        heading: "Event schedule",
        description: "Three days of open bracket, playoffs, and grand final.",
      }, [
        s("match-schedule", {
          title: "Weekend schedule",
          matches: [
            { title: "Check-in & tech test", game: "All teams", startsAt: "Fri 4–8pm" },
            { title: "Group / Ro16", game: "Valorant", startsAt: "Sat 10am–8pm" },
            { title: "Playoffs", game: "Valorant", startsAt: "Sun 10am–4pm" },
            { title: "Grand final", game: "Valorant", startsAt: "Sun 6pm" },
          ],
        }),
        s("event-countdown", {
          heading: "First match",
          eventName: "Round of 16",
          targetDate: "2026-09-12T10:00:00Z",
        }),
      ]),
      innerPage("Register", "/register", brand, links, {
        heading: "Team registration",
        description: "5 starters + 1 sub. Captain email and payment required.",
      }, [
        s("registration-cta", {
          heading: "Entry fee: $150/team",
          body: "Includes 3-day pass, arena PC option, and team photo.",
          buttonLabel: "Pay & register",
          buttonHref: "#form",
        }),
        s("contact-form", {
          heading: "Team registration form",
          description: "Team name, captain contact, roster tags, and payment confirmation.",
          submitLabel: "Submit entry",
        }),
        s("text", { text: "Refund policy: full refund if event cancelled. No refunds within 7 days of start." }),
      ]),
      innerPage("Contact", "/contact", brand, links, {
        heading: "Tournament support",
        description: "Registration help, press, and partnership inquiries.",
      }, contactBlocks("Contact Crown Cup")),
    ],
  };
}
