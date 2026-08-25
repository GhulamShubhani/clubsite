import type { PageContent, PageSection } from "@/lib/page-schema";

export type TemplateNavItem = { label: string; href: string };

export type TemplatePageDef = {
  title: string;
  path: string;
  content: PageContent;
};

export type TemplateDefinition = {
  key: string;
  name: string;
  description: string;
  theme: Record<string, unknown>;
  navigation: TemplateNavItem[];
  pages: TemplatePageDef[];
};

export type TemplateConfig = {
  theme: Record<string, unknown>;
  navigation: TemplateNavItem[];
  pages: TemplatePageDef[];
};

let _seq = 0;
function s(
  type: string,
  props: Record<string, unknown>,
  extra?: Partial<Omit<PageSection, "id" | "type" | "props">>,
): PageSection {
  _seq += 1;
  return { id: `${type}-${_seq}`, type, props, ...extra };
}

function page(
  title: string,
  path: string,
  sections: PageSection[],
): TemplatePageDef {
  return { title, path, content: { sections } };
}

function nav(...items: [string, string][]): TemplateNavItem[] {
  return items.map(([label, href]) => ({ label, href }));
}

function shell(
  brand: string,
  links: TemplateNavItem[],
  hero: { heading: string; subheading: string; ctaLabel?: string; ctaHref?: string },
  mid: PageSection[],
  footerNote: string,
): PageSection[] {
  return [
    s("navbar", { brand, links }),
    s("hero", {
      heading: hero.heading,
      subheading: hero.subheading,
      ctaLabel: hero.ctaLabel ?? "Get Started",
      ctaHref: hero.ctaHref ?? "/join",
    }),
    ...mid,
    s("footer", {
      brand,
      links,
      note: footerNote,
    }),
  ];
}

const gamingClub: TemplateDefinition = {
  key: "gaming-club",
  name: "Gaming Club",
  description: "Classic multi-game club site with teams, events, and community hubs.",
  theme: {
    primary: "#0ea5e9",
    secondary: "#111827",
    accent: "#22c55e",
    background: "#0b1220",
    surface: "#111827",
    text: "#f8fafc",
    fontHeading: "Orbitron",
    fontBody: "Inter",
  },
  navigation: nav(
    ["Home", "/"],
    ["Teams", "/teams"],
    ["Events", "/events"],
    ["Sponsors", "/sponsors"],
    ["Join", "/join"],
  ),
  pages: [
    page(
      "Home",
      "/",
      shell(
        "Gaming Club",
        nav(["Home", "/"], ["Teams", "/teams"], ["Events", "/events"], ["Join", "/join"]),
        {
          heading: "Where competitors become teammates",
          subheading: "Train, compete, and grow with your local gaming club.",
          ctaLabel: "Join the club",
          ctaHref: "/join",
        },
        [
          s("heading", { text: "This season", level: 2 }),
          s("grid", {
            columns: 3,
            children: [
              s("card", {
                title: "Weekly scrims",
                body: "Structured practice across our main titles.",
              }),
              s("card", {
                title: "Open nights",
                body: "Casual queues and coaching for new members.",
              }),
              s("card", {
                title: "Club Discord",
                body: "LFG, VODs, and announcement channels.",
              }),
            ],
          }),
          s("discord-section", {
            heading: "Jump into Discord",
            inviteUrl: "https://discord.gg/example",
            memberCount: "1.2k+",
          }),
          s("registration-cta", {
            heading: "Ready to compete?",
            body: "Memberships open for the new season.",
            buttonLabel: "Apply now",
            buttonHref: "/join",
          }),
        ],
        "© Gaming Club. Play fair. Play together.",
      ),
    ),
    page("Teams", "/teams", [
      s("navbar", {
        brand: "Gaming Club",
        links: nav(["Home", "/"], ["Teams", "/teams"], ["Events", "/events"]),
      }),
      s("heading", { text: "Our teams", level: 1 }),
      s("text", {
        text: "Rostered squads competing in ranked ladders and local cups.",
      }),
      s("grid", {
        columns: 2,
        children: [
          s("team-card", {
            name: "Neon Vipers",
            game: "Valorant",
            tag: "NV",
            record: "18-4",
          }),
          s("team-card", {
            name: "Aether",
            game: "League of Legends",
            tag: "AETH",
            record: "12-8",
          }),
        ],
      }),
      s("footer", { brand: "Gaming Club", note: "Teams page" }),
    ]),
    page("Events", "/events", [
      s("navbar", { brand: "Gaming Club", links: nav(["Home", "/"], ["Events", "/events"]) }),
      s("heading", { text: "Upcoming events", level: 1 }),
      s("match-schedule", {
        title: "Club calendar",
        matches: [
          { title: "Friday Night Fights", game: "Fighting Games", startsAt: "Fri 8pm" },
          { title: "Ranked Rumble", game: "FPS", startsAt: "Sat 2pm" },
        ],
      }),
      s("tournament-card", {
        name: "Spring Invitational",
        game: "Multi-title",
        prizePool: "$500",
        status: "Open",
      }),
      s("footer", { brand: "Gaming Club", note: "Events" }),
    ]),
    page("Sponsors", "/sponsors", [
      s("navbar", { brand: "Gaming Club", links: nav(["Home", "/"], ["Sponsors", "/sponsors"]) }),
      s("heading", { text: "Partners", level: 1 }),
      s("sponsor-section", {
        heading: "Proudly supported by",
        sponsors: [
          { name: "Pixel Gear", tier: "Gold" },
          { name: "Energy Rush", tier: "Silver" },
        ],
      }),
      s("footer", { brand: "Gaming Club", note: "Sponsors" }),
    ]),
    page("Join", "/join", [
      s("navbar", { brand: "Gaming Club", links: nav(["Home", "/"], ["Join", "/join"]) }),
      s("registration-cta", {
        heading: "Become a member",
        body: "Tell us your main games and availability.",
        buttonLabel: "Start application",
        buttonHref: "#form",
      }),
      s("text", {
        text: "All skill levels welcome. Must follow the club code of conduct.",
      }),
      s("footer", { brand: "Gaming Club", note: "Join" }),
    ]),
  ],
};

