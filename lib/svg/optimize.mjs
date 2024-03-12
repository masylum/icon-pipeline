import path from "path";
import SVGO from "svgo";
import { writeFile } from "../fs/writeFile.mjs";
import { readFile } from "../fs/readFile.mjs";
import { svgoConfig } from "./config.mjs";

export function optimizeSVG(svgPath, outputPath) {
  return new Promise(async (resolve, reject) => {
    const svgContents = await readFile(svgPath);
    const name = path.basename(svgPath);
    const SVGOSettings = svgoConfig(`svg-${name.replace(".svg", "")}`);
    const svgo = new SVGO(SVGOSettings);

    svgo.optimize(svgContents).then(async (result) => {
      try {
        await writeFile(outputPath, result.data);
      } catch (error) {
        console.log("optimizeSVG error", error);
        return reject(error);
      }
      return resolve(result.data);
    });
  });
}
