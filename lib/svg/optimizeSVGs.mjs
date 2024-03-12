import { readFile } from "../fs/readFile.mjs";
import { basename, join } from "path";
import { optimize } from "svgo";
import { writeFile } from "../fs/writeFile.mjs";
import { svgoConfig } from "./config.mjs";

export async function optimizeSVGs(fileArray, outputDir) {
  const promises = fileArray.map(async (svgPath, i) => {
    const originalCode = await readFile(svgPath, "utf-8");
    if (!originalCode) {
      console.log(
        `Warning ${svgPath} is an empty file. Double check that icon`
      );
      return;
    }

    const outputPath = join(outputDir, basename(svgPath));
    const svgContents = await readFile(svgPath);
    const SVGOSettings = svgoConfig();

    const result = optimize(svgContents, SVGOSettings);
    console.log(result.data, outputPath);
    await writeFile(outputPath, result.data);
    return result.data;
  });

  return await Promise.all(promises);
}
