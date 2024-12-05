import puppeteer, { Browser, KnownDevices, Page } from "puppeteer";
import { matchAll } from "./regex";
const iPhone = KnownDevices["iPhone 13"];

// Or import puppeteer from 'puppeteer-core';
export const runInBrowser = async (
  callback: (bBrowser: Browser, page: Page) => Promise<void>,
  isMobile = false,
  showBrowser = false,
  closeAfter = true
) => {
  const browser = await puppeteer.launch({
    headless: !showBrowser,
    defaultViewport: {
      width: isMobile ? 412 : 869,
      height: isMobile ? 412 : 1024,
      isMobile: isMobile,
    },
  });

  const pages = await browser.pages();
  const page = pages[0] ? pages[0] : await browser.newPage();
  if (isMobile) await page.emulate(iPhone);
  await callback(browser, page);
  if (closeAfter) browser.close();
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
