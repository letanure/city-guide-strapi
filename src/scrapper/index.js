import berlin_de from "./berlin_de/index.js";

const main = async () => {
  console.log("Scrapper main");
  const data = await berlin_de();
  return data;
};

export default main;
