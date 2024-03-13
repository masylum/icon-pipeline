import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import { buildSprite } from "./buildSprite.mjs";

export async function iconPipeline({ srcDir }) {
  let icons;

  try {
    const iconsFileNames = await fs.readdir(srcDir);

    icons = iconsFileNames.filter(
      (ico) => ico.match(/\.svg$/) && !ico.match(/sprite/)
    );

    console.log("◌ Generating sprite...");
    await buildSprite(icons, srcDir);

    console.log(`${chalk.green("✓")} File "sprite.svg" created`);
  } catch (e) {
    throw new Error(e);
  }

  return { icons };
}
