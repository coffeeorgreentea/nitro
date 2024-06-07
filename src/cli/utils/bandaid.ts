// import { mutations } from "./generated/proxy/deno/schema";
// import { zodToJsonSchema } from "zod-to-json-schema";
// import fs from "fs";
// import { openai } from "@ai-sdk/openai";
// import { generateText } from "ai";
// import consola from "consola";

// const name = "create_deployment" as const;

// const basePrompt = `
// Here is a json schema of a response from an api that we proxy.
// Write a prisma schema for a table that takes in this json schema as its input.
// This will be so we can sync our proxy request into our database.
// We are using postgres as our database, so take advantage of the features it provides.
// Return nothing but the table schema in a markdown block.
// The tables name should be: `;

// const schema = mutations.create_deployment.output;

// const jsonSchema = zodToJsonSchema(schema);

// const { text } = await generateText({
//   model: openai("gpt-4-turbo"),
//   prompt: `${basePrompt}${name}\n${JSON.stringify(jsonSchema, null, 2)}`,
// });

// consola.info(text);

// // // Write the JSON schema to a file called "zin.json"
// // fs.writeFileSync("zin.json", JSON.stringify(jsonSchema, null, 2), "utf-8");

// // console.log("Schema written to zin.json");
