import { v4 as uuidv4 } from "uuid";
import type { PageSection } from "@/lib/page-schema";

export type ComponentCategory = "standard" | "gaming";

export type ComponentDefinition = {
  type: string;
  label: string;
  category: ComponentCategory;
  defaultProps: Record<string, unknown>;
  defaultStyles: Record<string, unknown>;
};

function def(
  type: string,
  label: string,
  category: ComponentCategory,
  defaultProps: Record<string, unknown> = {},
  defaultStyles: Record<string, unknown> = {},
): ComponentDefinition {
  return { type, label, category, defaultProps, defaultStyles };
}

const pad = { padding: "1.5rem" } as const;

export const COMPONENT_REGISTRY: Record<string, ComponentDefinition> = {
  // —— Standard ——
  navbar: def(
    "navbar",
    "Navbar",
    "standard",
    {
      brand: "Club Name",
      logoUrl: "",
      links: [
        { label: "Home", href: "/" },
        { label: "Teams", href: "/teams" },
        { label: "Events", href: "/events" },
      ],
      ctaLabel: "Join",
      ctaHref: "/join",
      sticky: true,
      height: "4rem",
      mobileMenu: true,
    },
    { padding: "1rem 1.5rem", background: "#18181b", color: "#fafafa" },
  ),
  header: def(
    "header",
    "Header",
    "standard",
    { heading: "Page title", description: "Short intro for this page." },
    pad,
  ),
  hero: def(
    "hero",
    "Hero",
    "standard",
    {
      layout: "centered",
      heading: "Welcome to the club",
      subheading: "Compete, train, and grow together.",
      description: "Compete, train, and grow together.",
      ctaLabel: "Get started",
      ctaHref: "/join",
      buttons: [{ label: "Get started", href: "/join" }],
      imageUrl: "",
      videoUrl: "",
      slides: [
        {
          imageUrl: "",
          heading: "Welcome to the club",
          description: "Compete, train, and grow together.",
          ctaLabel: "Get started",
          ctaHref: "/join",
        },
        {
          imageUrl: "",
          heading: "Join our next event",
          description: "Tournaments, scrims, and community nights.",
          ctaLabel: "See events",
          ctaHref: "/events",
        },
      ],
      carouselIntervalMs: 5000,
    },
    { padding: "4rem 1.5rem", background: "#09090b", color: "#fafafa" },
  ),
  heading: def(
    "heading",
    "Heading",
    "standard",
    { text: "Section heading", heading: "Section heading", level: 2 },
    { padding: "0.5rem 0" },
  ),
  text: def(
    "text",
    "Text",
    "standard",
    {
      text: "Add your body copy here.",
      description: "Add your body copy here.",
    },
    { padding: "0.5rem 0" },
  ),
  image: def(
    "image",
    "Image",
    "standard",
    { imageUrl: "", alt: "Image", caption: "" },
    pad,
  ),
  video: def(
    "video",
    "Video",
    "standard",
    { videoUrl: "", heading: "Watch", posterUrl: "" },
    pad,
  ),
  button: def(
    "button",
    "Button",
    "standard",
    { label: "Click me", href: "#", variant: "primary" },
    { padding: "0.5rem 0" },
  ),
  card: def(
    "card",
    "Card",
    "standard",
    {
      title: "Card title",
      heading: "Card title",
      body: "Card description.",
      description: "Card description.",
      imageUrl: "",
    },
    { padding: "1.25rem", background: "#f4f4f5", borderRadius: "0.5rem" },
  ),
  grid: def(
    "grid",
    "Grid",
    "standard",
    {
      columns: 3,
      heading: "Grid",
      items: [
        { title: "Item 1", body: "Description" },
        { title: "Item 2", body: "Description" },
        { title: "Item 3", body: "Description" },
      ],
    },
    pad,
  ),
  gallery: def(
    "gallery",
    "Gallery",
    "standard",
    {
      heading: "Gallery",
      items: [
        { imageUrl: "", caption: "Shot 1" },
        { imageUrl: "", caption: "Shot 2" },
        { imageUrl: "", caption: "Shot 3" },
      ],
    },
    pad,
  ),
  divider: def("divider", "Divider", "standard", {}, { padding: "0.5rem 0" }),
  spacer: def(
    "spacer",
    "Spacer",
    "standard",
    { height: "2rem" },
    { height: "2rem" },
  ),
  footer: def(
    "footer",
    "Footer",
    "standard",
    {
      brand: "Club Name",
      note: "© Club. All rights reserved.",
      links: [
        { label: "Home", href: "/" },
        { label: "Contact", href: "/contact" },
      ],
    },
    { padding: "2rem 1.5rem", background: "#18181b", color: "#a1a1aa" },
  ),
  "social-links": def(
    "social-links",
    "Social Links",
    "standard",
    {
      heading: "Follow us",
      items: [
        { label: "Discord", href: "#" },
        { label: "Twitch", href: "#" },
        { label: "X", href: "#" },
      ],
    },
    pad,
  ),
  "contact-form": def(
    "contact-form",
    "Contact Form",
    "standard",
    {
      heading: "Contact us",
      description: "We usually reply within 24 hours.",
      submitLabel: "Send message",
    },
    pad,
  ),

  // —— Gaming ——
  "tournament-card": def(
    "tournament-card",
    "Tournament Card",
    "gaming",
    {
      name: "Spring Cup",
      heading: "Spring Cup",
      game: "Valorant",
      prizePool: "$1,000",
      status: "Open",
      description: "Open registration for all skill levels.",
    },
    { ...pad, background: "#f4f4f5", borderRadius: "0.5rem" },
  ),
  "match-card": def(
    "match-card",
    "Match Card",
    "gaming",
    {
      heading: "Team A vs Team B",
      title: "Team A vs Team B",
      game: "CS2",
      startsAt: "Sat 7pm",
      status: "Upcoming",
    },
    { ...pad, background: "#f4f4f5", borderRadius: "0.5rem" },
  ),
  "team-card": def(
    "team-card",
    "Team Card",
    "gaming",
    {
      name: "Neon Vipers",
      heading: "Neon Vipers",
      game: "Valorant",
      tag: "NV",
      record: "12-4",
      description: "Main roster",
    },
    { ...pad, background: "#f4f4f5", borderRadius: "0.5rem" },
  ),
  "player-card": def(
    "player-card",
    "Player Card",
    "gaming",
    {
      name: "Player",
      heading: "Player",
      role: "IGL",
      gamertag: "PlayerOne",
      description: "",
      imageUrl: "",
    },
    { ...pad, background: "#f4f4f5", borderRadius: "0.5rem" },
  ),
  "team-roster": def(
    "team-roster",
    "Team Roster",
    "gaming",
    {
      heading: "Roster",
      teamName: "Main Squad",
      items: [
        { name: "Kai", role: "IGL", gamertag: "Kai" },
        { name: "Ryn", role: "Entry", gamertag: "Ryn" },
      ],
    },
    pad,
  ),
  leaderboard: def(
    "leaderboard",
    "Leaderboard",
    "gaming",
    {
      heading: "Leaderboard",
      items: [
        { rank: 1, name: "Alpha", score: "2400" },
        { rank: 2, name: "Beta", score: "2200" },
        { rank: 3, name: "Gamma", score: "2100" },
      ],
    },
    pad,
  ),
  "match-schedule": def(
    "match-schedule",
    "Match Schedule",
    "gaming",
    {
      title: "Upcoming matches",
      heading: "Upcoming matches",
      matches: [
        { title: "Friday Night Fights", game: "FPS", startsAt: "Fri 8pm" },
        { title: "Cup Finals", game: "MOBA", startsAt: "Sun 4pm" },
      ],
      items: [],
    },
    pad,
  ),
  "tournament-bracket": def(
    "tournament-bracket",
    "Tournament Bracket",
    "gaming",
    {
      heading: "Bracket",
      description: "Single elimination",
      items: [
        { label: "QF1", teams: "A vs B" },
        { label: "QF2", teams: "C vs D" },
        { label: "SF1", teams: "TBD" },
        { label: "Final", teams: "TBD" },
      ],
    },
    pad,
  ),
  "upcoming-matches": def(
    "upcoming-matches",
    "Upcoming Matches",
    "gaming",
    {
      heading: "Next up",
      items: [
        { title: "Home vs Away", game: "CS2", startsAt: "Thu 7pm" },
      ],
    },
    pad,
  ),
  "match-results": def(
    "match-results",
    "Match Results",
    "gaming",
    {
      heading: "Recent results",
      items: [
        { title: "Us 2–0 Them", game: "Valorant", score: "2-0" },
      ],
    },
    pad,
  ),
  "player-statistics": def(
    "player-statistics",
    "Player Statistics",
    "gaming",
    {
      heading: "Player stats",
      items: [
        { label: "K/D", value: "1.24" },
        { label: "Win rate", value: "58%" },
        { label: "Hours", value: "420" },
      ],
    },
    pad,
  ),
  "game-information": def(
    "game-information",
    "Game Information",
    "gaming",
    {
      heading: "Game info",
      game: "Valorant",
      description: "Competitive 5v5 tactical shooter.",
      platform: "PC",
    },
    pad,
  ),
  "prize-pool": def(
    "prize-pool",
    "Prize Pool",
    "gaming",
    {
      heading: "Prize pool",
      amount: "$5,000",
      description: "Distributed across top 8.",
      items: [
        { place: "1st", amount: "$2,500" },
        { place: "2nd", amount: "$1,500" },
        { place: "3rd", amount: "$1,000" },
      ],
    },
    pad,
  ),
  "event-countdown": def(
    "event-countdown",
    "Event Countdown",
    "gaming",
    {
      heading: "Starts in",
      eventName: "Season Kickoff",
      targetDate: "2026-12-01T18:00:00Z",
      description: "Mark your calendar.",
    },
    pad,
  ),
  "sponsor-section": def(
    "sponsor-section",
    "Sponsor Section",
    "gaming",
    {
      heading: "Proudly supported by",
      sponsors: [
        { name: "Pixel Gear", tier: "Gold" },
        { name: "Energy Rush", tier: "Silver" },
      ],
      items: [],
    },
    pad,
  ),
  "discord-section": def(
    "discord-section",
    "Discord Section",
    "gaming",
    {
      heading: "Join Discord",
      description: "LFG, VODs, and announcements.",
      inviteUrl: "https://discord.gg/example",
      memberCount: "1k+",
    },
    { ...pad, background: "#5865F2", color: "#ffffff", borderRadius: "0.5rem" },
  ),
  "twitch-stream": def(
    "twitch-stream",
    "Twitch Stream",
    "gaming",
    {
      heading: "Watch live",
      channel: "clubchannel",
      embedUrl: "https://twitch.tv/clubchannel",
      description: "",
    },
    pad,
  ),
  "youtube-stream": def(
    "youtube-stream",
    "YouTube Stream",
    "gaming",
    {
      heading: "On YouTube",
      videoId: "",
      embedUrl: "https://youtube.com/@channel",
      description: "",
    },
    pad,
  ),
  "gaming-gallery": def(
    "gaming-gallery",
    "Gaming Gallery",
    "gaming",
    {
      heading: "Highlights",
      items: [
        { imageUrl: "", caption: "LAN night" },
        { imageUrl: "", caption: "Finals" },
      ],
    },
    pad,
  ),
  "game-logo": def(
    "game-logo",
    "Game Logo",
    "gaming",
    { heading: "Featured title", game: "Valorant", imageUrl: "", alt: "Game logo" },
    pad,
  ),
  "registration-cta": def(
    "registration-cta",
    "Registration CTA",
    "gaming",
    {
      heading: "Ready to compete?",
      body: "Memberships open for the new season.",
      description: "Memberships open for the new season.",
      buttonLabel: "Apply now",
      buttonHref: "/join",
      buttons: [{ label: "Apply now", href: "/join" }],
    },
    { ...pad, background: "#18181b", color: "#fafafa", borderRadius: "0.5rem" },
  ),
};

export function createSection(type: string): PageSection {
  const defn = COMPONENT_REGISTRY[type];
  if (!defn) {
    return {
      id: uuidv4(),
      type,
      props: {},
      styles: {},
    };
  }
  return {
    id: uuidv4(),
    type: defn.type,
    props: structuredClone(defn.defaultProps),
    styles: structuredClone(defn.defaultStyles),
  };
}

export function listComponentsByCategory(category: ComponentCategory) {
  return Object.values(COMPONENT_REGISTRY).filter((c) => c.category === category);
}
