import { rimraf } from "rimraf";

export async function emptyDir(dir) {
  await rimraf(dir);
}
