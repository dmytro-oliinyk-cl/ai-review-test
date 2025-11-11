// scripts/ai_post_inline.js
/* eslint-disable no-console */
const fs = require("fs");

const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // буде від Actions
if (!GITHUB_TOKEN) {
  console.error("❌ Missing GITHUB_TOKEN");
  process.exit(1);
}

const repoFull = process.env.GITHUB_REPOSITORY || ""; // "owner/repo"
const [owner, repo] = repoFull.split("/");
const eventPath = process.env.GITHUB_EVENT_PATH; // JSON події PR
const prData = JSON.parse(fs.readFileSync(eventPath, "utf8"));
const pull_number = prData?.pull_request?.number;
const headSha = prData?.pull_request?.head?.sha;

if (!owner || !repo || !pull_number || !headSha) {
  console.error("❌ Cannot resolve owner/repo/pull_number/headSha from event.");
  process.exit(1);
}

function readJSON(path) {
  if (!fs.existsSync(path)) return null;
  try {
    return JSON.parse(fs.readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

const result = readJSON("ai_result.json");
if (!result || !Array.isArray(result.issues) || result.issues.length === 0) {
  console.log("ℹ️ No issues to comment.");
  process.exit(0);
}

// Хелпер: шлемо один коментар
async function postComment({ body, path, line, side = "RIGHT" }) {
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}/comments`;
  const payload = { body, commit_id: headSha, path, line, side };
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const t = await resp.text().catch(() => "");
    throw new Error(
      `HTTP ${resp.status} posting comment on ${path}:${line} → ${t}`
    );
  }
}

function fmtIssue(i) {
  const header = `**${i.id}** at \`${i.path}:${i.line}\``;
  const msg = i.message ? `\n\n${i.message}` : "";
  const sugg = i.suggestion ? `\n\n**Suggestion:** ${i.suggestion}` : "";
  return header + msg + sugg;
}

async function run() {
  const MAX = Number(process.env.MAX_INLINE || 30);
  let posted = 0,
    skipped = 0,
    failed = 0;

  for (const i of result.issues.slice(0, MAX)) {
    if (!i?.path || !Number.isInteger(i?.line)) {
      skipped++;
      continue;
    }
    const body = fmtIssue(i);
    try {
      await postComment({ body, path: i.path, line: i.line, side: "RIGHT" });
      posted++;
    } catch (e) {
      // Часто падає, якщо line не у DIFF або файл поза PR — це окей
      console.warn("⚠️  Skip:", e.message);
      failed++;
    }
  }

  console.log(
    `✅ Inline comments: posted=${posted}, skipped=${skipped}, failed=${failed}`
  );
}

run().catch((e) => {
  console.error("❌ Inline posting failed:", e?.message || e);
  process.exit(1);
});
