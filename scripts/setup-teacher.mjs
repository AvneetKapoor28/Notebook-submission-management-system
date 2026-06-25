/**
 * Setup script: create (or reset) the teacher account.
 * Run with: node scripts/setup-teacher.mjs [email] [password] [name]
 *
 * Defaults:
 *   email:    teacher@notebookflow.local
 *   password: changeme123
 *   name:     Teacher
 */

import { randomUUID, pbkdf2Sync, randomBytes } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import postgres from "postgres";

function loadLocalEnv() {
  if (!existsSync(".env.local")) return;
  const content = readFileSync(".env.local", "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const sep = trimmed.indexOf("=");
    if (sep === -1) continue;
    const key = trimmed.slice(0, sep).trim();
    const value = trimmed.slice(sep + 1).trim().replace(/^"/, "").replace(/"$/, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

loadLocalEnv();

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 100_000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

const [, , argEmail, argPassword, ...nameParts] = process.argv;
const email = (argEmail || "teacher@notebookflow.local").toLowerCase().trim();
const password = argPassword || "changeme123";
const name = nameParts.length > 0 ? nameParts.join(" ") : "Teacher";

const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });

async function run() {
  const passwordHash = hashPassword(password);

  // Remove the old hard-coded Aditi Sharma teacher if it exists (no password hash)
  await sql`
    DELETE FROM teachers WHERE email = 'teacher@notebookflow.local' AND password_hash IS NULL
  `;

  // Upsert the new teacher account
  const existing = await sql`SELECT id FROM teachers WHERE email = ${email}`;
  if (existing.length > 0) {
    await sql`
      UPDATE teachers SET name = ${name}, password_hash = ${passwordHash} WHERE email = ${email}
    `;
    console.log(`✅ Updated teacher account: ${email}`);
  } else {
    await sql`
      INSERT INTO teachers (id, name, email, password_hash)
      VALUES (${randomUUID()}, ${name}, ${email}, ${passwordHash})
    `;
    console.log(`✅ Created teacher account: ${email}`);
  }

  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Name:     ${name}`);

  await sql.end();
}

run().catch(async (err) => {
  console.error(err);
  await sql.end();
  process.exit(1);
});
