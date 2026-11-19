import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/db";
import { companies } from "@/db/schema";
import { apiHandler, route } from "@/server/api";
import { badRequest, notFound } from "@/server/errors";
import { isCompanyImageUrl } from "@/server/uploads";

const publicFields = {
  id: companies.id,
  name: companies.name,
  domain: companies.domain,
  logoUrl: companies.logoUrl,
  websiteUrl: companies.websiteUrl,
  timezone: companies.timezone,
  locale: companies.locale,
  plan: companies.plan,
};

export default apiHandler({
  GET: route({
    handler: async ({ user }) => {
      const [company] = await db.select(publicFields).from(companies).where(eq(companies.id, user.companyId)).limit(1);
      if (!company) throw notFound("Company");
      return { company };
    },
  }),

  PATCH: route({
    capability: "company.edit",
    body: z
      .object({
        name: z.string().trim().min(1).max(120).optional(),
        websiteUrl: z.string().url().max(300).nullable().optional(),
        timezone: z.string().max(60).optional(),
        locale: z.string().max(20).optional(),
        logoUrl: z.string().url().nullable().optional(),
      })
      .strict(),
    handler: async ({ user, body }) => {
      if (body.logoUrl) {
        const bucket = process.env.AWS_S3_BUCKET_NAME ?? "";
        const region = process.env.AWS_REGION ?? "";
        if (!isCompanyImageUrl(body.logoUrl, user.companyId, bucket, region, "logo")) {
          throw badRequest("Logo must be uploaded through Ballo Dash");
        }
      }
      if (body.timezone && !Intl.supportedValuesOf("timeZone").includes(body.timezone)) {
        throw badRequest("Unknown time zone");
      }
      const [company] = await db
        .update(companies)
        .set({ ...body, updatedAt: new Date(), updatedBy: user.id })
        .where(eq(companies.id, user.companyId))
        .returning(publicFields);
      if (!company) throw notFound("Company");
      return { company };
    },
  }),
});
