import path from "path";
import chalk from "chalk";
import { readDir } from "./fs/readDir.mjs";
import { optimizeSVGs } from "./svg/optimizeSVGs.mjs";
import { buildSprite } from "./generate-sprite.mjs";

const defaultSettings = {
  disableClasses: false,
  includeSpriteInSrc: false,
};

export async function iconPipeline(config = defaultSettings) {
  let iconFiles;
  let iconMap;
  let outputFiles;
  let spriteFiles;
  let rawSVGData;
  const { srcDir, outputDir, disableClasses } = config;

  if (!srcDir || !outputDir) {
    throw new Error("Missing srcDir or outputDir");
  }

  try {
    const iconsFileNames = await readDir(srcDir);

    const icons = iconsFileNames.filter((ico) => {
      return ico.match(/\.svg$/) && !ico.match(/sprite/);
    });

    iconFiles = icons.map((ico) => {
      return path.join(srcDir, ico);
    });

    // optimize icons
    console.log(`◌ Optimizing SVGs...`);
    rawSVGData = await optimizeSVGs(iconFiles, outputDir);
    console.log();
    console.log(`${chalk.green("✓")} ${rawSVGData.length} SVGs optimized`);
    console.log();
    const outputFilesName = await readDir(outputDir);

    outputFiles = outputFilesName.map((name) => {
      return path.join(outputDir, name);
    });

    console.log("◌ Generating sprites...");
    // await buildSprite(outputDir, files, srcDir, config)
    spriteFiles = await buildSprite(outputFiles, config);
    console.log(`${chalk.green("✓")} Files "sprite.js" & "sprite.svg" created`);
    spriteFiles.forEach((file, i) => {
      const symbol = i === spriteFiles.length - 1 ? "└─" : "├─";
      console.log(`  ${symbol} Generated to ${file}`);
    });
    console.log();
  } catch (e) {
    throw new Error(e);
  }
  console.log(`${chalk.green("✓")} Finished processing Icons`);
  console.log();
  return {
    srcFiles: iconFiles,
    iconMap: iconMap,
    spriteFiles: spriteFiles,
    outputFiles: spriteFiles
      .filter((name) => {
        return name.indexOf(outputDir) > -1;
      })
      .concat(outputFiles),
  };
}
