import fs from "node:fs";
import path from "node:path";

const configPath = path.resolve(process.cwd(), ".vercel/output/config.json");

if (fs.existsSync(configPath)) {
  try {
    const raw = fs.readFileSync(configPath, "utf8");
    const config = JSON.parse(raw);

    // Remove any cron jobs so Vercel Hobby accounts don't reject the deployment
    if (config.crons) {
      delete config.crons;
      fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
      console.log("[postbuild-vercel] Successfully cleaned crons from .vercel/output/config.json for Vercel deployment.");
    }
  } catch (err) {
    console.error("[postbuild-vercel] Failed to adjust .vercel/output/config.json:", err);
  }
} else {
  console.warn(`[postbuild-vercel] Warning: ${configPath} does not exist.`);
}
