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

export function streamerTemplate(): TemplateDefinition {
  const theme = getTheme("streamer");
  beginTemplate(theme);
  const brand = "LunaPlays";
  const links = nav(
    ["Home", "/"],
    ["Schedule", "/schedule"],
    ["VODs", "/vods"],
    ["About", "/about"],
    ["Merch", "/merch"],
    ["Links", "/links"],
    ["Contact", "/contact"],
  );

  return {
    key: "streamer",
    name: "Streamer",
    description:
      "Full creator site — live embed, schedule, VODs, about, merch, social links, and contact.",
    theme,
    navigation: links,
    pages: [
      homePage(
        brand,
        links,
        {
          heading: "LunaPlays live",
          subheading:
            "Variety streams, ranked climbs, cozy chats, and collabs — Mon–Fri 7pm, Sat community games.",
          ctaLabel: "Watch on Twitch",
          ctaHref: "/links",
          imageUrl: STOCK.streamerHero,
        },
        [
          s("twitch-stream", {
            heading: "Live now",
            channel: "lunaplays",
            embedUrl: "https://twitch.tv/lunaplays",
            description: "Drop a follow for stream notifications!",
          }),
          s("upcoming-matches", {
            heading: "This week on stream",
            items: [
              { title: "Ranked grind", game: "Valorant", startsAt: "Mon 7pm" },
              { title: "Just chatting", game: "IRL", startsAt: "Wed 8pm" },
              { title: "Collab night", game: "Variety", startsAt: "Fri 6pm" },
            ],
          }),
          s("discord-section", {
            heading: "Community Discord",
            description: "Clips, memes, LFG, and sub-only channels.",
            inviteUrl: "https://discord.gg/lunaplays",
            memberCount: "4.5k",
          }),
          galleryBlock("Stream highlights", [
            { imageUrl: STOCK.streamerHero, caption: "500 sub celebration" },
            { imageUrl: STOCK.stream, caption: "Setup tour" },
            { imageUrl: STOCK.crowd, caption: "Con meetup" },
          ]),
          s("youtube-stream", {
            heading: "Latest VOD",
            embedUrl: "https://youtube.com/@lunaplays",
            description: "Full streams uploaded within 24 hours.",
          }),
          s("social-links", {
            heading: "Support Luna",
            items: [
              { label: "Patreon", href: "https://patreon.com/lunaplays" },
              { label: "Ko-fi", href: "https://ko-fi.com/lunaplays" },
              { label: "Merch", href: "/merch" },
            ],
          }),
        ],
        "Thanks for hanging out.",
      ),
      innerPage("Schedule", "/schedule", brand, links, {
        heading: "Stream schedule",
        description: "All times in EST. Schedule may shift — follow Discord for updates.",
      }, [
        s("match-schedule", {
          title: "Weekly schedule",
          matches: [
            { title: "Ranked grind", game: "Valorant", startsAt: "Mon 7pm" },
            { title: "Indie showcase", game: "Variety", startsAt: "Tue 7pm" },
            { title: "Just chatting", game: "IRL", startsAt: "Wed 8pm" },
            { title: "Community games", game: "Multi", startsAt: "Thu 7pm" },
            { title: "Collab night", game: "Variety", startsAt: "Fri 6pm" },
            { title: "Long stream", game: "Special", startsAt: "Sat 2pm" },
          ],
        }),
        s("event-countdown", {
          heading: "Next stream",
          eventName: "Ranked grind",
          targetDate: "2026-09-01T23:00:00Z",
        }),
      ]),
      innerPage("VODs", "/vods", brand, links, {
        heading: "VODs & clips",
        description: "Catch up on past streams and best moments.",
      }, [
        s("youtube-stream", {
          heading: "YouTube archive",
          videoId: "",
          embedUrl: "https://youtube.com/@lunaplays",
          description: "Full VODs, highlights, and tutorials.",
        }),
        s("grid", {
          columns: 3,
          children: [
            s("card", { title: "Road to Immortal ep. 42", body: "Valorant · 4h 12m · Aug 24" }),
            s("card", { title: "Cozy Stardew co-op", body: "Stardew · 3h 05m · Aug 22" }),
            s("card", { title: "Subathon highlights", body: "Variety · 12m · Aug 20" }),
          ],
        }),
        s("gaming-gallery", {
          heading: "Clip wall",
          items: [
            { imageUrl: STOCK.stream, caption: "Insane clutch" },
            { imageUrl: STOCK.streamerHero, caption: "Chat plays Pokemon" },
          ],
        }),
      ]),
      innerPage("About", "/about", brand, links, {
        heading: "About Luna",
        description: "Former comp player turned full-time creator.",
      }, [
        s("player-card", {
          name: "Luna",
          role: "Variety streamer",
          gamertag: "LunaPlays",
          description: "Diamond Valorant · Partner since 2023",
          imageUrl: STOCK.streamerHero,
        }),
        s("text", {
          text: "I started streaming in 2020 after leaving a semi-pro Valorant team. Now I focus on ranked climbs, indie discoveries, and building the coziest chat on Twitch. Dog cam always on.",
        }),
        s("player-statistics", {
          heading: "Channel stats",
          items: [
            { label: "Followers", value: "48k" },
            { label: "Avg. viewers", value: "320" },
            { label: "Stream hours", value: "2,400+" },
          ],
        }),
      ]),
      innerPage("Merch", "/merch", brand, links, {
        heading: "Merch store",
        description: "Hoodies, stickers, and limited drops.",
      }, [
        s("grid", {
          columns: 3,
          children: [
            s("card", {
              title: "Luna hoodie",
              body: "$45 · Black · S–XXL",
              imageUrl: STOCK.streamerHero,
            }),
            s("card", { title: "Emote sticker pack", body: "$8 · 6 vinyl stickers" }),
            s("card", { title: "Desk mat", body: "$30 · 900×400mm · Limited run" }),
          ],
        }),
        s("button", { label: "Visit store", href: "https://shop.example.com", variant: "primary" }),
      ]),
      innerPage("Links", "/links", brand, links, {
        heading: "All the links",
        description: "One page for every platform.",
      }, [
        s("social-links", {
          heading: "Platforms",
          items: [
            { label: "Twitch", href: "https://twitch.tv/lunaplays" },
            { label: "YouTube", href: "https://youtube.com/@lunaplays" },
            { label: "Discord", href: "https://discord.gg/lunaplays" },
            { label: "X / Twitter", href: "https://x.com/lunaplays" },
            { label: "TikTok", href: "https://tiktok.com/@lunaplays" },
            { label: "Instagram", href: "https://instagram.com/lunaplays" },
          ],
        }),
        s("grid", {
          columns: 1,
          children: [
            s("button", { label: "Watch live on Twitch", href: "https://twitch.tv/lunaplays", variant: "primary" }),
            s("button", { label: "Join Discord", href: "https://discord.gg/lunaplays" }),
            s("button", { label: "Support on Patreon", href: "https://patreon.com/lunaplays" }),
          ],
        }),
      ]),
      innerPage("Contact", "/contact", brand, links, {
        heading: "Business inquiries",
        description: "Sponsorships, collabs, and press.",
      }, contactBlocks("Contact LunaPlays", "For business inquiries only — use Discord for fan mail.")),
    ],
  };
}