const esportsTeam: TemplateDefinition = {
  key: "esports-team",
  name: "Esports Team",
  description: "Pro/semi-pro roster site with match schedule, players, and sponsors.",
  theme: {
    primary: "#ef4444",
    secondary: "#0f172a",
    accent: "#fbbf24",
    background: "#020617",
    surface: "#0f172a",
    text: "#f1f5f9",
    fontHeading: "Rajdhani",
    fontBody: "Inter",
  },
  navigation: nav(
    ["Home", "/"],
    ["Roster", "/roster"],
    ["Matches", "/matches"],
    ["Sponsors", "/sponsors"],
  ),
  pages: [
    page(
      "Home",
      "/",
      shell(
        "Team Apex",
        nav(["Home", "/"], ["Roster", "/roster"], ["Matches", "/matches"]),
        {
          heading: "Compete. Dominate. Repeat.",
          subheading: "Official home of Team Apex across premier titles.",
          ctaLabel: "View roster",
          ctaHref: "/roster",
        },
        [
          s("match-schedule", {
            title: "Next fixtures",
            matches: [
              { title: "Apex vs Nova", game: "CS2", startsAt: "Thu 7pm" },
              { title: "Regional Finals", game: "Valorant", startsAt: "Sun 4pm" },
            ],
          }),
          s("sponsor-section", {
            heading: "Official partners",
            sponsors: [{ name: "HyperGear", tier: "Title" }],
          }),
          s("twitch-stream", {
            heading: "Watch us live",
            channel: "teamapex",
            embedUrl: "https://twitch.tv/teamapex",
          }),
        ],
        "© Team Apex Esports",
      ),
    ),
    page("Roster", "/roster", [
      s("navbar", { brand: "Team Apex", links: nav(["Home", "/"], ["Roster", "/roster"]) }),
      s("heading", { text: "Roster", level: 1 }),
      s("grid", {
        columns: 3,
        children: [
          s("player-card", { name: "Kai", role: "IGL", gamertag: "KaiAPX" }),
          s("player-card", { name: "Ryn", role: "AWPer", gamertag: "RynAPX" }),
          s("player-card", { name: "Vex", role: "Entry", gamertag: "VexAPX" }),
        ],
      }),
      s("footer", { brand: "Team Apex", note: "Roster" }),
    ]),
    page("Matches", "/matches", [
      s("navbar", { brand: "Team Apex", links: nav(["Home", "/"], ["Matches", "/matches"]) }),
      s("heading", { text: "Match center", level: 1 }),
      s("match-schedule", {
        title: "Season schedule",
        matches: [
          { title: "Week 1", game: "CS2", startsAt: "Mar 2" },
          { title: "Week 2", game: "CS2", startsAt: "Mar 9" },
        ],
      }),
      s("button", { label: "Full bracket", href: "/matches#bracket" }),
      s("footer", { brand: "Team Apex", note: "Matches" }),
    ]),
    page("Sponsors", "/sponsors", [
      s("navbar", { brand: "Team Apex", links: nav(["Home", "/"], ["Sponsors", "/sponsors"]) }),
      s("sponsor-section", {
        heading: "Sponsors & partners",
        sponsors: [
          { name: "HyperGear", tier: "Title" },
          { name: "FuelUp", tier: "Kit" },
        ],
      }),
      s("footer", { brand: "Team Apex", note: "Sponsors" }),
    ]),
  ],
};

