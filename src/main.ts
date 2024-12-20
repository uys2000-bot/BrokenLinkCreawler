import "./services/ulogger";
import "./services/puppeteer";
import { crawler } from "./functions/bot";
import { writeFileSync, appendFileSync } from "node:fs";

const mainProcess = async (
  url: string,
  isMobile: boolean,
  fileName: string
) => {
  writeFileSync("res_err_" + fileName + ".csv", "code,link,redirected,page\n");
  writeFileSync("res_all_" + fileName + ".csv", "code,link,redirected,page\n");
  await crawler(url, isMobile, async (links, page, response, err) => {
    const statusCode = response?.status ? response.status() : undefined;
    let code: string;

    if (err) code = "err";
    else if (statusCode != undefined) code = statusCode.toString();
    else code = "nul";

    const currentUrl = page.url();
    if (code != "200") {
      const f = "res_err_" + fileName + ".csv";
      appendFileSync(f, `${code},${links[0]},${currentUrl},${links[1]}\n`);
    }
    const f = "res_all_" + fileName + ".csv";
    appendFileSync(f, `${code},${links[0]},${currentUrl},${links[1]}\n`);
  });
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
      await mainProcess(url, isMobile, fileName);
    }
  }
})();
