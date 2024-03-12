import { readFile } from "../fs/readFile.mjs";
import { basename, join } from "path";
import { optimizeSVG } from "./optimize.mjs";

export function optimizeSVGs(fileArray, outputDir) {
  return new Promise((resolve, reject) => {
    const promises = fileArray.map(async (svgPath, i) => {
      let newFile;

      try {
        const originalCode = await readFile(svgPath, "utf-8");
        if (!originalCode) {
          console.log(
            `Warning ${svgPath} is an empty file. Double check that icon`
          );
          return;
        }
        const outputPath = join(outputDir, basename(svgPath));
        newFile = await optimizeSVG(svgPath, outputPath);
      } catch (e) {
        console.log("e", e);
        reject(e);
      }

      return newFile;
    });
    Promise.all(promises).then((data) => {
      return resolve(data);
    });
  });
}