const gamingCommunity: TemplateDefinition = {
  key: "gaming-community",
  name: "Gaming Community",
  description: "Discord-first community hub with events, LFG, and creator spotlights.",
  theme: {
    primary: "#8b5cf6",
    secondary: "#1e1b4b",
    accent: "#34d399",
    background: "#0f0a1a",
    surface: "#1e1b4b",
    text: "#ede9fe",
    fontHeading: "Space Grotesk",
    fontBody: "DM Sans",
  },
  navigation: nav(
    ["Home", "/"],
    ["Community", "/community"],
    ["Events", "/events"],
    ["Creators", "/creators"],
  ),
  pages: [
    page(
      "Home",
      "/",
      shell(
        "Pulse Community",
        nav(["Home", "/"], ["Community", "/community"], ["Events", "/events"]),
        {
          heading: "Find your people. Find your queue.",
          subheading: "A friendly multi-game community for every rank.",
          ctaLabel: "Join Discord",
          ctaHref: "/community",
        },
        [
          s("discord-section", {
            heading: "10k+ members online vibes",
            inviteUrl: "https://discord.gg/pulse",
          }),
          s("grid", {
            columns: 2,
            children: [
              s("card", { title: "LFG boards", body: "Find teammates in minutes." }),
              s("card", { title: "Coach nights", body: "VOD reviews from veterans." }),
            ],
          }),
        ],
        "Built for the community.",
      ),
    ),
    page("Community", "/community", [
      s("navbar", { brand: "Pulse", links: nav(["Home", "/"], ["Community", "/community"]) }),
      s("heading", { text: "Community hubs", level: 1 }),
      s("discord-section", {
        heading: "Channels for every title",
        inviteUrl: "https://discord.gg/pulse",
      }),
      s("text", { text: "Respect, inclusivity, and good vibes required." }),
      s("footer", { brand: "Pulse", note: "Community" }),
    ]),
    page("Events", "/events", [
      s("navbar", { brand: "Pulse", links: nav(["Home", "/"], ["Events", "/events"]) }),
      s("heading", { text: "Community events", level: 1 }),
      s("match-schedule", {
        title: "This week",
        matches: [
          { title: "Movie night", game: "Social", startsAt: "Wed 9pm" },
          { title: "Custom lobbies", game: "FPS", startsAt: "Sat noon" },
        ],
      }),
      s("footer", { brand: "Pulse", note: "Events" }),
    ]),
    page("Creators", "/creators", [
      s("navbar", { brand: "Pulse", links: nav(["Home", "/"], ["Creators", "/creators"]) }),
      s("heading", { text: "Creator spotlight", level: 1 }),
      s("twitch-stream", {
        heading: "Featured streamers",
        channel: "pulsecommunity",
      }),
      s("grid", {
        columns: 2,
        children: [
          s("player-card", { name: "Nova", role: "Streamer", gamertag: "NovaPlays" }),
          s("player-card", { name: "Byte", role: "Editor", gamertag: "ByteCuts" }),
        ],
      }),
      s("footer", { brand: "Pulse", note: "Creators" }),
    ]),
  ],
};

