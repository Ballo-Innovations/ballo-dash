import { apiHandler, route } from "@/server/api";
import { createIntegration, createIntegrationSchema, listIntegrations } from "@/server/integrations";

/** Integrations for the signed-in user's company. Secrets are never returned. */
export default apiHandler({
  GET: route({ handler: ({ user }) => listIntegrations(user.companyId) }),
  POST: route({
    capability: "integrations.manage",
    body: createIntegrationSchema,
    handler: ({ user, body }) => createIntegration(user.companyId, user.id, body),
  }),
});
