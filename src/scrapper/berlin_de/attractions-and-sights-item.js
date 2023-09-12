import { CheerioCrawler } from "crawlee";

const main = async (urls) => {
  console.log("Attractions and sights item");

  let data = [];

  function sanitizeText(text = "") {
    return text
      .replace(" City map", "")
      .replace(/\n/g, "")
      .replace(/\s+/g, ", ")
      .trim();
  }

  function getDDbyDTtext($, ddTexts, type = "text") {
    const item = $(".info-container-list dt").filter((_, item) =>
      ddTexts.includes($(item).text().trim().toLowerCase())
    )[0];
    let result = "";
    if (type === "text") {
      result = sanitizeText($(item).next("dd").text().trim());
    }
    if (type === "href") {
      result = $(item).next("dd").attr("href");
    }
    return result;
  }

  const crawler = await new CheerioCrawler({
    // maxRequestsPerCrawl: 10,
    async requestHandler({ $, request }) {
      const title = $(".article__title").text();
      const images = $(".article-mainimage img").attr("src")
        ? [
            {
              src: $(".article-mainimage img").attr("src"),
              caption: sanitizeText(
                $(".article-mainimage .image__caption").text()
              ),
              copyright: $(".article-mainimage .image__copyright").text(),
            },
          ]
        : [...$(".modul-bildergalerie .image")].map((imgContainer) => ({
            src:
              $(imgContainer).find("img").attr("src") ||
              $(imgContainer).find("img").data("src"),
            caption: sanitizeText(
              $(imgContainer).find(".image__caption").text()
            ),
            copyright: $(imgContainer).find(".image__copyright").text(),
          }));

      const shortDescription = $(".article__introtext").text();
      const description = [...$(".modul-text_bild.paragraph")].map(
        (paragraph) => ({
          title: $(paragraph).find(".title").text(),
          text: $(paragraph).find(".text").text(),
        })
      );
      const cityMapUrl = $(".geomap-main > a").attr("href");
      const address = getDDbyDTtext($, ["address"]);
      const accessibility = getDDbyDTtext($, ["accessibility"]);
      const admission = getDDbyDTtext($, ["admission", "admission fee"]);
      const guidedTours = getDDbyDTtext($, ["guided tours", "guided", "tours"]);
      const website = getDDbyDTtext($, ["internet", "website"], "href");
      const openingHours = getDDbyDTtext($, ["opening hours"]);
      const parking = getDDbyDTtext($, ["parking"]);
      const phone = getDDbyDTtext($, ["phone"]);
      const note = getDDbyDTtext($, ["please note"]);
      const rooftop = getDDbyDTtext($, ["rooftop terrace"]);
      const tickets = getDDbyDTtext($, ["tickets"]);
      const style = getDDbyDTtext($, [
        "architect and style",
        "architect",
        "architects",
        "architecture",
        "architects and style",
        "architectural style",
        "style",
      ]);

      const geoCoordinates = $('meta[name="ICBM"]').attr("content");

      const ogDescription = $('meta[property="og:description"]').attr(
        "content"
      );
      const ogImage = $('meta[property="og:image"]').attr("content");

      //   info-container-list
      const dataItem = {
        source: request.url,
        title,
        geoCoordinates,
        // ogDescription,
        // ogImage,
        // images,
        // shortDescription,
        // description,
        // cityMapUrl,
        // address,
        // accessibility,
        // admission,
        // guidedTours,
        // website,
        // openingHours,
        // parking,
        // phone,
        // note,
        // rooftop,
        // tickets,
        // style,
      };
      data = [...data, dataItem];
    },
  });

  await crawler.run(urls);
  return data;
};

export default main;
