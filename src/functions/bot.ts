import { HTTPResponse, Page } from "puppeteer";
import { openBrowser, openPage, search } from "../services/puppeteer";

const formatLink = (base: string, currentUrl: string, url: string) => {
  let u = url.trim();
  if (u.endsWith("/")) u.slice(u.length - 1, u.length);
  if (url.startsWith("https://")) return u;
  if (url.startsWith("http://")) return u;
  if (url.startsWith("//")) return "https:" + u;
  if (url.startsWith("/")) return base + u;
  return "";
};

export const crawler = async (
  site: string,
  isMobile: boolean,
  runOnPage: (
    target: [string, string],
    page: Page,
    response: HTTPResponse | null,
    err: any
  ) => Promise<void>
) => {
  const regex =
    /((?:['])(https:\/\/|http:\/\/|\/)([^'"`]+)(?:[']))|((?:["])(https:\/\/|http:\/\/|\/)([^"'`]+)(?:["]))|((?:[`])(https:\/\/|http:\/\/|\/)([^`"']+)(?:[`]))/g;

  let nextLinks = [[site, "core"]] as Array<[link: string, host: string]>;
  let pastLinks = [] as Array<[string, string]>;
  const [browser, page] = await openBrowser(isMobile, false);
  while (nextLinks.length > 0) {
    const target = nextLinks[0];
    target[0] = formatLink(site, target[0].trim(), target[0].trim());

    let err: any = undefined;
    const response = await openPage(page, target[0]).catch((e) => (err = e));
    await runOnPage(target, page, response, err);

    nextLinks.shift();

    if (!target[0].startsWith(site)) {
      pastLinks.push(target);
      continue;
    }

    const newLinks = [...new Set(await search(page, regex))];
    for (let index = 0; index < newLinks.length; index++) {
      if (!newLinks[index]) {
        pastLinks.push(target);
        continue;
      }
      const newLink = formatLink(site, target[0], newLinks[index]).trim();
      if (
        newLink &&
        newLink.length > 0 &&
        newLink != target[0] &&
        !pastLinks.some((i) => i[0] == target[0]) &&
        !nextLinks.some((i) => i[0] == target[0])
      ) {
        nextLinks.push([newLink, target[0]]);
      }
    }

    pastLinks.push(target);
  }
  browser.close();
  process.exit();
};