const gamingCafe: TemplateDefinition = {
  key: "gaming-cafe",
  name: "Gaming Cafe",
  description: "PC cafe marketing site with rates, machines, and booking CTA.",
  theme: {
    primary: "#06b6d4",
    secondary: "#164e63",
    accent: "#f97316",
    background: "#083344",
    surface: "#0e7490",
    text: "#ecfeff",
    fontHeading: "Exo 2",
    fontBody: "Nunito",
  },
  navigation: nav(
    ["Home", "/"],
    ["Rates", "/rates"],
    ["PCs", "/pcs"],
    ["Book", "/book"],
  ),
  pages: [
    page(
      "Home",
      "/",
      shell(
        "Neon Cafe",
        nav(["Home", "/"], ["Rates", "/rates"], ["Book", "/book"]),
        {
          heading: "High refresh. Low ping. Great coffee.",
          subheading: "Premium PCs, snacks, and nightly tournaments downtown.",
          ctaLabel: "Book a seat",
          ctaHref: "/book",
        },
        [
          s("grid", {
            columns: 3,
            children: [
              s("card", { title: "240Hz rigs", body: "RTX-class machines ready to go." }),
              s("card", { title: "Food & drinks", body: "Fuel up between matches." }),
              s("card", { title: "Private rooms", body: "Perfect for teams and VODs." }),
            ],
          }),
          s("registration-cta", {
            heading: "First hour free on signup",
            body: "New members get a welcome session.",
            buttonLabel: "Claim offer",
            buttonHref: "/book",
          }),
        ],
        "Neon Cafe — open late every day.",
      ),
    ),
    page("Rates", "/rates", [
      s("navbar", { brand: "Neon Cafe", links: nav(["Home", "/"], ["Rates", "/rates"]) }),
      s("heading", { text: "Hourly & membership rates", level: 1 }),
      s("grid", {
        columns: 3,
        children: [
          s("card", { title: "Walk-in", body: "$6 / hour" }),
          s("card", { title: "Night pack", body: "$20 / 4 hours" }),
          s("card", { title: "Member", body: "$40 / month + discounts" }),
        ],
      }),
      s("footer", { brand: "Neon Cafe", note: "Rates" }),
    ]),
    page("PCs", "/pcs", [
      s("navbar", { brand: "Neon Cafe", links: nav(["Home", "/"], ["PCs", "/pcs"]) }),
      s("heading", { text: "Our setups", level: 1 }),
      s("text", { text: "Competitive specs across 40 stations plus VIP booths." }),
      s("grid", {
        columns: 2,
        children: [
          s("card", { title: "Standard", body: "1440p · 240Hz · RTX 4070" }),
          s("card", { title: "VIP", body: "4K · 360Hz · RTX 4090" }),
        ],
      }),
      s("footer", { brand: "Neon Cafe", note: "PCs" }),
    ]),
    page("Book", "/book", [
      s("navbar", { brand: "Neon Cafe", links: nav(["Home", "/"], ["Book", "/book"]) }),
      s("registration-cta", {
        heading: "Reserve your station",
        body: "Pick a time slot and walk in ready to play.",
        buttonLabel: "Book now",
        buttonHref: "#booking",
      }),
      s("footer", { brand: "Neon Cafe", note: "Book" }),
    ]),
  ],
};

