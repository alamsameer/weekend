/**
 * One-shot: create "LeetCode Top Interview 150" Notion DB and seed all problems.
 * Run: NODE_TLS_REJECT_UNAUTHORIZED=0 node scripts/seed-top150.mjs
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { Client } from "@notionhq/client";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const env = readFileSync(resolve(root, ".env.local"), "utf8");
const token = env.match(/NOTION_TOKEN=(.+)/)?.[1]?.trim();
if (!token) throw new Error("NOTION_TOKEN missing");

const PARENT_PAGE_ID = "356710cd-0192-80ba-a771-c7b1c73a569e";
const { problems } = JSON.parse(
  readFileSync(resolve(root, "top150.json"), "utf8"),
);

const COLORS = [
  "default",
  "gray",
  "brown",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "pink",
  "red",
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const notion = new Client({ auth: token });

const topics = [...new Set(problems.map((p) => p.topic))];
const tags = [...new Set(problems.flatMap((p) => p.tags))];

console.log(`Problems: ${problems.length}, Topics: ${topics.length}, Tags: ${tags.length}`);

const db = await notion.databases.create({
  parent: { type: "page_id", page_id: PARENT_PAGE_ID },
  title: [{ type: "text", text: { content: "LeetCode Top Interview 150" } }],
  icon: { type: "emoji", emoji: "💻" },
  initial_data_source: {
    properties: {
      Question: { title: {} },
      Topic: {
        select: {
          options: topics.map((name, i) => ({
            name,
            color: COLORS[i % COLORS.length],
          })),
        },
      },
      Topics: {
        multi_select: {
          options: tags.map((name, i) => ({
            name,
            color: COLORS[i % COLORS.length],
          })),
        },
      },
      Difficulty: {
        select: {
          options: [
            { name: "Easy", color: "green" },
            { name: "Medium", color: "yellow" },
            { name: "Hard", color: "red" },
          ],
        },
      },
      "#": { number: {} },
      Link: { url: {} },
      Status: {
        select: {
          options: [
            { name: "To revise", color: "orange" },
            { name: "In progress", color: "blue" },
            { name: "Done", color: "green" },
          ],
        },
      },
      "Next review": { date: {} },
    },
  },
});

const dataSourceId = db.data_sources?.[0]?.id;
if (!dataSourceId) {
  console.error("No data_source on created database", db);
  process.exit(1);
}

console.log(`Created database ${db.id}`);
console.log(`Data source ${dataSourceId}`);
console.log(`URL: ${db.url}`);

let ok = 0;
let fail = 0;

for (let i = 0; i < problems.length; i++) {
  const p = problems[i];
  const difficulty =
    p.difficulty.charAt(0) + p.difficulty.slice(1).toLowerCase(); // Easy/Medium/Hard

  try {
    await notion.pages.create({
      parent: { data_source_id: dataSourceId },
      properties: {
        Question: {
          title: [{ type: "text", text: { content: p.title } }],
        },
        Topic: { select: { name: p.topic } },
        Topics: {
          multi_select: p.tags.map((name) => ({ name })),
        },
        Difficulty: { select: { name: difficulty } },
        "#": { number: Number(p.id) || null },
        Link: { url: p.url },
        Status: { select: { name: "To revise" } },
      },
    });
    ok++;
    if ((i + 1) % 10 === 0 || i === problems.length - 1) {
      console.log(`Seeded ${i + 1}/${problems.length}`);
    }
  } catch (e) {
    fail++;
    console.error(`Fail #${p.id} ${p.title}:`, e.message);
    await sleep(1000);
    try {
      await notion.pages.create({
        parent: { data_source_id: dataSourceId },
        properties: {
          Question: {
            title: [{ type: "text", text: { content: p.title } }],
          },
          Topic: { select: { name: p.topic } },
          Topics: {
            multi_select: p.tags.map((name) => ({ name })),
          },
          Difficulty: { select: { name: difficulty } },
          "#": { number: Number(p.id) || null },
          Link: { url: p.url },
          Status: { select: { name: "To revise" } },
        },
      });
      ok++;
      fail--;
      console.log(`Retry ok #${p.id}`);
    } catch (e2) {
      console.error(`Retry fail #${p.id}:`, e2.message);
    }
  }
  await sleep(350);
}

console.log(JSON.stringify({ ok, fail, databaseId: db.id, dataSourceId, url: db.url }, null, 2));
