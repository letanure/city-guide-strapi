/**
 * event service
 */
import { factories } from "@strapi/strapi";
import slugify from "slugify";

type ServiceOptions =
  | "city"
  | "country"
  | "event"
  | "event-category"
  | "place"
  | "placeCategory"
  | "state";

const getServiceEntityName = (serviceName: ServiceOptions) =>
  `api::${serviceName}.${serviceName}`;

const Exception = (e) => ({
  e,
  data: e.data && e.data.errors && e.data.errors,
});

async function getByFilters(entityService, filters) {
  try {
    const item = await strapi.service(entityService).find({
      filters,
    });

    return item.results.length > 0 ? item.results[0] : null;
  } catch (error) {
    console.log("createUnique:", Exception(error));
  }
}

interface Create<Data> {
  serviceName: ServiceOptions;
  dataOriginal: Data;
  slugOf?: keyof Data;
}

async function create({
  serviceName,
  dataOriginal,
  slugOf = null,
}: Create<typeof dataOriginal>) {
  try {
    const serviceEntityName = getServiceEntityName(serviceName);
    const data = dataOriginal;
    if (slugOf && data[slugOf]) {
      data.slug = slugify(data[slugOf], { lower: true });
    }
    await strapi.service(serviceEntityName).create({
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
  // return await create(entityServices.country, countryData);
  return await create({
    serviceName: "country",
    dataOriginal: countryData,
  });
}

type StateData = {
  name: string;
};

async function createState(stateData: StateData) {
  return await create({
    serviceName: "state",
    dataOriginal: stateData,
    slugOf: "name",
  });
}

type CityData = {
  name: string;
  state?: string;
};
async function createCity(cityData: CityData) {
  return await create({
    serviceName: "city",
    dataOriginal: cityData,
    slugOf: "name",
  });
}

type EventCategoryData = {
  name: string;
  slug?: string;
};
async function createEventCategory(eventCategoryData: EventCategoryData) {
  return await create({
    serviceName: "event-category",
    dataOriginal: eventCategoryData,
    slugOf: "name",
  });
}

type PlaceCategoryData = {
  name: string;
  slug?: string;
};
async function createPlaceCategory(placeCategoryData: PlaceCategoryData) {
  return await create({
    serviceName: "placeCategory",
    dataOriginal: placeCategoryData,
    slugOf: "name",
  });
}

type PlaceData = {
  city?: string;
  description?: string;
  events?: string;
  name: string;
  placeCategories?: any;
  shortDescription: string;
  site?: string;
  slug?: string;
  socialLinks?: any;
};

async function createPlace(placeData: PlaceData) {
  return await create({
    serviceName: "place",
    dataOriginal: placeData,
    slugOf: "name",
  });
}

type EventData = {
  name: string;
  url?: string;
  places?: string;
  slug?: string;
  socialLinks?: any;
  sub_category?: any;
};
async function createEvent(eventData: EventData) {
  return await create({
    serviceName: "event",
    dataOriginal: eventData,
    slugOf: "name",
  });
}

export default factories.createCoreService(
  "api::event.event",
  ({ strapi }) => ({
    async populate(params) {
      try {
        console.log("SERVICE START");

        await createCountry({
          name: "Brazil",
          slug: "br",
        });

        await createState({
          name: "Minas Gerais",
        });

        await createCity({
          name: "Belo horizonte",
        });

        await createEventCategory({
          name: "Show de rock",
        });

        await createPlaceCategory({
          name: "centro de exposicoes",
        });

        await createPlace({
          name: "boteco do ze",
          shortDescription: "boteco do ze desc",
        });

        await createEvent({
          name: "sho no boteco do ze",
        });
      } catch (error) {
        console.log("populate:", Exception(error));
      }
    },
  })
);
