import fs from "fs";
import mongoose from "mongoose";

const env = fs.readFileSync(".env.local", "utf8");
const uri = env
  .split(/\r?\n/)
  .find((line) => line.startsWith("MONGODB_URI="))
  ?.slice("MONGODB_URI=".length)
  .trim();

await mongoose.connect(uri);

async function fixCollection(name) {
  const col = mongoose.connection.collection(name);

  const unsetUser = await col.updateMany({ user: null }, { $unset: { user: "" } });
  const unsetGuest = await col.updateMany(
    { guestId: null },
    { $unset: { guestId: "" } },
  );

  console.log(
    name,
    `cleared null user=${unsetUser.modifiedCount}, null guestId=${unsetGuest.modifiedCount}`,
  );

  const indexes = await col.indexes();
  for (const index of indexes) {
    if (index.name === "user_1" || index.name === "guestId_1") {
      await col.dropIndex(index.name);
      console.log(name, "dropped", index.name);
    }
  }

  await col.createIndex(
    { user: 1 },
    {
      unique: true,
      partialFilterExpression: { user: { $type: "objectId" } },
      name: "user_1",
    },
  );
  await col.createIndex(
    { guestId: 1 },
    {
      unique: true,
      partialFilterExpression: { guestId: { $type: "string" } },
      name: "guestId_1",
    },
  );

  console.log(name, "indexes ready");
}

await fixCollection("carts");
await fixCollection("wishlists");
await mongoose.disconnect();
console.log("Done");
