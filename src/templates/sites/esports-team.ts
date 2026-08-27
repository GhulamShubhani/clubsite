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

export function esportsTeamTemplate(): TemplateDefinition {
  const theme = getTheme("esports-team");
  beginTemplate(theme);
  const brand = "Team Apex";
  const links = nav(
    ["Home", "/"],
    ["Roster", "/roster"],
    ["Matches", "/matches"],
    ["Stats", "/stats"],
    ["Sponsors", "/sponsors"],
    ["About", "/about"],
    ["Contact", "/contact"],
  );

  return {
    key: "esports-team",
    name: "Esports Team",
    description:
      "Full pro team website — roster, match center, stats, live stream, sponsors, and media kit.",
    theme,
    navigation: links,
    pages: [
      homePage(
        brand,
        links,
        {
          heading: "Compete. Dominate. Repeat.",
          subheading:
            "Official home of Team Apex — premier CS2 and Valorant roster competing across regional and international circuits.",
          ctaLabel: "View roster",
          ctaHref: "/roster",
          imageUrl: STOCK.esportsHero,
        },
        [
          s("upcoming-matches", {
            heading: "Next fixtures",
            items: [
              { title: "Apex vs Nova", game: "CS2", startsAt: "Thu 7pm CET" },
              { title: "Regional Finals", game: "Valorant", startsAt: "Sun 4pm CET" },
            ],
          }),
          s("match-results", {
            heading: "Latest results",
            items: [
              { title: "Apex 2–0 Storm", game: "CS2", score: "2-0" },
              { title: "Apex 1–2 Pulse", game: "Valorant", score: "1-2" },
            ],
          }),
          s("team-roster", {
            heading: "Starting five",
            teamName: "CS2 Roster",
            items: [
              { name: "Kai", role: "IGL", gamertag: "KaiAPX" },
              { name: "Ryn", role: "AWPer", gamertag: "RynAPX" },
              { name: "Vex", role: "Entry", gamertag: "VexAPX" },
              { name: "Mira", role: "Support", gamertag: "MiraAPX" },
              { name: "Jade", role: "Lurker", gamertag: "JadeAPX" },
            ],
          }),
          s("twitch-stream", {
            heading: "Watch us live",
            channel: "teamapex",
            embedUrl: "https://twitch.tv/teamapex",
            description: "Official broadcast for match days and scrims.",
          }),
          galleryBlock("Behind the scenes", [
            { imageUrl: STOCK.esportsHero, caption: "Bootcamp week" },
            { imageUrl: STOCK.crowd, caption: "Stage finals" },
            { imageUrl: STOCK.trophy, caption: "Championship trophy" },
          ]),
          s("sponsor-section", {
            heading: "Official partners",
            sponsors: [
              { name: "HyperGear", tier: "Title" },
              { name: "FuelUp", tier: "Kit" },
              { name: "GameSense Analytics", tier: "Tech" },
            ],
          }),
        ],
        "© Team Apex Esports",
      ),
      innerPage("Roster", "/roster", brand, links, {
        heading: "Team roster",
        description: "Meet the players, staff, and substitutes behind Team Apex.",
      }, [
        s("grid", {
          columns: 3,
          children: [
            s("player-card", {
              name: "Kai",
              role: "IGL / Captain",
              gamertag: "KaiAPX",
              description: "3x regional champion. Shot-caller since 2022.",
              imageUrl: STOCK.setup,
            }),
            s("player-card", {
              name: "Ryn",
              role: "AWPer",
              gamertag: "RynAPX",
              description: "Top-10 national AWPer rating 2025.",
              imageUrl: STOCK.keyboard,
            }),
            s("player-card", {
              name: "Vex",
              role: "Entry fragger",
              gamertag: "VexAPX",
              description: "Aggressive opener with 1.18 entry success rate.",
            }),
            s("player-card", {
              name: "Mira",
              role: "Support",
              gamertag: "MiraAPX",
              description: "Utility specialist and clutch anchor.",
            }),
            s("player-card", {
              name: "Jade",
              role: "Lurker",
              gamertag: "JadeAPX",
              description: "Map control and late-round closer.",
            }),
            s("player-card", {
              name: "Coach Lee",
              role: "Head coach",
              gamertag: "LeeAPX",
              description: "Former pro IGL. VOD analyst and strategist.",
            }),
          ],
        }),
        s("player-statistics", {
          heading: "Team stats (season)",
          items: [
            { label: "Win rate", value: "68%" },
            { label: "Avg. round diff", value: "+3.2" },
            { label: "Maps played", value: "47" },
          ],
        }),
      ]),
      innerPage("Matches", "/matches", brand, links, {
        heading: "Match center",
        description: "Full season schedule, brackets, and VOD links.",
      }, [
        s("match-schedule", {
          title: "Season schedule",
          matches: [
            { title: "Week 1 — Apex vs Storm", game: "CS2", startsAt: "Mar 2" },
            { title: "Week 2 — Apex vs Pulse", game: "CS2", startsAt: "Mar 9" },
            { title: "Week 3 — Apex vs Nova", game: "CS2", startsAt: "Mar 16" },
            { title: "Regional Finals", game: "Valorant", startsAt: "Apr 5" },
          ],
        }),
        s("match-card", {
          title: "Apex vs Nova",
          game: "CS2",
          startsAt: "Thu 7pm",
          status: "Upcoming",
        }),
        s("match-card", {
          title: "Apex vs Storm",
          game: "CS2",
          startsAt: "Completed",
          status: "W 2-0",
        }),
        s("button", { label: "Download full calendar", href: "/contact", variant: "primary" }),
      ]),
      innerPage("Stats", "/stats", brand, links, {
        heading: "Player statistics",
        description: "Individual and team performance metrics for the current split.",
      }, [
        s("player-statistics", {
          heading: "KaiAPX",
          items: [
            { label: "K/D", value: "1.24" },
            { label: "ADR", value: "82.4" },
            { label: "Clutch %", value: "34%" },
          ],
        }),
        s("player-statistics", {
          heading: "RynAPX",
          items: [
            { label: "K/D", value: "1.31" },
            { label: "AWP kills/round", value: "0.42" },
            { label: "Opening duel %", value: "58%" },
          ],
        }),
        s("leaderboard", {
          heading: "Team leaderboard",
          items: [
            { rank: 1, name: "RynAPX", score: "1.31 K/D" },
            { rank: 2, name: "KaiAPX", score: "1.24 K/D" },
            { rank: 3, name: "VexAPX", score: "1.18 K/D" },
          ],
        }),
      ]),
      innerPage("Sponsors", "/sponsors", brand, links, {
        heading: "Sponsors & partners",
        description: "Thank you to the brands that power our journey.",
      }, [
        s("sponsor-section", {
          heading: "Title sponsor",
          sponsors: [{ name: "HyperGear", tier: "Title" }],
        }),
        s("sponsor-section", {
          heading: "Kit & tech partners",
          sponsors: [
            { name: "FuelUp", tier: "Kit" },
            { name: "GameSense Analytics", tier: "Tech" },
          ],
        }),
        s("registration-cta", {
          heading: "Partner with Team Apex",
          body: "Logo placement, social campaigns, and event activations. Media kit available on request.",
          buttonLabel: "Request media kit",
          buttonHref: "/contact",
        }),
      ]),
      innerPage("About", "/about", brand, links, {
        heading: "Our story",
        description: "From local LAN winners to regional contenders.",
      }, [
        s("image", { imageUrl: STOCK.esportsHero, alt: "Team Apex on stage", caption: "Regional finals 2025" }),
        s("text", {
          text: "Team Apex was founded in 2020 by five friends who met at a local cyber cafe. Today we compete in CS2 and Valorant with a full staff, bootcamp facility, and growing fan base.",
        }),
        s("game-logo", { heading: "Primary titles", game: "CS2 & Valorant", imageUrl: STOCK.setup, alt: "Game titles" }),
      ]),
      innerPage("Contact", "/contact", brand, links, {
        heading: "Contact & bookings",
        description: "Press, sponsorship, and appearance requests.",
      }, contactBlocks("Contact Team Apex", "Business inquiries and media requests welcome.")),
    ],
  };
}
