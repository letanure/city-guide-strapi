import puppeteer, { type Page } from "puppeteer";
import { getText, getHref } from "../utils";

type InfoPlace = {
  name: string;
  url: string;
};

const getPlacesNameAndUrl = async (page: Page): Promise<InfoPlace[]> => {
  await page.goto("https://www.berlin.de/en/attractions-and-sights/a-z/");
  const linkSelector = "ul.list--arrowlist.list--flexsplit.split--2 li a";
  await page.waitForSelector(linkSelector);
  return await page.$$eval(linkSelector, (linkPlaces: HTMLAnchorElement[]) => {
    return linkPlaces.map((linkPlace) => {
      return {
        name: getText(linkPlace),
        url: getHref(linkPlace),
      };
    });
  });
};

const scrapper = async () => {
  const browser = await puppeteer.launch({
    // headless: false,
    headless: "new",
    args: ["--disable-features=DialMediaRouteProvider"],
  });

  const page = await browser.newPage();

  const placesNameAndUrl = await getPlacesNameAndUrl(page);

  console.log("placesNameAndUrl 55555", placesNameAndUrl.length);

  // await new Promise((r) => setTimeout(r, 1000));

  // Turn off the browser to clean up after ourselves.
  await browser.close();
};

export default scrapper;
