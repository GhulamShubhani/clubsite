import fs from "fs";
import path from "path";

const dir = path.join(process.cwd(), "src/templates/sites");
const keys: Record<string, string> = {
  "gaming-club.ts": "gaming-club",
  "esports-team.ts": "esports-team",
  "gaming-community.ts": "gaming-community",
  "gaming-cafe.ts": "gaming-cafe",
  "lan-center.ts": "lan-center",
  "tournament.ts": "tournament",
  "streamer.ts": "streamer",
  "cyber-cafe.ts": "cyber-cafe",
};

for (const [file, key] of Object.entries(keys)) {
  const fp = path.join(dir, file);
  let src = fs.readFileSync(fp, "utf8");
  src = src.replace(
    /import \{[\s\S]*?\} from "\.\.\/builders";/,
    `import {
  beginTemplate,
  contactBlocks,
  galleryBlock,
  homePage,
  innerPage,
  nav,
  s,
  type TemplateDefinition,
} from "../builders";
import { getTheme } from "../themes";`,
  );
  src = src.replace(/  resetSeq\(\);\n/, `  const theme = getTheme("${key}");\n  beginTemplate(theme);\n`);
  src = src.replace(/    theme: \{[\s\S]*?\n    \},\n/, "    theme,\n");
  fs.writeFileSync(fp, src);
  console.log("patched", file);
}
