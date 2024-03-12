import { readFile } from "../fs/readFile.mjs";
import { basename, join } from "path";
import { optimize } from "./optimize.mjs";

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
    return await optimize(svgPath, outputPath);
  });

  return await Promise.all(promises);
}
