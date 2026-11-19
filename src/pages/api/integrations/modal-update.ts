import { z } from "zod";
import { apiHandler, route } from "@/server/api";
import { updateIntegration, updateIntegrationSchema } from "@/server/integrations";

/** Update from the management modal. Blank secret fields keep the saved value. */
export default apiHandler({
  PUT: route({
    capability: "integrations.manage",
    query: z.object({ id: z.string().uuid() }),
    body: updateIntegrationSchema,
    handler: ({ user, query, body }) => updateIntegration(user.companyId, user.id, query.id, body),
  }),
});
