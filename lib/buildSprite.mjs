import fs from "fs-extra";
import path from "path";
import { optimize } from "svgo";

export function svgoConfig() {
  return {
    plugins: [
      {
        name: "preset-default",
        params: {
          overrides: {
            removeViewBox: false,
          },
        },
      },
    ],
  };
}

function wrapWithSymbol(result, fileName) {
  let data = result.data;
  let viewBox;

  try {
    viewBox = data.match(/viewBox="(.*?)"/)[1];
  } catch (_e) {
    console.error(`${fileName} does not have a viewBox`);
    return Promise.resolve("");
  }
  const id = fileName.replace(".svg", "");
  const content = data
    .replace(/<svg[^>]*>(.*?)<\/svg>/, (_m, content) => content)
    .replace(/ *strok.*?=".*?"/g, "")
    .replace(/ *fill=".*?"/g, "");
  console.log(data, content);

  return `<symbol id="${id}" viewBox="${viewBox}">${content}</symbol>`;
}

export async function optimizeSVGs(fileArray, srcDir) {
  return await Promise.all(
    fileArray.map(async (filename) => {
      const svgContents = await fs.readFile(
        path.join(srcDir, filename),
        "utf-8"
      );
      const optimizedData = optimize(svgContents, svgoConfig());

      return wrapWithSymbol(optimizedData, filename);
    })
  );
}

export async function buildSprite(icons, srcDir) {
  const symbols = await optimizeSVGs(icons, srcDir);

  const sprite = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            ${symbols.join("\n\n")}
        </svg>
    `;

  await fs.writeFile(path.join(srcDir, "sprite.svg"), sprite);
}
