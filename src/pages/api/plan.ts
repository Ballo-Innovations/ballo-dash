import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/db";
import { marketingPlans } from "@/db/schema";
import { apiHandler, route } from "@/server/api";
import { conflict, notFound } from "@/server/errors";

/**
 * Marketing plans for the signed-in user's company (H-03).
 * Replaces /api/marketing_plans/route, which had no session check and accepted
 * any company id from the request.
 */

const timeframe = z.enum(["weekly", "monthly", "quarterly", "annual"]);

const task = z.object({
  id: z.string().min(1).max(64),
  title: z.string().min(1).max(300),
  platform: z.string().max(40),
  status: z.string().max(40).optional(),
  contentType: z.string().max(60).optional(),
  completed: z.boolean().optional(),
  budget: z.string().max(40).optional(),
  kpi: z.string().max(200).optional(),
});

const planBody = z
  .object({
    timeframe,
    periodStart: z.coerce.date(),
    periodEnd: z.coerce.date(),
    tasks: z.array(task).max(500).default([]),
  })
  .refine((plan) => plan.periodEnd >= plan.periodStart, { message: "periodEnd must not be before periodStart", path: ["periodEnd"] });

const idQuery = z.object({ id: z.string().uuid() });

export default apiHandler({
  GET: route({
    query: z.object({ timeframe, periodStart: z.coerce.date() }),
    handler: async ({ user, query }) => {
      const [plan] = await db
        .select()
        .from(marketingPlans)
        .where(
          and(
            eq(marketingPlans.companyId, user.companyId),
            eq(marketingPlans.timeframe, query.timeframe),
            eq(marketingPlans.periodStart, query.periodStart)
          )
        )
        .limit(1);
      return plan ?? null;
    },
  }),

  POST: route({
    capability: "campaigns.edit",
    body: planBody,
    handler: async ({ user, body }) => {
      const [created] = await db
        .insert(marketingPlans)
        .values({ ...body, companyId: user.companyId, createdBy: user.id, updatedBy: user.id })
        .onConflictDoNothing()
        .returning();
      if (!created) throw conflict("A plan already exists for this period");
      return created;
    },
  }),

  PUT: route({
    capability: "campaigns.edit",
    query: idQuery,
    body: planBody,
    handler: async ({ user, query, body }) => {
      const [updated] = await db
        .update(marketingPlans)
        .set({ ...body, updatedBy: user.id, updatedAt: new Date() })
        .where(and(eq(marketingPlans.id, query.id), eq(marketingPlans.companyId, user.companyId)))
        .returning();
      if (!updated) throw notFound("Plan");
      return updated;
    },
  }),

  DELETE: route({
    capability: "campaigns.edit",
    query: idQuery,
    handler: async ({ user, query }) => {
      const deleted = await db
        .delete(marketingPlans)
        .where(and(eq(marketingPlans.id, query.id), eq(marketingPlans.companyId, user.companyId)))
        .returning({ id: marketingPlans.id });
      if (deleted.length === 0) throw notFound("Plan");
      return undefined;
    },
  }),
});
