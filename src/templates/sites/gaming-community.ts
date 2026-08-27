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

export function gamingCommunityTemplate(): TemplateDefinition {
  const theme = getTheme("gaming-community");
  beginTemplate(theme);
  const brand = "Pulse Community";
  const links = nav(
    ["Home", "/"],
    ["Community", "/community"],
    ["Events", "/events"],
    ["LFG", "/lfg"],
    ["Creators", "/creators"],
    ["About", "/about"],
    ["Contact", "/contact"],
  );

  return {
    key: "gaming-community",
    name: "Gaming Community",
    description:
      "Discord-first community hub — LFG boards, events, creator spotlights, and onboarding.",
    theme,
    navigation: links,
    pages: [
      homePage(
        brand,
        links,
        {
          heading: "Find your people. Find your queue.",
          subheading:
            "A friendly multi-game community for every rank — 10,000+ members across Discord, events, and creator collabs.",
          ctaLabel: "Join Discord",
          ctaHref: "/community",
          imageUrl: STOCK.communityHero,
        },
        [
          s("discord-section", {
            heading: "10k+ members strong",
            description: "Voice channels, LFG bots, and game-specific hubs.",
            inviteUrl: "https://discord.gg/pulse",
            memberCount: "10k+",
          }),
          s("grid", {
            columns: 3,
            children: [
              s("card", {
                title: "LFG boards",
                body: "Find teammates in minutes with rank filters and role tags.",
                imageUrl: STOCK.gamingHero,
              }),
              s("card", {
                title: "Coach nights",
                body: "Weekly VOD reviews from Immortal+ players.",
                imageUrl: STOCK.stream,
              }),
              s("card", {
                title: "Creator collabs",
                body: "Monthly streams featuring community members.",
                imageUrl: STOCK.crowd,
              }),
            ],
          }),
          s("match-schedule", {
            title: "This week's events",
            matches: [
              { title: "Community custom lobbies", game: "FPS", startsAt: "Sat noon" },
              { title: "Movie & chill", game: "Social", startsAt: "Wed 9pm" },
              { title: "Ranked stack night", game: "Valorant", startsAt: "Fri 8pm" },
            ],
          }),
          galleryBlock("Community moments", [
            { imageUrl: STOCK.communityHero, caption: "Game night" },
            { imageUrl: STOCK.crowd, caption: "Watch party" },
            { imageUrl: STOCK.teamPhoto, caption: "Meetup IRL" },
          ]),
          s("social-links", {
            heading: "Find us everywhere",
            items: [
              { label: "Discord", href: "https://discord.gg/pulse" },
              { label: "Twitch", href: "https://twitch.tv/pulsecommunity" },
              { label: "Reddit", href: "https://reddit.com" },
            ],
          }),
        ],
        "Built for the community.",
      ),
      innerPage("Community", "/community", brand, links, {
        heading: "Community hubs",
        description: "Dedicated channels for every title, rank, and play style.",
      }, [
        s("discord-section", {
          heading: "Join the server",
          description: "Verified members get access to LFG, coaching, and event pings.",
          inviteUrl: "https://discord.gg/pulse",
          memberCount: "10k+",
        }),
        s("grid", {
          columns: 2,
          children: [
            s("card", { title: "FPS hub", body: "Valorant, CS2, Apex — all ranks welcome." }),
            s("card", { title: "MOBA hub", body: "LoL and Dota stacks every evening." }),
            s("card", { title: "Cozy games", body: "Stardew, Minecraft, and party games." }),
            s("card", { title: "Competitive", body: "Ranked-only channels with verification." }),
          ],
        }),
        s("text", { text: "Respect, inclusivity, and good vibes required. Zero tolerance for harassment." }),
      ]),
      innerPage("Events", "/events", brand, links, {
        heading: "Community events",
        description: "Weekly customs, watch parties, and seasonal tournaments.",
      }, [
        s("event-countdown", {
          heading: "Next community cup",
          eventName: "Pulse Cup #12",
          targetDate: "2026-09-01T17:00:00Z",
          description: "Open bracket — sign up in Discord.",
        }),
        s("match-schedule", {
          title: "Event calendar",
          matches: [
            { title: "Movie night", game: "Social", startsAt: "Wed 9pm" },
            { title: "Custom lobbies", game: "FPS", startsAt: "Sat noon" },
            { title: "Pulse Cup #12", game: "Valorant", startsAt: "Sep 1" },
          ],
        }),
        s("tournament-card", {
          name: "Pulse Cup #12",
          game: "Valorant",
          prizePool: "Discord Nitro + roles",
          status: "Sign-ups open",
        }),
      ]),
      innerPage("LFG", "/lfg", brand, links, {
        heading: "Looking for group",
        description: "Stack up faster with our LFG channels and weekly pairing nights.",
      }, [
        s("text", {
          text: "Post your rank, role, and availability in Discord #lfg. Moderators run pairing sessions every Friday at 8pm.",
        }),
        s("grid", {
          columns: 3,
          children: [
            s("card", { title: "Valorant stacks", body: "Iron to Radiant — duos and 5-stacks." }),
            s("card", { title: "CS2 premade", body: "Faceit levels 1–10." }),
            s("card", { title: "Casual co-op", body: "Helldivers, Deep Rock, and more." }),
          ],
        }),
        s("registration-cta", {
          heading: "Need a duo partner?",
          body: "Join Discord and ping @LFG-Bot with your game and rank.",
          buttonLabel: "Open Discord",
          buttonHref: "https://discord.gg/pulse",
        }),
      ]),
      innerPage("Creators", "/creators", brand, links, {
        heading: "Creator spotlight",
        description: "Streamers, editors, and artists from the Pulse community.",
      }, [
        s("twitch-stream", {
          heading: "Featured streamers",
          channel: "pulsecommunity",
          embedUrl: "https://twitch.tv/pulsecommunity",
        }),
        s("youtube-stream", {
          heading: "Highlights on YouTube",
          embedUrl: "https://youtube.com/@pulsecommunity",
          description: "Weekly montages and event recaps.",
        }),
        s("grid", {
          columns: 2,
          children: [
            s("player-card", {
              name: "Nova",
              role: "Streamer",
              gamertag: "NovaPlays",
              description: "Variety streams Mon–Fri.",
              imageUrl: STOCK.stream,
            }),
            s("player-card", {
              name: "Byte",
              role: "Editor",
              gamertag: "ByteCuts",
              description: "Community montage creator.",
            }),
          ],
        }),
      ]),
      innerPage("About", "/about", brand, links, {
        heading: "About Pulse",
        description: "Community-run since 2018. Not affiliated with any game publisher.",
      }, [
        s("text", {
          text: "Pulse started as a small Discord for friends who wanted better teammates. Today we're one of the largest open gaming communities in the region, run entirely by volunteers.",
        }),
        s("player-statistics", {
          heading: "By the numbers",
          items: [
            { label: "Members", value: "10,200" },
            { label: "Weekly events", value: "8" },
            { label: "Moderators", value: "24" },
          ],
        }),
      ]),
      innerPage("Contact", "/contact", brand, links, {
        heading: "Contact moderators",
        description: "Reports, partnership ideas, or moderator applications.",
      }, contactBlocks()),
    ],
  };
}
