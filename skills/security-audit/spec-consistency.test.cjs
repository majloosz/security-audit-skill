const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const DIR = __dirname;
const read = (name) => fs.readFileSync(path.join(DIR, name), "utf8");

function promotionBlock(markdown) {
  const match = markdown.match(/```text\n(Artifact promotion procedure[\s\S]*?)\n```/);
  assert.ok(match, "promotion procedure fenced block is present");
  return match[1];
}

test("promotion procedure fenced blocks stay identical", () => {
  const hunting = promotionBlock(read("HUNTING.md"));
  const validation = promotionBlock(read("VALIDATION-AND-REPORTING.md"));
  assert.strictEqual(validation, hunting);
});

test("sandbox termination is verified before any promotion", () => {
  const skill = read("SKILL.md");
  const hunting = read("HUNTING.md");
  const validation = read("VALIDATION-AND-REPORTING.md");
  const recon = read("RECONNAISSANCE.md");

  // Universal execution safety lists verified termination/teardown as a control.
  assert.ok(skill.includes("verified termination and teardown after each check"));
  assert.ok(skill.includes("kill all remaining target processes"));
  assert.ok(skill.includes("verify none remain"));

  // Every promotion precondition requires kill, reap, verify, and teardown.
  for (const [name, text] of [["SKILL.md", skill], ["HUNTING.md", hunting], ["VALIDATION-AND-REPORTING.md", validation]]) {
    assert.ok(
      text.includes("killed and reaped all sandbox processes, verified none remain"),
      `${name} promotion precondition requires kill, reap, and verification`,
    );
  }

  // Recon capability audit covers termination verification, not just limits.
  assert.ok(recon.includes("verified post-check termination"));
});

test("untrusted prompt content carries provenance framing", () => {
  const skill = read("SKILL.md");
  const hunting = read("HUNTING.md");
  const recon = read("RECONNAISSANCE.md");

  assert.ok(hunting.includes("`<architecture>...</architecture>`"));
  assert.ok(hunting.includes("`<prior-exclusion fingerprint=\"...\">"));
  assert.ok(skill.includes("never by semantic similarity"));
  assert.ok(recon.includes("never by semantic similarity"));
});

test("hunter file prohibitions match the shared-file list", () => {
  const hunting = read("HUNTING.md");
  assert.ok(hunting.includes("They never write retained artifacts or edit target source, `run-metadata.json`"));
  for (const name of ["run-metadata.json", "architecture.md", "coverage-ledger.json", "findings.json", "REPORT.md", "FINDINGS-DETAIL.md", "NEEDS-VALIDATION.md"]) {
    assert.ok(hunting.includes(`\`${name}\``), `prohibition list covers ${name}`);
  }
});

test("promotion is sequential and re-checks content integrity", () => {
  const skill = read("SKILL.md");
  const hunting = read("HUNTING.md");
  const validation = read("VALIDATION-AND-REPORTING.md");

  assert.ok(skill.includes("strictly sequentially"));
  for (const [name, text] of [["SKILL.md", skill], ["HUNTING.md", hunting], ["VALIDATION-AND-REPORTING.md", validation]]) {
    assert.ok(text.includes("same-size swap"), `${name} step 6 re-reads the leaf`);
  }
});

test("verdict-weakening removals count as material Phase 5 changes", () => {
  assert.ok(read("VALIDATION-AND-REPORTING.md").includes("Verdict-weakening removals"));
});

test("rejected carried records re-open unit coverage hunter-first", () => {
  const skill = read("SKILL.md");
  const recon = read("RECONNAISSANCE.md");

  assert.ok(skill.includes("the rejection closes the claim, never the unit's coverage"));
  assert.ok(recon.includes("returns to `planned` for hunter assignment"));
  assert.ok(recon.includes("hunter-first"));
});

test("sandbox controls define loopback, floors, copy lifecycle, and device scope", () => {
  const skill = read("SKILL.md");
  const hunting = read("HUNTING.md");

  assert.ok(skill.includes("fresh empty network namespace with loopback up"));
  assert.ok(skill.includes("no veth or route to host services"));
  assert.ok(skill.includes("worked example floors per check"));
  assert.ok(skill.includes("never reused across checks"));
  assert.ok(skill.includes("never listed in a promotion allowlist unless predeclared"));
  assert.ok(hunting.includes("no host devices, sensors, or GPU passthrough"));
});
