import type { NextApiRequest, NextApiResponse } from "next";

import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { db } from "@/db/db";
import { users, companies } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  logger.debug("=== Company API called ===");
  
  const session = await getServerSession(req, res, authOptions);
  logger.debug("Session user email:", session?.user?.email);

  if (!session?.user?.email) {
    logger.debug("No session or user email");
    return res.status(401).json({ error: "Unauthorized" });
  }

  logger.debug("User email:", session.user.email);

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email));

    logger.debug("User found:", user ? "Yes" : "No");

    if (!user) return res.status(404).json({ error: "User not found" });

    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.id, user.companyId));

    logger.debug("Company found:", company ? "Yes" : "No");
    logger.debug("Company data:", company);

    return res.status(200).json({ company });
  } catch (error) {
    logger.error("❌ Company API Error:", error);
    return res.status(500).json({ error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" });
  }
}
