import { apiHandler, route } from "@/server/api";
import { listIntegrations } from "@/server/integrations";

/** Integrations for the management modal. Same as GET /api/integrations: secrets appear only as has* flags. */
export default apiHandler({
  GET: route({ capability: "integrations.manage", handler: ({ user }) => listIntegrations(user.companyId) }),
});
