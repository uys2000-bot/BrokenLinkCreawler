import "./services/ulogger";
import "./services/puppeteer";
import { crawler } from "./functions/bot";
import { writeFileSync, appendFileSync } from "node:fs";

const mainProcess = async (
  url: string,
  isMobile: boolean,
  fileName: string
) => {
  const errorURLS = [] as Array<[number | string | undefined, string]>;
  await crawler(url, isMobile, async (page, response, err) => {
    const url = page.url();
    const statusCode = response?.status ? response.status() : undefined;
    let code: string;

    if (err) code = "err";
    else if (statusCode != undefined) code = statusCode.toString();
    else code = "nul";

    if (code != "200") {
      errorURLS.push([code, url]);
      writeFileSync("result" + fileName, `${code} : ${url}\n`);
    }
    appendFileSync(fileName, `${code} : ${url}\n`);
  });
  return errorURLS;
};

(async () => {
  const message =
    "3 paramters needed, url, isMobile, exportName\n node file.js https://www.supplementler.com false webResult.ext";
  if (process.argv.length < 4) console.log(message);
  else {
    const url = process.argv[2];
    const isMobile = process.argv[3] == "true";
    const fileName = process.argv[4];
    if (url == undefined || isMobile == undefined || fileName == undefined)
      return console.log(message);
    else {
      writeFileSync(fileName, "");
      writeFileSync("result" + fileName, "");
      const errorUrls = await mainProcess(url, isMobile, fileName);
    }
  }
})();
