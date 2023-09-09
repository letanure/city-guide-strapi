/**
 * event service
 */
import { factories } from "@strapi/strapi";
import { ContentType } from "@strapi/strapi/lib/types/core/uid";
import slugify from "slugify";

type ServiceOptions =
  | "city"
  | "country"
  | "event"
  | "event-category"
  | "place"
  | "place-category"
  | "state";

const getServiceEntityName = (serviceName: ServiceOptions) =>
  `api::${serviceName}.${serviceName}` as ContentType;

const Exception = (e) => ({
  e,
  data: e.data && e.data.errors && e.data.errors,
});

async function findOneByFilters(entityService, filters) {
  try {
    const serviceEntityName = getServiceEntityName(entityService);
    const entries = await strapi.entityService.findMany(serviceEntityName, {
      filters,
    });
    return entries;
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
    console.log("create:", serviceName, Exception(error));
  }
}

async function createUnique({
  serviceName,
  dataOriginal,
  slugOf = null,
  filters,
}) {
  try {
    const results = await findOneByFilters(serviceName, filters);
    if (results.length === 0) {
      create({ serviceName, dataOriginal, slugOf });
    } else {
      console.log(
        "createUnique:",
        serviceName,
        Exception({
          message: "item already exists",
          dataOriginal,
          results,
        })
      );
    }
  } catch (error) {
    console.log("createUnique:", serviceName, Exception(error));
  }
}

type CountryData = {
  name: string;
  slug: string;
};

async function createCountry(dataOriginal: CountryData) {
  // return await create(entityServices.country, countryData);
  return await createUnique({
    serviceName: "country",
    dataOriginal,
    filters: {
      ...dataOriginal,
    },
  });
}

type StateData = {
  name: string;
};

async function createState(dataOriginal: StateData) {
  return await createUnique({
    serviceName: "state",
    dataOriginal,
    slugOf: "name",
    filters: {
      ...dataOriginal,
    },
  });
}

type CityData = {
  name: string;
  state?: string;
};
async function createCity(dataOriginal: CityData) {
  return await createUnique({
    serviceName: "city",
    dataOriginal,
    slugOf: "name",
    filters: {
      ...dataOriginal,
    },
  });
}

type EventCategoryData = {
  name: string;
  slug?: string;
};
async function createEventCategory(dataOriginal: EventCategoryData) {
  return await createUnique({
    serviceName: "event-category",
    dataOriginal,
    slugOf: "name",
    filters: {
      ...dataOriginal,
    },
  });
}

type PlaceCategoryData = {
  name: string;
  slug?: string;
};
async function createPlaceCategory(dataOriginal: PlaceCategoryData) {
  return await createUnique({
    serviceName: "place-category",
    dataOriginal,
    slugOf: "name",
    filters: {
      ...dataOriginal,
    },
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

async function createPlace(dataOriginal: PlaceData) {
  return await createUnique({
    serviceName: "place",
    dataOriginal,
    slugOf: "name",
    filters: {
      ...dataOriginal,
    },
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
async function createEvent(dataOriginal: EventData) {
  return await createUnique({
    serviceName: "event",
    dataOriginal,
    slugOf: "name",
    filters: {
      ...dataOriginal,
    },
  });
}

export default factories.createCoreService(
  "api::event.event",
  ({ strapi }) => ({
    async populate(params) {
      try {
        console.log("SERVICE START");

        await createCountry({
          name: "Germany",
          slug: "de",
        });

        await createState({
          name: "Berlin",
        });

        await createCity({
          name: "Berlin",
        });

        await createEventCategory({
          name: "Rave",
        });

        await createPlaceCategory({
          name: "Park",
        });

        await createPlace({
          name: "Volkspark fried",
          shortDescription: "boteco do ze desc 3",
        });

        await createEvent({
          name: "rtave ilegal",
        });
        console.log("SERVICE END");
      } catch (error) {
        console.log("populate:", Exception(error));
      }
    },
  })
);
