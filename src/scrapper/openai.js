import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

async function main(
  text,
  options = {
    temperature: 0.4,
    model: "gpt-3.5-turbo", //  "gpt-4",
  }
) {
  const prompt = `rewrite the text in english: ${text}`;
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: prompt,
      },
      {
        role: "system",
        content: "rewrite this text, SEO friendly, keep the markdown.",
      },
    ],
    model: options.model,
    temperature: options.temperature,
  });

  return completion;
}

export default main;
