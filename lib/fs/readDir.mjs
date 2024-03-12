import fs from "fs";

export function readDir(path) {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (error, files) => {
      if (error) {
        return reject(error);
      }
      return resolve(files);
    });
  });
}
