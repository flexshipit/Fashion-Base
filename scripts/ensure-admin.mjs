/**
 * Upsert the admin user from .env.local
 *
 * Required:
 *   ADMIN_EMAIL
 *   ADMIN_PASSWORD
 * Optional:
 *   ADMIN_NAME  (default: Admin)
 *
 * Usage: pnpm seed:admin
 */
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const text = fs.readFileSync(filePath, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eq = line.indexOf("=");
    if (eq === -1) continue;

    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.join(process.cwd(), ".env.local"));
loadEnvFile(path.join(process.cwd(), ".env"));

const uri = process.env.MONGODB_URI;
const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || "";
const name = (process.env.ADMIN_NAME || "Admin").trim() || "Admin";

if (!uri) {
  console.error("Missing MONGODB_URI in .env.local");
  process.exit(1);
}

if (!email || !password) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local");
  process.exit(1);
}

if (password.length < 6) {
  console.error("ADMIN_PASSWORD must be at least 6 characters");
  process.exit(1);
}

await mongoose.connect(uri);

const users = mongoose.connection.collection("users");
const hash = await bcrypt.hash(password, 12);
const now = new Date();

const existing = await users.findOne({ email });

if (existing) {
  await users.updateOne(
    { _id: existing._id },
    {
      $set: {
        name,
        password: hash,
        role: "admin",
        isActive: true,
        updatedAt: now,
      },
    },
  );
  console.log("Updated admin account:", email);
} else {
  await users.insertOne({
    name,
    email,
    password: hash,
    role: "admin",
    phone: "",
    avatar: { url: "", fileId: "" },
    addresses: [],
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });
  console.log("Created admin account:", email);
}

console.log("You can log in at /login with the credentials from .env.local");
await mongoose.disconnect();
