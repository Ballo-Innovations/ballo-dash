import { z } from "zod";
import { apiHandler, route } from "@/server/api";
import { IMAGE_TYPES, MAX_IMAGE_BYTES, UPLOAD_KINDS, createCompanyImageUpload, type ImageContentType } from "@/server/uploads";

/**
 * Returns a short-lived signed URL for uploading a company image (H-03).
 * The client then saves the returned fileUrl with PATCH /api/company.
 */
export default apiHandler({
  POST: route({
    capability: "company.edit",
    rateLimit: { name: "upload", limit: 20, windowSeconds: 600, by: "user" },
    body: z.object({
      kind: z.enum(UPLOAD_KINDS),
      contentType: z.enum(Object.keys(IMAGE_TYPES) as [ImageContentType, ...ImageContentType[]]),
      size: z.number().int().positive().max(MAX_IMAGE_BYTES),
    }),
    handler: ({ user, body }) => createCompanyImageUpload({ companyId: user.companyId, ...body }),
  }),
});
