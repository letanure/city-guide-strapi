import { CheerioCrawler } from "crawlee";

const main = async () => {
  console.log("Attractions and sights");

  let data = [];

  const crawler = await new CheerioCrawler({
    async requestHandler({ $, request }) {
      const links = [...$(".list--arrowlist a")].map(
        (link) => `https://www.berlin.de${$(link).attr("href")}`
      );
      data = [...links];
    },
  });
  await crawler.run(["https://www.berlin.de/en/attractions-and-sights/a-z/"]);
  return data;
};

export default main;