const lanCenter: TemplateDefinition = {
  key: "lan-center",
  name: "LAN Center",
  description: "LAN party venue with seating maps, BYOC info, and tournament weekends.",
  theme: {
    primary: "#84cc16",
    secondary: "#14532d",
    accent: "#eab308",
    background: "#052e16",
    surface: "#14532d",
    text: "#f7fee7",
    fontHeading: "Chakra Petch",
    fontBody: "IBM Plex Sans",
  },
  navigation: nav(
    ["Home", "/"],
    ["Venue", "/venue"],
    ["Events", "/events"],
    ["BYOC", "/byoc"],
  ),
  pages: [
    page(
      "Home",
      "/",
      shell(
        "LAN Forge",
        nav(["Home", "/"], ["Venue", "/venue"], ["Events", "/events"]),
        {
          heading: "Bring your own PC. Leave with legends.",
          subheading: "Powered tables, gigabit switches, and weekend cups.",
          ctaLabel: "See events",
          ctaHref: "/events",
        },
        [
          s("tournament-card", {
            name: "Forge Cup",
            game: "Multi",
            prizePool: "Gear + cash",
            status: "This weekend",
          }),
          s("grid", {
            columns: 2,
            children: [
              s("card", { title: "120 seats", body: "Dedicated power & networking." }),
              s("card", { title: "Overnight", body: "Sleeping zone and showers on-site." }),
            ],
          }),
        ],
        "LAN Forge — plug in and play.",
      ),
    ),
    page("Venue", "/venue", [
      s("navbar", { brand: "LAN Forge", links: nav(["Home", "/"], ["Venue", "/venue"]) }),
      s("heading", { text: "The venue", level: 1 }),
      s("text", { text: "Climate-controlled hall with redundant uplink and on-site tech." }),
      s("card", { title: "Floor map", body: "Sections A–D with VIP rows near stage." }),
      s("footer", { brand: "LAN Forge", note: "Venue" }),
    ]),
    page("Events", "/events", [
      s("navbar", { brand: "LAN Forge", links: nav(["Home", "/"], ["Events", "/events"]) }),
      s("heading", { text: "LAN weekends", level: 1 }),
      s("match-schedule", {
        title: "Upcoming LANs",
        matches: [
          { title: "Forge Cup Spring", game: "Multi", startsAt: "Apr 12" },
          { title: "Retro LAN", game: "Classics", startsAt: "May 3" },
        ],
      }),
      s("footer", { brand: "LAN Forge", note: "Events" }),
    ]),
    page("BYOC", "/byoc", [
      s("navbar", { brand: "LAN Forge", links: nav(["Home", "/"], ["BYOC", "/byoc"]) }),
      s("heading", { text: "BYOC checklist", level: 1 }),
      s("text", {
        text: "Bring PC, monitor, cables, headset. We provide power strips and Ethernet.",
      }),
      s("registration-cta", {
        heading: "Reserve a seat",
        body: "Seats sell out — book early.",
        buttonLabel: "Register",
        buttonHref: "#register",
      }),
      s("footer", { brand: "LAN Forge", note: "BYOC" }),
    ]),
  ],
};

const tournament: TemplateDefinition = {
  key: "tournament",
  name: "Tournament",
  description: "Single-event tournament landing with brackets, rules, and registration.",
  theme: {
    primary: "#f59e0b",
    secondary: "#78350f",
    accent: "#dc2626",
    background: "#1c1917",
    surface: "#292524",
    text: "#fafaf9",
    fontHeading: "Bebas Neue",
    fontBody: "Source Sans 3",
  },
  navigation: nav(
    ["Home", "/"],
    ["Bracket", "/bracket"],
    ["Rules", "/rules"],
    ["Register", "/register"],
  ),
  pages: [
    page(
      "Home",
      "/",
      shell(
        "Crown Cup",
        nav(["Home", "/"], ["Bracket", "/bracket"], ["Register", "/register"]),
        {
          heading: "Crown Cup 2026",
          subheading: "Open bracket. Cash prizes. Streamed finals.",
          ctaLabel: "Register team",
          ctaHref: "/register",
        },
        [
          s("tournament-card", {
            name: "Crown Cup",
            game: "Valorant",
            prizePool: "$10,000",
            status: "Registration open",
          }),
          s("sponsor-section", {
            heading: "Presented by",
            sponsors: [{ name: "Arena Energy", tier: "Presenting" }],
          }),
          s("twitch-stream", {
            heading: "Official stream",
            channel: "crowncup",
          }),
        ],
        "Crown Cup — one weekend. One champion.",
      ),
    ),
    page("Bracket", "/bracket", [
      s("navbar", { brand: "Crown Cup", links: nav(["Home", "/"], ["Bracket", "/bracket"]) }),
      s("heading", { text: "Bracket", level: 1 }),
      s("match-schedule", {
        title: "Round of 16",
        matches: [
          { title: "Seed 1 vs Seed 16", game: "Valorant", startsAt: "Sat 10am" },
          { title: "Seed 8 vs Seed 9", game: "Valorant", startsAt: "Sat 11am" },
        ],
      }),
      s("footer", { brand: "Crown Cup", note: "Bracket" }),
    ]),
    page("Rules", "/rules", [
      s("navbar", { brand: "Crown Cup", links: nav(["Home", "/"], ["Rules", "/rules"]) }),
      s("heading", { text: "Rules & format", level: 1 }),
      s("text", {
        text: "Double elimination. Standard competitive settings. Check-in closes 30 minutes before first match.",
      }),
      s("card", {
        title: "Code of conduct",
        body: "Toxicity, cheating, or no-shows result in disqualification.",
      }),
      s("footer", { brand: "Crown Cup", note: "Rules" }),
    ]),
    page("Register", "/register", [
      s("navbar", { brand: "Crown Cup", links: nav(["Home", "/"], ["Register", "/register"]) }),
      s("registration-cta", {
        heading: "Enter your roster",
        body: "5 starters + 1 sub. Captain email required.",
        buttonLabel: "Submit entry",
        buttonHref: "#form",
      }),
      s("footer", { brand: "Crown Cup", note: "Register" }),
    ]),
  ],
};

