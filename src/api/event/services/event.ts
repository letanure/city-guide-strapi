import axios from "axios";
import puppeteer from "puppeteer";
import qs from "querystring";
/**
 * event service
 */
import { factories } from "@strapi/strapi";

const eventService = "api::event.event";
const eventPlace = "api::place.place";

function Exception(e) {
  return { e, data: e.data && e.data.errors && e.data.errors };
}

async function create2(name, entityService) {
  try {
    const item = await getByName(name, entityService);

    if (!item) {
      await strapi.service(entityService).create({
        data: {
          name,
          slug: name
            .normalize("NFKD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-"),
        },
      });
    }
  } catch (error) {
    console.log("create:", Exception(error));
  }
}

async function getByName(name, entityService) {
  try {
    const item = await strapi.service(entityService).find({
      filters: { name },
    });

    return item.results.length > 0 ? item.results[0] : null;
  } catch (error) {
    console.log("getByName:", Exception(error));
  }
}

const scrapBerlinDeAttractionsSghtsAz = async () => {
  try {
    console.log("scrapBerlinDeAttractionsSghtsAz");
    const pageUrl = `https://www.berlin.de/en/attractions-and-sights/a-z/`;
    const browser = await puppeteer.launch({
      headless: "new",
      defaultViewport: null,
    });
    const page = await browser.newPage();
    await page.goto(pageUrl, {
      waitUntil: "domcontentloaded",
    });

    // Get page data
    await page.waitForSelector(".azmap");
    let attractions = await page.$$eval("a.nowidows", async (links) => {
      console.log("links", links);
      links = links.map(async (el) => {
        const name = el.innerText;
        // const data = {
        //   name,
        //   slug: name
        //     .normalize("NFKD")
        //     .replace(/[\u0300-\u036f]/g, "")
        //     .trim()
        //     .toLowerCase()
        //     .replace(/[^a-z0-9 -]/g, "")
        //     .replace(/\s+/g, "-")
        //     .replace(/-+/g, "-"),
        // };

        // strapi.service(eventPlace).create({
        //   data,
        // });
        return name;
      });
      return links;
    });
    return attractions;
  } catch (error) {
    console.log("scrapBerlinDeAttractionsSghtsAz:", Exception(error));
  }
};

async function create(name, entityService) {
  try {
    const item = await getByName(name, entityService);

    if (!item) {
      await strapi.service(entityService).create({
        data: {
          name,
          slug: name
            .normalize("NFKD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-"),
        },
      });
    }
  } catch (error) {
    console.log("create:", Exception(error));
  }
}

export default factories.createCoreService(eventService, ({ strapi }) => ({
  async populate(params) {
    try {
      console.log("SERVICE START", eventService);
      scrapBerlinDeAttractionsSghtsAz();
      // createManyToManyData(attractions);
      // console.log("attractions", attractions);
    } catch (error) {
      console.log("populate:", Exception(error));
    }
    // console.log("SERVICE STAT");
    // console.dir(params);

    // async function populateEvent(event) {
    //   await strapi.service("api::event.event").create({
    //     data: {
    //       name: event.name,
    //     },
    //   });
    // }

    // populateEvent({ name: "test2" });
    // return "SERVICE END";
  },
}));
