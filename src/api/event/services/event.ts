/**
 * event service
 */
import { factories } from "@strapi/strapi";
import slugify from "slugify";

const eventService = "api::event.event";
const eventCountry = "api::country.country";
const eventState = "api::state.state";
const eventCity = "api::city.city";

function Exception(e) {
  return { e, data: e.data && e.data.errors && e.data.errors };
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

async function create(entityService, dataOriginal, slugOf = null) {
  try {
    const data = dataOriginal;
    if (slugOf && data[slugOf]) {
      data.slug = slugify(data[slugOf], { lower: true });
    }
    await strapi.service(entityService).create({
      data,
    });
  } catch (error) {
    console.log("create:", Exception(error));
  }
}

type CountryData = {
  name: string;
  slug: string;
};

async function createCountry(countryData: CountryData) {
  return await create(eventCountry, countryData);
}

type StateData = {
  name: string;
};

async function createState(stateData: StateData) {
  return await create(eventState, stateData, "name");
}

type CityData = {
  name: string;
  state?: string;
};
async function createCity(cityData: CityData) {
  return await create(eventCity, cityData, "name");
}

export default factories.createCoreService(eventService, ({ strapi }) => ({
  async populate(params) {
    try {
      console.log("SERVICE START", eventService);

      await createCountry({
        name: "Brazil",
        slug: "br",
      });

      await createState({
        name: "Minas Gerais",
      });

      await createCity({
        name: "Belo horizonte",
        state: item,
      });

      createState;
    } catch (error) {
      console.log("populate:", Exception(error));
    }
  },
}));