const streamer: TemplateDefinition = {
  key: "streamer",
  name: "Streamer",
  description: "Personal streamer / creator site with schedule, VODs, and merch CTA.",
  theme: {
    primary: "#ec4899",
    secondary: "#831843",
    accent: "#a78bfa",
    background: "#1a0a14",
    surface: "#3b0f2e",
    text: "#fdf2f8",
    fontHeading: "Poppins",
    fontBody: "Nunito Sans",
  },
  navigation: nav(
    ["Home", "/"],
    ["Schedule", "/schedule"],
    ["About", "/about"],
    ["Links", "/links"],
  ),
  pages: [
    page(
      "Home",
      "/",
      shell(
        "LunaPlays",
        nav(["Home", "/"], ["Schedule", "/schedule"], ["Links", "/links"]),
        {
          heading: "LunaPlays live",
          subheading: "Variety streams, ranked climbs, and cozy chats.",
          ctaLabel: "Watch on Twitch",
          ctaHref: "/links",
        },
        [
          s("twitch-stream", {
            heading: "Live now",
            channel: "lunaplays",
            embedUrl: "https://twitch.tv/lunaplays",
          }),
          s("discord-section", {
            heading: "Community Discord",
            inviteUrl: "https://discord.gg/lunaplays",
          }),
          s("button", { label: "Support on Patreon", href: "https://patreon.com/example" }),
        ],
        "Thanks for hanging out.",
      ),
    ),
    page("Schedule", "/schedule", [
      s("navbar", { brand: "LunaPlays", links: nav(["Home", "/"], ["Schedule", "/schedule"]) }),
      s("heading", { text: "Stream schedule", level: 1 }),
      s("match-schedule", {
        title: "This week",
        matches: [
          { title: "Ranked grind", game: "Valorant", startsAt: "Mon 7pm" },
          { title: "Just chatting", game: "IRL", startsAt: "Wed 8pm" },
          { title: "Collab night", game: "Variety", startsAt: "Fri 6pm" },
        ],
      }),
      s("footer", { brand: "LunaPlays", note: "Schedule" }),
    ]),
    page("About", "/about", [
      s("navbar", { brand: "LunaPlays", links: nav(["Home", "/"], ["About", "/about"]) }),
      s("heading", { text: "About Luna", level: 1 }),
      s("player-card", {
        name: "Luna",
        role: "Variety streamer",
        gamertag: "LunaPlays",
      }),
      s("text", {
        text: "Former competitive player turned full-time creator. Dog content guaranteed.",
      }),
      s("footer", { brand: "LunaPlays", note: "About" }),
    ]),
    page("Links", "/links", [
      s("navbar", { brand: "LunaPlays", links: nav(["Home", "/"], ["Links", "/links"]) }),
      s("heading", { text: "All the links", level: 1 }),
      s("grid", {
        columns: 1,
        children: [
          s("button", { label: "Twitch", href: "https://twitch.tv/lunaplays" }),
          s("button", { label: "YouTube", href: "https://youtube.com/@lunaplays" }),
          s("button", { label: "Discord", href: "https://discord.gg/lunaplays" }),
        ],
      }),
      s("footer", { brand: "LunaPlays", note: "Links" }),
    ]),
  ],
};

