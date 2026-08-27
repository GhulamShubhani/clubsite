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

export function gamingClubTemplate(): TemplateDefinition {
  const theme = getTheme("gaming-club");
  beginTemplate(theme);
  const brand = "Gaming Club";
  const links = nav(
    ["Home", "/"],
    ["Teams", "/teams"],
    ["Events", "/events"],
    ["Leaderboard", "/leaderboard"],
    ["Sponsors", "/sponsors"],
    ["About", "/about"],
    ["Join", "/join"],
    ["Contact", "/contact"],
  );

  return {
    key: "gaming-club",
    name: "Gaming Club",
    description:
      "Complete multi-game club website — teams, events, leaderboard, sponsors, and membership.",
    theme,
    navigation: links,
    pages: [
      homePage(
        brand,
        links,
        {
          heading: "Where competitors become teammates",
          subheading:
            "Train, compete, and grow with your local gaming club. Weekly scrims, open nights, and a thriving Discord community.",
          ctaLabel: "Join the club",
          ctaHref: "/join",
          imageUrl: STOCK.gamingHero,
        },
        [
          s("heading", { text: "This season at a glance", level: 2 }),
          s("grid", {
            columns: 3,
            children: [
              s("card", {
                title: "Weekly scrims",
                body: "Structured practice across Valorant, LoL, and fighting games every Tuesday & Thursday.",
                imageUrl: STOCK.setup,
              }),
              s("card", {
                title: "Open nights",
                body: "Casual queues, coaching clinics, and new-member onboarding every Friday.",
                imageUrl: STOCK.crowd,
              }),
              s("card", {
                title: "Club Discord",
                body: "1,200+ members — LFG channels, VOD reviews, and announcement feeds.",
                imageUrl: STOCK.teamPhoto,
              }),
            ],
          }),
          s("upcoming-matches", {
            heading: "Next matches",
            items: [
              { title: "Neon Vipers vs Aether", game: "Valorant", startsAt: "Fri 8pm" },
              { title: "Club Cup Qualifier", game: "Multi-title", startsAt: "Sat 2pm" },
            ],
          }),
          s("team-roster", {
            heading: "Featured roster",
            teamName: "Neon Vipers",
            items: [
              { name: "Kai", role: "IGL", gamertag: "KaiNV" },
              { name: "Ryn", role: "Duelist", gamertag: "RynNV" },
              { name: "Vex", role: "Controller", gamertag: "VexNV" },
              { name: "Mira", role: "Sentinel", gamertag: "MiraNV" },
              { name: "Jade", role: "Flex", gamertag: "JadeNV" },
            ],
          }),
          galleryBlock("Club highlights", [
            { imageUrl: STOCK.gamingHero, caption: "Season opener LAN" },
            { imageUrl: STOCK.crowd, caption: "Community night" },
            { imageUrl: STOCK.trophy, caption: "Regional cup win" },
          ]),
          s("discord-section", {
            heading: "Jump into Discord",
            description: "Find teammates, share VODs, and stay updated on events.",
            inviteUrl: "https://discord.gg/example",
            memberCount: "1.2k+",
          }),
          s("sponsor-section", {
            heading: "Proudly supported by",
            sponsors: [
              { name: "Pixel Gear", tier: "Gold" },
              { name: "Energy Rush", tier: "Silver" },
              { name: "GameHost ISP", tier: "Bronze" },
            ],
          }),
          s("registration-cta", {
            heading: "Ready to compete?",
            body: "Memberships open for the new season. All skill levels welcome.",
            buttonLabel: "Apply now",
            buttonHref: "/join",
          }),
        ],
        "© Gaming Club. Play fair. Play together.",
      ),
      innerPage("Teams", "/teams", brand, links, {
        heading: "Our teams",
        description: "Rostered squads competing in ranked ladders, local cups, and collegiate leagues.",
      }, [
        s("grid", {
          columns: 2,
          children: [
            s("team-card", {
              name: "Neon Vipers",
              game: "Valorant",
              tag: "NV",
              record: "18-4",
              description: "Premier tactical roster. Regional finalists 2025.",
            }),
            s("team-card", {
              name: "Aether",
              game: "League of Legends",
              tag: "AETH",
              record: "12-8",
              description: "Flex roster climbing the ranked ladder.",
            }),
            s("team-card", {
              name: "Iron Fist",
              game: "Street Fighter 6",
              tag: "IF",
              record: "9-2",
              description: "Fighting game specialists for local FGC events.",
            }),
            s("team-card", {
              name: "Nova Six",
              game: "CS2",
              tag: "N6",
              record: "14-6",
              description: "Tactical FPS squad with weekly scrims.",
            }),
          ],
        }),
        s("game-information", {
          heading: "Titles we compete in",
          game: "Multi-title",
          description: "Valorant, League of Legends, CS2, Street Fighter 6, and Rocket League.",
          platform: "PC & Console",
        }),
        s("button", { label: "Try out for a team", href: "/join", variant: "primary" }),
      ]),
      innerPage("Events", "/events", brand, links, {
        heading: "Upcoming events",
        description: "Tournaments, scrims, social nights, and community meetups.",
      }, [
        s("event-countdown", {
          heading: "Next major event",
          eventName: "Spring Invitational",
          targetDate: "2026-09-15T18:00:00Z",
          description: "Multi-title bracket with $500 prize pool.",
        }),
        s("match-schedule", {
          title: "Club calendar",
          matches: [
            { title: "Friday Night Fights", game: "Fighting Games", startsAt: "Every Fri 8pm" },
            { title: "Ranked Rumble", game: "FPS", startsAt: "Every Sat 2pm" },
            { title: "Movie & Meta Night", game: "Social", startsAt: "Wed 9pm" },
            { title: "Coach Clinic", game: "Valorant", startsAt: "Sun 11am" },
          ],
        }),
        s("tournament-card", {
          name: "Spring Invitational",
          game: "Multi-title",
          prizePool: "$500",
          status: "Registration open",
          description: "Open bracket for all club members. Double elimination.",
        }),
        s("match-results", {
          heading: "Recent results",
          items: [
            { title: "Neon Vipers 2–1 Rivals", game: "Valorant", score: "2-1" },
            { title: "Aether 3–0 Underdogs", game: "LoL", score: "3-0" },
          ],
        }),
      ]),
      innerPage("Leaderboard", "/leaderboard", brand, links, {
        heading: "Season leaderboard",
        description: "Points earned across scrims, tournaments, and community events.",
      }, [
        s("leaderboard", {
          heading: "Top players",
          items: [
            { rank: 1, name: "KaiNV", score: "2,450 pts" },
            { rank: 2, name: "RynNV", score: "2,180 pts" },
            { rank: 3, name: "VexAPX", score: "1,920 pts" },
            { rank: 4, name: "MiraNV", score: "1,740 pts" },
            { rank: 5, name: "ByteCuts", score: "1,650 pts" },
          ],
        }),
        s("player-statistics", {
          heading: "Club averages",
          items: [
            { label: "Active members", value: "186" },
            { label: "Events this month", value: "12" },
            { label: "Win rate (teams)", value: "62%" },
          ],
        }),
      ]),
      innerPage("Sponsors", "/sponsors", brand, links, {
        heading: "Partners & sponsors",
        description: "Our partners help us run events, upgrade gear, and keep membership affordable.",
      }, [
        s("sponsor-section", {
          heading: "Gold partners",
          sponsors: [
            { name: "Pixel Gear", tier: "Gold" },
            { name: "Energy Rush", tier: "Gold" },
          ],
        }),
        s("sponsor-section", {
          heading: "Silver & bronze",
          sponsors: [
            { name: "GameHost ISP", tier: "Silver" },
            { name: "Local Pizza Co", tier: "Bronze" },
          ],
        }),
        s("registration-cta", {
          heading: "Become a partner",
          body: "Reach gamers, students, and local esports fans. Packages from $200/season.",
          buttonLabel: "Partner with us",
          buttonHref: "/contact",
        }),
      ]),
      innerPage("About", "/about", brand, links, {
        heading: "About the club",
        description: "Founded in 2019, we are a community-first gaming club open to all skill levels.",
      }, [
        s("image", {
          imageUrl: STOCK.teamPhoto,
          alt: "Club members at LAN event",
          caption: "Our community at the 2025 season opener.",
        }),
        s("text", {
          text: "We run weekly scrims, host LAN nights, and send teams to regional tournaments. Whether you want to go pro or just find a squad for ranked, you belong here.",
        }),
        s("grid", {
          columns: 3,
          children: [
            s("card", { title: "186 members", body: "Active across 6 game titles." }),
            s("card", { title: "48 events/year", body: "Scrims, cups, and social nights." }),
            s("card", { title: "4 team rosters", body: "Competitive and academy squads." }),
          ],
        }),
      ]),
      innerPage("Join", "/join", brand, links, {
        heading: "Become a member",
        description: "Tell us your main games, rank, and availability. All skill levels welcome.",
      }, [
        s("registration-cta", {
          heading: "Apply for membership",
          body: "Season fee: $25/year. Includes event access, Discord roles, and team tryouts.",
          buttonLabel: "Start application",
          buttonHref: "#form",
        }),
        s("contact-form", {
          heading: "Membership application",
          description: "Gamertag, main games, and why you want to join.",
          submitLabel: "Submit application",
        }),
        s("text", {
          text: "All members must follow the club code of conduct. Toxicity, cheating, or harassment results in removal.",
        }),
      ]),
      innerPage("Contact", "/contact", brand, links, {
        heading: "Contact us",
        description: "General inquiries, partnerships, press, or venue questions.",
      }, contactBlocks()),
    ],
  };
}
