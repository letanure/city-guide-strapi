/**
 * event controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController("api::event.event", ({}) => ({
  async populate(ctx: any) {
    console.log("Start populating events");

    const options = {
      limit: 5,
      // order: "desc:trending",
      ...ctx.query,
    };

    await strapi.service("api::event.event").populate(options);

    ctx.send("Finished populating events");
  },
}));
