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

function extractText(d) {
  // 1) Пряме поле (інколи присутнє в Responses API)
  if (typeof d?.output_text === "string" && d.output_text.trim()) {
    return d.output_text;
  }

  // 2) Загальний випадок Responses API:
  //    output[] -> type: "message" -> content[] -> type: "output_text" -> text
  if (Array.isArray(d?.output)) {
    const chunks = [];
    for (const part of d.output) {
      if (part?.type === "message" && Array.isArray(part.content)) {
        for (const c of part.content) {
          if (c?.type === "output_text" && typeof c.text === "string") {
            chunks.push(c.text);
          }
        }
      }
    }
    if (chunks.length) return chunks.join("\n");
  }

  // 3) Фолбек на Chat Completions
  const choice = d?.choices?.[0];
  if (choice?.message?.content && typeof choice.message.content === "string") {
    return choice.message.content;
  }

  return "";
}

async function main() {
  const body = JSON.parse(read("request.json") || "{}");
  body.model = body.model || MODEL; // safety

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
  fs.writeFileSync("response.json", JSON.stringify(data, null, 2), "utf8");

  // Витягаємо відповідь надійно
  let text = extractText(data);
  if (!text || typeof text !== "string") text = "{}";

  // Лог сирого тексту для дебага
  fs.writeFileSync("ai_raw_text.txt", text, "utf8");

  // Парсимо очікуваний JSON {"issues":[...]}
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = {};
  }

  fs.writeFileSync("ai_result.json", JSON.stringify(parsed, null, 2), "utf8");

  const md = [
    "### 🤖 AI Code Review",
    `_Model: \`${MODEL}\` • raw diff: ${RAW_DIFF_LEN} chars_`,
    "",
    "```json",
    JSON.stringify(parsed, null, 2),
    "```",
  ].join("\n");

  fs.writeFileSync("comment.md", md, "utf8");
  console.log("✅ OpenAI call done, ai_result.json & comment.md generated");
}

main().catch((err) => {
  console.error("❌ OpenAI call failed:", err?.message || err);
  process.exit(1);
});
