// scripts/ai_call_openai.js
/* eslint-disable no-console */
const fs = require("fs");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL =
  process.env.OPENAI_API_URL || "https://api.openai.com/v1/responses";
const MODEL = process.env.MODEL || "gpt-5-nano";
const RAW_DIFF_LEN = process.env.RAW_DIFF_LEN || "0";

if (!OPENAI_API_KEY) {
  console.error("❌ Missing OPENAI_API_KEY");
  process.exit(1);
}

function read(path) {
  return fs.existsSync(path) ? fs.readFileSync(path, "utf8") : "";
}

async function main() {
  const body = JSON.parse(read("request.json") || "{}");

  // safety: переконаємось, що модель виставлена
  body.model = body.model || MODEL;

  // timeout на запит
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 60_000);

  const resp = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: ac.signal,
  }).catch((e) => {
    clearTimeout(t);
    throw e;
  });

  clearTimeout(t);

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    console.error(`❌ OpenAI HTTP ${resp.status}: ${text}`);
    process.exit(1);
  }

  const data = await resp.json();
  fs.writeFileSync("response.json", JSON.stringify(data));

  // Responses API → output_text; fallback на Chat Completions
  let text = data.output_text;
  if (
    !text &&
    Array.isArray(data.choices) &&
    data.choices[0]?.message?.content
  ) {
    text = data.choices[0].message.content;
  }
  if (typeof text !== "string") text = "{}";

  // намагаємось розпарсити як JSON {"issues":[...]}
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = {};
  }

  fs.writeFileSync("ai_result.json", JSON.stringify(parsed, null, 2));

  const md = [
    "### 🤖 AI Code Review",
    `_Model: \`${MODEL}\` • raw diff: ${RAW_DIFF_LEN} chars_`,
    "",
    "```json",
    JSON.stringify(parsed, null, 2),
    "```",
  ].join("\n");

  fs.writeFileSync("comment.md", md);
  console.log("✅ OpenAI call done, ai_result.json & comment.md generated");
}

main().catch((err) => {
  console.error("❌ OpenAI call failed:", err?.message || err);
  process.exit(1);
});
