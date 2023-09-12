import runAttractionsAndSights from "./attractions-and-sights.js";
import runAttractionsAndSightsItem from "./attractions-and-sights-item.js";

const main = async () => {
  console.log("Berlin.de");
  const attractionsAndSightsLinks = await runAttractionsAndSights();
  const dataItems = await runAttractionsAndSightsItem(
    attractionsAndSightsLinks.slice(0, 2)
  );
  console.log(dataItems);
};

export default main;
