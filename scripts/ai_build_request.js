const fs = require("fs");

const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "");
const model = process.env.MODEL || "gpt-5-nano";

const sys = read(".ai/ai-reviewer-instruction.md");
const rules = read(".ai/review-rules.md");
const diff = read("diff.trimmed");

const payload = {
  model,
  response_format: { type: "json_object" },
  input: [
    { role: "system", content: sys },
    { role: "user", content: `Rules:\n${rules}\n\nDIFF:\n${diff}` },
  ],
};

fs.writeFileSync("request.json", JSON.stringify(payload), "utf8");
console.log("request.json built ✅");
