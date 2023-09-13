/**
 * event service
 */
import { factories } from "@strapi/strapi";
import { ContentType } from "@strapi/strapi/lib/types/core/uid";
import slugify from "slugify";
import scrapper from "../../../scrapper";
import openai from "../../../scrapper/openai.js";
import axios from "axios";

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
      populate: "*",
    });
    return entries;
  } catch (error) {
    console.log("findOneByFilters:", Exception(error));
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
    return await strapi.entityService.create(serviceEntityName, {
      data,
    });
    // await strapi.service(serviceEntityName).create({
    //   data,
    // });
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
  name: string;
  city?: any;
  // events?: string;
  // placeCategories?: any;
  site?: string;
  shortDescription: string;
  slug?: string;
  // socialLinks?: any;
  rawData?: any;
  properties?: any;
  addressText: string;
  description?: string;
};

async function createPlace(dataOriginal: PlaceData, unique = true) {
  return await (unique
    ? createUnique({
        serviceName: "place",
        dataOriginal,
        slugOf: "name",
        filters: {
          ...dataOriginal,
        },
      })
    : create({
        serviceName: "place",
        dataOriginal,
        slugOf: "name",
      }));
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

async function setImage({ imageUrl, serviceName, item, field = "cover" }) {
  console.log("download image", imageUrl);
  const serviceEntityName = getServiceEntityName(serviceName);
  const { data } = await axios.get(imageUrl, { responseType: "arraybuffer" });
  const buffer = Buffer.from(data, "base64");

  const FormData = require("form-data");

  const formData: any = new FormData();

  formData.append("refId", item.id);
  formData.append("ref", `${serviceEntityName}`);
  formData.append("field", field);
  formData.append("files", buffer, { filename: `${item.slug}.jpg` });

  console.info(`Uploading ${field} image: ${item.slug}.jpg`);

  try {
    await axios({
      method: "POST",
      url: `http://localhost:1337/api/upload/`,
      data: formData,
      headers: {
        "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
      },
    });
  } catch (error) {
    console.log("setImage:", Exception(error));
  }
}

export default factories.createCoreService(
  "api::event.event",
  ({ strapi }) => ({
    async populate(params) {
      try {
        console.log("SERVICE START");

        const dataScraped = await scrapper();

        const cityRef = await findOneByFilters("city", {
          name: "Berlin",
        });

        dataScraped.slice(0, 150).forEach(async (data) => {
          const mdDescription = data.description
            .map((block) => `## ${block.title}\n\n${block.text}`)
            .join("\n\n")
            .replace("## \n\n", "");
          const aiDescription = await openai(mdDescription);
          const finalDescription =
            aiDescription?.choices[0].message.content || mdDescription;
          const placeRef = await createPlace(
            {
              name: data.title,
              shortDescription: data.shortDescription,
              description: finalDescription,
              city: cityRef[0],
              site: data.website,
              addressText: data.address,
              properties: [
                { name: "source", value: data.source },
                { name: "geoCoordinates", value: data.geoCoordinates },
                { name: "ogDescription", value: data.ogDescription },
                { name: "ogImage", value: data.ogImage },
                { name: "cityMapUrl", value: data.cityMapUrl },
                { name: "accessibility", value: data.accessibility },
                { name: "openingHours", value: data.openingHours },
                { name: "parking", value: data.parking },
                { name: "tickets", value: data.tickets },
                { name: "guidedTours", value: data.guidedTours },
                { name: "admission", value: data.admission },
                { name: "phone", value: data.phone },
                { name: "rooftop", value: data.rooftop },
                { name: "note", value: data.note },
                { name: "style", value: data.style },
              ].filter((item) => item.value),
              rawData: data,
            },
            false
          );

          if (data.images.length > 0 && placeRef) {
            await Promise.all(
              data.images.slice(0, 5).map((imgObg) =>
                // setImage({ image, serviceName, item, field = "cover" }) {
                setImage({
                  imageUrl: `https://www.berlin.de${imgObg.src}`,
                  serviceName: "place",
                  item: placeRef,
                  field: "gallery",
                })
              )
            );
          }
        });

        // await createPlaceCategory({
        //   name: "Park",
        // });

        // await createPlace({
        //   name: "Volkspark fried",
        //   shortDescription: "boteco do ze desc 3",
        //   city: cityRef[0],
        // });

        // await createCountry({
        //   name: "Germany",
        //   slug: "de",
        // });

        // await createState({
        //   name: "Berlin",
        // });

        // await createCity({
        //   name: "Berlin",
        // });

        // await createEventCategory({
        //   name: "Rave",
        // });

        // await createEvent({
        //   name: "rtave ilegal",
        // });
        console.log("SERVICE END");
      } catch (error) {
        console.log("populate:", Exception(error));
      }
    },
  })
);