const cyberCafe: TemplateDefinition = {
  key: "cyber-cafe",
  name: "Cyber Cafe",
  description: "Internet / cyber cafe site with services, pricing, and memberships.",
  theme: {
    primary: "#14b8a6",
    secondary: "#134e4a",
    accent: "#38bdf8",
    background: "#042f2e",
    surface: "#115e59",
    text: "#f0fdfa",
    fontHeading: "Titillium Web",
    fontBody: "Open Sans",
  },
  navigation: nav(
    ["Home", "/"],
    ["Services", "/services"],
    ["Pricing", "/pricing"],
    ["Membership", "/membership"],
  ),
  pages: [
    page(
      "Home",
      "/",
      shell(
        "ByteBar Cafe",
        nav(["Home", "/"], ["Services", "/services"], ["Membership", "/membership"]),
        {
          heading: "Work. Play. Connect.",
          subheading: "Fast PCs, printing, and late-night gaming downtown.",
          ctaLabel: "See pricing",
          ctaHref: "/pricing",
        },
        [
          s("grid", {
            columns: 3,
            children: [
              s("card", { title: "Gaming PCs", body: "Esports-ready stations." }),
              s("card", { title: "Office suite", body: "Docs, print, scan." }),
              s("card", { title: "Wi‑Fi lounge", body: "Bring your laptop." }),
            ],
          }),
          s("sponsor-section", {
            heading: "Local partners",
            sponsors: [{ name: "City Net ISP", tier: "Infra" }],
          }),
        ],
        "ByteBar Cafe — open 24/7.",
      ),
    ),
    page("Services", "/services", [
      s("navbar", {
        brand: "ByteBar",
        links: nav(["Home", "/"], ["Services", "/services"]),
      }),
      s("heading", { text: "Services", level: 1 }),
      s("grid", {
        columns: 2,
        children: [
          s("card", { title: "Gaming sessions", body: "Hourly or packs." }),
          s("card", { title: "Print & copy", body: "Color and B&W." }),
          s("card", { title: "Private booths", body: "Quiet work or duo queues." }),
          s("card", { title: "Events", body: "Host your mini-tournament." }),
        ],
      }),
      s("footer", { brand: "ByteBar", note: "Services" }),
    ]),
    page("Pricing", "/pricing", [
      s("navbar", { brand: "ByteBar", links: nav(["Home", "/"], ["Pricing", "/pricing"]) }),
      s("heading", { text: "Pricing", level: 1 }),
      s("grid", {
        columns: 3,
        children: [
          s("card", { title: "Standard", body: "$4 / hour" }),
          s("card", { title: "Premium", body: "$7 / hour" }),
          s("card", { title: "Day pass", body: "$25 all day" }),
        ],
      }),
      s("footer", { brand: "ByteBar", note: "Pricing" }),
    ]),
    page("Membership", "/membership", [
      s("navbar", {
        brand: "ByteBar",
        links: nav(["Home", "/"], ["Membership", "/membership"]),
      }),
      s("registration-cta", {
        heading: "Member perks",
        body: "Priority seats, free drinks on weekends, and discounted hours.",
        buttonLabel: "Join membership",
        buttonHref: "#join",
      }),
      s("discord-section", {
        heading: "Members Discord",
        inviteUrl: "https://discord.gg/bytebar",
      }),
      s("footer", { brand: "ByteBar", note: "Membership" }),
    ]),
  ],
};

export const TEMPLATE_CATALOG: TemplateDefinition[] = [
  gamingClub,
  esportsTeam,
  gamingCommunity,
  gamingCafe,
  lanCenter,
  tournament,
  streamer,
  cyberCafe,
];

export const TEMPLATE_KEYS = TEMPLATE_CATALOG.map((t) => t.key) as readonly string[];

export function getCatalogTemplate(key: string): TemplateDefinition | undefined {
  return TEMPLATE_CATALOG.find((t) => t.key === key);
}

export function toTemplateConfig(def: TemplateDefinition): TemplateConfig {
  return {
    theme: def.theme,
    navigation: def.navigation,
    pages: def.pages,
  };
}
