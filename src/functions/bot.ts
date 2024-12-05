import { HTTPResponse, Page } from "puppeteer";
import { openPage, runInBrowser, search } from "../services/puppeteer";
import { filterBatcher, mapBatcher } from "../services/batcher";

const linkFormatter = (base: string, currentUrl: string, url: string) => {
  if (url.startsWith("https://")) return url;
  if (url.startsWith("http://")) return url;
  if (url.startsWith("//")) return "https://" + url;
  if (url.startsWith("/")) return base + url;
  return "";
};
const filterLinks = async (
  newLinks: string[],
  usedLinks: string[],
  unusedLinks: string[]
) => {
  const links = await filterBatcher(newLinks, (item, i) =>
    usedLinks.includes(item) || unusedLinks.includes(item) ? undefined : item
  );
  return [...new Set(links)];
};
export const crawler = async (
  site: string,
  isMobile = false,
  runOnPage = async (page: Page, response: HTTPResponse | null, err: any) => {}
) => {
  const regex = /(?:['"])(https:\/\/|http:\/\/|\/)([^'"]+)(?:['"])/g;
  const unusedlinks = [site] as string[];
  const usedLinks = [] as string[];
  await runInBrowser(
    async (browser, page) => {
      while (unusedlinks.length > 0) {
        const currentUrl = unusedlinks[0];
        unusedlinks.shift();
        usedLinks.push(currentUrl);

        let err = undefined as any;
        const response = await openPage(page, currentUrl).catch(
          (e) => (err = e)
        );

        if (currentUrl.startsWith(site)) {
          const links = await search(page, regex);
          const formattedLinks = await mapBatcher(links, (item, i) =>
            linkFormatter(site, currentUrl, item)
          );
          const filteredLinks = await filterLinks(
            formattedLinks,
            usedLinks,
            unusedlinks
          );
          filteredLinks.map((item) => unusedlinks.push(item));
        }
        await runOnPage(page, response, err);
      }
    },
    isMobile,
    false,
    true
  );
};
