import path from "path";
import { optimize } from "svgo";
import { writeFile } from "../fs/writeFile.mjs";
import { readFile } from "../fs/readFile.mjs";
import { svgoConfig } from "./config.mjs";

export async function optimize(svgPath, outputPath) {
  const svgContents = await readFile(svgPath);
  const SVGOSettings = svgoConfig();

  const result = optimize(svgContents, SVGOSettings);
  console.log(result.data, outputPath);
  await writeFile(outputPath, result.data);
  return result.data;
}
