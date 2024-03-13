import { iconPipeline } from "../lib/index.mjs";

async function makeIcons() {
  const iconData = await iconPipeline({
    srcDir: "XXX",
  });
  console.log("iconData", iconData);
}

makeIcons();
