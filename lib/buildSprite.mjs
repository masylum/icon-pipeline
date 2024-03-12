import fs from "fs-extra";
import path from "path";
import * as htmlparser2 from "htmlparser2";
import pug from "pug";
import filter from "lodash.filter";
import { writeFile } from "./fs/writeFile.mjs";

const spriteTemplate = path.join(
  import.meta.dirname,
  "templates",
  "layout.pug"
);

export function buildSprite(files, config = {}) {
  const { srcDir, outputDir, namespace, includeSpriteInSrc } = config;
  const iconNameSpace = namespace ? `${namespace.replace(/-$/, "")}-` : "";
  if (!srcDir || !outputDir) {
    throw new Error("Missing srcDir or outputDir");
  }
  return new Promise(async (resolve, reject) => {
    const data = {
      svg: {
        xmlns: "http://www.w3.org/2000/svg",
        "xmlns:xlink": "http://www.w3.org/1999/xlink",
        style: "position:absolute; width: 0; height: 0",
      },
      defs: [],
      symbols: [],
    };
    // each over files
    files.forEach(async (fpath) => {
      // load and minify
      const buffer = fs.readFileSync(fpath, "utf8");
      // get filename for id generation
      const filename = path.basename(fpath, ".svg");
      const handler = new htmlparser2.DomHandler((e, dom) => {
        if (e) {
          return reject(e);
        }
        console.log(data, filename, dom, iconNameSpace);
        parseDomObject(data, filename, dom, iconNameSpace);
      });

      // lets create parser instance
      const Parser = new htmlparser2.Parser(handler, {
        xmlMode: true,
      });
      Parser.write(buffer);
      Parser.end();
    });
    // console.log('Final', data)
    const spriteContents = createSprite(data);

    let svgFilesToWrite = [path.join(outputDir, "sprite.svg")];

    /* Add sprite to src folder */
    if (includeSpriteInSrc) {
      svgFilesToWrite = svgFilesToWrite.concat([
        path.join(srcDir, "sprite.svg"),
      ]);
    }

    try {
      const svgFiles = svgFilesToWrite.map((filePath) => {
        return writeFile(filePath, spriteContents);
      });

      const promises = svgFiles;
      const allFiles = svgFilesToWrite;

      Promise.all(promises).then(() => {
        return resolve(allFiles);
      });
    } catch (error) {
      return reject(error);
    }
  });
}

function createSprite(data) {
  return pug.renderFile(spriteTemplate, data);
}

function parseDomObject(data, filename, dom, prefix) {
  const id = convertFilenameToId(filename);
  if (dom && dom[0]) {
    defs(id, dom[0], data.defs);
    symbols(id, dom[0], data.symbols, prefix);
  }

  return data;
}

function convertFilenameToId(filename) {
  let _name = filename;
  const dotPos = filename.indexOf(".");
  if (dotPos > -1) {
    _name = filename.substring(0, dotPos);
  }
  return _name;
}

function defs(id, dom, data) {
  const defs = filter(dom.children, { name: "defs" });
  defs.forEach((item) => {
    if (item.children && item.children.length > 0) {
      // mutable attribute
      item.children.forEach((_data) => {
        _data.attribs.id = [id, _data.attribs.id || "icon-id"].join("-");
        data.push(_data);
      });
    }
  });

  return data;
}

function symbols(id, dom, data, prefix) {
  // create symbol object

  // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute
  const removeList = [
    "xmlns",
    "xlink:href",
    "xlink:type",
    "xlink:role",
    "xlink:arcrole",
    "xlink:title",
    "xlink:show",
    "xlink:actuate",
    "xml:base",
    "xml:lang",
    "xml:space",
    "style",
  ];

  // Allow for stroke & other props on use tags
  const cleanSymbolAttrs = Object.keys(dom.attribs)
    .filter((prop) => {
      return !removeList.includes(prop);
    })
    .reduce((acc, curr) => {
      acc[curr] = dom.attribs[curr];
      return acc;
    }, {});
  // console.log(cleanSymbolAttrs)

  const symbol = {
    type: "tag",
    name: "symbol",
    attribs: Object.assign({}, cleanSymbolAttrs, {
      // apply the ID for use tag
      id: prefix + id,
      // viewBox: dom.attribs.viewBox,
      // class: dom.attribs.class,
    }),
    next: null,
    prev: null,
    parent: null,
  };

  // add dom children without defs and titles
  symbol.children = filter(dom.children, (obj) => {
    return obj.name !== "defs" && obj.name !== "title";
  });

  // go through the svg element
  parseSVG(symbol.children, id);

  // push symbol data
  data.push(symbol);

  return data;
}
function parseSVG(arr, id) {
  const data = [];
  arr.forEach((obj, i) => {
    if (obj) {
      // console.log('obj', obj)
      // add unic ids to urls
      fixUrls(obj, id);
      // add ids
      fixIds(obj, id);
      // go deeper if children exists
      if (obj.children && obj.children.length > 0) {
        parseSVG(obj.children, id);
      }
      data.push(obj, id);
    }
  });

  return data;
}

function fixUrls(obj, id) {
  let key;
  let match;
  const json = obj.attribs;
  if (json) {
    for (key in json) {
      if (json.hasOwnProperty(key)) {
        match = /url\(\s*#([^ ]+?)\s*\)/g.exec(json[key]);
        if (key && match) {
          json[key] = `url(#${id}-${match[1]})`;
        }
      }
    }
  }
}

function fixIds(obj, id) {
  // add id
  if (obj.attribs && obj.attribs.id) {
    obj.attribs.id = [id, obj.attribs.id].join("-");
  }
  // add id to use tag
  if (obj.name === "use") {
    obj.attribs["xlink:href"] = [
      `#${id}`,
      obj.attribs["xlink:href"].replace("#", ""),
    ].join("-");
  }
}
