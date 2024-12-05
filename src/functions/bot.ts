import { HTTPResponse, Page } from "puppeteer";
import { openBrowser, openPage, search } from "../services/puppeteer";

const formatLink = (base: string, currentUrl: string, url: string) => {
  const u = url.trim();
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
    link: string,
    page: Page,
    response: HTTPResponse | null,
    err: any
  ) => Promise<void>
) => {
  const regex = /(?:['"])(https:\/\/|http:\/\/|\/)([^'"]+)(?:['"])/g;
  let nextLinks = [site] as string[];
  let pastLinks = [] as string[];
  const [browser, page] = await openBrowser(isMobile, false);
  while (nextLinks.length > 0) {
    const link = nextLinks[0].trim();

    let err: any = undefined;
    const response = await openPage(page, link).catch((e) => (err = e));
    await runOnPage(link, page, response, err);

    nextLinks.shift();
    pastLinks.push(link);

    const newLinks = [...new Set(await search(page, regex))];
    for (let index = 0; index < newLinks.length; index++) {
      const newLink = formatLink(site, link, newLinks[index]).trim();
      if (
        newLink &&
        newLink.length > 0 &&
        newLink != link &&
        !pastLinks.includes(newLink) &&
        !nextLinks.includes(newLink)
      ) {
        nextLinks.push(newLink);
      }
    }
  }
  browser.close();
  process.exit();
};
