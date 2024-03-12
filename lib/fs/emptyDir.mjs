import { rimraf } from "rimraf";

export function emptyDir(dir) {
  return new Promise((resolve, reject) => {
    rimraf(dir, function (error) {
      if (error) {
        return reject(error);
      }
      return resolve(true);
    });
  });
}
