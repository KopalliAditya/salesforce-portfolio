#!/usr/bin/env node
/*
 * Regenerates assets/data/stats.json for the portfolio.
 *
 * Sources (whatever is reachable at run time; failures degrade gracefully):
 *   - Local git clones under $HOME  -> commit calendar + per-source totals
 *     (reads local history, so it works offline even when GHE tokens expire)
 *   - git.soma / gitcore / github   -> pull requests (needs valid gh auth)
 *   - GUS (ADM_Work__c via sf CLI)   -> work-item totals + monthly timeline
 *
 * Usage:  node scripts/update-stats.mjs [--push]
 */
import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const HOME = homedir();

/* ---- config ---- */
const AUTHOR_RE = /akopalli/i;              // matches your commit emails
const TENURE_START = "2025-05-07";          // Salesforce start date (confirm!)
const GUS_ORG = "gus";
const GUS_WHERE = "Assignee__r.Name LIKE '%Kopalli%'";

const sh = (cmd, opts = {}) => {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 1 << 26, ...opts }).trim();
  } catch {
    return "";
  }
};

/* ---- 1. local commits -> calendar ---- */
function collectCommits() {
  let repos = sh(`fd -t d -H '^\\.git$' ${HOME} --max-depth 6 2>/dev/null`)
    .split("\n").filter(Boolean)
    .map((g) => g.replace(/\/\.git$/, ""))
    .filter((d) => !/\.claude\/plugins|node_modules|\.Trash|sf-portfolio/.test(d));
  if (!repos.length) {
    repos = sh(`find ${HOME} -maxdepth 6 -name .git -type d 2>/dev/null`)
      .split("\n").filter(Boolean).map((g) => g.replace(/\/\.git$/, ""));
  }

  const seen = new Set();           // dedupe by SHA (duplicate clones)
  const calendar = {};              // "YYYY-MM-DD" -> count
  const bySource = {};              // host label -> count
  let total = 0;

  for (const dir of repos) {
    const remote = sh(`git -C "${dir}" remote get-url origin 2>/dev/null`);
    const host = /gitcore\.soma/.test(remote) ? "gitcore (core)"
      : /git\.soma/.test(remote) ? "git.soma"
      : /github\.com/.test(remote) ? "github"
      : "local";
    const log = sh(`git -C "${dir}" log --all --no-merges --format='%H%x09%ad%x09%ae' --date=short 2>/dev/null`);
    if (!log) continue;
    for (const line of log.split("\n")) {
      const [sha, date, email] = line.split("\t");
      if (!sha || !AUTHOR_RE.test(email || "") || seen.has(sha)) continue;
      seen.add(sha);
      calendar[date] = (calendar[date] || 0) + 1;
      bySource[host] = (bySource[host] || 0) + 1;
      total++;
    }
  }
  return { total, calendar, bySource, repoCount: repos.length };
}

/* ---- 2. pull requests (best-effort; needs auth) ---- */
function collectPRs() {
  const hosts = ["github.com", "git.soma.salesforce.com", "gitcore.soma.salesforce.com"];
  const out = { total: 0, byHost: {}, note: "" };
  const unreachable = [];
  for (const h of hosts) {
    const authed = sh(`gh auth status --hostname ${h} 2>&1 | grep -c "✓ Logged in"`) === "1";
    if (!authed) { unreachable.push(h); continue; }
    const n = sh(`gh search prs --author=@me --hostname ${h} --limit 100 --json id 2>/dev/null | jq 'length' 2>/dev/null`);
    const c = parseInt(n, 10);
    if (!Number.isNaN(c)) { out.byHost[h] = c; out.total += c; }
  }
  if (unreachable.length) {
    out.note = `PRs from ${unreachable.join(", ")} need a fresh token (gh auth refresh -h <host>).`;
  }
  return out;
}

/* ---- 3. GUS work items ---- */
function collectGUS() {
  const q = (soql) => {
    const raw = sh(`sf data query --target-org ${GUS_ORG} -q "${soql}" --json 2>/dev/null`);
    try { return JSON.parse(raw).result.records; } catch { return null; }
  };
  const one = (soql, f) => { const r = q(soql); return r && r[0] ? r[0][f] : null; };
  const total = one(`SELECT COUNT(Id) t FROM ADM_Work__c WHERE ${GUS_WHERE}`, "t");
  if (total == null) return { available: false };
  const closed = one(`SELECT COUNT(Id) t FROM ADM_Work__c WHERE ${GUS_WHERE} AND Status__c IN ('Closed','Fixed')`, "t");
  const bugs = one(`SELECT COUNT(Id) t FROM ADM_Work__c WHERE ${GUS_WHERE} AND RecordType.Name='Bug'`, "t");
  const stories = one(`SELECT COUNT(Id) t FROM ADM_Work__c WHERE ${GUS_WHERE} AND RecordType.Name='User Story'`, "t");
  const monthlyRows = q(`SELECT CALENDAR_YEAR(CreatedDate) y, CALENDAR_MONTH(CreatedDate) m, COUNT(Id) c FROM ADM_Work__c WHERE ${GUS_WHERE} GROUP BY CALENDAR_YEAR(CreatedDate), CALENDAR_MONTH(CreatedDate) ORDER BY CALENDAR_YEAR(CreatedDate), CALENDAR_MONTH(CreatedDate)`) || [];
  const monthly = {};
  for (const r of monthlyRows) monthly[`${r.y}-${String(r.m).padStart(2, "0")}`] = r.c;
  return { available: true, total, closed, bugs, stories, monthly };
}

/* ---- assemble ---- */
console.error("Collecting commits…");
const commits = collectCommits();
console.error(`  ${commits.total} commits across ${commits.repoCount} repos`);
console.error("Collecting PRs…");
const prs = collectPRs();
console.error("Collecting GUS…");
const gus = collectGUS();

const stats = {
  generated: new Date().toISOString(),
  tenureStart: TENURE_START,
  commits,
  prs,
  gus,
};

mkdirSync(path.join(ROOT, "assets/data"), { recursive: true });
const outPath = path.join(ROOT, "assets/data/stats.json");
writeFileSync(outPath, JSON.stringify(stats, null, 2) + "\n");
console.error(`Wrote ${outPath}`);

if (process.argv.includes("--push")) {
  const msg = `chore: refresh stats (${new Date().toISOString().slice(0, 10)})`;
  sh(`git -C "${ROOT}" add assets/data/stats.json`);
  const changed = sh(`git -C "${ROOT}" diff --cached --name-only`);
  if (changed) {
    sh(`git -C "${ROOT}" -c commit.gpgsign=false commit -q -m "${msg}"`);
    sh(`git -C "${ROOT}" push -q origin HEAD`);
    console.error("Pushed.");
  } else {
    console.error("No change.");
  }
}
