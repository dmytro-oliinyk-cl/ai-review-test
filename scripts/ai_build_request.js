const fs = require("fs");

const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "");
const model = process.env.MODEL || "gpt-5-nano";

const sys = read(".ai/ai-reviewer-instruction.md");
const rules = read(".ai/review-rules.md");
const diff = read("diff.trimmed");

// У scripts/ai_build_request.js — сформуй payload ось так:
const payload = {
  model,
  text: {
    format: {
      type: "json_schema",
      name: "AiCodeReviewIssues", // ← потрібен ТУТ (на рівні format)
      schema: {
        // ← а тут уже сам JSON Schema
        type: "object",
        properties: {
          issues: {
            type: "array",
            items: {
              type: "object",
              required: ["id", "path", "line", "message", "suggestion"],
              properties: {
                id: { type: "string" },
                path: { type: "string" },
                line: { type: "integer" },
                message: { type: "string" },
                suggestion: { type: "string" },
              },
              additionalProperties: false,
            },
          },
        },
        required: ["issues"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
  input: [
    { role: "system", content: sys },
    { role: "user", content: `Rules:\n${rules}\n\nDIFF:\n${diff}` },
  ],
};

fs.writeFileSync("request.json", JSON.stringify(payload), "utf8");
console.log("request.json built ✅");
