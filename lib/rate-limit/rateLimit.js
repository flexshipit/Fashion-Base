import RateLimit from "@/lib/models/RateLimit";

export async function rateLimit({ key, limit, windowMs }) {
  const now = new Date();

  const existing = await RateLimit.findOne({ key }).lean();

  if (!existing || existing.expiresAt <= now) {
    const expiresAt = new Date(now.getTime() + windowMs);

    const record = await RateLimit.findOneAndUpdate(
      {
        key,
        $or: [{ expiresAt: { $lte: now } }, { expiresAt: { $exists: false } }],
      },
      {
        $set: {
          count: 1,
          expiresAt,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
      },
    );

    return {
      success: true,
      remaining: Math.max(limit - record.count, 0),
      resetAt: record.expiresAt,
    };
  }

  if (existing.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: existing.expiresAt,
    };
  }

  const updated = await RateLimit.findOneAndUpdate(
    {
      key,
      count: {
        $lt: limit,
      },
    },
    {
      $inc: {
        count: 1,
      },
    },
    {
      returnDocument: "after",
    },
  );

  if (!updated) {
    return {
      success: false,
      remaining: 0,
      resetAt: existing.expiresAt,
    };
  }

  return {
    success: true,
    remaining: Math.max(limit - updated.count, 0),
    resetAt: updated.expiresAt,
  };
}
