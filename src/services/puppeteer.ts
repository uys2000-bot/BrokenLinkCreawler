import puppeteer, {
  Browser,
  KnownDevices,
  LaunchOptions,
  Page,
} from "puppeteer";
import { matchAll } from "./regex";
const iPhone = KnownDevices["iPhone 13"];

const getLaunchOptions = (
  showBrowser = false,
  isMobile = false
): LaunchOptions => {
  return {
    headless: !showBrowser,
    defaultViewport: {
      width: isMobile ? 412 : 869,
      height: isMobile ? 412 : 1024,
      isMobile: isMobile,
    },
    args: [
      "--disable-gpu",
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--no-zygote",
    ],
  };
};

export const openBrowser = async (isMobile = false, showBrowser = false) => {
  const options = getLaunchOptions(showBrowser, isMobile);
  if (process.env.RASP === "true")
    options["executablePath"] = "/usr/bin/chromium-browser";
  const browser = await puppeteer.launch(options);

  const pages = await browser.pages();
  const page = pages[0] ? pages[0] : await browser.newPage();

  if (isMobile) await page.emulate(iPhone);
  return [browser, page] as [Browser, Page];
};

export const openPage = async (page: Page, url: string) => {
  return await page.goto(url, { waitUntil: "domcontentloaded" });
};

export const search = async (page: Page, regex: RegExp) => {
  try {
    const content = page.content ? await page.content() : "";
    return matchAll(content, regex);
  } catch {
    return [];
  }
};
