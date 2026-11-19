import { z } from "zod";
import { apiHandler, route } from "@/server/api";
import { deleteIntegration, getIntegration, updateIntegration, updateIntegrationSchema } from "@/server/integrations";

const params = z.object({ id: z.string().uuid() });

export default apiHandler({
  GET: route({ query: params, handler: ({ user, query }) => getIntegration(user.companyId, query.id) }),
  PUT: route({
    capability: "integrations.manage",
    query: params,
    body: updateIntegrationSchema,
    handler: ({ user, query, body }) => updateIntegration(user.companyId, user.id, query.id, body),
  }),
  DELETE: route({
    capability: "integrations.manage",
    query: params,
    handler: async ({ user, query }) => {
      await deleteIntegration(user.companyId, query.id);
      return { message: "Integration deleted" };
    },
  }),
});
